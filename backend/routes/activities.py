"""
Activity Routes
Handle CRUD operations for carbon footprint activities
"""

from flask import Blueprint, request, jsonify
from firebase_admin import auth, firestore
from datetime import datetime
from services.carbon_calculator import CarbonCalculator

activities_bp = Blueprint('activities', __name__)
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

@activities_bp.route('', methods=['POST'])
def create_activity():
    """Log a new activity"""
    try:
        uid = verify_user()
        if not uid:
            return jsonify({'error': 'Unauthorized'}), 401
        
        data = request.json
        
        # Calculate carbon emissions
        emissions = calculator.calculate_generic({
            'category': data.get('category'),
            'type': data.get('type'),
            'amount': data.get('amount')
        })
        
        # Prepare activity data
        activity = {
            'userId': uid,
            'category': data.get('category'),
            'type': data.get('type'),
            'amount': float(data.get('amount', 0)),
            'unit': data.get('unit', ''),
            'description': data.get('description', ''),
            'emissions': round(emissions, 2),
            'date': data.get('date', datetime.now().isoformat()),
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        
        # Add to Firestore
        doc_ref = get_db().collection('activities').add(activity)
        activity['id'] = doc_ref[1].id
        
        return jsonify({
            'success': True,
            'activity': activity
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@activities_bp.route('', methods=['GET'])
def get_activities():
    """Get user's activities with optional date filters"""
    try:
        uid = verify_user()
        if not uid:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Query parameters
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        category = request.args.get('category')
        limit = int(request.args.get('limit', 100))
        
        # Build query
        query = get_db().collection('activities').where('userId', '==', uid)
        
        if category:
            query = query.where('category', '==', category)
        
        # Order by date descending
        query = query.order_by('date', direction=firestore.Query.DESCENDING).limit(limit)
        
        # Execute query
        docs = query.stream()
        
        activities = []
        for doc in docs:
            activity = doc.to_dict()
            activity['id'] = doc.id
            
            # Filter by date range if provided
            if start_date and activity.get('date', '') < start_date:
                continue
            if end_date and activity.get('date', '') > end_date:
                continue
            
            activities.append(activity)
        
        return jsonify({
            'success': True,
            'activities': activities
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@activities_bp.route('/<activity_id>', methods=['PUT'])
def update_activity(activity_id):
    """Update an existing activity"""
    try:
        uid = verify_user()
        if not uid:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Get the activity
        doc_ref = get_db().collection('activities').document(activity_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({'error': 'Activity not found'}), 404
        
        activity = doc.to_dict()
        
        # Verify ownership
        if activity.get('userId') != uid:
            return jsonify({'error': 'Forbidden'}), 403
        
        # Update data
        data = request.json
        
        # Recalculate emissions if amount/type changed
        if 'amount' in data or 'type' in data or 'category' in data:
            emissions = calculator.calculate_generic({
                'category': data.get('category', activity.get('category')),
                'type': data.get('type', activity.get('type')),
                'amount': data.get('amount', activity.get('amount'))
            })
            data['emissions'] = round(emissions, 2)
        
        # Update timestamp
        data['updatedAt'] = firestore.SERVER_TIMESTAMP
        
        # Update in Firestore
        doc_ref.update(data)
        
        return jsonify({
            'success': True,
            'message': 'Activity updated successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@activities_bp.route('/<activity_id>', methods=['DELETE'])
def delete_activity(activity_id):
    """Delete an activity"""
    try:
        uid = verify_user()
        if not uid:
            return jsonify({'error': 'Unauthorized'}), 401
        
        # Get the activity
        doc_ref = get_db().collection('activities').document(activity_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({'error': 'Activity not found'}), 404
        
        activity = doc.to_dict()
        
        # Verify ownership
        if activity.get('userId') != uid:
            return jsonify({'error': 'Forbidden'}), 403
        
        # Delete from Firestore
        doc_ref.delete()
        
        return jsonify({
            'success': True,
            'message': 'Activity deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
