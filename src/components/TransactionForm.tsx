import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';

interface TransactionFormProps {
    onClose: () => void;
    onAdd: (transaction: any) => void;
    onUpdate?: (id: string, transaction: any) => void;
    accounts: any[];
    categories: any[];
    editData?: any;
    defaultType?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onAdd, onUpdate, accounts, categories, editData, defaultType }) => {
    const isEditing = !!editData;

    // Get last used type from localStorage for better UX
    const lastUsedType = localStorage.getItem('lastTransactionType') || 'Gasto';

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: defaultType || lastUsedType,
        amount: '',
        accountId: accounts.length > 0 ? accounts[0].id : '',
        destinationAccountId: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        subcategory: '',
        description: '',
        owner: 'Mayra'
    });

    useEffect(() => {
        if (editData) {
            setFormData({
                date: editData.date,
                type: editData.type,
                amount: editData.amount.toString().replace(/[^\d.-]/g, ''),
                accountId: editData.account_id,
                destinationAccountId: editData.destination_account_id || '',
                categoryId: editData.category_id || (categories.length > 0 ? categories[0].id : ''),
                subcategory: editData.description?.split(': ')[1] || '',
                description: (editData.description || '').replace('(M)', '').replace('(Y)', '').trim(),
                owner: editData.description?.includes('(M)') ? 'Manuel' : 'Mayra'
            });
        }
    }, [editData, categories]);

    useEffect(() => {
        if (defaultType && !isEditing) {
            setFormData(prev => ({ ...prev, type: defaultType }));
        }
    }, [defaultType, isEditing]);

    const handleCategoryChange = (catId: string) => {
        const cat = categories.find(c => c.id === catId);
        setFormData({
            ...formData,
            categoryId: catId,
            subcategory: (cat && cat.subcategories.length > 0) ? cat.subcategories[0] : ''
        });
    };

    const isTransfer = formData.type === 'Transferencia';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isManuel = formData.owner === 'Manuel';

        if (!formData.amount || (!isManuel && !formData.accountId)) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        if (isTransfer && !formData.destinationAccountId && !isManuel) {
            alert('Por favor selecciona la cuenta de destino');
            return;
        }

        // Save last used type
        localStorage.setItem('lastTransactionType', formData.type);

        const selectedAccount = accounts.find(a => a.id === formData.accountId);
        const selectedCategory = isTransfer ? null : categories.find(c => c.id === formData.categoryId);

        const cardColor = selectedAccount ? selectedAccount.color : null;
        const typePrefix = formData.type === 'Ingreso' ? '+' : '-';
        const formattedAmount = `${typePrefix}$${parseFloat(formData.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const payload = {
            ...formData,
            categoryId: isTransfer ? null : formData.categoryId,
            amount: formattedAmount,
            cardColor,
            categoryName: selectedCategory ? selectedCategory.name : formData.type,
            accountName: selectedAccount ? selectedAccount.name : (isManuel ? 'N/A' : ''),
            description: formData.owner === 'Manuel' ? `(M) ${formData.description}` : formData.description
        };

        if (isEditing && onUpdate) {
            onUpdate(editData.id, payload);
        } else {
            onAdd(payload);
        }
        onClose();
    };

    const selectedCategory = categories.find(c => c.id === formData.categoryId);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{isEditing ? 'Editar' : (defaultType ? `Nuevo ${defaultType}` : 'Nueva Transacción')}</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tipo de movimiento</label>
                        <div className="custom-segmented-control">
                            {['Gasto', 'Ingreso', 'Transferencia'].map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`segment-item ${formData.type === t ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, type: t })}
                                >
                                    {t === 'Gasto' ? '💸' : t === 'Ingreso' ? '💰' : '🔄'}
                                    <span>{t}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Monto</label>
                        <div className="amount-input-wrapper">
                            <span className="currency-symbol">$</span>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row mobile-stack">
                        <div className="form-group">
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        {formData.owner === 'Mayra' && (
                            <div className="form-group slide-down">
                                <label>{formData.type === 'Transferencia' ? 'Desde Cuenta' : 'Cuenta'}</label>
                                <select
                                    value={formData.accountId}
                                    onChange={e => setFormData({ ...formData, accountId: e.target.value })}
                                    required={formData.owner === 'Mayra'}
                                >
                                    <option value="" disabled>Seleccionar</option>
                                    {accounts.map(a => (
                                        <option key={a.id} value={a.id}>{a.name} ({a.balance})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {isTransfer && formData.owner === 'Mayra' && (
                        <div className="form-group slide-down">
                            <label>Hacia Cuenta (Destino)</label>
                            <select
                                value={formData.destinationAccountId}
                                onChange={e => setFormData({ ...formData, destinationAccountId: e.target.value })}
                                required
                            >
                                <option value="" disabled>Seleccionar destino</option>
                                {accounts.filter(a => a.id !== formData.accountId).map(a => (
                                    <option key={a.id} value={a.id}>{a.name} ({a.balance})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {!isTransfer && (
                        <div className="form-row mobile-stack">
                            <div className="form-group">
                                <label>Categoría</label>
                                <select
                                    value={formData.categoryId}
                                    onChange={e => handleCategoryChange(e.target.value)}
                                >
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Subcategoría</label>
                                <select
                                    value={formData.subcategory}
                                    onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                                    disabled={!selectedCategory || selectedCategory.subcategories.length === 0}
                                >
                                    {selectedCategory && selectedCategory.subcategories.map((s: string) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Nota (Opcional)</label>
                        <input
                            type="text"
                            placeholder="Ej: Almuerzo ejecutivo"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Responsable</label>
                        <div className="custom-segmented-control" style={{ gridTemplateColumns: 'repeat(2, 1fr)', zIndex: 10 }}>
                            {['Mayra', 'Manuel'].map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`segment-item ${formData.owner === p ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setFormData({ ...formData, owner: p });
                                    }}
                                    style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                                >
                                    {p === 'Mayra' ? '👩‍💼' : '👨‍💼'}
                                    <span>{p}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="modal-actions-piquis">
                        <button type="submit" className="btn-primary main-save">
                            {isEditing ? 'Actualizar' : 'Guardar Transacción'}
                        </button>
                    </div>
                </form>

                <style>{`
                    .custom-segmented-control {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 8px;
                        background: var(--bg-primary);
                        padding: 6px;
                        border-radius: var(--radius-md);
                    }
                    .segment-item {
                        border: none;
                        background: none;
                        padding: 10px;
                        border-radius: var(--radius-sm);
                        font-size: 0.8rem;
                        font-weight: 700;
                        color: var(--text-muted);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 6px;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .segment-item.active {
                        background: white;
                        color: var(--text-main);
                        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    }
                    .amount-input-wrapper {
                        position: relative;
                        display: flex;
                        align-items: center;
                    }
                    .currency-symbol {
                        position: absolute;
                        left: 1.25rem;
                        font-weight: 800;
                        color: var(--text-main);
                        font-size: 1.2rem;
                    }
                    .amount-input-wrapper input {
                        padding-left: 2.5rem !important;
                        font-size: 1.5rem !important;
                        font-weight: 800;
                        color: var(--accent-primary);
                    }
                    .mobile-stack {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                    }
                    @media (max-width: 480px) {
                        .mobile-stack { grid-template-columns: 1fr; }
                        .custom-segmented-control { grid-template-columns: repeat(2, 1fr); }
                    }
                    .modal-actions-piquis {
                        margin-top: 2rem;
                    }
                    .main-save {
                        width: 100%;
                        height: 56px;
                        font-size: 1.1rem;
                        box-shadow: 0 10px 25px rgba(229, 115, 115, 0.3) !important;
                    }
                    .slide-down {
                        animation: slideDown 0.3s ease-out;
                    }
                    @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default TransactionForm;
