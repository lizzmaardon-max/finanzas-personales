import React, { useState } from 'react';

interface LoanFormProps {
    onClose: () => void;
    onSave: (loan: any) => void;
    accounts: any[];
    categories: any[];
    loanToEdit?: any;
}

const LoanForm: React.FC<LoanFormProps> = ({ onClose, onSave, accounts, categories, loanToEdit }) => {
    const [formData, setFormData] = useState({
        name: loanToEdit?.name || '',
        initial_capital: loanToEdit?.initial_capital || '',
        total_installments: loanToEdit?.total_installments || '',
        monthly_installment: loanToEdit?.monthly_installment || '',
        start_date: loanToEdit?.start_date || new Date().toISOString().split('T')[0],
        account_id: loanToEdit?.account_id || accounts[0]?.id || '',
        category_id: loanToEdit?.category_id || categories.find(c => c.name.toLowerCase().includes('créditos'))?.id || categories.find(c => c.name.toLowerCase().includes('préstamos'))?.id || categories[0]?.id || '',
        subcategory: loanToEdit?.subcategory || 'Personal'
    });

    const selectedCategory = categories.find(c => c.id === formData.category_id);
    const subcategories = selectedCategory?.subcategories || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            initial_capital: parseFloat(formData.initial_capital.toString()),
            total_installments: parseInt(formData.total_installments.toString()),
            monthly_installment: formData.monthly_installment ? parseFloat(formData.monthly_installment.toString()) : null
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{loanToEdit ? 'Editar Crédito' : 'Nuevo Crédito'}</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre del Crédito</label>
                        <input
                            type="text"
                            placeholder="Ej: Préstamo Hipotecario"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Capital Inicial</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.initial_capital}
                                onChange={e => setFormData({ ...formData, initial_capital: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>N° Cuotas</label>
                            <input
                                type="number"
                                value={formData.total_installments}
                                onChange={e => setFormData({ ...formData, total_installments: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Cuota Mensual (Opcional)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.monthly_installment}
                                onChange={e => setFormData({ ...formData, monthly_installment: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Fecha Inicio</label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                            />
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
                        >
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>

                    {subcategories.length > 0 && (
                        <div className="form-group">
                            <label>Subcategoría</label>
                            <select
                                value={formData.subcategory}
                                onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                            >
                                {subcategories.map((s: string) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Cuenta de Pago (Default)</label>
                        <select
                            value={formData.account_id}
                            onChange={e => setFormData({ ...formData, account_id: e.target.value })}
                        >
                            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-primary">
                            {loanToEdit ? 'Actualizar Crédito' : 'Guardar Crédito'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoanForm;
