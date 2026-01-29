import React, { useState } from 'react';

interface TransactionsTableProps {
    transactions: any[];
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        month: '' // format YYYY-MM
    });

    const filteredTransactions = transactions.filter(t => {
        const matchesType = filters.type ? t.type === filters.type : true;
        const matchesCategory = filters.category ? t.category.toLowerCase().includes(filters.category.toLowerCase()) : true;

        // Month filter logic
        const matchesMonth = filters.month ? t.date.includes(filters.month) : true;

        return matchesType && matchesCategory && matchesMonth;
    });

    return (
        <div className="table-container">
            <div className="filter-bar glass">
                <div className="filter-item">
                    <label>Mes (2025-2030)</label>
                    <input
                        type="month"
                        min="2025-01"
                        max="2030-12"
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
                        placeholder="Filtrar por categoría..."
                        value={filters.category}
                        onChange={e => setFilters({ ...filters, category: e.target.value })}
                    />
                </div>
            </div>

            {filteredTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No hay transacciones que coincidan con los filtros.
                </div>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Monto</th>
                            <th>Método / Cuenta</th>
                            <th>Categoría</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((t, i) => (
                            <tr key={i}>
                                <td>{t.date}</td>
                                <td>{t.type}</td>
                                <td className={`amount ${t.amount.toString().startsWith('+') ? 'income' : 'expense'}`}>
                                    {t.amount}
                                </td>
                                <td>
                                    <span className="tag" style={{ background: t.cardColor || 'var(--accent-soft)', color: t.cardColor ? '#fff' : 'var(--text-main)' }}>
                                        {t.method}
                                    </span>
                                </td>
                                <td>{t.category}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TransactionsTable;
