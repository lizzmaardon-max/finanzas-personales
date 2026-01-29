import React from 'react';

const SpendPie: React.FC = () => {
    // Mock data cleared - should be linked to real transactions in the future
    const data: any[] = [];

    return (
        <div className="donut-container">
            {data.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                    No hay gastos registrados para este periodo.
                </div>
            ) : (
                <>
                    <div className="donut">
                        <div className="donut-inner-text">
                            <p className="donut-label">Gastos de</p>
                            <p className="donut-value">Mensual</p>
                        </div>
                    </div>

                    <div className="legend-grid">
                        {data.map((item, i) => (
                            <div key={i} className="legend-item">
                                <span className="dot" style={{ background: item.color }}></span>
                                <span>{item.label} ({item.value})</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SpendPie;
