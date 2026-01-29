import React, { useState } from 'react';
import '../styles/dashboard.css';

interface CuentasProps {
    accounts: any[];
    onAdd: (a: any) => void;
    onUpdate: (a: any) => void;
    onDelete: (id: any) => void;
}

const Cuentas: React.FC<CuentasProps> = ({ accounts, onAdd, onUpdate, onDelete }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'Cuenta de Ahorro',
        bank: '',
        last4: '',
        balance: '',
        color: '#f9a8a8'
    });

    const colors = ['#f9a8a8', '#68b6a3', '#82aaff', '#c792ea', '#ffcb6b', '#333333'];

    const resetForm = () => {
        setFormData({ name: '', type: 'Cuenta de Ahorro', bank: '', last4: '', balance: '', color: '#f9a8a8' });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (account: any) => {
        setFormData({
            ...account,
            balance: account.balance.replace('$', '').replace(',', '').replace('-', '')
        });
        setEditingId(account.id);
        setShowForm(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numBalance = parseFloat(formData.balance) || 0;
        const finalBalance = formData.type === 'Tarjeta de Crédito' ? -Math.abs(numBalance) : Math.abs(numBalance);

        const accountData = {
            ...formData,
            balance: `${finalBalance < 0 ? '-' : ''}$${Math.abs(finalBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
                <h1>Cuentas y Métodos de Pago</h1>
                <button className="btn-add" onClick={() => setShowForm(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Agregar Cuenta
                </button>
            </header>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {accounts.length === 0 ? (
                    <div className="section-card glass" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                        <p>No hay cuentas registradas. ¡Agrega tus tarjetas, ahorros o efectivo!</p>
                    </div>
                ) : (
                    accounts.map(a => (
                        <div
                            key={a.id}
                            className="section-card glass payment-card"
                            style={{
                                background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, ${a.color}33 100%)`,
                                borderLeft: `6px solid ${a.color}`
                            }}
                        >
                            <div className="card-header">
                                <span className="tag" style={{ background: a.color, color: '#fff' }}>{a.type}</span>
                                <div className="card-actions">
                                    <button className="btn-icon" onClick={() => handleEdit(a)} title="Editar">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                        </svg>
                                    </button>
                                    <button className="btn-icon delete" onClick={() => onDelete(a.id)} title="Eliminar">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="card-body">
                                <h3 className="card-name">{a.name}</h3>
                                {a.last4 && <p className="card-number">•••• •••• •••• {a.last4}</p>}
                                <div className="card-footer">
                                    <span className="card-bank">{a.bank || 'Efectivo'}</span>
                                    <span className="card-balance" style={{ color: a.balance.startsWith('-') ? 'var(--negative)' : 'var(--positive)' }}>
                                        {a.balance}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h2 className="section-title">{editingId ? 'Editar Cuenta' : 'Nueva Cuenta'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nombre de la Cuenta</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Ahorro Principal, Visa Gold"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Tipo</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option>Cuenta de Ahorro</option>
                                    <option>Tarjeta de Crédito</option>
                                    <option>Efectivo</option>
                                    <option>Billetera Digital</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Saldo Inicial</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.balance}
                                    onChange={e => setFormData({ ...formData, balance: e.target.value })}
                                    required
                                />
                                <small style={{ display: 'block', marginTop: '4px', opacity: 0.7 }}>
                                    Las tarjetas de crédito se guardarán con saldo negativo automáticamente.
                                </small>
                            </div>
                            <div className="form-group">
                                <label>Banco (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Nombre del banco"
                                    value={formData.bank}
                                    onChange={e => setFormData({ ...formData, bank: e.target.value })}
                                />
                            </div>
                            {formData.type.includes('Tarjeta') && (
                                <div className="form-group">
                                    <label>Últimos 4 dígitos</label>
                                    <input
                                        type="text"
                                        maxLength={4}
                                        placeholder="1234"
                                        value={formData.last4}
                                        onChange={e => setFormData({ ...formData, last4: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Color Personalizado</label>
                                <div className="color-picker">
                                    {colors.map(c => (
                                        <div
                                            key={c}
                                            className={`color-option ${formData.color === c ? 'active' : ''}`}
                                            style={{ backgroundColor: c }}
                                            onClick={() => setFormData({ ...formData, color: c })}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style>{`
                .card-actions {
                    display: flex;
                    gap: 5px;
                }
                .btn-icon {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .btn-icon:hover {
                    background: rgba(0,0,0,0.05);
                }
                .btn-icon.delete:hover {
                    background: rgba(255,0,0,0.1);
                    color: var(--negative);
                }
            `}</style>
        </div>
    );
};

export default Cuentas;
