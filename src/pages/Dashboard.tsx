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
}

const Dashboard: React.FC<DashboardProps> = ({
    transactions, accounts, categories, budgets, loans, installmentPlans,
    onAddTransaction, onUpdateTransaction, onDeleteTransaction,
    onAddBudget, onUpdateBudget, onDeleteBudget
}) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
    const [isFullBudgetOpen, setIsFullBudgetOpen] = useState(false);
    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('Gasto');
    const [editingTx, setEditingTx] = useState<any>(null);
    const [editingBudget, setEditingBudget] = useState<any>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [showAllChips, setShowAllChips] = useState(false);

    const isMobile = window.innerWidth < 768;

    // --- KPI CALCULATIONS ---
    const monthlyIncome = transactions
        .filter(t => t.type?.toLowerCase() === 'ingreso' && t.date.startsWith(selectedMonth))
        .reduce((acc, t) => acc + Math.abs(parseFloat(t.amount.toString().replace(/[^\d.-]/g, ''))), 0);

    const fixedLoanExpenses = loans
        .reduce((acc, l) => acc + (parseFloat(l.monthly_installment) || 0), 0);

    const fixedInstallmentExpenses = installmentPlans
        .filter(p => p.is_active)
        .reduce((acc, p) => acc + (parseFloat(p.installment_amount) || 0), 0);

    const totalFixedExpenses = fixedLoanExpenses + fixedInstallmentExpenses;

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

    const remainingAvailable = monthlyIncome - totalFixedExpenses - variableExpenses;

    const accountSum = accounts
        .filter(a => a.type !== 'Ahorro')
        .reduce((acc, a) => acc + parseFloat(a.balance.toString().replace(/[^\d.-]/g, '')), 0);

    const income = transactions
        .filter(t => t.type?.toLowerCase() === 'ingreso' && t.date.startsWith(selectedMonth) && t.owner === 'Mayra')
        .reduce((acc, t) => acc + Math.abs(parseFloat(t.amount.toString().replace(/[^\d.-]/g, ''))), 0);

    const expenses = transactions
        .filter(t => t.type?.toLowerCase() === 'gasto' && t.date.startsWith(selectedMonth) && t.owner === 'Mayra')
        .reduce((acc, t) => acc + Math.abs(parseFloat(t.amount.toString().replace(/[^\d.-]/g, ''))), 0);

    const netChangeSinceSelectedMonth = transactions
        .filter(t => t.date >= `${selectedMonth}-01` && t.owner === 'Mayra')
        .reduce((acc, t) => {
            const val = Math.abs(parseFloat(t.amount.toString().replace(/[^\d.-]/g, '')));
            if (t.type?.toLowerCase() === 'ingreso') return acc + val;
            if (t.type?.toLowerCase() === 'gasto') return acc - val;
            return acc;
        }, 0);

    const totalTasaCeroDebt = (installmentPlans || []).filter(p => p.is_active).reduce((acc, p) => acc + (parseFloat(p.remaining_amount) || 0), 0);
    const totalBalance = accountSum - totalTasaCeroDebt;
    const initialBalance = (accountSum - netChangeSinceSelectedMonth) - totalTasaCeroDebt;

    const totalDebt = accounts
        .filter(a => a.type === 'Tarjeta de Crédito')
        .reduce((acc, a) => {
            const val = parseFloat(a.balance.toString().replace(/[^\d.-]/g, ''));
            return val < 0 ? acc + Math.abs(val) : acc;
        }, 0) + (installmentPlans || []).filter(p => p.is_active).reduce((acc, p) => acc + (parseFloat(p.remaining_amount) || 0), 0);

    const totalSavings = accounts
        .filter(a => a.type === 'Ahorro')
        .reduce((acc, a) => acc + parseFloat(a.balance.toString().replace(/[^\d.-]/g, '')), 0);

    // --- HANDLERS ---
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

    // --- MOBILE CURATION LOGIC ---
    const mobileChipKeywords = ['asado', 'comida', 'beb', 'transporte', 'gustito', 'alimentaci'];
    const curatedChips = categories.filter(c => mobileChipKeywords.some(kw => c.name.toLowerCase().includes(kw))).slice(0, 4);

    const mobileBudgetKeywords = ['alimentaci', 'beb', 'servicio', 'gustito'];
    const curatedBudgetCategories = categories.filter(c => mobileBudgetKeywords.some(kw => c.name.toLowerCase().includes(kw)));

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
                <button className="btn-add desktop-only" onClick={() => setShowTypeSelector(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nueva transacción
                </button>
            </header>

            <section className="quick-action-block glass">
                <div className="quick-action-info">
                    <h3>Hoy</h3>
                    <p>Registra tus gastos del día (toma 1 minuto)</p>
                </div>
                <button className="btn-quick-gasto" onClick={() => handleOpenForm('Gasto')}>
                    Agregar gasto rápido
                </button>
            </section>

            <div className="kpi-grid">
                {[
                    { label: "Saldo Inicial", val: initialBalance, trend: "neutral", icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
                    { label: "Disponible hoy", val: totalBalance, trend: "up", icon: <><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" /></> },
                    { label: "Ingresado", val: income, trend: "up", icon: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></> },
                    { label: "Gastado", val: expenses, trend: "neutral", icon: <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" /><path d="M16 8h-6" /><path d="M16 12H8" /><path d="M13 16H8" /></> },
                    { label: "Ahorro total", val: totalSavings, trend: "neutral", icon: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></> },
                    { label: "Deuda", val: totalDebt, trend: "neutral", icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> }
                ].map((kpi, idx) => (
                    <StatCard
                        key={idx}
                        label={kpi.label}
                        value={`$${kpi.val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`}
                        change="+ $0 este mes"
                        trend={kpi.trend as any}
                        isCompact={isMobile}
                        icon={iconBase(kpi.icon)}
                    />
                ))}
            </div>

            <section className="quick-chips-section mobile-curated">
                <span className="chips-label">Gasto rápido:</span>
                <div className="chips-container-wrapper">
                    <div className="chips-container-grid">
                        {(isMobile && !showAllChips ? curatedChips : categories).map(cat => (
                            <button key={cat.id} className="quick-chip-compact" onClick={() => {
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
                    {isMobile && (
                        <button className="chip-btn-more-minimal" onClick={() => setShowAllChips(!showAllChips)}>
                            {showAllChips ? 'Ver menos' : 'Ver todas +'}
                        </button>
                    )}
                </div>
            </section>

            <div className="dashboard-grid v3-layout">
                <div className="left-column">
                    {isMobile && (
                        <section className="section-card budget-section-v3 mobile-compact-budget">
                            <BudgetTable
                                budgets={budgets}
                                transactions={transactions.filter(t => t.owner === 'Mayra')}
                                categories={curatedBudgetCategories}
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
                                onOpenFull={() => setIsFullBudgetOpen(true)}
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
                    )}

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

                <div className="right-column desktop-only">
                    <section className="section-card" style={{ marginBottom: '1.5rem' }}>
                        <h2 className="section-title">Distribución</h2>
                        {transactions.filter(t => t.type?.toLowerCase() === 'gasto' && t.date.startsWith(selectedMonth) && t.owner === 'Mayra').length === 0 ? (
                            <div className="empty-state-mini">
                                <p>No hay data este mes</p>
                            </div>
                        ) : (
                            <SpendPie
                                transactions={transactions.filter(t => t.date.startsWith(selectedMonth) && t.owner === 'Mayra')}
                                categories={categories}
                            />
                        )}
                    </section>

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
                            onOpenFull={() => setIsFullBudgetOpen(true)}
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

            {/* Modals & Forms */}
            {showTypeSelector && (
                <div className="modal-overlay" onClick={() => setShowTypeSelector(false)}>
                    <div className="modal-content selector-modal" onClick={e => e.stopPropagation()}>
                        <h2>¿Qué quieres registrar?</h2>
                        <div className="selector-grid">
                            {[
                                { t: 'Gasto', i: '💸' },
                                { t: 'Ingreso', i: '💰' },
                                { t: 'Transferencia', i: '🔄' }
                            ].map(item => (
                                <button key={item.t} className="selector-btn" onClick={() => handleOpenForm(item.t)}>
                                    <span className="icon">{item.i}</span>
                                    <span>{item.t}</span>
                                </button>
                            ))}
                        </div>
                        <button className="btn-secondary" onClick={() => setShowTypeSelector(false)}>Cancelar</button>
                    </div>
                </div>
            )}

            {isFormOpen && (
                <TransactionForm
                    onClose={handleCloseForm}
                    onAdd={(t) => { onAddTransaction(t); handleCloseForm(); }}
                    onUpdate={(id, t) => { onUpdateTransaction(id, t); handleCloseForm(); }}
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
                        if (editingBudget?.id) onUpdateBudget(b);
                        else onAddBudget(b);
                        setIsBudgetFormOpen(false);
                    }}
                />
            )}

            {isFullBudgetOpen && (
                <div className="modal-overlay" onClick={() => setIsFullBudgetOpen(false)}>
                    <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Presupuesto Completo</h2>
                            <button className="close-button" onClick={() => setIsFullBudgetOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
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
                                onAdd={(catId) => { setEditingBudget({ category_id: catId }); setIsBudgetFormOpen(true); }}
                                onEdit={(b) => { setEditingBudget(b); setIsBudgetFormOpen(true); }}
                                onDelete={onDeleteBudget}
                            />
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .v3-layout { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; }
                .chips-container-wrapper { display: flex; flex-direction: column; gap: 8px; }
                .chips-container-grid { display: flex; flex-wrap: wrap; gap: 8px; }
                .quick-chip-compact {
                    display: flex; align-items: center; gap: 6px; padding: 6px 12px;
                    background: white; border: 1px solid var(--accent-soft); border-radius: 16px;
                    font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
                }
                .chip-btn-more-minimal {
                    background: none; border: none; color: var(--accent-primary);
                    font-size: 0.75rem; font-weight: 800; text-align: left; cursor: pointer; width: fit-content;
                }
                .mobile-curated { margin: 1rem 0; }
                
                @media (max-width: 768px) {
                    .v3-layout { grid-template-columns: 1fr; gap: 1rem; }
                    .header h1 { font-size: 1.2rem; }
                    .badge-quote { display: none; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
