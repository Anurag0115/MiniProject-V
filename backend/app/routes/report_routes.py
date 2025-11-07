# from flask import Blueprint, request, jsonify
# from app.extensions import mongo
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from datetime import datetime
# from bson import ObjectId

# report_bp = Blueprint('reports', __name__)

# # ---------------------------
# # Submit Report
# # ---------------------------
# @report_bp.route('/api/reports', methods=['POST'])
# @jwt_required(optional=True)
# def submit_report():
#     data = request.get_json()
#     required_fields = ['issueType', 'location', 'priority']

#     for field in required_fields:
#         if not data.get(field):
#             return jsonify({"message": f"{field} is required"}), 400

#     identity = get_jwt_identity()
#     email = identity.get('email') if identity else "anonymous"

#     report = {
#         "issueType": data['issueType'],
#         "location": data['location'],
#         "priority": data['priority'],
#         "details": data.get('details', ''),
#         "timestamp": datetime.utcnow(),
#         "userEmail": email,
#         "status": "pending"
#     }

#     mongo.db.reports.insert_one(report)
#     return jsonify({"message": "Report submitted successfully!"}), 201

# # ---------------------------
# # Get All Reports
# # ---------------------------
# @report_bp.route('/api/reports', methods=['GET'])
# def get_all_reports():
#     reports = list(mongo.db.reports.find().sort("timestamp", -1))
#     for report in reports:
#         report['_id'] = str(report['_id'])
#     return jsonify(reports), 200

# # ---------------------------
# # Get My Reports
# # ---------------------------
# @report_bp.route('/api/my-reports', methods=['GET'])
# @jwt_required()
# def get_my_reports():
#     identity = get_jwt_identity()
#     email = identity.get("email")
#     reports = list(mongo.db.reports.find({"userEmail": email}).sort("timestamp", -1))
#     for report in reports:
#         report['_id'] = str(report['_id'])
#     return jsonify(reports), 200

# # ---------------------------
# # PATCH: Resolve a report AND create admin update
# # ---------------------------
# @report_bp.route('/api/reports/<report_id>/resolve', methods=['POST'])  # Not PATCH
# def resolve_report(report_id):
#     report = mongo.db.reports.find_one({'_id': ObjectId(report_id)})

#     if not report:
#         return jsonify({"message": "Report not found"}), 404

#     # Insert into admin_updates collection
#     mongo.db.admin_updates.insert_one({
#         "reportId": str(report['_id']),
#         "issueType": report.get('issueType', ''),
#         "location": report.get('location', ''),
#         "priority": report.get('priority', ''),
#         "timestamp": datetime.utcnow()
#     })

#     return jsonify({"message": "Report resolved and admin update created"}), 200

# # ---------------------------
# # DELETE: Remove a report
# # ---------------------------
# @report_bp.route('/api/reports/<report_id>', methods=['DELETE'])
# def delete_report(report_id):
#     result = mongo.db.reports.delete_one({'_id': ObjectId(report_id)})
#     if result.deleted_count == 1:
#         return jsonify({"message": "Report deleted successfully"}), 200
#     return jsonify({"message": "Report not found"}), 404

# # ---------------------------
# # GET: Admin Updates (for UserDashboard)
# # ---------------------------
# @report_bp.route('/api/admin-updates', methods=['GET'])
# def get_admin_updates():
#     updates = list(mongo.db.admin_updates.find().sort("timestamp", -1))
#     for update in updates:
#         update['_id'] = str(update['_id'])
#     return jsonify(updates), 200


from flask import Blueprint, request, jsonify
from app.extensions import mongo
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from datetime import datetime
from bson import ObjectId

report_bp = Blueprint('reports', __name__)

