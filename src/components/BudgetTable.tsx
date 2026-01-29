import React from 'react';

const BudgetTable: React.FC = () => {
    // Mock data cleared
    const budgets: any[] = [];

    return (
        <div className="budget-container">
            {budgets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                    No hay presupuestos configurados.
                </div>
            ) : (
                <>
                    <table>
                        <thead>
                            <tr>
                                <th>Categoría</th>
                                <th>Límite de Presupuesto</th>
                                <th>Gasto Actual</th>
                                <th>Saldo Restante</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.map((b, i) => {
                                const remaining = b.limit - b.spent;

                                return (
                                    <tr key={i}>
                                        <td>{b.category}</td>
                                        <td>${b.limit}</td>
                                        <td>${b.spent}</td>
                                        <td style={{ color: remaining < 0 ? 'var(--negative)' : 'var(--positive)', fontWeight: 600 }}>
                                            {remaining < 0 ? 'Excedido' : `$${remaining}`}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div style={{ marginTop: '1rem' }}>
                        {budgets.map((b, i) => (
                            <div key={i} style={{ marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                                    <span>{b.category}</span>
                                    <span>{b.spent} / {b.limit}</span>
                                </div>
                                <div className="progress-container">
                                    <div
                                        className={`progress-bar ${b.spent > b.limit ? 'warning' : ''}`}
                                        style={{ width: `${(b.spent / b.limit) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BudgetTable;
