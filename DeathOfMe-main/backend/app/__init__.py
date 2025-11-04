from flask import Flask
from app.extensions import mongo, jwt
from flask_cors import CORS
from app.routes.auth_routes import auth_bp
from app.routes.report_routes import report_bp
from .routes.admin_update_routes import admin_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    CORS(app)

    mongo.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(report_bp)
    app.register_blueprint(admin_bp)
    return app
