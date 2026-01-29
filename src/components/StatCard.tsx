import React from 'react';

interface StatCardProps {
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, trend }) => {
    return (
        <div className="stat-card glass">
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
            {change && (
                <span className={`stat-change ${trend === 'up' ? 'up' : trend === 'down' ? 'down' : ''}`}>
                    {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {change}
                </span>
            )}
        </div>
    );
};

export default StatCard;
