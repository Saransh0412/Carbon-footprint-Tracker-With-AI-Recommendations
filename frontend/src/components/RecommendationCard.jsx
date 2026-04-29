/**
 * Recommendation Card Component
 * Displays individual AI-powered recommendations
 */

import './RecommendationCard.css';

const RecommendationCard = ({ recommendation, index }) => {
    const icons = ['💡', '🌱', '♻️', '🚴', '⚡'];
    const icon = icons[index % icons.length];

    return (
        <div className="recommendation-card">
            <div className="recommendation-icon">{icon}</div>
            <div className="recommendation-content">
                <div className="recommendation-number">Tip #{index + 1}</div>
                <p className="recommendation-text">{recommendation}</p>
            </div>
        </div>
    );
};

export default RecommendationCard;
