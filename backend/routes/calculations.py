"""
Calculation Routes
Handle carbon emission calculations and statistics
"""

from flask import Blueprint, request, jsonify
from firebase_admin import auth, firestore
from datetime import datetime, timedelta
from services.carbon_calculator import CarbonCalculator
from collections import defaultdict

calculations_bp = Blueprint('calculations', __name__)
calculator = CarbonCalculator()

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

@calculations_bp.route('/calculate', methods=['POST'])
def calculate():
    """Calculate emissions for a given activity without saving"""
    try:
        data = request.json
        
        emissions = calculator.calculate_generic({
            'category': data.get('category'),
            'type': data.get('type'),
            'amount': data.get('amount')
        })
        
        return jsonify({
            'success': True,
            'emissions': round(emissions, 2),
            'unit': 'kg CO2'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@calculations_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get emission statistics (daily, weekly, monthly)"""
    try:
        uid = verify_user()
        if not uid:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Get date for period calculations
        now = datetime.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        week_start = (now - timedelta(days=7)).isoformat()
        month_start = (now - timedelta(days=30)).isoformat()
        
        # Get all activities for the user
        activities_ref = get_db().collection('activities').where('userId', '==', uid).stream()
        
        daily_total = 0
        weekly_total = 0
        monthly_total = 0
        all_time_total = 0
        
        for doc in activities_ref:
            activity = doc.to_dict()
            emissions = activity.get('emissions', 0)
            activity_date = activity.get('date', '')
            
            all_time_total += emissions
            
            if activity_date >= today_start:
                daily_total += emissions
            if activity_date >= week_start:
                weekly_total += emissions
            if activity_date >= month_start:
                monthly_total += emissions
        
        return jsonify({
            'success': True,
            'stats': {
                'daily': round(daily_total, 2),
                'weekly': round(weekly_total, 2),
                'monthly': round(monthly_total, 2),
                'allTime': round(all_time_total, 2)
            },
            'unit': 'kg CO2'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@calculations_bp.route('/breakdown', methods=['GET'])
def get_breakdown():
    """Get emissions breakdown by category"""
    try:
        uid = verify_user()
        if not uid:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Date range (default: last 30 days)
        days = int(request.args.get('days', 30))
        start_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        # Get activities
        activities_ref = get_db().collection('activities')\
            .where('userId', '==', uid)\
            .where('date', '>=', start_date)\
            .stream()
        
        breakdown = defaultdict(float)
        
        for doc in activities_ref:
            activity = doc.to_dict()
            category = activity.get('category', 'other')
            emissions = activity.get('emissions', 0)
            breakdown[category] += emissions
        
        # Convert to percentage
        total = sum(breakdown.values())
        breakdown_list = []
        
        for category, emissions in breakdown.items():
            breakdown_list.append({
                'category': category,
                'emissions': round(emissions, 2),
                'percentage': round((emissions / total * 100) if total > 0 else 0, 1)
            })
        
        # Sort by emissions (highest first)
        breakdown_list.sort(key=lambda x: x['emissions'], reverse=True)
        
        return jsonify({
            'success': True,
            'breakdown': breakdown_list,
            'total': round(total, 2),
            'period_days': days
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@calculations_bp.route('/trends', methods=['GET'])
def get_trends():
    """Get emission trends over time"""
    try:
        uid = verify_user()
        if not uid:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Get period (default: 30 days)
        days = int(request.args.get('days', 30))
        start_date = datetime.now() - timedelta(days=days)
        
        # Get activities
        activities_ref = get_db().collection('activities')\
            .where('userId', '==', uid)\
            .where('date', '>=', start_date.isoformat())\
            .stream()
        
        # Group by date
        daily_emissions = defaultdict(float)
        
        for doc in activities_ref:
            activity = doc.to_dict()
            date_str = activity.get('date', '')[:10]  # Get YYYY-MM-DD
            emissions = activity.get('emissions', 0)
            daily_emissions[date_str] += emissions
        
        # Create trend data (fill missing days with 0)
        trends = []
        current_date = start_date
        
        for i in range(days + 1):
            date_str = current_date.strftime('%Y-%m-%d')
            trends.append({
                'date': date_str,
                'emissions': round(daily_emissions.get(date_str, 0), 2)
            })
            current_date += timedelta(days=1)
        
        return jsonify({
            'success': True,
            'trends': trends
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
