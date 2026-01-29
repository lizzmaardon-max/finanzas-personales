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
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        type: 'Gasto',
        amount: '',
        method: accounts.length > 0 ? accounts[0].name : '',
        category: categories.length > 0 ? categories[0].name : '',
        subcategory: (categories.length > 0 && categories[0].subcategories.length > 0) ? categories[0].subcategories[0] : '',
        origin: accounts.length > 0 ? accounts[0].name : 'Efectivo',
        destination: '-'
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
            // We combine category and subcategory for display if needed
            category: formData.subcategory ? `${formData.category} > ${formData.subcategory}` : formData.category
        });
    };

    const selectedCategory = categories.find(c => c.name === formData.category);

    return (
        <div className="modal-overlay">
            <div className="modal-content glass">
                <header className="modal-header">
                    <h2 className="section-title">Nueva Transacción</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Tipo</label>
                        <select
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="Gasto">Gasto</option>
                            <option value="Ingreso">Ingreso</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Pago de Deuda">Pago de Deuda</option>
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

                    <div className="form-group">
                        <label>Fecha</label>
                        <input
                            type="date"
                            min="2025-01-01"
                            max="2030-12-31"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Categoría</label>
                            <select
                                value={formData.category}
                                onChange={e => handleCategoryChange(e.target.value)}
                            >
                                {categories.map(c => (
                                    <option key={c.id} value={c.name}>{c.icon || '📁'} {c.name}</option>
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
                        <label>Método de Pago / Cuenta</label>
                        <select
                            value={formData.method}
                            onChange={e => setFormData({ ...formData, method: e.target.value })}
                        >
                            {accounts.length === 0 && <option value="">Sin cuentas registradas</option>}
                            {accounts.map(a => (
                                <option key={a.id} value={a.name}>{a.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar Transacción</button>
                    </div>
                </form>
            </div>
            <style>{`
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                }
            `}</style>
        </div>
    );
};

export default TransactionForm;
