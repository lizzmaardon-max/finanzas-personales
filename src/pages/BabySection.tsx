import React, { useState } from 'react';
import StatCard from '../components/StatCard';
import TransactionsTable from '../components/TransactionsTable';
import TransactionForm from '../components/TransactionForm';
import '../styles/dashboard.css';

interface BabySectionProps {
    transactions: any[];
    categories: any[];
    onUpdateTransaction: (id: string, t: any) => void;
    onDeleteTransaction: (tx: any) => void;
}

const BabySection: React.FC<BabySectionProps> = ({ transactions, categories, onUpdateTransaction, onDeleteTransaction }) => {
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
    const [editingTx, setEditingTx] = useState<any>(null);

    // Filter baby transactions
    const babyTransactions = transactions.filter(t =>
        (t.category_id === '5' || t.category?.toLowerCase() === 'bebé') &&
        t.date.startsWith(selectedMonth)
    );

    const totalMayra = babyTransactions
        .filter(t => t.owner === 'Mayra')
        .reduce((acc, t) => acc + Math.abs(parseFloat(t.amount.toString().replace(/[^\d.-]/g, ''))), 0);

    const totalManuel = babyTransactions
        .filter(t => t.owner === 'Manuel')
        .reduce((acc, t) => acc + Math.abs(parseFloat(t.amount.toString().replace(/[^\d.-]/g, ''))), 0);

    const totalBebé = totalMayra + totalManuel;

    return (
        <div className="main-content">
            <header className="header">
                <div className="header-info">
                    <h1>Apartado Bebé 👶</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="month-selector-piquis"
                        />
                        <span className="badge-quote" style={{ margin: 0 }}>Todo para el crecimiento de nuestro bebé</span>
                    </div>
                </div>
            </header>

            <div className="kpi-grid">
                <StatCard
                    label="Gasto Total Bebé"
                    value={`$${totalBebé.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    change="Suma de ambos"
                    trend="neutral"
                    icon={<span style={{ fontSize: '1.5rem' }}>👶</span>}
                />
                <StatCard
                    label="Aporte Mayra"
                    value={`$${totalMayra.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    change={`${totalBebé > 0 ? ((totalMayra / totalBebé) * 100).toFixed(0) : 0}% del total`}
                    trend="up"
                    icon={<span style={{ fontSize: '1.5rem' }}>👩‍💼</span>}
                />
                <StatCard
                    label="Aporte Manuel"
                    value={`$${totalManuel.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    change={`${totalBebé > 0 ? ((totalManuel / totalBebé) * 100).toFixed(0) : 0}% del total`}
                    trend="up"
                    icon={<span style={{ fontSize: '1.5rem' }}>👨‍💼</span>}
                />
            </div>

            <div className="dashboard-grid">
                <div className="full-width-column">
                    <section className="section-card">
                        <h2 className="section-title">Historial de gastos del Bebé</h2>
                        {babyTransactions.length === 0 ? (
                            <div className="empty-state" style={{ padding: '3rem' }}>
                                <span style={{ fontSize: '3rem' }}>🍼</span>
                                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>No hay gastos registrados para el bebé este mes.</p>
                            </div>
                        ) : (
                            <TransactionsTable
                                transactions={babyTransactions}
                                categories={categories}
                                onOpenForm={() => { }}
                                onEdit={(tx) => setEditingTx(tx)}
                                onDelete={(tx) => onDeleteTransaction(tx)}
                            />
                        )}
                    </section>
                </div>
            </div>

            {editingTx && (
                <TransactionForm
                    onClose={() => setEditingTx(null)}
                    onAdd={() => { }}
                    onUpdate={onUpdateTransaction}
                    accounts={[]} // Manuel's might be empty or we can pass all accounts
                    categories={categories}
                    editData={editingTx}
                />
            )}

            <style>{`
                .full-width-column { grid-column: 1 / -1; }
                .comparison-bar-container {
                    background: var(--bg-primary);
                    height: 24px;
                    border-radius: 12px;
                    overflow: hidden;
                    display: flex;
                    margin: 1rem 0;
                }
                .mayra-bar { background: var(--accent-primary); height: 100%; transition: width 0.5s ease; }
                .manuel-bar { background: #68b6a3; height: 100%; transition: width 0.5s ease; }
            `}</style>
        </div>
    );
};

export default BabySection;
