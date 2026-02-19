import React from 'react';
import '../styles/dashboard.css';

interface BudgetTableProps {
    budgets: any[];
    transactions: any[];
    categories: any[];
    loans: any[];
    installmentPlans: any[];
    kpis: {
        income: number;
        fixed: number;
        variable: number;
        remaining: number;
    };
    onEdit: (budget: any) => void;
    onDelete: (id: string) => void;
    onAdd: (categoryId: string) => void;
    onOpenFull?: () => void;
    selectedMonth: string;
    isDetailedView?: boolean;
}

const BudgetTable: React.FC<BudgetTableProps> = ({
    budgets, transactions, categories, loans, installmentPlans, kpis,
    onEdit, onDelete, onAdd, onOpenFull, selectedMonth, isDetailedView = false
}) => {
    const [viewMode, setViewMode] = React.useState<'top' | 'all'>(isDetailedView ? 'all' : 'top');
    const [showFixed, setShowFixed] = React.useState(!isDetailedView); // Expanded by default in desktop/detailed

    // Calculate days remaining in the month
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemaining = Math.max(1, lastDayOfMonth - today.getDate());
    const dailyAvailable = kpis.remaining > 0 ? kpis.remaining / daysRemaining : 0;

    // Filter budgets for the selected month and create a lookup map
    const budgetMap = budgets
        .filter(b => b.month === selectedMonth)
        .reduce((acc: any, b) => {
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

    const formatCurrency = (val: number) => {
        return `$${val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    const processedCategories = categories
        .filter(c => !c.name.toLowerCase().includes('crédito') && !c.name.toLowerCase().includes('tasa cero'))
        .map(category => {
            const budget = budgetMap[category.id];
            const spent = categorySpending[category.id] || 0;
            const limit = budget ? budget.amount : 0;
            const percentage = limit > 0 ? (spent / limit) * 100 : 0;
            return { ...category, budget, spent, limit, percentage };
        })
        .sort((a, b) => {
            // Sort by percentage used first, then by spent amount
            if (b.percentage !== a.percentage) return b.percentage - a.percentage;
            return b.spent - a.spent;
        });

    const isMobile = window.innerWidth < 768;
    const topCount = isMobile ? 3 : 5;
    const displayCategories = viewMode === 'top' ? processedCategories.slice(0, topCount) : processedCategories;

    return (
        <div className={`budget-v3-container ${isDetailedView ? 'detailed' : ''}`}>
            {/* 1. Header & KPIs Grid */}
            {!isDetailedView && <h4 className="v3-title">Presupuesto del mes</h4>}

            <div className="v3-kpi-grid">
                <div className="v3-kpi-card">
                    <span className="v3-label">Ingresos</span>
                    <span className="v3-val income">{formatCurrency(kpis.income)}</span>
                </div>
                <div className="v3-kpi-card">
                    <span className="v3-label">Fijos</span>
                    <span className="v3-val">{formatCurrency(kpis.fixed)}</span>
                </div>
                <div className="v3-kpi-card">
                    <span className="v3-label">Gastado</span>
                    <span className="v3-val spent">{formatCurrency(kpis.variable)}</span>
                </div>
                <div className="v3-kpi-card relative">
                    <span className="v3-label">Disponible</span>
                    <span className={`v3-val ${kpis.remaining < 0 ? 'negative' : 'positive'}`}>
                        {formatCurrency(kpis.remaining)}
                    </span>
                    {kpis.remaining < 0 && <span className="v3-badge">En rojo</span>}
                </div>
            </div>

            {dailyAvailable > 0 && kpis.income > 0 && (
                <div className="v3-daily-info">
                    Disponible diario: <strong>{formatCurrency(dailyAvailable)}</strong>
                </div>
            )}

            {/* 2. Collapsible Fixed Expenses */}
            <div className="v3-section">
                <div className="v3-section-header clickable" onClick={() => setShowFixed(!showFixed)}>
                    <span>Gastos fijos</span>
                    <span className={`v3-caret ${showFixed ? 'open' : ''}`}>▾</span>
                </div>

                {showFixed && (
                    <div className="v3-list-rows">
                        <div className="v3-row">
                            <div className="v3-row-main">
                                <span className="v3-icon">💳</span>
                                <div className="v3-row-info">
                                    <span className="v3-name">Créditos</span>
                                    <span className="v3-meta">{loans.length} activos</span>
                                </div>
                            </div>
                            <span className="v3-amount">{formatCurrency(loans.reduce((acc, l) => acc + (parseFloat(l.monthly_installment) || 0), 0))}</span>
                        </div>
                        <div className="v3-row">
                            <div className="v3-row-main">
                                <span className="v3-icon">🛍️</span>
                                <div className="v3-row-info">
                                    <span className="v3-name">Tasa Cero</span>
                                    <span className="v3-meta">{installmentPlans.filter(p => p.is_active).length} activos</span>
                                </div>
                            </div>
                            <span className="v3-amount">{formatCurrency(installmentPlans.filter(p => p.is_active).reduce((acc, p) => acc + (parseFloat(p.installment_amount) || 0), 0))}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Variable Budget Section */}
            <div className="v3-section">
                <div className="v3-section-header">
                    <span>Presupuesto</span>
                    {!isMobile && !isDetailedView && (
                        <div className="v3-segmented-control">
                            <button className={viewMode === 'top' ? 'active' : ''} onClick={() => setViewMode('top')}>TOP {topCount}</button>
                            <button className={viewMode === 'all' ? 'active' : ''} onClick={() => setViewMode('all')}>Todas</button>
                        </div>
                    )}
                </div>

                <div className="v3-list-rows">
                    {displayCategories.map(cat => {
                        const isOver = cat.limit > 0 && cat.spent > cat.limit;
                        const isWarning = cat.limit > 0 && cat.percentage > 80;
                        const barColor = isOver ? '#e74c3c' : (isWarning ? '#f39c12' : '#27ae60');

                        if (isMobile && !isDetailedView) {
                            return (
                                <div key={cat.id} className="v3-row v3-row-compact-mobile">
                                    <div className="v3-row-left">
                                        <span className="v3-icon-sm">{cat.icon || '📁'}</span>
                                        <span className="v3-name-sm">{cat.name}</span>
                                    </div>
                                    <div className="v3-row-right">
                                        <div className="v3-row-values-sm">
                                            <span className="v3-spent-sm">{formatCurrency(cat.spent)}</span>
                                            <span className="v3-limit-sm">/ {cat.limit > 0 ? formatCurrency(cat.limit) : '—'}</span>
                                        </div>
                                        <div className="v3-mini-progress">
                                            <div
                                                className="v3-mini-fill"
                                                style={{ width: `${Math.min(cat.percentage, 100)}%`, backgroundColor: barColor }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={cat.id} className="v3-row v3-budget-row">
                                <div className="v3-row-main">
                                    <span className="v3-icon">{cat.icon || '📁'}</span>
                                    <div className="v3-row-content">
                                        <div className="v3-row-top">
                                            <span className="v3-name">{cat.name}</span>
                                            <div className="v3-row-values">
                                                <span className="v3-spent">{formatCurrency(cat.spent)}</span>
                                                <span className="v3-divider">/</span>
                                                <span className="v3-limit">{cat.limit > 0 ? formatCurrency(cat.limit) : '—'}</span>
                                            </div>
                                        </div>
                                        <div className="v3-progress-container">
                                            <div className="v3-progress-bg">
                                                <div
                                                    className="v3-progress-fill"
                                                    style={{
                                                        width: `${Math.min(cat.percentage, 100)}%`,
                                                        backgroundColor: barColor
                                                    }}
                                                />
                                            </div>
                                            {cat.limit === 0 && (
                                                <button className="v3-link-btn" onClick={() => onAdd(cat.id)}>Definir</button>
                                            )}
                                            {cat.limit > 0 && (
                                                <div className="v3-row-actions-mini">
                                                    <button className="v3-icon-btn" onClick={() => onEdit(cat.budget)}>✎</button>
                                                    <button className="v3-icon-btn del" onClick={() => onDelete(cat.budget.id)}>&times;</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {viewMode === 'top' && processedCategories.length > topCount && (
                    <button className="v3-full-btn" onClick={() => onOpenFull ? onOpenFull() : setViewMode('all')}>
                        Ver presupuesto completo
                    </button>
                )}
            </div>

            <style>{`
                .budget-v3-container { display: flex; flex-direction: column; gap: 12px; color: var(--text-main); }
                .v3-title { font-size: 0.8rem; font-weight: 850; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin: 0; }
                
                /* KPIs Grid */
                .v3-kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
                .v3-kpi-card { 
                    background: white; border: 1px solid var(--accent-soft); border-radius: 12px; 
                    padding: 8px 12px; display: flex; flex-direction: column; height: 56px; justify-content: center;
                }
                .v3-label { font-size: 0.6rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 2px; }
                .v3-val { font-size: 0.95rem; font-weight: 900; letter-spacing: -0.02em; }
                .v3-val.income { color: #2ecc71; }
                .v3-val.spent { color: var(--text-muted); }
                .v3-val.positive { color: #2ecc71; }
                .v3-val.negative { color: #e74c3c; }
                
                .v3-badge { 
                    position: absolute; top: 6px; right: 8px; background: rgba(231, 76, 60, 0.1); 
                    color: #e74c3c; font-size: 0.5rem; font-weight: 900; padding: 2px 5px; border-radius: 4px; text-transform: uppercase;
                }
                .relative { position: relative; }

                .v3-daily-info { 
                    font-size: 0.7rem; color: var(--text-muted); background: var(--bg-primary); 
                    padding: 6px 12px; border-radius: 8px; align-self: flex-start;
                }

                /* Sections */
                .v3-section { display: flex; flex-direction: column; gap: 8px; }
                .v3-section-header { 
                    display: flex; justify-content: space-between; align-items: center; 
                    font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted);
                }
                .v3-section-header.clickable { cursor: pointer; }
                .v3-caret { transition: transform 0.2s; font-size: 1rem; }
                .v3-caret.open { transform: rotate(180deg); }

                /* List Rows */
                .v3-list-rows { display: flex; flex-direction: column; background: white; border: 1px solid var(--accent-soft); border-radius: 12px; overflow: hidden; }
                .v3-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px solid var(--bg-primary); min-height: 44px; }
                .v3-row:last-child { border-bottom: none; }
                .v3-row-main { display: flex; align-items: center; gap: 10px; flex: 1; }
                .v3-icon { font-size: 1.1rem; }
                .v3-row-info { display: flex; flex-direction: column; }
                .v3-name { font-size: 0.8rem; font-weight: 800; color: var(--text-main); }
                .v3-meta { font-size: 0.65rem; color: var(--text-muted); }
                .v3-amount { font-size: 0.85rem; font-weight: 850; }

                /* Budget Row Specifics */
                .v3-budget-row { min-height: 48px; padding: 6px 12px; }
                .v3-row-content { flex: 1; display: flex; flex-direction: column; gap: 4px; }
                .v3-row-top { display: flex; justify-content: space-between; align-items: center; }
                .v3-row-values { font-size: 0.7rem; font-weight: 800; }
                .v3-divider { margin: 0 2px; color: var(--accent-medium); }
                .v3-limit { color: var(--text-muted); font-size: 0.65rem; }
                
                .v3-progress-container { display: flex; align-items: center; gap: 8px; width: 100%; }
                .v3-progress-bg { flex: 1; height: 3px; background: var(--bg-primary); border-radius: 2px; overflow: hidden; }
                .v3-progress-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease-out; }
                
                .v3-link-btn { background: none; border: none; color: var(--text-muted); font-size: 0.6rem; font-weight: 800; text-decoration: underline; cursor: pointer; padding: 0; }
                .v3-row-actions-mini { display: flex; gap: 6px; }
                .v3-icon-btn { background: none; border: none; font-size: 0.7rem; color: var(--text-muted); cursor: pointer; padding: 0 4px; border-radius: 4px; }
                .v3-icon-btn:hover { background: var(--bg-primary); }
                .v3-icon-btn.del { color: #e74c3c; font-size: 0.9rem; }

                /* Controls */
                .v3-segmented-control { display: flex; background: var(--bg-primary); padding: 2px; border-radius: 8px; }
                .v3-segmented-control button { 
                    border: none; background: none; font-size: 0.55rem; font-weight: 800; padding: 3px 8px; 
                    border-radius: 6px; cursor: pointer; color: var(--text-muted);
                }
                .v3-segmented-control button.active { background: white; color: var(--text-main); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                
                .v3-full-btn { 
                    margin-top: 4px; background: var(--bg-primary); border: 1px solid var(--accent-soft); 
                    color: var(--text-main); padding: 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 800; 
                    cursor: pointer; transition: all 0.2s;
                }
                .v3-full-btn:hover { background: white; border-color: var(--accent-medium); }

                @media (max-width: 768px) {
                    .budget-v3-container { gap: 8px; }
                    .v3-kpi-grid { gap: 6px; }
                    .v3-kpi-card { padding: 5px 10px; height: 48px; border-radius: 10px; }
                    .v3-val { font-size: 0.85rem; }
                    .v3-label { font-size: 0.55rem; }
                    .v3-row { padding: 6px 10px; min-height: 38px; }
                    .v3-name { font-size: 0.75rem; }
                    .v3-amount { font-size: 0.8rem; }
                    .v3-list-rows { border-radius: 12px; }
                    .v3-budget-row { padding: 4px 10px; min-height: 42px; }
                    .v3-row-content { gap: 2px; }
                    .v3-progress-container { gap: 6px; }
                    .v3-row-values { font-size: 0.65rem; }

                    /* Compact rows */
                    .v3-row-compact-mobile { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; min-height: 40px; }
                    .v3-row-left { display: flex; align-items: center; gap: 8px; flex: 1; }
                    .v3-row-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; min-width: 80px; }
                    .v3-icon-sm { font-size: 0.9rem; }
                    .v3-name-sm { font-size: 0.75rem; font-weight: 750; color: var(--text-main); }
                    .v3-row-values-sm { display: flex; gap: 4px; align-items: baseline; }
                    .v3-spent-sm { font-size: 0.75rem; font-weight: 850; }
                    .v3-limit-sm { font-size: 0.6rem; color: var(--text-muted); font-weight: 600; }
                    .v3-mini-progress { width: 40px; height: 1.5px; background: var(--bg-primary); border-radius: 1px; overflow: hidden; }
                    .v3-mini-fill { height: 100%; transition: width 0.3s; }
                }
            `}</style>
        </div>
    );
};

export default BudgetTable;
