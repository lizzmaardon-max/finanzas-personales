import React, { useState } from 'react';
import TransactionsTable from '../components/TransactionsTable';
import TransactionForm from '../components/TransactionForm';
import '../styles/dashboard.css';

interface TransaccionesProps {
    transactions: any[];
    accounts: any[];
    categories: any[];
    onAddTransaction: (t: any) => void;
    onUpdateTransaction: (id: string, t: any) => void;
    onDeleteTransaction?: (tx: any) => void;
}

const Transacciones: React.FC<TransaccionesProps> = ({ transactions, accounts, categories, onAddTransaction, onUpdateTransaction, onDeleteTransaction }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTx, setEditingTx] = useState<any>(null);

    const handleEdit = (tx: any) => {
        setEditingTx(tx);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingTx(null);
    };

    return (
        <div className="main-content">
            <header className="header">
                <h1>Transacciones</h1>
                <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
                    + Nueva Transacción
                </button>
            </header>

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
                />
            )}

            <section className="section-card glass">
                <h2 className="section-title">Historial Completo</h2>
                <TransactionsTable
                    transactions={transactions}
                    categories={categories}
                    onEdit={handleEdit}
                    onDelete={onDeleteTransaction}
                    onOpenForm={() => {
                        setEditingTx(null);
                        setIsFormOpen(true);
                    }}
                />
            </section>
        </div>
    );
};

export default Transacciones;