# ---------------------------
# Submit Report
# ---------------------------
@report_bp.route('/api/reports', methods=['POST'])
def submit_report():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"message": "Request body is required"}), 400
        
        required_fields = ['issueType', 'location', 'priority']

        for field in required_fields:
            if not data.get(field):
                return jsonify({"message": f"{field} is required"}), 400

        # Try to get identity from JWT if available, but don't require it
        # This endpoint works with or without authentication - NEVER FAILS due to JWT
        email = "anonymous"
        auth_header = request.headers.get('Authorization', '')
        if auth_header and auth_header.startswith('Bearer '):
            try:
                # Try to verify and get identity, but catch ALL exceptions
                from flask_jwt_extended.exceptions import JWTDecodeError, InvalidHeaderError
                verify_jwt_in_request(optional=True)
                identity = get_jwt_identity()
                if identity and isinstance(identity, dict):
                    email = identity.get('email', 'anonymous')
            except (JWTDecodeError, InvalidHeaderError, Exception) as e:
                # Completely ignore JWT errors - allow anonymous submission
                # This ensures the endpoint ALWAYS works
                email = "anonymous"

        report = {
            "issueType": data['issueType'],
            "location": data['location'],
            "priority": data['priority'],
            "details": data.get('details', ''),
            "timestamp": datetime.utcnow(),
            "userEmail": email,
            "status": "pending"
        }

        mongo.db.reports.insert_one(report)
        return jsonify({"message": "Report submitted successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------
# Get All Reports
# ---------------------------
@report_bp.route('/api/reports', methods=['GET'])
def get_all_reports():
    try:
        reports = list(mongo.db.reports.find().sort("timestamp", -1))
        for report in reports:
            report['_id'] = str(report['_id'])
            # Handle datetime serialization
            if 'timestamp' in report:
                if hasattr(report['timestamp'], 'isoformat'):
                    report['timestamp'] = report['timestamp'].isoformat()
                elif isinstance(report['timestamp'], dict) and '$date' in report['timestamp']:
                    # Handle MongoDB extended JSON format
                    from datetime import datetime
                    report['timestamp'] = datetime.fromtimestamp(report['timestamp']['$date'] / 1000).isoformat()
        return jsonify(reports), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------
# Get My Reports
# ---------------------------
@report_bp.route('/api/my-reports', methods=['GET'])
@jwt_required()
def get_my_reports():
    try:
        identity = get_jwt_identity()
        if not identity:
            return jsonify({"error": "Invalid token"}), 401
        
        # Handle both dict and string identity formats
        if isinstance(identity, dict):
            email = identity.get("email")
        else:
            # If identity is a string, try to get email from it
            return jsonify({"error": "Invalid token format"}), 401
        
        if not email:
            return jsonify({"error": "Email not found in token"}), 401
        
        reports = list(mongo.db.reports.find({"userEmail": email}).sort("timestamp", -1))
        for report in reports:
            report['_id'] = str(report['_id'])
            # Handle datetime serialization
            if 'timestamp' in report and hasattr(report['timestamp'], 'isoformat'):
                report['timestamp'] = report['timestamp'].isoformat()
        return jsonify(reports), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------
# PATCH: Resolve a report (Admin side - moves to admin_updates)
# ---------------------------
@report_bp.route('/api/reports/<report_id>/resolve', methods=['POST'])
def resolve_report(report_id):
    report = mongo.db.reports.find_one({'_id': ObjectId(report_id)})

    if not report:
        return jsonify({"message": "Report not found"}), 404

    # Insert into admin_updates collection
    mongo.db.admin_updates.insert_one({
        "reportId": str(report['_id']),
        "issueType": report.get('issueType', ''),
        "location": report.get('location', ''),
        "priority": report.get('priority', ''),
        "timestamp": datetime.utcnow()
    })

    # Do NOT delete from 'reports' collection here. It will be deleted on user confirmation.
    return jsonify({"message": "Report moved to admin updates for user confirmation"}), 200

# ---------------------------
# DELETE: Remove a report (Admin/User confirmed resolution)
# ---------------------------
@report_bp.route('/api/reports/<report_id>', methods=['DELETE'])
def delete_report(report_id):
    result = mongo.db.reports.delete_one({'_id': ObjectId(report_id)})
    if result.deleted_count == 1:
        return jsonify({"message": "Report deleted successfully"}), 200
    return jsonify({"message": "Report not found"}), 404

# ---------------------------
# GET: Admin Updates (for UserDashboard)
# ---------------------------
@report_bp.route('/api/admin-updates', methods=['GET'])
def get_admin_updates():
    updates = list(mongo.db.admin_updates.find().sort("timestamp", -1))
    for update in updates:
        update['_id'] = str(update['_id'])
    return jsonify(updates), 200