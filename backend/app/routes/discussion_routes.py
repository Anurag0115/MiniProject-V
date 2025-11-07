from flask import Blueprint, request, jsonify
from app.extensions import mongo
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from datetime import datetime
from bson import ObjectId

discussion_bp = Blueprint('discussions', __name__)

# ---------------------------
# Get All Discussions
# ---------------------------
@discussion_bp.route('/api/discussions', methods=['GET'])
def get_all_discussions():
    try:
        category = request.args.get('category', None)
        query = {}
        
        # Filter by category if provided
        if category and category != "All Posts":
            query['tags'] = category.lower()
        
        discussions = list(mongo.db.discussions.find(query).sort("createdAt", -1))
        
        for discussion in discussions:
            discussion['_id'] = str(discussion['_id'])
            # Handle datetime serialization
            if 'createdAt' in discussion:
                if hasattr(discussion['createdAt'], 'isoformat'):
                    discussion['createdAt'] = discussion['createdAt'].isoformat()
                elif isinstance(discussion['createdAt'], dict) and '$date' in discussion['createdAt']:
                    from datetime import datetime
                    discussion['createdAt'] = datetime.fromtimestamp(
                        discussion['createdAt']['$date'] / 1000
                    ).isoformat()
            
            # Count comments
            discussion['commentCount'] = len(discussion.get('comments', []))
            
            # Don't send all comments in list view, just count
            if 'comments' in discussion:
                discussion.pop('comments')
        
        return jsonify(discussions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------
# Get Single Discussion with Comments
# ---------------------------
@discussion_bp.route('/api/discussions/<discussion_id>', methods=['GET'])
def get_discussion(discussion_id):
    try:
        discussion = mongo.db.discussions.find_one({'_id': ObjectId(discussion_id)})
        
        if not discussion:
            return jsonify({"error": "Discussion not found"}), 404
        
        discussion['_id'] = str(discussion['_id'])
        
        # Handle datetime serialization
        if 'createdAt' in discussion:
            if hasattr(discussion['createdAt'], 'isoformat'):
                discussion['createdAt'] = discussion['createdAt'].isoformat()
            elif isinstance(discussion['createdAt'], dict) and '$date' in discussion['createdAt']:
                from datetime import datetime
                discussion['createdAt'] = datetime.fromtimestamp(
                    discussion['createdAt']['$date'] / 1000
                ).isoformat()
        
        # Serialize comments
        if 'comments' in discussion:
            for comment in discussion['comments']:
                if 'createdAt' in comment:
                    if hasattr(comment['createdAt'], 'isoformat'):
                        comment['createdAt'] = comment['createdAt'].isoformat()
                    elif isinstance(comment['createdAt'], dict) and '$date' in comment['createdAt']:
                        from datetime import datetime
                        comment['createdAt'] = datetime.fromtimestamp(
                            comment['createdAt']['$date'] / 1000
                        ).isoformat()
        
        return jsonify(discussion), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------
# Create New Discussion
# ---------------------------
@discussion_bp.route('/api/discussions', methods=['POST'])
def create_discussion():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        
        required_fields = ['title', 'description', 'tags']
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400
        
        # Get user email if authenticated, otherwise anonymous
        email = "anonymous"
        try:
            auth_header = request.headers.get('Authorization', '')
            if auth_header and auth_header.startswith('Bearer '):
                verify_jwt_in_request(optional=True)
                identity = get_jwt_identity()
                if identity and isinstance(identity, dict):
                    email = identity.get('email', 'anonymous')
        except Exception:
            email = "anonymous"
        
        discussion = {
            "title": data['title'],
            "description": data['description'],
            "tags": data['tags'] if isinstance(data['tags'], list) else [data['tags']],
            "authorEmail": email,
            "createdAt": datetime.utcnow(),
            "comments": [],
            "upvotes": 0,
            "downvotes": 0
        }
        
        result = mongo.db.discussions.insert_one(discussion)
        discussion['_id'] = str(result.inserted_id)
        discussion['createdAt'] = discussion['createdAt'].isoformat()
        discussion['commentCount'] = 0
        
        return jsonify(discussion), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------
# Add Comment to Discussion
# ---------------------------
@discussion_bp.route('/api/discussions/<discussion_id>/comments', methods=['POST'])
def add_comment(discussion_id):
    try:
        data = request.get_json()
        if not data or not data.get('text'):
            return jsonify({"error": "Comment text is required"}), 400
        
        # Check if discussion exists
        discussion = mongo.db.discussions.find_one({'_id': ObjectId(discussion_id)})
        if not discussion:
            return jsonify({"error": "Discussion not found"}), 404
        
        # Get user email if authenticated, otherwise anonymous
        email = "anonymous"
        try:
            auth_header = request.headers.get('Authorization', '')
            if auth_header and auth_header.startswith('Bearer '):
                verify_jwt_in_request(optional=True)
                identity = get_jwt_identity()
                if identity and isinstance(identity, dict):
                    email = identity.get('email', 'anonymous')
        except Exception:
            email = "anonymous"
        
        comment = {
            "text": data['text'],
            "authorEmail": email,
            "createdAt": datetime.utcnow(),
            "_id": str(ObjectId())
        }
        
        # Add comment to discussion
        mongo.db.discussions.update_one(
            {'_id': ObjectId(discussion_id)},
            {'$push': {'comments': comment}}
        )
        
        comment['createdAt'] = comment['createdAt'].isoformat()
        return jsonify(comment), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------------------
# Get Discussion Categories/Stats
# ---------------------------
@discussion_bp.route('/api/discussions/stats', methods=['GET'])
def get_discussion_stats():
    try:
        # Get count for each category
        categories = ["All Posts", "Hygiene", "Privacy", "Urgent", "Suggestions", "Appreciation", "Feedback"]
        stats = {}
        
        for category in categories:
            if category == "All Posts":
                count = mongo.db.discussions.count_documents({})
            else:
                count = mongo.db.discussions.count_documents({"tags": category.lower()})
            stats[category] = count
        
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

