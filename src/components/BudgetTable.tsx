import React from 'react';
import '../styles/dashboard.css';

interface BudgetTableProps {
    budgets: any[];
    transactions: any[];
    categories: any[];
    onEdit: (budget: any) => void;
    onDelete: (id: string) => void;
    onAdd: (categoryId: string) => void;
    selectedMonth: string;
}

const BudgetTable: React.FC<BudgetTableProps> = ({ budgets, transactions, categories, onEdit, onDelete, onAdd, selectedMonth }) => {
    // Filter budgets for the selected month and create a lookup map
    const budgetMap = budgets
        .filter(b => b.month === selectedMonth)
        .reduce((acc: any, b) => {
            // Note: handles both categoryId and category_id due to previous bug
            const catId = b.category_id || b.categoryId;
            if (catId) acc[catId] = b;
            return acc;
        }, {});

    // Calculate actual spending per category for the current month
    const categorySpending = transactions
        .filter(t => t.type?.toLowerCase() === 'gasto' && t.date.startsWith(selectedMonth))
        .reduce((acc: any, t) => {
            const catId = t.category_id;
            if (catId) {
                acc[catId] = (acc[catId] || 0) + Math.abs(parseFloat(t.amount.toString().replace(/[^\d.-]/g, '')));
            }
            return acc;
        }, {});

    return (
        <div className="budget-container">
            <div className="budget-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>GESTIÓN POR CATEGORÍA</span>
                </div>

                {categories.map(category => {
                    const budget = budgetMap[category.id];
                    const spent = categorySpending[category.id] || 0;
                    const limit = budget ? budget.amount : 0;
                    const remaining = limit - spent;
                    const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

                    // Color logic
                    const isOver = limit > 0 && spent > limit;
                    const isWarning = limit > 0 && percentage > 80;
                    const barColor = isOver ? 'var(--negative)' : (isWarning ? '#ffb946' : '#1dd1a1');

                    return (
                        <div key={category.id} className="budget-item" style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-end' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '1.25rem' }}>{category.icon || '📁'}</span>
                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>{category.name}</h4>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {limit > 0 ? (
                                                <>
                                                    {isOver ? 'Excedido por ' : 'Resta '}
                                                    <strong style={{ color: isOver ? 'var(--negative)' : 'inherit' }}>
                                                        ${Math.abs(remaining).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                    </strong>
                                                </>
                                            ) : (
                                                'Sin presupuesto definido'
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>
                                        ${spent.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                        <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem' }}> / ${limit}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                        <button
                                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: budget ? 'var(--text-muted)' : 'var(--text-main)' }}
                                            onClick={() => budget ? onEdit(budget) : onAdd(category.id)}
                                            title={budget ? "Editar presupuesto" : "Definir presupuesto"}
                                        >
                                            {budget ? (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            ) : (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                </svg>
                                            )}
                                        </button>
                                        {budget && (
                                            <button
                                                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--negative)', opacity: 0.6 }}
                                                onClick={() => onDelete(budget.id)}
                                                title="Eliminar presupuesto"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="progress-bar-bg" style={{
                                height: '8px',
                                backgroundColor: 'var(--accent-soft)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                opacity: limit > 0 ? 1 : 0.3
                            }}>
                                <div className="progress-bar-fill" style={{
                                    height: '100%',
                                    width: `${percentage}%`,
                                    backgroundColor: barColor,
                                    transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BudgetTable;
