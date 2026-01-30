import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';

interface BudgetFormProps {
    onClose: () => void;
    onSave: (budget: any) => void;
    categories: any[];
    selectedMonth: string;
    editData?: any;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onClose, onSave, categories, selectedMonth, editData }) => {
    const [formData, setFormData] = useState({
        categoryId: categories.length > 0 ? categories[0].id : '',
        amount: '',
        month: selectedMonth
    });

    useEffect(() => {
        if (editData) {
            setFormData({
                categoryId: editData.category_id,
                amount: editData.amount.toString(),
                month: editData.month
            });
        }
    }, [editData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.amount || !formData.categoryId) {
            alert('Por favor completa todos los campos');
            return;
        }

        onSave({
            ...formData,
            id: editData?.id || Date.now().toString(),
            amount: parseFloat(formData.amount),
            category_id: formData.categoryId // Ensure we use the property name expected by the table
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{editData ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Categoría</label>
                        <select
                            value={formData.categoryId}
                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            disabled={!!editData}
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Monto Mensual ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Mes</label>
                        <input
                            type="month"
                            value={formData.month}
                            onChange={e => setFormData({ ...formData, month: e.target.value })}
                            required
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar Presupuesto</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BudgetForm;
