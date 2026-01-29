import React from 'react';

const BudgetTable: React.FC = () => {
    // Mock data cleared
    const budgets: any[] = [];

    return (
        <div className="budget-container">
            {budgets.length === 0 ? (
                <div className="empty-state" style={{ padding: '1rem' }}>
                    <svg className="empty-icon" style={{ width: '48px', height: '48px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <p className="empty-text">Aún no has configurado presupuestos.</p>
                    <button className="btn-secondary" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }} disabled>
                        Crear presupuesto
                    </button>
                </div>
            ) : (
                <div className="desktop-only">
                    {/* Table implementation */}
                </div>
            )}
        </div>
    );
};

export default BudgetTable;
