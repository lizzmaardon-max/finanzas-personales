import React, { useState } from 'react';
import '../styles/dashboard.css';

interface TransactionsTableProps {
    transactions: any[];
    categories: any[];
    onOpenForm?: () => void;
    onEdit?: (transaction: any) => void;
    onDelete?: (transaction: any) => void;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, categories, onOpenForm, onEdit, onDelete }) => {
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        month: '' // Default to empty to show all
    });

    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

    const filteredTransactions = transactions.filter(t => {
        const matchesType = filters.type ? t.type === filters.type : true;
        const matchesCategory = filters.category ? (t.category?.toLowerCase() || '').includes(filters.category.toLowerCase()) : true;
        const matchesMonth = filters.month ? t.date.includes(filters.month) : true;
        return matchesType && matchesCategory && matchesMonth;
    });

    const hasActiveFilters = filters.type !== '' || filters.category !== '' || filters.month !== '';

    const resetFilters = () => {
        setFilters({
            type: '',
            category: '',
            month: ''
        });
    };

    if (transactions.length === 0) {
        return (
            <div className="empty-state">
                <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M7 10h4" />
                    <path d="M7 14h10" />
                </svg>
                <h3 className="empty-title">Aún no hay movimientos</h3>
                <p className="empty-text">Registra tu primera transacción para ver tu progreso.</p>
                <button className="btn btn-primary" onClick={onOpenForm}>
                    Registrar primera transacción
                </button>
            </div>
        );
    }

    return (
        <div className="table-container">
            <div className="filter-bar-piquis">
                <div className="filter-item">
                    <label>Mes</label>
                    <input
                        type="month"
                        value={filters.month}
                        onChange={e => setFilters({ ...filters, month: e.target.value })}
                    />
                </div>
                <div className="filter-item">
                    <label>Tipo</label>
                    <div className="custom-select-wrapper">
                        <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
                            <option value="">Todos</option>
                            <option value="Ingreso">Ingreso</option>
                            <option value="Gasto">Gasto</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>
                    </div>
                </div>
                <div className="filter-item combobox-container">
                    <label>Categoría</label>
                    <div className="combobox-wrapper">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={filters.category}
                            onFocus={() => setShowCategoryDropdown(true)}
                            onChange={e => {
                                setFilters({ ...filters, category: e.target.value });
                                setShowCategoryDropdown(true);
                            }}
                        />
                        {showCategoryDropdown && (
                            <div className="combobox-dropdown glass">
                                {categories
                                    .filter(c => c.name.toLowerCase().includes(filters.category.toLowerCase()))
                                    .map(c => (
                                        <div
                                            key={c.id}
                                            className="combobox-option"
                                            onClick={() => {
                                                setFilters({ ...filters, category: c.name });
                                                setShowCategoryDropdown(false);
                                            }}
                                        >
                                            <span className="icon">{c.icon}</span>
                                            <span>{c.name}</span>
                                        </div>
                                    ))
                                }
                                {categories.filter(c => c.name.toLowerCase().includes(filters.category.toLowerCase())).length === 0 && (
                                    <div className="combobox-no-results">No hay resultados</div>
                                )}
                            </div>
                        )}
                        {showCategoryDropdown && <div className="combobox-overlay" onClick={() => setShowCategoryDropdown(false)}></div>}
                    </div>
                </div>
                {hasActiveFilters && (
                    <button className="btn-reset-filters" onClick={resetFilters}>
                        Limpiar filtros
                    </button>
                )}
            </div>

            {filteredTransactions.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem' }}>
                    <p className="empty-text">No hay resultados para estos filtros.</p>
                </div>
            ) : (
                <>
                    {/* Desktop View: Table */}
                    <div className="transactions-list-piquis desktop-only">
                        <div className="table-header-piquis">
                            <div className="col-date">Fecha</div>
                            <div className="col-category">Categoría</div>
                            <div className="col-account">Cuenta</div>
                            <div className="col-type">Tipo</div>
                            <div className="col-amount" style={{ textAlign: 'right', paddingRight: '16px' }}>Monto</div>
                            <div className="col-actions"></div>
                        </div>

                        {filteredTransactions.map((t) => (
                            <div key={t.id} className="transaction-row-piquis" onClick={() => onEdit && onEdit(t)}>
                                <div className="col-date">{t.date}</div>
                                <div className="col-category">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <span className="category-tag-mini">{t.category}</span>
                                        {t.description && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                                                {t.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="col-account">
                                    <span className="account-indicator" style={{ borderLeft: `3px solid ${t.cardColor || '#ccc'}` }}>
                                        {t.method}
                                    </span>
                                </div>
                                <div className="col-type">
                                    <span className={`type-tag-mini ${t.type?.toLowerCase() === 'ingreso' ? 'income' :
                                        t.type?.toLowerCase() === 'gasto' ? 'expense' : 'transfer'
                                        }`}>
                                        {t.type}
                                    </span>
                                </div>
                                <div className="col-amount" style={{ textAlign: 'right' }}>
                                    <span className={`amount-text ${t.type?.toLowerCase() === 'ingreso' ? 'positive' :
                                        (t.type?.toLowerCase() === 'transferencia') ? 'neutral' : 'negative'
                                        }`}>
                                        {t.amount}
                                    </span>
                                </div>
                                <div className="col-actions" onClick={e => e.stopPropagation()}>
                                    <button className="btn-icon-piquis" title="Editar" onClick={() => onEdit && onEdit(t)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                    </button>
                                    <button className="btn-icon-piquis delete" title="Eliminar" onClick={() => onDelete && onDelete(t)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mobile View: Cards */}
                    <div className="mobile-only transactions-cards-list">
                        {filteredTransactions.map((t) => (
                            <div key={t.id} className="transaction-card-mobile glass" onClick={() => onEdit && onEdit(t)}>
                                <div className="card-top">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span className="card-category">{t.category}</span>
                                        {t.description && (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                {t.description}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`card-amount ${t.type?.toLowerCase() === 'ingreso' ? 'positive' :
                                        (t.type?.toLowerCase() === 'transferencia') ? 'neutral' : 'negative'
                                        }`}>
                                        {t.amount}
                                    </span>
                                </div>
                                <div className="card-bottom">
                                    <div className="card-meta">
                                        <span className="card-date">{t.date}</span>
                                        <span className={`card-type-badge ${t.type?.toLowerCase() === 'ingreso' ? 'income' :
                                            t.type?.toLowerCase() === 'gasto' ? 'expense' : 'transfer'
                                            }`}>
                                            {t.type}
                                        </span>
                                    </div>
                                    <div className="card-actions-row">
                                        <span className="card-account">
                                            <span className="dot" style={{ backgroundColor: t.cardColor || '#ccc' }}></span>
                                            {t.method}
                                        </span>
                                        <div className="card-actions" onClick={e => e.stopPropagation()}>
                                            <button className="btn-icon-piquis delete" onClick={() => onDelete && onDelete(t)}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <style>{`
                .filter-bar-piquis {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                    align-items: end;
                }

                .combobox-container { position: relative; }
                .combobox-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    width: 100%;
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 1001;
                    margin-top: 5px;
                    border-radius: var(--radius-md);
                    padding: 4px;
                }
                .combobox-option {
                    padding: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-radius: var(--radius-sm);
                    font-size: 0.9rem;
                    transition: background 0.2s;
                }
                .combobox-option:hover { background: var(--accent-soft); }
                .combobox-no-results { padding: 10px; font-size: 0.85rem; color: var(--text-muted); }
                .combobox-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; }
                
                .btn-reset-filters {
                    background: none;
                    border: none;
                    color: var(--accent-primary);
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                    padding: 8px;
                    text-decoration: underline;
                }

                /* Desktop Table Styles */
                .table-header-piquis, .transaction-row-piquis {
                    display: grid;
                    grid-template-columns: 120px 1fr 1fr 120px 100px 80px;
                    gap: 1rem;
                    align-items: center;
                    padding: 1rem;
                }

                .table-header-piquis {
                    border-bottom: 1px solid var(--accent-soft);
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .transaction-row-piquis {
                    border-bottom: 1px solid var(--accent-soft);
                    transition: all 0.2s ease;
                    cursor: pointer;
                    grid-template-columns: 120px 1fr 1fr 120px 100px 80px;
                }

                .transaction-row-piquis:hover {
                    background: var(--accent-soft);
                }

                .col-actions {
                    display: flex;
                    gap: 0.5rem;
                    justify-content: flex-end;
                }

                .category-tag-mini {
                    display: inline-block;
                    padding: 4px 10px;
                    background: var(--accent-soft);
                    border-radius: var(--radius-sm);
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .type-tag-mini {
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 4px;
                    text-transform: uppercase;
                }

                .amount-text {
                    font-weight: 700;
                    font-family: 'Inter', monospace;
                }

                /* Mobile Styles */
                .transactions-cards-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .transaction-card-mobile {
                    padding: 1rem;
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .card-top { display: flex; justify-content: space-between; align-items: center; }
                .card-category { font-weight: 800; font-size: 1.05rem; }
                .card-amount { font-weight: 900; font-size: 1.1rem; }
                .card-amount.positive { color: var(--positive); }
                .card-amount.negative { color: var(--negative); }
                
                .card-bottom { display: flex; justify-content: space-between; align-items: center; }
                .card-meta { display: flex; align-items: center; gap: 8px; }
                .card-date { font-size: 0.75rem; color: var(--text-muted); }
                .card-type-badge {
                    font-size: 0.65rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .card-type-badge.income { background: rgba(34, 197, 94, 0.1); color: var(--positive); }
                .card-type-badge.expense { background: rgba(239, 68, 68, 0.1); color: var(--negative); }
                .card-type-badge.transfer { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .card-type-badge.debt { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                
                .type-tag-mini.transfer { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .type-tag-mini.debt { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .amount-text.neutral { color: var(--text-main); }
                .card-amount.neutral { color: var(--text-main); }
                
                .card-account { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--text-muted); }
                .card-account .dot { width: 6px; height: 6px; border-radius: 50%; }

                .btn-icon-piquis.delete { color: var(--negative); }
                .btn-icon-piquis.delete:hover { background: rgba(239, 68, 68, 0.1); }
                
                .card-actions { display: flex; gap: 4px; }
                .card-actions-row { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 4px; }

                @media (max-width: 768px) {
                    .filter-bar-piquis { 
                        grid-template-columns: 1fr 1fr; 
                    }
                    .filter-item.combobox-container { grid-column: span 2; }
                    .btn-reset-filters { grid-column: span 2; justify-self: center; }
                }
            `}</style>
        </div >
    );
};

export default TransactionsTable;
