import React, { useState } from 'react';
import LoanForm from '../components/LoanForm';
import LoanPaymentForm from '../components/LoanPaymentForm';

interface LoansProps {
    loans: any[];
    payments: any[];
    accounts: any[];
    categories: any[];
    onAddLoan: (loan: any) => void;
    onUpdateLoan: (id: string, loan: any) => void;
    onDeleteLoan: (id: string) => void;
    onAddPayment: (loanId: string, payment: any) => void;
    onUpdatePayment: (id: string, payment: any) => void;
    onDeletePayment: (id: string) => void;
}

const Loans: React.FC<LoansProps> = ({
    loans,
    payments,
    accounts,
    categories,
    onAddLoan,
    onUpdateLoan,
    onDeleteLoan,
    onAddPayment,
    onUpdatePayment,
    onDeletePayment
}) => {
    const [isLoanFormOpen, setIsLoanFormOpen] = useState(false);
    const [loanToEdit, setLoanToEdit] = useState<any>(null);
    const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);
    const [paymentToEdit, setPaymentToEdit] = useState<any>(null);
    const [viewHistory, setViewHistory] = useState<string | null>(null);

    const calculateLoanSummary = (loan: any) => {
        const loanPayments = payments.filter(p => p.loan_id === loan.id);
        const totalPrincipalPaid = loanPayments.reduce((sum, p) => sum + parseFloat(p.principal), 0);
        const totalInterestPaid = loanPayments.reduce((sum, p) => sum + parseFloat(p.interest), 0);
        const totalOthersPaid = loanPayments.reduce((sum, p) => sum + parseFloat(p.others), 0);
        const totalAmountPaid = loanPayments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
        const installmentsPaid = loanPayments.filter(p => p.is_installment).length;

        const remainingCapital = Math.max(0, loan.initial_capital - totalPrincipalPaid);
        const remainingInstallments = Math.max(0, loan.total_installments - installmentsPaid);

        // Time remaining estimate
        const years = Math.floor(remainingInstallments / 12);
        const months = remainingInstallments % 12;
        const timeRemaining = `${years > 0 ? `${years} año${years > 1 ? 's' : ''} ` : ''}${months > 0 ? `${months} mes${months > 1 ? 'es' : ''}` : ''}` || 'Terminado';

        return {
            remainingCapital,
            remainingInstallments,
            timeRemaining,
            totalInterestPaid,
            totalOthersPaid,
            totalAmountPaid,
            totalPrincipalPaid,
            paymentsCount: loanPayments.length,
            payments: loanPayments.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
        };
    };

    const formatCurrency = (val: number) => {
        return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleSaveLoan = (loanData: any) => {
        if (loanToEdit) {
            onUpdateLoan(loanToEdit.id, loanData);
        } else {
            onAddLoan(loanData);
        }
        setIsLoanFormOpen(false);
        setLoanToEdit(null);
    };

    return (
        <main className="main-content">
            <header className="header">
                <div className="header-info">
                    <h1>Préstamos</h1>
                    <p className="header-subtitle">Gestión de créditos y pagos detallados</p>
                </div>
                <button className="btn-add" onClick={() => { setLoanToEdit(null); setIsLoanFormOpen(true); }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nuevo Crédito
                </button>
            </header>

            <div className="dashboard-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px'
            }}>
                {loans.map(loan => {
                    const summary = calculateLoanSummary(loan);
                    const isHistoryVisible = viewHistory === loan.id;

                    return (
                        <div
                            key={loan.id}
                            className="card glass loan-card"
                            style={{
                                padding: '0.75rem',
                                background: `linear-gradient(135deg, #ffffff 0%, var(--accent-primary)08 100%)`,
                                borderLeft: `5px solid var(--accent-primary)`,
                                borderRadius: '1.25rem'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '8px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: '0.9rem',
                                        fontWeight: 800,
                                        wordBreak: 'break-word',
                                        lineHeight: 1.2
                                    }}>{loan.name}</h3>
                                </div>
                                <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                                    <button className="btn-icon" title="Editar" onClick={() => { setLoanToEdit(loan); setIsLoanFormOpen(true); }} style={{ padding: '2px' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                    <button className="btn-icon delete" title="Eliminar" onClick={() => onDeleteLoan(loan.id)} style={{ padding: '2px' }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            </div>

                            <div className="loan-stats-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                                <div className="stat-mini">
                                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Saldo Cap.</span>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 850, color: 'var(--accent-primary)' }}>{formatCurrency(summary.remainingCapital)}</div>
                                </div>
                                <div className="stat-mini">
                                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Cuotas</span>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 850 }}>{summary.remainingInstallments}/{loan.total_installments}</div>
                                </div>
                                <div className="stat-mini">
                                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Estimado</span>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{summary.timeRemaining}</div>
                                </div>
                                <div className="stat-mini">
                                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Pag. Cap.</span>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--positive)' }}>{formatCurrency(summary.totalPrincipalPaid)}</div>
                                </div>
                                <div className="stat-mini">
                                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Pag. Int.</span>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--negative)' }}>{formatCurrency(summary.totalInterestPaid)}</div>
                                </div>
                                <div className="stat-mini">
                                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Pag. Otros</span>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{formatCurrency(summary.totalOthersPaid)}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                <button className="btn-primary w-100" style={{ padding: '8px', fontSize: '0.8rem' }} onClick={() => { setSelectedLoan(loan); setIsPaymentFormOpen(true); }}>
                                    Registrar Pago
                                </button>
                                <button className={`btn-secondary w-100 ${isHistoryVisible ? 'active' : ''}`} style={{ padding: '8px', fontSize: '0.8rem' }} onClick={() => setViewHistory(isHistoryVisible ? null : loan.id)}>
                                    {isHistoryVisible ? 'Cerrar Hist.' : 'Ver Historial'}
                                </button>
                            </div>

                            {isHistoryVisible && (
                                <div className="detailed-history" style={{ borderTop: '1px solid var(--accent-soft)', paddingTop: '12px', animation: 'fadeIn 0.3s ease' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>Histórico de Pagos</h4>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                                            <thead>
                                                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--accent-soft)' }}>
                                                    <th style={{ padding: '6px' }}>Fecha</th>
                                                    <th style={{ padding: '6px' }}>Principal</th>
                                                    <th style={{ padding: '6px' }}>Int.</th>
                                                    <th style={{ padding: '6px' }}>Total</th>
                                                    <th style={{ padding: '6px' }}>Acc.</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {summary.payments.map((p: any) => (
                                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--accent-soft)' }}>
                                                        <td style={{ padding: '6px' }}>{p.payment_date}</td>
                                                        <td style={{ padding: '6px', fontWeight: 600 }}>{formatCurrency(parseFloat(p.principal))}</td>
                                                        <td style={{ padding: '6px', color: 'var(--danger)' }}>{formatCurrency(parseFloat(p.interest))}</td>
                                                        <td style={{ padding: '6px', fontWeight: 700 }}>{formatCurrency(parseFloat(p.amount_paid))}</td>
                                                        <td style={{ padding: '6px text-center' }}>
                                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                                <button className="btn-icon" onClick={() => { setSelectedLoan(loan); setPaymentToEdit(p); setIsPaymentFormOpen(true); }} style={{ padding: '2px' }}>
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                                </button>
                                                                <button className="btn-icon delete" onClick={() => onDeletePayment(p.id)} style={{ padding: '2px' }}>
                                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr style={{ background: 'var(--accent-soft)', fontWeight: 800 }}>
                                                    <td style={{ padding: '6px' }}>SUMA</td>
                                                    <td style={{ padding: '6px' }}>{formatCurrency(summary.totalPrincipalPaid)}</td>
                                                    <td style={{ padding: '6px' }}>{formatCurrency(summary.totalInterestPaid)}</td>
                                                    <td style={{ padding: '6px' }}>{formatCurrency(summary.totalAmountPaid)}</td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {isLoanFormOpen && (
                <LoanForm
                    accounts={accounts}
                    categories={categories}
                    loanToEdit={loanToEdit}
                    onClose={() => { setIsLoanFormOpen(false); setLoanToEdit(null); }}
                    onSave={handleSaveLoan}
                />
            )}

            {isPaymentFormOpen && selectedLoan && (
                <LoanPaymentForm
                    loan={selectedLoan}
                    lastPayment={payments.filter(p => p.loan_id === selectedLoan.id && p.id !== paymentToEdit?.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]}
                    paymentToEdit={paymentToEdit}
                    onClose={() => { setIsPaymentFormOpen(false); setSelectedLoan(null); setPaymentToEdit(null); }}
                    onSave={(p) => {
                        if (paymentToEdit) {
                            onUpdatePayment(paymentToEdit.id, p);
                        } else {
                            onAddPayment(selectedLoan.id, p);
                        }
                    }}
                />
            )}
        </main>
    );
};

export default Loans;
