# from flask import Blueprint, request, jsonify
# from app.extensions import mongo
# from bson import ObjectId
# from datetime import datetime

# admin_bp = Blueprint("admin_updates", __name__)

# @admin_bp.route("/api/admin/resolve", methods=["POST"])
# def resolve_issue():
#     data = request.get_json()
#     report_id = data.get("reportId")
#     issue_type = data.get("issueType")
#     location = data.get("location")

#     if not report_id or not issue_type or not location:
#         return jsonify({"message": "Missing data"}), 400

#     # Add to admin_updates collection
#     mongo.db.admin_updates.insert_one({
#         "reportId": ObjectId(report_id),
#         "issueType": issue_type,
#         "location": location,
#         "timestamp": datetime.utcnow()
#     })

#     return jsonify({"message": "Update sent to user"}), 200


# @admin_bp.route("/api/admin/updates", methods=["GET"])
# def get_admin_updates():
#     updates = list(mongo.db.admin_updates.find().sort("timestamp", -1))
#     for update in updates:
#         update["_id"] = str(update["_id"])
#         update["reportId"] = str(update["reportId"])
#     return jsonify(updates), 200


# @admin_bp.route("/api/admin/resolve-confirm", methods=["POST"])
# def confirm_resolution():
#     data = request.get_json()
#     report_id = data.get("reportId")

#     if not report_id:
#         return jsonify({"message": "reportId is required"}), 400

#     # Delete from reports and admin_updates
#     mongo.db.reports.delete_one({"_id": ObjectId(report_id)})
#     mongo.db.admin_updates.delete_one({"reportId": ObjectId(report_id)})

#     return jsonify({"message": "Report marked as resolved"}), 200


from flask import Blueprint, request, jsonify
from app.extensions import mongo
from bson import ObjectId
from datetime import datetime

admin_bp = Blueprint("admin_updates", __name__)

@admin_bp.route("/api/admin/resolve", methods=["POST"])
def resolve_issue():
    data = request.get_json()
    report_id = data.get("reportId")
    issue_type = data.get("issueType")
    location = data.get("location")

    if not report_id or not issue_type or not location:
        return jsonify({"message": "Missing data"}), 400

    # This endpoint is currently redundant if /api/reports/<report_id>/resolve is used for initial admin action
    # However, keeping it as is, but the primary logic will be in the report_routes resolve endpoint now.
    mongo.db.admin_updates.insert_one({
        "reportId": ObjectId(report_id),
        "issueType": issue_type,
        "location": location,
        "timestamp": datetime.utcnow()
    })

    return jsonify({"message": "Update sent to user"}), 200


@admin_bp.route("/api/admin/updates", methods=["GET"])
def get_admin_updates():
    updates = list(mongo.db.admin_updates.find().sort("timestamp", -1))
    for update in updates:
        update["_id"] = str(update["_id"])
        update["reportId"] = str(update["reportId"])
    return jsonify(updates), 200


@admin_bp.route("/api/admin/resolve-confirm", methods=["POST"])
def confirm_resolution():
    data = request.get_json()
    report_id = data.get("reportId")

    if not report_id:
        return jsonify({"message": "reportId is required"}), 400

    # Delete from reports and admin_updates
    mongo.db.reports.delete_one({"_id": ObjectId(report_id)})
    mongo.db.admin_updates.delete_one({"reportId": ObjectId(report_id)})

    return jsonify({"message": "Report marked as resolved"}), 200