import React, { useState } from 'react';
import '../styles/dashboard.css';

interface CuentasProps {
    accounts: any[];
    transactions: any[];
    onAdd: (a: any) => void;
    onUpdate: (a: any) => void;
    onDelete: (id: any) => void;
}

const Cuentas: React.FC<CuentasProps> = ({ accounts, transactions, onAdd, onUpdate, onDelete }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Cuenta de Ahorro',
        bank: '',
        last4: '',
        balance: '',
        color: '#f9a8a8',
        credit_limit: ''
    });
    const [originalInitialBalance, setOriginalInitialBalance] = useState<number | null>(null);
    const [originalCurrentBalance, setOriginalCurrentBalance] = useState<number | null>(null);

    const colors = ['#f9a8a8', '#68b6a3', '#82aaff', '#c792ea', '#ffcb6b', '#212529', '#1dd1a1'];

    const resetForm = () => {
        setFormData({ name: '', type: 'Cuenta de Ahorro', bank: '', last4: '', balance: '', color: '#f9a8a8', credit_limit: '' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (account: any) => {
        // Calculate original initial balance by backtracking
        // Actual Balance - (all incomes to this account) + (all expenses from this account)
        const accountTransactions = transactions.filter(t => {
            const isSource = t.method?.split(' ➔ ')[0] === account.name || t.method === account.name;
            const isDest = t.method?.split(' ➔ ')[1] === account.name;
            return isSource || isDest;
        });

        const netChange = accountTransactions.reduce((acc, t) => {
            const amountVal = Math.abs(parseFloat(t.amount.toString().replace(/[^\d.-]/g, '')));
            const isSource = t.method?.split(' ➔ ')[0] === account.name || t.method === account.name;
            const isDest = t.method?.split(' ➔ ')[1] === account.name;

            const type = t.type?.toLowerCase();
            if (type === 'ingreso') return acc + amountVal;
            if (type === 'gasto') return acc - amountVal;
            if (type === 'transferencia') {
                if (isSource) return acc - amountVal;
                if (isDest) return acc + amountVal;
            }
            return acc;
        }, 0);

        const currentBalanceNum = parseFloat(account.balance.toString().replace(/[^\d.-]/g, ''));
        const initialBalance = currentBalanceNum - netChange;

        setOriginalInitialBalance(initialBalance);
        setOriginalCurrentBalance(currentBalanceNum);

        setFormData({
            ...account,
            balance: initialBalance.toFixed(2),
            credit_limit: account.credit_limit ? account.credit_limit.toString() : ''
        });
        setEditingId(account.id);
        setShowForm(true);
    };

    const renderAccountCard = (a: any) => {
        // Calculate Initial Balance by backtracking transactions
        const currentBalanceValue = parseFloat(a.balance.toString().replace(/[^\d.-]/g, ''));

        // Filter transactions for this account
        const accountTransactions = transactions.filter(t =>
            t.account_id === a.id ||
            t.destination_account_id === a.id
        );

        // Calculate sum of transactions impact
        let transactionsImpact = 0;
        accountTransactions.forEach(t => {
            const val = Math.abs(parseFloat(t.amount.toString().replace(/[^\d.-]/g, '')));
            const type = t.type?.toLowerCase();

            if (t.account_id === a.id) {
                // Withdrawal or Source of Transfer
                if (type === 'ingreso') transactionsImpact += val;
                else transactionsImpact -= val;
            } else if (t.destination_account_id === a.id) {
                // Destination of Transfer
                transactionsImpact += val;
            }
        });

        const initialBalanceValue = currentBalanceValue - transactionsImpact;
        const initialBalanceStr = `$${Math.abs(initialBalanceValue).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

        return (
            <div
                key={a.id}
                className="section-card payment-card-piquis"
                style={{
                    background: `linear-gradient(135deg, #ffffff 0%, ${a.color}15 100%)`,
                    borderLeft: `5px solid ${a.color}`,
                    padding: '0.75rem',
                    borderRadius: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    minHeight: '130px'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: `${a.color}22`,
                            color: a.color,
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            display: 'inline-block'
                        }}>{a.type}</span>
                        <h3 style={{ marginTop: '0.2rem', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0px', lineHeight: 1.2 }}>{a.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{a.bank || 'Efectivo'}</p>
                    </div>
                    <div className="card-actions" style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-icon" onClick={() => handleEdit(a)} style={{ padding: '4px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button className="btn-icon delete" onClick={() => onDelete(a.id)} style={{ padding: '4px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {a.last4 && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                        •••• {a.last4}
                    </div>
                )}

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(0,0,0,0.05)', paddingTop: '4px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Saldo Inicial</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{initialBalanceStr}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Saldo Actual</span>
                        <span style={{
                            fontSize: '1.05rem',
                            fontWeight: 900,
                            color: a.balance.toString().startsWith('-') ? 'var(--negative)' : 'var(--positive)'
                        }}>
                            {a.balance}
                        </span>
                    </div>
                    {Number(a.credit_limit) > 0 && (
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: '4px', paddingTop: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Límite</span>
                                <span style={{ fontWeight: 600 }}>${Number(a.credit_limit).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: '2px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Disponible</span>
                                <span style={{ fontWeight: 700, color: 'var(--positive)' }}>
                                    ${Math.max(0, Number(a.credit_limit) + parseFloat(a.balance.toString().replace(/[^\d.-]/g, ''))).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const inputInitialBalance = parseFloat(formData.balance) || 0;

        let finalBalanceStr = '';

        if (editingId && originalInitialBalance !== null && originalCurrentBalance !== null) {
            // Logic: Current = OldCurrent + (NewInitial - OldInitial)
            const delta = inputInitialBalance - originalInitialBalance;
            const newCurrentBalance = originalCurrentBalance + delta;
            finalBalanceStr = `${newCurrentBalance < 0 ? '-' : ''}$${Math.abs(newCurrentBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        } else {
            // New account: balance entered IS the current balance (which is also the initial)
            const numBalance = inputInitialBalance;
            const finalBalance = formData.type === 'Tarjeta de Crédito' ? -Math.abs(numBalance) : Math.abs(numBalance);
            finalBalanceStr = `${finalBalance < 0 ? '-' : ''}$${Math.abs(finalBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        const accountData = {
            ...formData,
            balance: finalBalanceStr
        };

        if (editingId) {
            onUpdate({ ...accountData, id: editingId });
        } else {
            onAdd({ ...accountData, id: Date.now() });
        }
        resetForm();
    };

    return (
        <div className="main-content">
            <header className="header">
                <div className="header-info">
                    <h1>Mis Cuentas</h1>
                    <p className="header-subtitle">Gestiona tus tarjetas de crédito, cuentas bancarias y efectivo</p>
                </div>
                <button className="btn-add" onClick={() => setShowForm(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nueva Cuenta
                </button>
            </header>

            <div className="dashboard-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '8px'
            }}>
                {accounts.length === 0 ? (
                    <div className="empty-state section-card">
                        <div className="empty-icon">📂</div>
                        <h3 className="empty-title">Sin cuentas registradas</h3>
                        <p className="empty-text">Agrega tu primera cuenta para empezar a registrar movimientos.</p>
                        <button className="btn btn-secondary" onClick={() => setShowForm(true)}>Agregar ahora</button>
                    </div>
                ) : (
                    <>
                        {/* Sección de Cuentas Normales */}
                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem', marginBottom: '0.5rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.5rem' }}>🏦</span> Cuentas y Efectivo
                            </h2>
                        </div>
                        {accounts.filter(a => a.type !== 'Tarjeta de Crédito').length === 0 ? (
                            <div className="empty-state-mini section-card" style={{ gridColumn: '1 / -1', padding: '2rem' }}>
                                <p style={{ color: 'var(--text-muted)' }}>No tienes cuentas debito o efectivo registradas.</p>
                            </div>
                        ) : (
                            accounts.filter(a => a.type !== 'Tarjeta de Crédito').map(a => renderAccountCard(a))
                        )}

                        {/* Sección de Tarjetas de Crédito */}
                        <div style={{ gridColumn: '1 / -1', marginTop: '2.5rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.5rem' }}>💳</span> Tarjetas de Crédito
                            </h2>
                            {accounts.filter(a => a.type === 'Tarjeta de Crédito').length > 0 && (
                                <span className="badge-quote" style={{ margin: 0 }}>Estas tarjetas descuentan de tu patrimonio</span>
                            )}
                        </div>
                        {accounts.filter(a => a.type === 'Tarjeta de Crédito').length === 0 ? (
                            <div className="empty-state-mini section-card" style={{
                                gridColumn: '1 / -1',
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(130, 170, 255, 0.05) 100%)',
                                border: '2px dashed var(--accent-soft)',
                                borderRadius: '24px'
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💳</div>
                                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>¿No tienes tarjetas de crédito?</h3>
                                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                                    Agrégalas para llevar un control exacto de tus deudas y pagos mensuales.
                                </p>
                                <button className="btn btn-primary" onClick={() => {
                                    setFormData({ ...formData, type: 'Tarjeta de Crédito' });
                                    setShowForm(true);
                                }}>Agregar mi primera tarjeta</button>
                            </div>
                        ) : (
                            accounts.filter(a => a.type === 'Tarjeta de Crédito').map(a => renderAccountCard(a))
                        )}
                    </>
                )}
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <header className="modal-header">
                            <h2>{editingId ? 'Editar Cuenta' : 'Nueva Cuenta'}</h2>
                            <button className="btn-close" onClick={resetForm}>&times;</button>
                        </header>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre Personalizado</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Ahorro Vacaciones, Mi Visa"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Tipo de Cuenta</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option>Cuenta de Ahorro</option>
                                    <option>Ahorro</option>
                                    <option>Tarjeta de Crédito</option>
                                    <option>Efectivo</option>
                                    <option>Billetera Digital</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>{editingId ? 'Saldo Inicial' : 'Saldo Actual'}</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.balance}
                                    onChange={e => setFormData({ ...formData, balance: e.target.value })}
                                    required
                                />
                                {editingId && (
                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                        * Al modificar el saldo inicial, se ajustará automáticamente tu saldo actual.
                                    </small>
                                )}
                            </div>

                            {formData.type === 'Tarjeta de Crédito' && (
                                <div className="form-group">
                                    <label>Límite de Crédito</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.credit_limit}
                                        onChange={e => setFormData({ ...formData, credit_limit: e.target.value })}
                                        required
                                    />
                                    <small style={{ color: 'var(--accent-primary)', fontWeight: 600, marginTop: '4px' }}>
                                        * Las tarjetas de crédito se descuentan de tu patrimonio neto.
                                    </small>
                                </div>
                            )}

                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Banco (Opcional)</label>
                                    <input
                                        type="text"
                                        placeholder="BCP, BBVA, etc."
                                        value={formData.bank}
                                        onChange={e => setFormData({ ...formData, bank: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Últimos 4 (Opcional)</label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        placeholder="1234"
                                        value={formData.last4}
                                        onChange={e => setFormData({ ...formData, last4: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Color de la tarjeta</label>
                                <div className="color-picker-piquis" style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                    padding: '12px',
                                    backgroundColor: 'var(--bg-primary)',
                                    borderRadius: '16px'
                                }}>
                                    {colors.map(c => (
                                        <div
                                            key={c}
                                            className={`color-option ${formData.color === c ? 'active' : ''}`}
                                            style={{
                                                backgroundColor: c,
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '10px',
                                                cursor: 'pointer',
                                                border: formData.color === c ? '3px solid white' : 'none',
                                                boxShadow: formData.color === c ? `0 0 0 2px ${c}` : 'none'
                                            }}
                                            onClick={() => setFormData({ ...formData, color: c })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar Cuenta</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cuentas;
