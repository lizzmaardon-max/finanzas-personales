import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import TransactionsTable from '../components/TransactionsTable';
import SpendPie from '../components/SpendPie';
import BudgetTable from '../components/BudgetTable';
import TransactionForm from '../components/TransactionForm';
import '../styles/dashboard.css';

interface DashboardProps {
    transactions: any[];
    accounts: any[];
    categories: any[];
    onAddTransaction: (t: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, accounts, categories, onAddTransaction }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Dynamic KPI Calculation
    const accountSum = accounts.reduce((acc, a) => {
        const val = parseFloat(a.balance.toString().replace('$', '').replace(',', ''));
        return acc + val;
    }, 0);

    const income = transactions
        .filter(t => t.type === 'Ingreso')
        .reduce((acc, t) => acc + parseFloat(t.amount.toString().replace('+$', '').replace(',', '')), 0);

    const expenses = transactions
        .filter(t => t.type === 'Gasto')
        .reduce((acc, t) => acc + parseFloat(t.amount.toString().replace('-$', '').replace(',', '')), 0);

    const totalBalance = accountSum + income - expenses;

    const totalDebt = accounts
        .filter(a => a.type === 'Tarjeta de Crédito')
        .reduce((acc, a) => {
            const val = parseFloat(a.balance.toString().replace('$', '').replace(',', ''));
            return val < 0 ? acc + Math.abs(val) : acc;
        }, 0);

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
                    <p className="header-subtitle">Un registro al día cambia el mes</p>
                    <span className="badge-quote">Pequeños hábitos, grandes resultados</span>
                </div>
                <button className="btn-add" onClick={() => setIsFormOpen(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nueva transacción
                </button>
            </header>

            {isFormOpen && (
                <TransactionForm
                    onClose={() => setIsFormOpen(false)}
                    onAdd={(t) => {
                        onAddTransaction(t);
                        setIsFormOpen(false);
                    }}
                    accounts={accounts}
                    categories={categories}
                />
            )}

            <div className="kpi-grid">
                <StatCard
                    label="Saldo Total Disponible"
                    value={`$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    change="+ $0 este mes"
                    trend="up"
                    icon={iconBase(<>
                        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                        <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
                    </>)}
                />
                <StatCard
                    label="Ingreso Mensual"
                    value={`$${income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    change="+ $0 este mes"
                    trend="up"
                    icon={iconBase(<>
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                        <polyline points="17 6 23 6 23 12" />
                    </>)}
                />
                <StatCard
                    label="Gastos Mensuales"
                    value={`$${expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
                    label="Progreso de Ahorro"
                    value="0%"
                    change="($0 / $10,000)"
                    trend="neutral"
                    icon={iconBase(<>
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                    </>)}
                />
                <StatCard
                    label="Deuda Total Pendiente"
                    value={`$${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
                            transactions={transactions.slice(0, 5)}
                            onOpenForm={() => setIsFormOpen(true)}
                        />
                    </section>
                </div>

                <div className="right-column">
                    <section className="section-card" style={{ marginBottom: '1.5rem' }}>
                        <h2 className="section-title">Distribución de gastos</h2>
                        <SpendPie />
                    </section>

                    <section className="section-card">
                        <h2 className="section-title">Resumen de presupuesto</h2>
                        <BudgetTable />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
