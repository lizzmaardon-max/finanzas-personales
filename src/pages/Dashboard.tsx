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

    return (
        <div className="main-content">
            <header className="header">
                <h1>Dashboard</h1>
                <button className="btn-add" onClick={() => setIsFormOpen(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Agregar
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
                    change=""
                    trend="up"
                />
                <StatCard
                    label="Ingreso Mensual"
                    value={`$${income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    change=""
                    trend="up"
                />
                <StatCard
                    label="Gastos Mensuales"
                    value={`$${expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    change=""
                    trend="down"
                />
                <StatCard
                    label="Progreso de Ahorro"
                    value="0%"
                    change="($0 / $10,000)"
                    trend="up"
                />
                <StatCard
                    label="Deuda Total Pendiente"
                    value={`$${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    change=""
                    trend="down"
                />
            </div>

            <div className="dashboard-grid">
                <div className="left-column">
                    <section className="section-card glass">
                        <h2 className="section-title">Transacciones Recientes</h2>
                        <TransactionsTable transactions={transactions.slice(0, 5)} />
                    </section>
                </div>

                <div className="right-column">
                    <section className="section-card glass" style={{ marginBottom: '1.5rem' }}>
                        <h2 className="section-title">Distribución de Gastos</h2>
                        <SpendPie />
                    </section>

                    <section className="section-card glass">
                        <h2 className="section-title">Resumen de Presupuesto</h2>
                        <BudgetTable />
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
