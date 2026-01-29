import React from 'react';

interface StatCardProps {
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, trend, icon }) => {
    return (
        <div className="stat-card">
            {icon && <div className="stat-icon">{icon}</div>}
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
            <span className={`stat-change ${trend || 'neutral'}`}>
                {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {change || 'Sin cambios este mes'}
            </span>
        </div>
    );
};

export default StatCard;
