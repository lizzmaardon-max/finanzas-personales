import React, { useState } from 'react';
import '../styles/dashboard.css';

interface InstallmentPlan {
    id: string;
    description: string;
    total_amount: number;
    remaining_amount: number;
    total_installments: number;
    completed_installments: number;
    installment_amount: number;
    payment_day: number;
    account_id: string;
    category_id: string;
    is_active: boolean;
}

interface InstallmentsProps {
    plans: InstallmentPlan[];
    accounts: any[];
    categories: any[];
    onAddPlan: (plan: any) => Promise<void>;
    onDeletePlan: (id: string) => Promise<void>;
}

const Installments: React.FC<InstallmentsProps> = ({ plans, accounts, categories, onAddPlan, onDeletePlan }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        total_amount: '',
        total_installments: '12',
        payment_day: '3',
        account_id: '',
        category_id: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const installmentAmount = parseFloat(formData.total_amount) / parseInt(formData.total_installments);

        await onAddPlan({
            ...formData,
            total_amount: parseFloat(formData.total_amount),
            remaining_amount: parseFloat(formData.total_amount),
            total_installments: parseInt(formData.total_installments),
            payment_day: parseInt(formData.payment_day),
            installment_amount: installmentAmount,
            start_date: new Date().toISOString().split('T')[0]
        });

        setIsFormOpen(false);
        setFormData({
            description: '',
            total_amount: '',
            total_installments: '12',
            payment_day: '3',
            account_id: '',
            category_id: ''
        });
    };

    return (
        <div className="main-content">
            <header className="header">
                <h1>Compras Tasa Cero</h1>
                <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
                    + Nuevo Plan
                </button>
            </header>

            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <header className="modal-header">
                            <h2>Nuevo Plan Tasa Cero</h2>
                            <button className="btn-close" onClick={() => setIsFormOpen(false)}>&times;</button>
                        </header>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Descripción de la compra</label>
                                <input
                                    type="text"
                                    placeholder="Ej: iPhone 15, Lavadora, etc."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Monto Total ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.total_amount}
                                        onChange={e => setFormData({ ...formData, total_amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Cuotas Totales</label>
                                    <input
                                        type="number"
                                        value={formData.total_installments}
                                        onChange={e => setFormData({ ...formData, total_installments: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label>Día de Pago (1-31)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={formData.payment_day}
                                        onChange={e => setFormData({ ...formData, payment_day: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tarjeta / Cuenta</label>
                                    <select
                                        value={formData.account_id}
                                        onChange={e => setFormData({ ...formData, account_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        {accounts.map(a => (
                                            <option key={a.id} value={a.id}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Categoría</label>
                                <select
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Crear Plan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {plans.length === 0 ? (
                    <div className="empty-state section-card" style={{ gridColumn: '1 / -1' }}>
                        <div className="empty-icon">📂</div>
                        <h3 className="empty-title">Sin planes activos</h3>
                        <p className="empty-text">Agrega tu primer plan de cuotas para empezar a rastrearlo.</p>
                    </div>
                ) : (
                    plans.map(plan => {
                        const progress = (plan.completed_installments / plan.total_installments) * 100;
                        const account = accounts.find(a => a.id === plan.account_id);

                        return (
                            <div key={plan.id} className="section-card glass plan-card-piquis">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <span className="badge-quote" style={{ marginBottom: '0.5rem' }}>Tasa Cero</span>
                                        <h3 style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>{plan.description}</h3>
                                    </div>
                                    <button className="btn-icon delete" onClick={() => onDeletePlan(plan.id)} style={{ padding: '8px' }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>

                                <div className="plan-details-piquis">
                                    <div className="detail-row">
                                        <span className="detail-label">Monto Total</span>
                                        <span className="detail-value">${plan.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Cuota Mensual</span>
                                        <span className="detail-value" style={{ fontWeight: 800, color: 'var(--accent-primary)' }}>
                                            ${plan.installment_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Día de Pago</span>
                                        <span className="detail-value">{plan.payment_day} de cada mes</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Cuenta</span>
                                        <span className="detail-value">{account ? account.name : '?'}</span>
                                    </div>
                                </div>

                                <div className="progress-section-piquis">
                                    <div className="progress-header">
                                        <span>Progreso: {plan.completed_installments}/{plan.total_installments}</span>
                                        <span>{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <div className="progress-footer">
                                        <span>Saldo restante</span>
                                        <span style={{ fontWeight: 700 }}>${plan.remaining_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <style>{`
                .plan-card-piquis {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    min-height: 280px;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .plan-card-piquis:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                }
                .plan-details-piquis {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-bottom: 1.5rem;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .detail-label {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .detail-value {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-main);
                }
                .progress-section-piquis {
                    margin-top: auto;
                    border-top: 1px dashed var(--accent-medium);
                    padding-top: 1.25rem;
                }
                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }
                .progress-bar-container {
                    height: 8px;
                    background: var(--accent-soft);
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }
                .progress-bar-fill {
                    height: 100%;
                    background: var(--accent-primary);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
                .progress-footer {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    color: var(--text-main);
                }
                .btn-icon.delete {
                    color: var(--text-light);
                    background: transparent;
                }
                .btn-icon.delete:hover {
                    color: var(--negative);
                    background: rgba(250, 82, 82, 0.1);
                }
            `}</style>
        </div>
    );
};

export default Installments;
