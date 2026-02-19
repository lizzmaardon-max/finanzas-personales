import React, { useState, useEffect, useRef } from 'react';

interface LoanPaymentFormProps {
    onClose: () => void;
    onSave: (payment: any) => void;
    loan: any;
    lastPayment?: any;
    paymentToEdit?: any;
}

const LoanPaymentForm: React.FC<LoanPaymentFormProps> = ({ onClose, onSave, loan, lastPayment, paymentToEdit }) => {
    const amountInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        amount_paid: paymentToEdit?.amount_paid || lastPayment?.amount_paid || loan.monthly_installment || '',
        principal: paymentToEdit?.principal || lastPayment?.principal || '',
        interest: paymentToEdit?.interest || lastPayment?.interest || '',
        others: paymentToEdit?.others || '0',
        is_installment: paymentToEdit ? paymentToEdit.is_installment : true,
        payment_date: paymentToEdit?.payment_date || new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (amountInputRef.current) {
            amountInputRef.current.focus();
        }
    }, []);

    // Auto-calculate "Others"
    useEffect(() => {
        const total = parseFloat(formData.amount_paid) || 0;
        const princ = parseFloat(formData.principal) || 0;
        const intr = parseFloat(formData.interest) || 0;
        const calculatedOthers = (total - princ - intr).toFixed(2);

        if (calculatedOthers !== formData.others) {
            setFormData(prev => ({ ...prev, others: calculatedOthers }));
        }
    }, [formData.amount_paid, formData.principal, formData.interest]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...formData,
            amount_paid: parseFloat(formData.amount_paid),
            principal: parseFloat(formData.principal),
            interest: parseFloat(formData.interest),
            others: parseFloat(formData.others)
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>{paymentToEdit ? 'Editar Pago' : `Registrar Pago: ${loan.name}`}</h2>
                    <button className="btn-close" onClick={onClose}>&times;</button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Total Pagado (Banco)</label>
                        <input
                            ref={amountInputRef}
                            type="number"
                            step="0.01"
                            value={formData.amount_paid}
                            onChange={e => setFormData({ ...formData, amount_paid: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Abono a Capital</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.principal}
                                onChange={e => setFormData({ ...formData, principal: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Intereses</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.interest}
                                onChange={e => setFormData({ ...formData, interest: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Otros (Seguros, etc.) - Autocalculado</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.others}
                                onChange={e => setFormData({ ...formData, others: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Fecha de Pago</label>
                            <input
                                type="date"
                                value={formData.payment_date}
                                onChange={e => setFormData({ ...formData, payment_date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            type="checkbox"
                            id="is_installment"
                            checked={formData.is_installment}
                            onChange={e => setFormData({ ...formData, is_installment: e.target.checked })}
                        />
                        <label htmlFor="is_installment" style={{ marginBottom: 0 }}>Es una cuota pagada</label>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn btn-primary">
                            {paymentToEdit ? 'Guardar Cambios' : 'Registrar Pago'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoanPaymentForm;
