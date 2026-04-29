/**
 * Category Breakdown Component
 * Pie chart showing emissions breakdown by category using Recharts
 */

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './CategoryBreakdown.css';

const CategoryBreakdown = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="chart-empty">No data available for this period</div>;
    }

    const COLORS = {
        transportation: '#3b82f6',
        energy: '#f59e0b',
        diet: '#10b981',
        consumption: '#8b5cf6',
        other: '#6b7280'
    };

    const chartData = data.map(item => ({
        name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        value: item.emissions,
        percentage: item.percentage
    }));

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percentage < 5) return null; // Don't show label for small slices

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                style={{ fontSize: '14px', fontWeight: 'bold' }}
            >
                {`${percentage.toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="category-breakdown">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[data[index].category] || COLORS.other}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value, name) => [`${value.toFixed(2)} kg CO₂`, name]}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '10px'
                        }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry) => `${value} (${entry.payload.percentage.toFixed(1)}%)`}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Stats Table */}
            <div className="breakdown-stats">
                {data.map((item, index) => (
                    <div key={index} className="breakdown-item">
                        <div className="breakdown-color" style={{ backgroundColor: COLORS[item.category] || COLORS.other }}></div>
                        <div className="breakdown-label">{item.category}</div>
                        <div className="breakdown-value">{item.emissions.toFixed(2)} kg</div>
                        <div className="breakdown-percentage">{item.percentage.toFixed(1)}%</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryBreakdown;
