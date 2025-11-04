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
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson import ObjectId

report_bp = Blueprint('reports', __name__)

# ---------------------------
# Submit Report
# ---------------------------
@report_bp.route('/api/reports', methods=['POST'])
@jwt_required(optional=True)
def submit_report():
    data = request.get_json()
    required_fields = ['issueType', 'location', 'priority']

    for field in required_fields:
        if not data.get(field):
            return jsonify({"message": f"{field} is required"}), 400

    identity = get_jwt_identity()
    email = identity.get('email') if identity else "anonymous"

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

# ---------------------------
# Get All Reports
# ---------------------------
@report_bp.route('/api/reports', methods=['GET'])
def get_all_reports():
    reports = list(mongo.db.reports.find().sort("timestamp", -1))
    for report in reports:
        report['_id'] = str(report['_id'])
    return jsonify(reports), 200

# ---------------------------
# Get My Reports
# ---------------------------
@report_bp.route('/api/my-reports', methods=['GET'])
@jwt_required()
def get_my_reports():
    identity = get_jwt_identity()
    email = identity.get("email")
    reports = list(mongo.db.reports.find({"userEmail": email}).sort("timestamp", -1))
    for report in reports:
        report['_id'] = str(report['_id'])
    return jsonify(reports), 200

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