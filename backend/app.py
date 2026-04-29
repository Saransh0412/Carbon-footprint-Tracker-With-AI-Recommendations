"""
Flask Backend for Carbon Footprint Tracker
Main application entry point
"""

from flask import Flask, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS (allow requests from React frontend)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize Firebase Admin SDK
try:
    cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-credentials.json')
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("✓ Firebase Admin SDK initialized successfully")
    else:
        print("⚠ Warning: Firebase credentials file not found.")
        print(f"  Please add your Firebase service account key as: {cred_path}")
        print("  The app will run but authentication won't work.")
except Exception as e:
    print(f"⚠ Warning: Could not initialize Firebase: {str(e)}")
    print("  The app will run but authentication won't work.")

# Import and register blueprints
from routes.auth import auth_bp
from routes.activities import activities_bp
from routes.calculations import calculations_bp
from routes.recommendations import recommendations_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(activities_bp, url_prefix='/api/activities')
app.register_blueprint(calculations_bp, url_prefix='/api/calculations')
app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Carbon Footprint Tracker API is running',
        'version': '1.0.0'
    }), 200

# Root endpoint
@app.route('/', methods=['GET'])
def root():
    """Root endpoint"""
    return jsonify({
        'message': 'Carbon Footprint Tracker API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth',
            'activities': '/api/activities',
            'calculations': '/api/calculations',
            'recommendations': '/api/recommendations',
            'health': '/api/health'
        }
    }), 200

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    print(f"\n🌍 Carbon Footprint Tracker API")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print(f"Server running on: http://localhost:{port}")
    print(f"Debug mode: {debug}")
    print(f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
