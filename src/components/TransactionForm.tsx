import React, { useState } from 'react';
import '../styles/dashboard.css';

interface TransactionFormProps {
    onClose: () => void;
    onAdd: (transaction: any) => void;
    accounts: any[];
    categories: any[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, onAdd, accounts, categories }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'Gasto',
        amount: '',
        method: accounts.length > 0 ? accounts[0].name : '',
        category: categories.length > 0 ? categories[0].name : '',
        subcategory: (categories.length > 0 && categories[0].subcategories.length > 0) ? categories[0].subcategories[0] : '',
        description: ''
    });

    const handleCategoryChange = (catName: string) => {
        const cat = categories.find(c => c.name === catName);
        setFormData({
            ...formData,
            category: catName,
            subcategory: (cat && cat.subcategories.length > 0) ? cat.subcategories[0] : ''
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.amount) return;

        const selectedAccount = accounts.find(a => a.name === formData.method);
        const cardColor = selectedAccount ? selectedAccount.color : null;

        const formattedAmount = `${formData.type === 'Ingreso' ? '+' : '-'}$${parseFloat(formData.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        onAdd({
            ...formData,
            amount: formattedAmount,
            cardColor,
            category: formData.subcategory ? `${formData.category} > ${formData.subcategory}` : formData.category
        });
    };

    const selectedCategory = categories.find(c => c.name === formData.category);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <header className="modal-header">
                    <h2>Nueva Transacción</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>¿Qué tipo de movimiento es?</label>
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Gasto">💸 Gasto</option>
                            <option value="Ingreso">💰 Ingreso</option>
                            <option value="Transferencia">🔄 Transferencia</option>
                            <option value="Pago de Deuda">💳 Pago de Deuda</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Monto</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                            <label>Fecha</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Cuenta</label>
                            <select
                                value={formData.method}
                                onChange={e => setFormData({ ...formData, method: e.target.value })}
                            >
                                {accounts.map(a => (
                                    <option key={a.id} value={a.name}>
                                        {a.name} {a.last4 || ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group">
                            <label>Categoría</label>
                            <select
                                value={formData.category}
                                onChange={e => handleCategoryChange(e.target.value)}
                            >
                                {categories.map(c => (
                                    <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
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
                                {(!selectedCategory || selectedCategory.subcategories.length === 0) && (
                                    <option value="">Sin subcategorías</option>
                                )}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Nota / Descripción (Opcional)</label>
                        <input
                            type="text"
                            placeholder="Ej: Cena con amigos"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionForm;
