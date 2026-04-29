/**
 * Emission Chart Component
 * Line chart showing emission trends over time using Recharts
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './EmissionChart.css';

const EmissionChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="chart-empty">No data available for this period</div>;
    }

    // Format data for the chart
    const chartData = data.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        emissions: item.emissions
    }));

    return (
        <div className="emission-chart">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                        dataKey="date"
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#666"
                        style={{ fontSize: '12px' }}
                        label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '10px'
                        }}
                        formatter={(value) => [`${value} kg CO₂`, 'Emissions']}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="emissions"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Daily Emissions"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EmissionChart;
