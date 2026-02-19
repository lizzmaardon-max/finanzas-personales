import React from 'react';

interface StatCardProps {
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
    isCompact?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, trend, icon, isCompact }) => {
    return (
        <div className={`stat-card ${isCompact ? 'compact' : ''}`}>
            {icon && <div className="stat-icon">{icon}</div>}
            <div className="stat-content">
                <span className="stat-label">{label}</span>
                <span className="stat-value">{value}</span>
                {!isCompact && (
                    <span className={`stat-change ${trend || 'neutral'}`}>
                        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {change || 'Sin cambios este mes'}
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatCard;
