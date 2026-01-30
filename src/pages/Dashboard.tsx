import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import TransactionsTable from '../components/TransactionsTable';
import SpendPie from '../components/SpendPie';
import TransactionForm from '../components/TransactionForm';
import BudgetTable from '../components/BudgetTable';
import BudgetForm from '../components/BudgetForm';
import '../styles/dashboard.css';

interface DashboardProps {
    transactions: any[];
    accounts: any[];
    categories: any[];
    budgets: any[];
    onAddTransaction: (t: any) => void;
    onUpdateTransaction: (id: string, t: any) => void;
    onDeleteTransaction?: (tx: any) => void;
    onAddBudget: (b: any) => void;
    onUpdateBudget: (updated: any) => void;
    onDeleteBudget: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    transactions, accounts, categories, budgets,
    onAddTransaction, onUpdateTransaction, onDeleteTransaction,
    onAddBudget, onUpdateBudget, onDeleteBudget
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('Gasto');
    const [editingTx, setEditingTx] = useState<any>(null);
    const [editingBudget, setEditingBudget] = useState<any>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

    // Dynamic KPI Calculation - Filter out Savings from "Available"
    const accountSum = accounts
        .filter(a => a.type !== 'Ahorro')
        .reduce((acc, a) => {
            const val = parseFloat(a.balance.toString().replace('$', '').replace(',', ''));
            return acc + val;
        }, 0);

    const income = transactions
        .filter(t => t.type?.toLowerCase() === 'ingreso' && t.date.startsWith(selectedMonth) && t.owner === 'Mayra')
        .reduce((acc, t) => acc + parseFloat(t.amount.toString().replace('+$', '').replace(',', '')), 0);

    const expenses = transactions
        .filter(t => t.type?.toLowerCase() === 'gasto' && t.date.startsWith(selectedMonth) && t.owner === 'Mayra')
        .reduce((acc, t) => acc + parseFloat(t.amount.toString().replace('-$', '').replace(',', '')), 0);

    // Calculate initial balance of the month by backtracking from current accountSum
    // Backtrack = accountSum - (sum of income since selectedMonth start) + (sum of expenses since selectedMonth start)
    const netChangeSinceSelectedMonth = transactions
        .filter(t => t.date >= `${selectedMonth}-01` && t.owner === 'Mayra')
        .reduce((acc, t) => {
            const amountStr = t.amount.toString().replace(/[^\d.-]/g, '');
            const val = Math.abs(parseFloat(amountStr));
            if (t.type?.toLowerCase() === 'ingreso') return acc + val;
            if (t.type?.toLowerCase() === 'gasto') return acc - val;
            return acc; // Transfers don't change TOTAL balance
        }, 0);

    const totalBalance = accountSum;
    const initialBalance = accountSum - netChangeSinceSelectedMonth;

    const totalDebt = accounts
        .filter(a => a.type === 'Tarjeta de Crédito')
        .reduce((acc, a) => {
            const val = parseFloat(a.balance.toString().replace('$', '').replace(',', ''));
            return val < 0 ? acc + Math.abs(val) : acc;
        }, 0);

    const totalSavings = accounts
        .filter(a => a.type === 'Ahorro')
        .reduce((acc, a) => {
            const val = parseFloat(a.balance.toString().replace(/[^\d.-]/g, ''));
            return acc + val;
        }, 0);

    const handleEdit = (tx: any) => {
        setEditingTx(tx);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingTx(null);
        setShowTypeSelector(false);
    };

    const handleOpenForm = (type: string) => {
        setSelectedType(type);
        localStorage.setItem('lastTransactionType', type);
        setIsFormOpen(true);
        setShowTypeSelector(false);
    };

