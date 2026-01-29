import React from 'react';
import TransactionsTable from '../components/TransactionsTable';
import '../styles/dashboard.css';

interface TransaccionesProps {
    transactions: any[];
    accounts: any[];
}

const Transacciones: React.FC<TransaccionesProps> = ({ transactions }) => {
    return (
        <div className="main-content">
            <header className="header">
                <h1>Transacciones</h1>
            </header>

            <section className="section-card glass">
                <h2 className="section-title">Historial Completo</h2>
                <TransactionsTable transactions={transactions} />
            </section>
        </div>
    );
};

export default Transacciones;
