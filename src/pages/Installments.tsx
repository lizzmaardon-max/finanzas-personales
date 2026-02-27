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
    subcategory: string;
    is_active: boolean;
}

interface InstallmentsProps {
    plans: InstallmentPlan[];
    accounts: any[];
    categories: any[];
    onAddPlan: (plan: any) => Promise<void>;
    onUpdatePlan: (id: string, plan: any) => Promise<void>;
    onDeletePlan: (id: string) => Promise<void>;
}

const Installments: React.FC<InstallmentsProps> = ({ plans, accounts, categories, onAddPlan, onUpdatePlan, onDeletePlan }) => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [planToEdit, setPlanToEdit] = useState<InstallmentPlan | null>(null);
    const [formData, setFormData] = useState({
        description: '',
        total_amount: '',
        total_installments: '12',
        payment_day: '3',
        account_id: '',
        category_id: '',
        subcategory: ''
    });

    const selectedCategory = categories.find(c => c.id === formData.category_id);
    const subcategories = selectedCategory?.subcategories || [];

    const handleOpenForm = (plan?: InstallmentPlan) => {
        if (plan) {
            setPlanToEdit(plan);
            setFormData({
                description: plan.description,
                total_amount: plan.total_amount.toString(),
                total_installments: plan.total_installments.toString(),
                payment_day: plan.payment_day.toString(),
                account_id: plan.account_id,
                category_id: plan.category_id,
                subcategory: plan.subcategory || ''
            });
        } else {
            setPlanToEdit(null);
            setFormData({
                description: '',
                total_amount: '',
                total_installments: '12',
                payment_day: '3',
                account_id: accounts[0]?.id || '',
                category_id: categories.find(c => c.name.toLowerCase().includes('compras'))?.id || categories[0]?.id || '',
                subcategory: ''
            });
        }
        setIsFormOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const installmentAmount = parseFloat(formData.total_amount) / parseInt(formData.total_installments);

        const planData = {
            ...formData,
            total_amount: parseFloat(formData.total_amount),
            total_installments: parseInt(formData.total_installments),
            payment_day: parseInt(formData.payment_day),
            installment_amount: installmentAmount,
        };

        if (planToEdit) {
            await onUpdatePlan(planToEdit.id, planData);
        } else {
            await onAddPlan({
                ...planData,
                remaining_amount: planData.total_amount,
                completed_installments: 0,
                is_active: true,
                start_date: new Date().toISOString().split('T')[0]
            });
        }

        setIsFormOpen(false);
        setPlanToEdit(null);
    };

    return (
        <div className="main-content">
            <header className="header">
                <h1>Compras Tasa Cero</h1>
                <button className="btn btn-primary" onClick={() => handleOpenForm()}>
                    + Nuevo Plan
                </button>
            </header>

            {isFormOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <header className="modal-header">
                            <h2>{planToEdit ? 'Editar Plan' : 'Nuevo Plan Tasa Cero'}</h2>
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
                                    onChange={e => {
                                        const catId = e.target.value;
                                        const cat = categories.find(c => c.id === catId);
                                        setFormData({
                                            ...formData,
                                            category_id: catId,
                                            subcategory: cat?.subcategories?.[0] || ''
                                        });
                                    }}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {subcategories.length > 0 && (
                                <div className="form-group">
                                    <label>Subcategoría</label>
                                    <select
                                        value={formData.subcategory}
                                        onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                                    >
                                        {subcategories.map((s: string) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">
                                    {planToEdit ? 'Guardar Cambios' : 'Crear Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="dashboard-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '8px'
            }}>
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
                        const accentColor = account?.color || 'var(--accent-primary)';

                        return (
                            <div
                                key={plan.id}
                                className="section-card glass plan-card-piquis"
                                style={{
                                    background: `linear-gradient(135deg, #ffffff 0%, ${accentColor}10 100%)`,
                                    borderLeft: `5px solid ${accentColor}`,
                                    padding: '0.75rem',
                                    borderRadius: '1.25rem',
                                    minHeight: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <span className="badge-quote" style={{ marginBottom: '2px', fontSize: '0.6rem', padding: '2px 6px' }}>Tasa Cero</span>
                                        <h3 style={{ fontWeight: 800, fontSize: '0.95rem', margin: 0, lineHeight: 1.2 }}>{plan.description}</h3>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button className="btn-icon" onClick={() => handleOpenForm(plan)} style={{ padding: '4px' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                        <button className="btn-icon delete" onClick={() => onDeletePlan(plan.id)} style={{ padding: '4px' }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>
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
                    padding: 0.75rem;
                    display: flex;
                    flex-direction: column;
                    min-height: auto;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .plan-card-piquis:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }
                .plan-details-piquis {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    margin-bottom: 0.75rem;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .detail-label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }
                .detail-value {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-main);
                }
                .progress-section-piquis {
                    margin-top: auto;
                    border-top: 1px dashed var(--accent-medium);
                    padding-top: 0.75rem;
                }
                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.65rem;
                    font-weight: 700;
                    margin-bottom: 4px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                }
                .progress-bar-container {
                    height: 6px;
                    background: var(--accent-soft);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 6px;
                }
                .progress-bar-fill {
                    height: 100%;
                    background: var(--accent-primary);
                    border-radius: 3px;
                    transition: width 0.3s ease;
                }
                .progress-footer {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.7rem;
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
