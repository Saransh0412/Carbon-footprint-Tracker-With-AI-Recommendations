/**
 * Activity Log Page
 * Interface for logging and managing carbon footprint activities
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { activitiesAPI } from '../services/api';
import ActivityForm from '../components/ActivityForm';
import './ActivityLog.css';

const ActivityLog = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.currentUser) {
            navigate('/login');
            return;
        }
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            setLoading(true);

            // Try API first
            try {
                const response = await activitiesAPI.getAll({ limit: 50 });
                setActivities(response.data.activities);
            } catch (apiError) {
                // Fallback to localStorage if API fails
                console.warn('API failed, using localStorage:', apiError);
                const { localStorageService } = await import('../services/localStorage');
                const localActivities = localStorageService.getActivities();
                setActivities(localActivities);
            }
        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddActivity = () => {
        setEditingActivity(null);
        setShowForm(true);
    };

    const handleEditActivity = (activity) => {
        setEditingActivity(activity);
        setShowForm(true);
    };

    const handleDeleteActivity = async (activityId) => {
        if (!confirm('Are you sure you want to delete this activity?')) return;

        try {
            // Try API first
            try {
                await activitiesAPI.delete(activityId);
            } catch (apiError) {
                // Fallback to localStorage
                console.warn('API failed, using localStorage:', apiError);
                const { localStorageService } = await import('../services/localStorage');
                localStorageService.deleteActivity(activityId);
            }
            setActivities(activities.filter(a => a.id !== activityId));
        } catch (error) {
            console.error('Error deleting activity:', error);
            alert('Failed to delete activity');
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingActivity(null);
        fetchActivities();
    };

    const getCategoryIcon = (category) => {
        const icons = {
            transportation: '🚗',
            energy: '⚡',
            diet: '🍽️',
            consumption: '🛍️'
        };
        return icons[category] || '📊';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="activity-log-container">
            {/* Header */}
            <header className="page-header">
                <div>
                    <button onClick={() => navigate('/dashboard')} className="back-btn">
                        ← Back to Dashboard
                    </button>
                    <h1>Activity Log</h1>
                    <p>Track your daily carbon emissions</p>
                </div>
                <button onClick={handleAddActivity} className="btn btn-primary">
                    + Add Activity
                </button>
            </header>

            {/* Activity Form Modal */}
            {showForm && (
                <div className="modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <ActivityForm
                            activity={editingActivity}
                            onSuccess={handleFormSuccess}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                </div>
            )}

            {/* Activities List */}
            <div className="activities-section">
                {loading ? (
                    <div className="loading">Loading activities...</div>
                ) : activities.length === 0 ? (
                    <div className="empty-state">
                        <p>No activities logged yet</p>
                        <button onClick={handleAddActivity} className="btn btn-primary">
                            Log Your First Activity
                        </button>
                    </div>
                ) : (
                    <div className="activities-list">
                        {activities.map((activity) => (
                            <div key={activity.id} className="activity-card">
                                <div className="activity-icon">
                                    {getCategoryIcon(activity.category)}
                                </div>
                                <div className="activity-details">
                                    <div className="activity-header">
                                        <h3>{activity.type.replace('_', ' ')}</h3>
                                        <span className="activity-date">{formatDate(activity.date)}</span>
                                    </div>
                                    <div className="activity-info">
                                        <span className="category-badge">{activity.category}</span>
                                        <span className="amount">
                                            {activity.amount} {activity.unit}
                                        </span>
                                    </div>
                                    {activity.description && (
                                        <p className="activity-description">{activity.description}</p>
                                    )}
                                </div>
                                <div className="activity-emissions">
                                    <div className="emissions-value">{activity.emissions}</div>
                                    <div className="emissions-unit">kg CO₂</div>
                                </div>
                                <div className="activity-actions">
                                    <button
                                        onClick={() => handleEditActivity(activity)}
                                        className="btn-icon"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDeleteActivity(activity.id)}
                                        className="btn-icon"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
