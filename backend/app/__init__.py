from flask import Flask, jsonify
from app.extensions import mongo, jwt
from flask_cors import CORS
from app.routes.auth_routes import auth_bp
from app.routes.report_routes import report_bp
from .routes.admin_update_routes import admin_bp
from .routes.analytics_routes import analytics_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    CORS(app)

    mongo.init_app(app)
    jwt.init_app(app)

    # JWT Error Handlers - only for required JWT endpoints
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        # Only return error for required JWT endpoints
        # For optional JWT, this won't be called
        return jsonify({"error": "Invalid token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        # Only return error for required JWT endpoints
        return jsonify({"error": "Authorization required"}), 401

    @jwt.needs_fresh_token_loader
    def token_not_fresh_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Fresh token required"}), 401

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(report_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(analytics_bp)
    return app
