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
    loans: any[];
    installmentPlans: any[];
    onAddTransaction: (t: any) => void;
    onUpdateTransaction: (id: string, t: any) => void;
    onDeleteTransaction?: (tx: any) => void;
    onAddBudget: (b: any) => void;
    onUpdateBudget: (updated: any) => void;
    onDeleteBudget: (id: string) => void;
    onNavigate: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    transactions, accounts, categories, budgets, loans, installmentPlans,
    onAddTransaction, onUpdateTransaction, onDeleteTransaction,
    onAddBudget, onUpdateBudget, onDeleteBudget, onNavigate
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
    const [isFullBudgetOpen, setIsFullBudgetOpen] = useState(false);
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('Gasto');
    const [editingTx, setEditingTx] = useState<any>(null);
    const [editingBudget, setEditingBudget] = useState<any>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM

    // --- NEW BUDGET KPI CALCULATIONS ---

    // 1. Ingresos del mes
    const monthlyIncome = transactions
        .filter(t => t.type?.toLowerCase() === 'ingreso' && t.date.startsWith(selectedMonth))
        .reduce((acc, t) => acc + Math.abs(parseFloat(t.amount.toString().replace(/[^\d.-]/g, ''))), 0);

    // 2. Gastos Fijos (Préstamos + Tasa Cero)
    const fixedLoanExpenses = loans
        .reduce((acc, l) => acc + (parseFloat(l.monthly_installment) || 0), 0);

    const fixedInstallmentExpenses = installmentPlans
        .filter(p => p.is_active)
        .reduce((acc, p) => acc + (parseFloat(p.installment_amount) || 0), 0);

    const totalFixedExpenses = fixedLoanExpenses + fixedInstallmentExpenses;

    // 3. Gastos Variables Gastados
    // Exclude: "Créditos" and Tasa Cero transactions manually
    const creditCategory = categories.find(c => c.name.toLowerCase().includes('crédito'));
    const installmentsCategory = categories.find(c => c.name.toLowerCase().includes('compras') || c.name.toLowerCase().includes('tasa cero'));

    const variableExpenses = transactions
        .filter(t => {
            const isGasto = t.type?.toLowerCase() === 'gasto';
            const isThisMonth = t.date.startsWith(selectedMonth);
            const isFixed = (creditCategory && t.category_id === creditCategory.id) ||
                (installmentsCategory && t.category_id === installmentsCategory.id);
            return isGasto && isThisMonth && !isFixed;
        })
        .reduce((acc, t) => acc + Math.abs(parseFloat(t.amount.toString().replace(/[^\d.-]/g, ''))), 0);

    // 4. Disponible Restante
    const remainingAvailable = monthlyIncome - totalFixedExpenses - variableExpenses;

    // --- OLD KPI CALCULATIONS (Keeping for StatCards if needed, but will focus on Budget Summary) ---
    const accountSum = accounts
        .filter(a => a.type !== 'Ahorro')
        .reduce((acc, a) => {
            const val = parseFloat(a.balance.toString().replace(/[^\d.-]/g, ''));
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

            {/* Quick Add Chips */}
            <section className="quick-chips-section">
                <span className="chips-label">Gasto rápido:</span>
                <div className="chips-container">
                    {[
                        { label: '🛒 Super', cat: 'Supermercado' },
                        { label: '🍕 Comida', cat: 'Comida' },
                        { label: '🚗 Transporte', cat: 'Transporte' },
                        { label: '👶 Bebé', cat: 'Bebé' }
                    ].map(chip => (
                        <button
                            key={chip.label}
                            className="chip-btn"
                            onClick={() => {
                                const foundCat = categories.find(c => c.name.toLowerCase().includes(chip.cat.toLowerCase()));
                                handleOpenForm('Gasto');
                                if (foundCat) {
                                    // We'll need a way to pass the category to the form.
                                    // For now, let's just use the existing handleOpenForm which opens the modal.
                                    // I will modify Dashboard to support pre-filled categories if needed.
                                    setTimeout(() => {
                                        const event = new CustomEvent('prefill-category', { detail: foundCat.id });
                                        window.dispatchEvent(event);
                                    }, 100);
                                }
                            }}
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>
            </section>


            <div className="dashboard-grid v3-layout">
                <div className="left-column">
                    {/* Sección móvil: Presupuesto al inicio */}
                    <div className="mobile-only-section">
                        <section className="section-card budget-section-v3">
                            <BudgetTable
                                budgets={budgets}
                                transactions={transactions.filter(t => t.owner === 'Mayra')}
                                categories={categories}
                                selectedMonth={selectedMonth}
                                loans={loans}
                                installmentPlans={installmentPlans}
                                kpis={{
                                    income: monthlyIncome,
                                    fixed: totalFixedExpenses,
                                    variable: variableExpenses,
                                    remaining: remainingAvailable
                                }}
                                isDetailedView={false}
                                onViewFull={() => setIsFullBudgetOpen(true)}
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

                    <div className="quick-chips-section">
                        {categories.slice(0, 8).map(cat => (
                            <button key={cat.id} className="quick-chip" onClick={() => {
                                setEditingTx({
                                    amount: '',
                                    date: new Date().toISOString().split('T')[0],
                                    category_id: cat.id,
                                    type: 'Gasto',
                                    description: '',
                                    owner: 'Mayra'
                                });
                                setIsFormOpen(true);
                            }}>
                                <span className="chip-icon">{cat.icon || '📁'}</span>
                                <span className="chip-name">{cat.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="transactions-section">
                        <div className="section-header-flex">
                            <h2 className="section-title">Transacciones recientes</h2>
                            <button className="btn-secondary btn-small" onClick={() => handleOpenForm('Gasto')}>Registrar gasto</button>
                        </div>
                        <TransactionsTable
                            transactions={transactions.filter(t => t.date.startsWith(selectedMonth) && t.owner === 'Mayra').slice(0, 10)}
                            categories={categories}
                            onEdit={handleEdit}
                            onDelete={onDeleteTransaction}
                        />
                    </div>
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

                    <section className="section-card desktop-only-section">
                        <BudgetTable
                            budgets={budgets}
                            transactions={transactions.filter(t => t.owner === 'Mayra')}
                            categories={categories}
                            selectedMonth={selectedMonth}
                            loans={loans}
                            installmentPlans={installmentPlans}
                            kpis={{
                                income: monthlyIncome,
                                fixed: totalFixedExpenses,
                                variable: variableExpenses,
                                remaining: remainingAvailable
                            }}
                            isDetailedView={false}
                            onViewFull={() => setIsFullBudgetOpen(true)}
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
                .v3-layout { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; align-items: start; }
                .mobile-only-section { display: none; }
                
                .budget-section-v3 { border: 1px solid var(--accent-soft); }

                @media (max-width: 1024px) {
                    .v3-layout { grid-template-columns: 1fr; gap: 1.5rem; }
                    .mobile-only-section { display: block; margin-bottom: 2rem; }
                    .desktop-only-section { display: none; }
                    .right-column { order: 2; }
                    .left-column { order: 1; }
                }

                .quick-chips-section { display: flex; gap: 0.75rem; overflow-x: auto; padding: 4px 0 1.5rem 0; margin-bottom: 0.5rem; scrollbar-width: none; }
                .quick-chips-section::-webkit-scrollbar { display: none; }
                .quick-chip { 
                    display: flex; align-items: center; gap: 8px; padding: 8px 16px; 
                    background: white; border: 1px solid var(--accent-soft); border-radius: 20px;
                    font-size: 0.85rem; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.2s;
                }
                .quick-chip:hover { border-color: var(--accent-medium); background: var(--bg-primary); transform: translateY(-1px); }

                .section-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                
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
                
                .empty-state-mini { text-align: center; padding: 1rem; color: var(--text-muted); }
                .btn-small { padding: 0.5rem 1rem; font-size: 0.8rem; height: auto; width: auto; margin-top: 10px; }

                .onboarding-block {
                    margin-bottom: 2.5rem; padding: 2rem; border-radius: var(--radius-lg); text-align: center;
                }
                .steps-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
                .step-item { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
                .step-num {
                    width: 32px; height: 32px; background: var(--accent-soft); color: var(--accent-primary);
                    border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800;
                }
                .onboarding-actions { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
                .btn-onboarding { padding: 0.85rem 1.75rem; border-radius: var(--radius-md); border: none; font-weight: 700; cursor: pointer; }
                .btn-onboarding.gasto { background: var(--text-main); color: white; }
                .btn-onboarding.ingreso { background: var(--bg-primary); color: var(--text-main); border: 1px solid var(--accent-soft); }
                .btn-onboarding.cuenta { background: transparent; color: var(--text-muted); text-decoration: underline; }
            `}</style>

            {/* Modal Presupuesto Completo */}
            {isFullBudgetOpen && (
                <div className="modal-overlay" onClick={() => setIsFullBudgetOpen(false)}>
                    <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Presupuesto Detallado</h2>
                            <button className="close-button" onClick={() => setIsFullBudgetOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                            <BudgetTable
                                budgets={budgets}
                                transactions={transactions.filter(t => t.owner === 'Mayra')}
                                categories={categories}
                                selectedMonth={selectedMonth}
                                loans={loans}
                                installmentPlans={installmentPlans}
                                kpis={{
                                    income: monthlyIncome,
                                    fixed: totalFixedExpenses,
                                    variable: variableExpenses,
                                    remaining: remainingAvailable
                                }}
                                isDetailedView={true}
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

