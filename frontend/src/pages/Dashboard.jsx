/**
 * Dashboard Page
 * Main dashboard with stats, charts, and AI recommendations
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, auth } from '../services/firebase';
import { calculationsAPI, recommendationsAPI } from '../services/api';
import EmissionChart from '../components/EmissionChart';
import CategoryBreakdown from '../components/CategoryBreakdown';
import RecommendationCard from '../components/RecommendationCard';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [trends, setTrends] = useState([]);
    const [breakdown, setBreakdown] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState(30);
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.currentUser) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [period]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Try API first
            try {
                const [statsRes, trendsRes, breakdownRes, recsRes] = await Promise.all([
                    calculationsAPI.getStats(),
                    calculationsAPI.getTrends(period),
                    calculationsAPI.getBreakdown(period),
                    recommendationsAPI.get(period)
                ]);

                setStats(statsRes.data.stats);
                setTrends(trendsRes.data.trends);
                setBreakdown(breakdownRes.data.breakdown);
                setRecommendations(recsRes.data.recommendations);
            } catch (apiError) {
                // Fallback to localStorage if API fails
                console.warn('API failed, using localStorage:', apiError);
                const { localStorageService } = await import('../services/localStorage');

                const localStats = localStorageService.calculateStats();
                const localBreakdown = localStorageService.getBreakdown(period);
                const localTrends = localStorageService.getTrends(period);

                setStats(localStats);
                setBreakdown(localBreakdown);
                setTrends(localTrends);

                // Simple local recommendations
                const topCategory = localBreakdown[0]?.category || 'transportation';
                setRecommendations([
                    `Your highest emissions are from ${topCategory}. Consider reducing activities in this category.`,
                    'Try to combine trips and use public transportation when possible.',
                    'Small changes in daily habits can make a big difference over time.'
                ]);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading">Loading your dashboard...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <h1>🌍 Carbon Footprint Dashboard</h1>
                    <p>Welcome back, {auth.currentUser?.email}</p>
                </div>
                <div className="header-actions">
                    <button
                        onClick={() => navigate('/activities')}
                        className="btn btn-secondary"
                    >
                        Log Activity
                    </button>
                    <button onClick={handleLogout} className="btn btn-outline">
                        Logout
                    </button>
                </div>
            </header>

            {/* Period Selector */}
            <div className="period-selector">
                <button
                    className={period === 7 ? 'active' : ''}
                    onClick={() => setPeriod(7)}
                >
                    7 Days
                </button>
                <button
                    className={period === 30 ? 'active' : ''}
                    onClick={() => setPeriod(30)}
                >
                    30 Days
                </button>
                <button
                    className={period === 90 ? 'active' : ''}
                    onClick={() => setPeriod(90)}
                >
                    3 Months
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                        <div className="stat-label">Today</div>
                        <div className="stat-value">{stats?.daily || 0} kg</div>
                        <div className="stat-unit">CO₂</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <div className="stat-label">This Week</div>
                        <div className="stat-value">{stats?.weekly || 0} kg</div>
                        <div className="stat-unit">CO₂</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                        <div className="stat-label">This Month</div>
                        <div className="stat-value">{stats?.monthly || 0} kg</div>
                        <div className="stat-unit">CO₂</div>
                    </div>
                </div>

                <div className="stat-card highlight">
                    <div className="stat-icon">🌍</div>
                    <div className="stat-content">
                        <div className="stat-label">All Time</div>
                        <div className="stat-value">{stats?.allTime || 0} kg</div>
                        <div className="stat-unit">CO₂</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-container">
                    <h2>Emission Trends</h2>
                    <EmissionChart data={trends} />
                </div>

                <div className="chart-container">
                    <h2>Breakdown by Category</h2>
                    <CategoryBreakdown data={breakdown} />
                </div>
            </div>

            {/* AI Recommendations */}
            <div className="recommendations-section">
                <h2>🤖 Personalized Recommendations</h2>
                <p className="section-subtitle">
                    AI-powered suggestions to help you reduce your carbon footprint
                </p>
                <div className="recommendations-grid">
                    {recommendations.length > 0 ? (
                        recommendations.map((rec, index) => (
                            <RecommendationCard key={index} recommendation={rec} index={index} />
                        ))
                    ) : (
                        <p>No recommendations available. Log more activities to get personalized suggestions!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
