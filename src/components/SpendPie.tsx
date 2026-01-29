import React from 'react';

const SpendPie: React.FC = () => {
    // Mock data cleared
    const data: any[] = [];

    return (
        <div className="donut-container">
            {data.length === 0 ? (
                <div className="empty-state" style={{ padding: '1rem' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        border: '8px solid var(--accent-soft)',
                        borderTopColor: 'transparent',
                        margin: '0 auto 1.5rem',
                        opacity: 0.5
                    }} />
                    <p className="empty-text">No hay gastos registrados para este periodo.</p>
                </div>
            ) : (
                <div className="donut">
                    {/* Real chart implementation would go here */}
                </div>
            )}
        </div>
    );
};

export default SpendPie;
