import React, { useState } from 'react';

interface TransactionsTableProps {
    transactions: any[];
    onOpenForm?: () => void;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions, onOpenForm }) => {
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        month: ''
    });

    const filteredTransactions = transactions.filter(t => {
        const matchesType = filters.type ? t.type === filters.type : true;
        const matchesCategory = filters.category ? t.category.toLowerCase().includes(filters.category.toLowerCase()) : true;
        const matchesMonth = filters.month ? t.date.includes(filters.month) : true;
        return matchesType && matchesCategory && matchesMonth;
    });

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
                <button className="btn-secondary" onClick={onOpenForm}>
                    Registrar primera transacción
                </button>
            </div>
        );
    }

    return (
        <div className="table-container">
            <div className="filter-bar">
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
                    <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
                        <option value="">Todos</option>
                        <option value="Gasto">Gasto</option>
                        <option value="Ingreso">Ingreso</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Pago de Deuda">Pago de Deuda</option>
                    </select>
                </div>
                <div className="filter-item">
                    <label>Categoría</label>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={filters.category}
                        onChange={e => setFilters({ ...filters, category: e.target.value })}
                    />
                </div>
            </div>

            {filteredTransactions.length === 0 ? (
                <div className="empty-state">
                    <p className="empty-text">No hay resultados para estos filtros.</p>
                </div>
            ) : (
                <>
                    {/* Desktop View */}
                    <table className="desktop-only">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Categoría</th>
                                <th>Tipo</th>
                                <th style={{ textAlign: 'right' }}>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((t, i) => (
                                <tr key={i}>
                                    <td>{t.date}</td>
                                    <td>{t.category}</td>
                                    <td>{t.type}</td>
                                    <td style={{ textAlign: 'right' }} className={`tr-amount ${t.type === 'Ingreso' ? 'income' : 'expense'}`}>
                                        {t.amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile View */}
                    <div className="mobile-only">
                        {filteredTransactions.map((t, i) => (
                            <div key={i} className="transaction-card">
                                <div className="tr-info">
                                    <span className="tr-category">{t.category}</span>
                                    <span className="tr-date">{t.date} • {t.type}</span>
                                </div>
                                <span className={`tr-amount ${t.type === 'Ingreso' ? 'income' : 'expense'}`}>
                                    {t.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default TransactionsTable;
