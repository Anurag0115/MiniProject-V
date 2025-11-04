from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from app.extensions import mongo
from flask_jwt_extended import create_access_token
from flask_pymongo.wrappers import Database
from typing import cast

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')  # 'user' or 'admin'

        if not all([email, password, role]):
            return jsonify({"error": "Missing required fields"}), 400

        collection_name = 'admins' if role == 'admin' else 'users'
        db = cast(Database, mongo.db)
        user = db[collection_name].find_one({"email": email})

        if user and check_password_hash(user['password'], password):
            access_token = create_access_token(identity={'email': email, 'role': role})
            return jsonify({"access_token": access_token}), 200
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'user')  # Default to user role

        if not all([email, password]):
            return jsonify({"error": "Missing required fields"}), 400

        # Check if user already exists
        db = cast(Database, mongo.db)
        collection_name = 'admins' if role == 'admin' else 'users'
        existing_user = db[collection_name].find_one({"email": email})
        
        if existing_user:
            return jsonify({"error": "Email already registered"}), 409

        # Hash password and create user
        hashed_password = generate_password_hash(password)
        user_data = {
            "email": email,
            "password": hashed_password
        }
        
        db[collection_name].insert_one(user_data)
        
        # Create and return token
        access_token = create_access_token(identity={'email': email, 'role': role})
        return jsonify({
            "message": "User created successfully",
            "access_token": access_token
        }), 201

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500
