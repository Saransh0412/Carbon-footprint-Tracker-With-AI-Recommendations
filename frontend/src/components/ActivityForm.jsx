/**
 * Activity Form Component
 * Form for creating and editing activities
 */

import { useState, useEffect } from 'react';
import { activitiesAPI, calculationsAPI } from '../services/api';
import './ActivityForm.css';

const ActivityForm = ({ activity, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        category: 'transportation',
        type: 'car_petrol',
        amount: '',
        unit: 'km',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [predictedEmissions, setPredictedEmissions] = useState(null);
    const [loading, setLoading] = useState(false);

    // Activity types by category
    const activityTypes = {
        transportation: [
            { value: 'car_petrol', label: 'Car (Petrol)', unit: 'km' },
            { value: 'car_diesel', label: 'Car (Diesel)', unit: 'km' },
            { value: 'bus', label: 'Bus', unit: 'km' },
            { value: 'train', label: 'Train', unit: 'km' },
            { value: 'flight_short', label: 'Flight (Short-haul)', unit: 'km' },
            { value: 'flight_long', label: 'Flight (Long-haul)', unit: 'km' },
            { value: 'motorcycle', label: 'Motorcycle', unit: 'km' },
        ],
        energy: [
            { value: 'electricity', label: 'Electricity', unit: 'kWh' },
            { value: 'natural_gas', label: 'Natural Gas', unit: 'kWh' },
            { value: 'heating_oil', label: 'Heating Oil', unit: 'liters' },
        ],
        diet: [
            { value: 'beef_meal', label: 'Beef Meal', unit: 'meals' },
            { value: 'pork_meal', label: 'Pork Meal', unit: 'meals' },
            { value: 'chicken_meal', label: 'Chicken Meal', unit: 'meals' },
            { value: 'fish_meal', label: 'Fish Meal', unit: 'meals' },
            { value: 'vegetarian_meal', label: 'Vegetarian Meal', unit: 'meals' },
            { value: 'vegan_meal', label: 'Vegan Meal', unit: 'meals' },
        ],
        consumption: [
            { value: 'shopping_clothes', label: 'Clothes Shopping', unit: 'items' },
            { value: 'electronics_small', label: 'Small Electronics', unit: 'items' },
            { value: 'electronics_large', label: 'Large Electronics', unit: 'items' },
        ]
    };

    useEffect(() => {
        if (activity) {
            setFormData({
                category: activity.category,
                type: activity.type,
                amount: activity.amount,
                unit: activity.unit,
                description: activity.description || '',
                date: activity.date.split('T')[0]
            });
        }
    }, [activity]);

    useEffect(() => {
        // Update unit when type changes
        const selectedType = activityTypes[formData.category]?.find(
            t => t.value === formData.type
        );
        if (selectedType) {
            setFormData(prev => ({ ...prev, unit: selectedType.unit }));
        }
    }, [formData.type]);

    useEffect(() => {
        // Calculate predicted emissions when amount changes
        if (formData.amount && parseFloat(formData.amount) > 0) {
            calculateEmissions();
        } else {
            setPredictedEmissions(null);
        }
    }, [formData.amount, formData.type, formData.category]);

    const calculateEmissions = async () => {
        try {
            const response = await calculationsAPI.calculate({
                category: formData.category,
                type: formData.type,
                amount: parseFloat(formData.amount)
            });
            setPredictedEmissions(response.data.emissions);
        } catch (error) {
            console.error('Error calculating emissions:', error);
        }
    };

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        const firstType = activityTypes[newCategory][0];
        setFormData({
            ...formData,
            category: newCategory,
            type: firstType.value,
            unit: firstType.unit
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const activityData = {
                ...formData,
                amount: parseFloat(formData.amount),
                date: new Date(formData.date).toISOString()
            };

            // Try to save with API first
            try {
                if (activity) {
                    await activitiesAPI.update(activity.id, activityData);
                } else {
                    await activitiesAPI.create(activityData);
                }
                onSuccess();
            } catch (apiError) {
                // Fallback to localStorage if API fails (likely no Firebase)
                console.warn('API failed, using localStorage fallback:', apiError);

                // Import localStorage service dynamically
                const { localStorageService } = await import('../services/localStorage');

                // Calculate emissions locally
                const emissions = predictedEmissions || 0;
                const localActivity = {
                    ...activityData,
                    emissions,
                    userId: 'local-user'
                };

                if (activity) {
                    localStorageService.updateActivity(activity.id, localActivity);
                } else {
                    localStorageService.saveActivity(localActivity);
                }

                alert('✓ Saved locally! (Firebase not configured, data stored in browser)');
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving activity:', error);
            alert('Failed to save activity. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="activity-form">
            <h2>{activity ? 'Edit Activity' : 'Log New Activity'}</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            value={formData.category}
                            onChange={handleCategoryChange}
                            required
                        >
                            <option value="transportation">🚗 Transportation</option>
                            <option value="energy">⚡ Energy</option>
                            <option value="diet">🍽️ Diet</option>
                            <option value="consumption">🛍️ Consumption</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="type">Activity Type</label>
                        <select
                            id="type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                        >
                            {activityTypes[formData.category].map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="amount">Amount ({formData.unit})</label>
                        <input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            placeholder={`Enter ${formData.unit}`}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description (Optional)</label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Add notes about this activity..."
                        rows="3"
                    />
                </div>

                {predictedEmissions !== null && (
                    <div className="emissions-preview">
                        <span>Estimated Emissions:</span>
                        <strong>{predictedEmissions} kg CO₂</strong>
                    </div>
                )}

                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="btn btn-outline">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : activity ? 'Update Activity' : 'Log Activity'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ActivityForm;
