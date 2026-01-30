import React from 'react';

interface SpendPieProps {
    transactions: any[];
    categories: any[];
}

const SpendPie: React.FC<SpendPieProps> = ({ transactions, categories }) => {
    // Group expenses by category
    const expensesByCategory = transactions
        .filter(t => t.type?.toLowerCase() === 'gasto')
        .reduce((acc: any, t) => {
            const catId = t.category_id || 'Varios';
            const cat = categories.find(c => c.id === catId || c.name === t.category);
            const catName = cat ? cat.name : 'Varios';
            const catColor = cat ? cat.color : '#ccc';

            if (!acc[catName]) {
                acc[catName] = { name: catName, value: 0, color: catColor };
            }
            acc[catName].value += Math.abs(parseFloat(t.amount.toString().replace(/[^\d.-]/g, '')));
            return acc;
        }, {});

    const data = Object.values(expensesByCategory) as any[];
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Sort by value descending
    data.sort((a, b) => b.value - a.value);

    // SVG parameters
    const size = 200;
    const center = size / 2;
    const radius = 70;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius;

    let currentOffset = 0;

    return (
        <div className="donut-container">
            {total === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        border: '8px solid var(--accent-soft)',
                        borderTopColor: 'transparent',
                        margin: '0 auto 1.5rem',
                        opacity: 0.3
                    }} />
                    <p className="empty-text">No hay gastos en este mes.</p>
                </div>
            ) : (
                <div className="pie-layout" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
                    <div className="donut-wrapper" style={{ position: 'relative', width: size, height: size }}>
                        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                            {/* Background circle */}
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="transparent"
                                stroke="var(--accent-soft)"
                                strokeWidth={strokeWidth}
                            />
                            {/* Data segments */}
                            {data.map((item, index) => {
                                const percentage = item.value / total;
                                const strokeLength = circumference * percentage;
                                const offset = currentOffset;
                                currentOffset += strokeLength;

                                return (
                                    <circle
                                        key={index}
                                        cx={center}
                                        cy={center}
                                        r={radius}
                                        fill="transparent"
                                        stroke={item.color}
                                        strokeWidth={strokeWidth + 2}
                                        strokeDasharray={`${strokeLength} ${circumference}`}
                                        strokeDashoffset={-offset}
                                        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                                    />
                                );
                            })}
                        </svg>
                        <div className="donut-center-text" style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center'
                        }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block' }}>TOTAL</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>
                                ${total.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            </span>
                        </div>
                    </div>

                    <div className="pie-legend" style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {data.map((item, index) => (
                            <div key={index} className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: item.color }} />
                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.name}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        {((item.value / total) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpendPie;
