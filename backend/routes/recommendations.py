"""
Recommendations Routes
Handle AI-powered personalized recommendations
"""

from flask import Blueprint, request, jsonify
from firebase_admin import auth, firestore
from datetime import datetime, timedelta
from services.ai_service import AIService
from collections import defaultdict

recommendations_bp = Blueprint('recommendations', __name__)
ai_service = AIService()

def get_db():
    """Get Firestore client (lazy initialization)"""
    return firestore.client()

def verify_user():
    """Helper function to verify user from Authorization header"""
    try:
        id_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not id_token:
            return None
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token['uid']
    except:
        return None

@recommendations_bp.route('', methods=['GET'])
def get_recommendations():
    """Get AI-powered personalized recommendations based on user's emission patterns"""
    try:
        uid = verify_user()
        if not uid:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Get period (default: last 30 days)
        days = int(request.args.get('days', 30))
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        # Get user's activities
        activities_ref = get_db().collection('activities')\
            .where('userId', '==', uid)\
            .where('date', '>=', start_date)\
            .stream()
        
        # Calculate statistics
        breakdown = defaultdict(float)
        total_emissions = 0
        
        for doc in activities_ref:
            activity = doc.to_dict()
            category = activity.get('category', 'other')
            emissions = activity.get('emissions', 0)
            breakdown[category] += emissions
            total_emissions += emissions
        
        # Prepare stats for AI service
        user_stats = {
            'total_emissions': total_emissions,
            'breakdown': dict(breakdown),
            'top_category': max(breakdown, key=breakdown.get) if breakdown else 'transportation'
        }
        
        # Generate recommendations using AI
        recommendations = ai_service.generate_recommendations(user_stats)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'stats': {
                'total_emissions': round(total_emissions, 2),
                'period_days': days,
                'breakdown': {k: round(v, 2) for k, v in breakdown.items()}
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
