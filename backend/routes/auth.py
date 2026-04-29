"""
Authentication Routes
Handle Firebase token verification
"""

from flask import Blueprint, request, jsonify
import firebase_admin
from firebase_admin import auth

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/verify', methods=['POST'])
def verify_token():
    """Verify Firebase ID token"""
    try:
        id_token = request.json.get('idToken')
        
        if not id_token:
            return jsonify({'error': 'No token provided'}), 400
        
        # Verify the token
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        
        return jsonify({
            'success': True,
            'uid': uid,
            'email': decoded_token.get('email', '')
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 401

@auth_bp.route('/user', methods=['GET'])
def get_user():
    """Get current user info from token"""
    try:
        id_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not id_token:
            return jsonify({'error': 'No token provided'}), 401
        
        decoded_token = auth.verify_id_token(id_token)
        
        return jsonify({
            'uid': decoded_token['uid'],
            'email': decoded_token.get('email', ''),
            'name': decoded_token.get('name', '')
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 401