    const iconBase = (paths: React.ReactNode) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {paths}
        </svg>
    );

    return (
        <div className="main-content">
            <header className="header">
                <div className="header-info">
                    <h1>Control financiero</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="month-selector-piquis"
                        />
                        <span className="badge-quote" style={{ margin: 0 }}>Pequeños hábitos, grandes resultados</span>
                    </div>
                </div>

                {/* Desktop "New" button - Hidden on mobile in favor of quick action block */}
                <button className="btn-add desktop-only" onClick={() => setShowTypeSelector(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nueva transacción
                </button>
            </header>

            {/* Quick Action Block */}
            <section className="quick-action-block glass">
                <div className="quick-action-info">
                    <h3>Hoy</h3>
                    <p>Registra tus gastos del día (toma 1 minuto)</p>
                </div>
                <button className="btn-quick-gasto" onClick={() => handleOpenForm('Gasto')}>
                    Agregar gasto rápido
                </button>
            </section>

            {/* Type Selector Modal */}
            {showTypeSelector && (
                <div className="modal-overlay" onClick={() => setShowTypeSelector(false)}>
                    <div className="modal-content selector-modal" onClick={e => e.stopPropagation()}>
                        <h2>¿Qué quieres registrar?</h2>
                        <div className="selector-grid">
                            <button className="selector-btn gasto" onClick={() => handleOpenForm('Gasto')}>
                                <span className="icon">💸</span>
                                <span>Gasto</span>
                            </button>
                            <button className="selector-btn ingreso" onClick={() => handleOpenForm('Ingreso')}>
                                <span className="icon">💰</span>
                                <span>Ingreso</span>
                            </button>
                            <button className="selector-btn transferencia" onClick={() => handleOpenForm('Transferencia')}>
                                <span className="icon">🔄</span>
                                <span>Transferencia</span>
                            </button>
                        </div>
                        <button className="btn-secondary" onClick={() => setShowTypeSelector(false)}>Cancelar</button>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <TransactionForm
                    onClose={handleCloseForm}
                    onAdd={(t) => {
                        onAddTransaction(t);
                        handleCloseForm();
                    }}
                    onUpdate={(id, t) => {
                        onUpdateTransaction(id, t);
                        handleCloseForm();
                    }}
                    accounts={accounts}
                    categories={categories}
                    editData={editingTx}
                    defaultType={selectedType}
                />
            )}

            {isBudgetFormOpen && (
                <BudgetForm
                    categories={categories}
                    selectedMonth={selectedMonth}
                    editData={editingBudget}
                    onClose={() => setIsBudgetFormOpen(false)}
                    onSave={(b) => {
                        if (editingBudget) onUpdateBudget(b);
                        else onAddBudget(b);
                    }}
                />
            )}

            <div className="kpi-grid">
                <StatCard
                    label="Saldo Inicial"
                    value={`$${initialBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                    change="+ $0 este mes"
                    trend="neutral"
                    icon={iconBase(<>
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </>)}
                />
                <StatCard
                    label="Disponible hoy"
                    value={`$${totalBalance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                    change="+ $0 este mes"
                    trend="up"
                    icon={iconBase(<>
                        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                        <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                    </>)}
                />
                <StatCard
                    label="Ingresado este mes"
                    value={`$${income.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                    change="+ $0 este mes"
                    trend="up"
                    icon={iconBase(<>
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                    </>)}
                />
                <StatCard
                    label="Gastado este mes"
                    value={`$${expenses.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                    change="$0 este mes"
                    trend="neutral"
                    icon={iconBase(<>
                        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
                        <path d="M16 8h-6" />
                        <path d="M16 12H8" />
                        <path d="M13 16H8" />
                    </>)}
                />
                <StatCard
                    label="Ahorro total"
                    value={`$${totalSavings.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                    change={`Basado en ${accounts.filter(a => a.type === 'Ahorro').length} cuentas`}
                    trend="neutral"
                    icon={iconBase(<>
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                    </>)}
                />
                <StatCard
                    label="Deuda pendiente"
                    value={`$${totalDebt.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                    change="Sin cambios este mes"
                    trend="neutral"
                    icon={iconBase(<>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </>)}
                />
            </div>

            <div className="dashboard-grid">
                <div className="left-column">
                    <section className="section-card">
                        <h2 className="section-title">Transacciones recientes</h2>
                        <TransactionsTable
                            transactions={transactions.filter(t => t.date.startsWith(selectedMonth)).slice(0, 5)}
                            categories={categories}
                            onOpenForm={() => handleOpenForm('Gasto')}
                            onEdit={handleEdit}
                            onDelete={onDeleteTransaction}
                        />
                    </section>
                </div>

                <div className="right-column">
                    <section className="section-card" style={{ marginBottom: '1.5rem' }}>
                        <h2 className="section-title">Distribución de gastos</h2>
                        {transactions.filter(t => t.type?.toLowerCase() === 'gasto' && t.date.startsWith(selectedMonth) && t.owner === 'Mayra').length === 0 ? (
                            <div className="empty-state-mini">
                                <p>No hay data para este mes</p>
                                <button className="btn-secondary btn-small" onClick={() => handleOpenForm('Gasto')}>Registrar gasto</button>
                            </div>
                        ) : (
                            <SpendPie
                                transactions={transactions.filter(t => t.date.startsWith(selectedMonth) && t.owner === 'Mayra')}
                                categories={categories}
                            />
                        )}
                    </section>

                    <section className="section-card">
                        <h2 className="section-title">Resumen de presupuesto</h2>
                        <BudgetTable
                            budgets={budgets}
                            transactions={transactions.filter(t => t.owner === 'Mayra')}
                            categories={categories}
                            selectedMonth={selectedMonth}
                            onAdd={(catId) => {
                                setEditingBudget({ category_id: catId });
                                setIsBudgetFormOpen(true);
                            }}
                            onEdit={(b) => {
                                setEditingBudget(b);
                                setIsBudgetFormOpen(true);
                            }}
                            onDelete={onDeleteBudget}
                        />
                    </section>
                </div>
            </div>

            <style>{`
                .quick-action-block {
                    margin-bottom: 2rem;
                    padding: 1.25rem 1.5rem;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-radius: var(--radius-lg);
                    gap: 1rem;
                }
                .quick-action-info h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 2px; }
                .quick-action-info p { font-size: 0.85rem; color: var(--text-muted); }
                .btn-quick-gasto {
                    background: var(--text-main);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.25rem;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .selector-modal { text-align: center; }
                .selector-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1rem;
                    margin: 2rem 0;
                }
                .selector-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                    padding: 1.5rem 0.5rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--accent-soft);
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .selector-btn:hover { background: var(--bg-primary); transform: translateY(-3px); }
                .selector-btn .icon { font-size: 1.5rem; }
                .selector-btn span:last-child { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); }
                
                .empty-state-mini {
                    text-align: center;
                    padding: 1rem;
                    color: var(--text-muted);
                }
                .btn-small { padding: 0.5rem 1rem; font-size: 0.8rem; height: auto; width: auto; margin-top: 10px; }
                .disabled { opacity: 0.5; cursor: not-allowed; }

                @media (max-width: 640px) {
                    .quick-action-block { flex-direction: column; text-align: center; }
                    .btn-quick-gasto { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
