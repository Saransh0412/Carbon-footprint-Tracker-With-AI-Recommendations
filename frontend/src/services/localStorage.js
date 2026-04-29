/**
 * Local Storage Service (Fallback when Firebase is not configured)
 */

const STORAGE_KEY = 'carbon_tracker_activities';

export const localStorageService = {
    // Save activity to localStorage
    saveActivity: (activity) => {
        const activities = localStorageService.getActivities();
        const newActivity = {
            ...activity,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        activities.push(newActivity);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
        return newActivity;
    },

    // Get all activities
    getActivities: () => {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Update activity
    updateActivity: (id, updates) => {
        const activities = localStorageService.getActivities();
        const index = activities.findIndex(a => a.id === id);
        if (index !== -1) {
            activities[index] = { ...activities[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
            return activities[index];
        }
        return null;
    },

    // Delete activity
    deleteActivity: (id) => {
        const activities = localStorageService.getActivities();
        const filtered = activities.filter(a => a.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    },

    // Calculate stats
    calculateStats: () => {
        const activities = localStorageService.getActivities();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        let daily = 0, weekly = 0, monthly = 0, allTime = 0;

        activities.forEach(activity => {
            const activityDate = new Date(activity.date);
            const emissions = activity.emissions || 0;

            allTime += emissions;
            if (activityDate >= monthAgo) monthly += emissions;
            if (activityDate >= weekAgo) weekly += emissions;
            if (activityDate >= today) daily += emissions;
        });

        return {
            daily: daily.toFixed(2),
            weekly: weekly.toFixed(2),
            monthly: monthly.toFixed(2),
            allTime: allTime.toFixed(2)
        };
    },

    // Get breakdown by category
    getBreakdown: (days = 30) => {
        const activities = localStorageService.getActivities();
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const breakdown = {};

        activities.forEach(activity => {
            const activityDate = new Date(activity.date);
            if (activityDate >= startDate) {
                const category = activity.category || 'other';
                breakdown[category] = (breakdown[category] || 0) + (activity.emissions || 0);
            }
        });

        const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
        return Object.entries(breakdown).map(([category, emissions]) => ({
            category,
            emissions: parseFloat(emissions.toFixed(2)),
            percentage: total > 0 ? parseFloat(((emissions / total) * 100).toFixed(1)) : 0
        })).sort((a, b) => b.emissions - a.emissions);
    },

    // Get trends
    getTrends: (days = 30) => {
        const activities = localStorageService.getActivities();
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const dailyData = {};

        activities.forEach(activity => {
            const activityDate = new Date(activity.date);
            if (activityDate >= startDate) {
                const dateStr = activityDate.toISOString().split('T')[0];
                dailyData[dateStr] = (dailyData[dateStr] || 0) + (activity.emissions || 0);
            }
        });

        const trends = [];
        for (let i = 0; i <= days; i++) {
            const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            trends.push({
                date: dateStr,
                emissions: parseFloat((dailyData[dateStr] || 0).toFixed(2))
            });
        }

        return trends;
    }
};
