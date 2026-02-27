import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transacciones from './pages/Transacciones';
import Cuentas from './pages/Cuentas';
import Categorias from './pages/Categorias';
import BabySection from './pages/BabySection';
import Installments from './pages/Installments';
import Loans from './pages/Loans';
import { supabase } from './lib/supabase';
import './styles/dashboard.css';

const MOCK_USER_ID = '0e3405eb-3972-4238-b533-e740709748cb';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<any[]>([]);
    const [installmentPlans, setInstallmentPlans] = useState<any[]>([]);
    const [loans, setLoans] = useState<any[]>([]);
    const [loanPayments, setLoanPayments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch Accounts
            const { data: accountsData } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', MOCK_USER_ID)
                .order('created_at', { ascending: true });

            const cleanedAccounts = accountsData ? accountsData.map(a => {
                const isAhorro = a.name.includes('\u200B');
                return {
                    ...a,
                    name: a.name.replace('\u200B', '').trim(),
                    balance: `${a.balance < 0 ? '-' : ''}$${Math.abs(parseFloat(a.balance.toString().replace(/[^\d.-]/g, ''))).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                    type: a.type === 'credito' ? 'Tarjeta de Crédito' :
                        a.type === 'efectivo' ? 'Efectivo' :
                            (a.type === 'banco' && isAhorro) ? 'Ahorro' :
                                a.type === 'banco' ? 'Cuenta de Ahorro' : 'Billetera Digital',
                    credit_limit: parseFloat(a.credit_limit || 0)
                };
            }) : [];
            setAccounts(cleanedAccounts);

            // Fetch Transactions
            const { data: transactionsData, error: txError } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', MOCK_USER_ID)
                .order('date', { ascending: false })
                .order('created_at', { ascending: false });

            if (txError) console.error('Error fetching transactions:', txError);

            // Fetch Categories
            const { data: categoriesData, error: catError } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', MOCK_USER_ID);

            if (catError) console.error('Error fetching categories:', catError);

            const finalCategories = categoriesData && categoriesData.length > 0 ? categoriesData.map(c => ({
                ...c,
                subcategories: c.subcategories || []
            })) : [
                { id: '1', name: 'Alimentación', color: '#f9a8a8', icon: '🍎', subcategories: ['Supermercado', 'Restaurantes', 'Antojos'] },
                { id: '2', name: 'Vivienda', color: '#82aaff', icon: '🏠', subcategories: ['Alquiler', 'Mantenimiento del hogar', 'Reparaciones', 'Muebles / decoración', 'Artículos del hogar'] },
                { id: '3', name: 'Transporte', color: '#68b6a3', icon: '🚗', subcategories: ['Gasolina', 'Transporte Público', 'Taller / Mantenimiento'] },
                { id: '4', name: 'Servicios', color: '#c792ea', icon: '💡', subcategories: ['Energía', 'Agua', 'Internet', 'Celular'] },
                { id: '5', name: 'Bebé', color: '#ffb946', icon: '👶', subcategories: ['Pañales', 'Leche', 'Ropa', 'Médico', 'Otros'] },
            ];

            setCategories(finalCategories);

            // Fetch Budgets (LocalStorage fallback)
            const localBudgets = localStorage.getItem('finanzas_budgets');
            if (localBudgets) {
                setBudgets(JSON.parse(localBudgets));
            }

            if (transactionsData) {
                const adaptedTransactions = transactionsData.map(t => {
                    const acc = cleanedAccounts.find(a => a.id === t.account_id);
                    const destAcc = t.destination_account_id ? cleanedAccounts.find(a => a.id === t.destination_account_id) : null;
                    const cat = finalCategories.find(c => c.id === t.category_id);
                    const categoryName = cat ? cat.name : (t.type === 'transferencia' ? 'Transferencia' : (t.category_id || 'Varios'));

                    return {
                        ...t,
                        amount: `${t.type?.toLowerCase() === 'ingreso' ? '+' : '-'}$${Math.abs(parseFloat(t.amount.toString().replace(/[^\d.-]/g, ''))).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`,
                        category: categoryName,
                        method: (t.type === 'transferencia')
                            ? `${acc ? acc.name : '?'} ➔ ${destAcc ? destAcc.name : '?'}`
                            : (acc ? acc.name : 'Cuenta'),
                        cardColor: cat ? cat.color : (acc ? acc.color : '#ccc'),
                        type: t.type?.toLowerCase() === 'ingreso' ? 'Ingreso' :
                            t.type?.toLowerCase() === 'gasto' ? 'Gasto' :
                                t.type?.toLowerCase() === 'transferencia' ? 'Transferencia' : t.type,
                        owner: t.description?.includes('(M)') ? 'Manuel' : 'Mayra'
                    };
                });
                setTransactions(adaptedTransactions);
            }
            // Fetch Installment Plans
            const { data: plansData } = await supabase
                .from('installment_plans')
                .select('*')
                .eq('user_id', MOCK_USER_ID)
                .eq('is_active', true);
            setInstallmentPlans(plansData || []);

            if (plansData && plansData.length > 0) {
                await processDueInstallments(plansData);
            }

            // Fetch Loans
            const { data: loansData } = await supabase
                .from('loans')
                .select('*')
                .eq('user_id', MOCK_USER_ID);
            setLoans(loansData || []);

            // Fetch Loan Payments
            if (loansData && loansData.length > 0) {
                const { data: paymentsData } = await supabase
                    .from('loan_payments')
                    .select('*')
                    .in('loan_id', loansData.map((l: any) => l.id));
                setLoanPayments(paymentsData || []);
                console.log('Loan payments fetched:', paymentsData?.length);
            } else {
                setLoanPayments([]);
            }

            console.log('--- DATA FETCH COMPLETE ---');
            console.log('Accounts:', cleanedAccounts.length);
            console.log('Transactions:', transactionsData?.length);
            console.log('Categories:', finalCategories.length);
            console.log('--- DATA FETCH COMPLETE ---');
        } catch (error: any) {
            console.error('Error fetching data:', error);
            const msg = error.message || 'Error de conexión';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Budget Helpers ---
    const addBudget = (b: any) => {
        const newBudgets = [...budgets, b];
        setBudgets(newBudgets);
        localStorage.setItem('finanzas_budgets', JSON.stringify(newBudgets));
    };

    const updateBudget = (updated: any) => {
        const newBudgets = budgets.map(b => b.id === updated.id ? updated : b);
        setBudgets(newBudgets);
        localStorage.setItem('finanzas_budgets', JSON.stringify(newBudgets));
    };

    const deleteBudget = (id: string) => {
        const newBudgets = budgets.filter(b => b.id !== id);
        setBudgets(newBudgets);
        localStorage.setItem('finanzas_budgets', JSON.stringify(newBudgets));
    };

    const processDueInstallments = async (plans: any[]) => {
        let needsRefresh = false;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentDay = now.getDate();

        for (const plan of plans) {
            if (!plan.is_active) continue;

            // Check if payment day is today or passed, and hasn't been processed this month
            const lastProcessed = plan.last_processed_date ? new Date(plan.last_processed_date) : null;
            const isDifferentMonth = !lastProcessed ||
                lastProcessed.getMonth() !== currentMonth ||
                lastProcessed.getFullYear() !== currentYear;

            if (isDifferentMonth && currentDay >= plan.payment_day) {
                // Time to process a new installment
                console.log(`Processing installment for: ${plan.description}`);

                // 1. Create transaction
                const transaction = {
                    accountId: plan.account_id,
                    categoryId: plan.category_id,
                    subcategory: plan.subcategory || null,
                    amount: plan.installment_amount.toString(),
                    type: 'Gasto',
                    date: now.toISOString().split('T')[0],
                    description: `Cuota ${plan.completed_installments + 1}/${plan.total_installments}: ${plan.description}`
                };

                await addTransaction(transaction, true);

                // 2. Update plan
                const newCompleted = plan.completed_installments + 1;
                const newRemaining = Math.max(0, plan.remaining_amount - plan.installment_amount);
                const isActive = newCompleted < plan.total_installments;

                await supabase.from('installment_plans').update({
                    completed_installments: newCompleted,
                    remaining_amount: newRemaining,
                    is_active: isActive,
                    last_processed_date: now.toISOString().split('T')[0]
                }).eq('id', plan.id);

                needsRefresh = true;
            }
        }

        if (needsRefresh) {
            await fetchData();
        }
    };

    const addInstallmentPlan = async (plan: any) => {
        const now = new Date();
        const currentDay = now.getDate();

        // If payment day has already passed this month, don't auto-charge for this month
        const lastProcessedDate = plan.payment_day < currentDay
            ? now.toISOString().split('T')[0]
            : null;

        const { error } = await supabase
            .from('installment_plans')
            .insert([{ ...plan, user_id: MOCK_USER_ID, last_processed_date: lastProcessedDate }])
            .select()
            .single();

        if (error) {
            console.error('Error adding installment plan:', error);
            alert('Error al guardar el plan: ' + error.message);
            return;
        }

        await fetchData();
    };

    const updateInstallmentPlan = async (id: string, plan: any) => {
        const { error } = await supabase
            .from('installment_plans')
            .update(plan)
            .eq('id', id);

        if (error) {
            console.error('Error updating plan:', error);
            alert('Error al actualizar el plan: ' + error.message);
            return;
        }
        await fetchData();
    };

    const deleteInstallmentPlan = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar este plan? No se borrarán las transacciones ya registradas.')) return;

        const { error } = await supabase
            .from('installment_plans')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting plan:', error);
            return;
        }

        setInstallmentPlans(installmentPlans.filter(p => p.id !== id));
    };

    const addTransaction = async (t: any, skipRefresh = false) => {
        // Map UI labels to Database Enum (lowercase/underscore)
        const dbType = t.type === 'Gasto' ? 'gasto' :
            t.type === 'Ingreso' ? 'ingreso' :
                t.type === 'Transferencia' ? 'transferencia' : 'gasto';

        const amountNum = parseFloat(t.amount.replace(/[^\d.-]/g, ''));

        const newTransaction = {
            user_id: MOCK_USER_ID,
            account_id: t.accountId || null,
            category_id: t.categoryId,
            subcategory: t.subcategory || null,
            loan_payment_id: t.loanPaymentId || null,
            amount: amountNum,
            type: dbType,
            date: t.date,
            description: t.description || t.categoryName,
            destination_account_id: (t.type === 'Transferencia') ? t.destinationAccountId : null
        };

        const { data, error } = await supabase
            .from('transactions')
            .insert([newTransaction])
            .select('*, category:categories(name, icon, color)')
            .single();

        if (error) {
            console.error('Error adding transaction:', error);
            alert('Error al guardar la transacción: ' + error.message);
            return;
        }

        // Update Account Balances
        if (data && t.accountId) {
            // Update Source Account
            const sourceAccount = accounts.find(a => a.id === t.accountId);
            if (sourceAccount) {
                const currentBalance = parseFloat(sourceAccount.balance.replace(/[^\d.-]/g, ''));
                const absAmount = Math.abs(amountNum);
                let newBalance = currentBalance;

                if (dbType === 'ingreso') newBalance += absAmount;
                else newBalance -= absAmount; // gasto, transferencia all subtract from source

                await supabase.from('accounts').update({ balance: newBalance }).eq('id', t.accountId);
            }

            // Update Destination Account if Transfer
            if ((dbType === 'transferencia') && t.destinationAccountId) {
                const destAccount = accounts.find(a => a.id === t.destinationAccountId);
                if (destAccount) {
                    const currentBalance = parseFloat(destAccount.balance.replace(/[^\d.-]/g, ''));
                    const newBalance = currentBalance + Math.abs(amountNum);
                    await supabase.from('accounts').update({ balance: newBalance }).eq('id', t.destinationAccountId);
                }
            }
        }

        // Refresh data to ensure everything is in sync
        if (!skipRefresh) {
            await fetchData();
        }
    };

    const updateTransaction = async (id: string, t: any) => {
        const dbType = t.type === 'Gasto' ? 'gasto' :
            t.type === 'Ingreso' ? 'ingreso' :
                t.type === 'Transferencia' ? 'transferencia' : 'gasto';

        // Robust parsing: remove all except numbers, dot, and minus sign
        const cleanedAmount = t.amount.toString().replace(/[^\d.-]/g, '');
        const amountNum = parseFloat(cleanedAmount);

        if (isNaN(amountNum)) {
            console.error('Invalid amount during update:', t.amount);
            alert('Error: Monto inválido');
            return;
        }

        const { error } = await supabase
            .from('transactions')
            .update({
                account_id: t.accountId || null,
                category_id: t.categoryId,
                amount: amountNum,
                type: dbType,
                date: t.date,
                description: t.description
            })
            .eq('id', id);

        if (error) {
            console.error('Error updating transaction:', error);
            alert('Error al actualizar: ' + error.message);
            return;
        }

        fetchData(); // Refresh to sync balances and transactions
    };

    const deleteTransaction = async (tx: any) => {
        if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;

        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', tx.id);

        if (error) {
            console.error('Error deleting transaction:', error);
            alert('Error al eliminar: ' + error.message);
            return;
        }

        // If it was a loan payment, delete that too
        if (tx.loan_payment_id) {
            const { error: loanPaymentError } = await supabase
                .from('loan_payments')
                .delete()
                .eq('id', tx.loan_payment_id);

            if (loanPaymentError) {
                console.error('Error deleting associated loan payment:', loanPaymentError);
            }
        }

        // Reverse balance update
        const amountNum = Math.abs(parseFloat(tx.amount.replace(/[^\d.-]/g, '')));
        const type = tx.type?.toLowerCase();

        // Reverse source account
        const sourceAcc = accounts.find(a => a.name === tx.method?.split(' ➔ ')[0] || a.name === tx.method);
        if (sourceAcc) {
            const currentBalance = parseFloat(sourceAcc.balance.replace(/[^\d.-]/g, ''));
            let newBalance = currentBalance;
            if (type === 'ingreso') newBalance -= amountNum;
            else newBalance += amountNum; // Reverse expense or transfer withdrawal

            await supabase.from('accounts').update({ balance: newBalance }).eq('id', sourceAcc.id);
        }

        // Reverse destination account for transfers
        if (type === 'transferencia' && tx.destination_account_id) {
            const destAcc = accounts.find(a => a.id === tx.destination_account_id);
            if (destAcc) {
                const currentBalance = parseFloat(destAcc.balance.replace(/[^\d.-]/g, ''));
                const newBalance = currentBalance - amountNum;
                await supabase.from('accounts').update({ balance: newBalance }).eq('id', destAcc.id);
            }
        }

        await fetchData();
    };

    const addAccount = async (a: any) => {
        // Map UI type to Database Enum
        const isAhorro = a.type === 'Ahorro';
        const finalDbType = a.type === 'Tarjeta de Crédito' ? 'credito' :
            a.type === 'Efectivo' ? 'efectivo' : 'banco';

        const newAccount = {
            user_id: MOCK_USER_ID,
            name: isAhorro ? `${a.name} \u200B` : a.name,
            type: finalDbType,
            balance: parseFloat(a.balance.toString().replace('$', '').replace(',', '')) || 0,
            bank: a.bank || '',
            color: a.color || '#f9a8a8',
            last4: a.last4 || '',
            credit_limit: parseFloat(a.credit_limit) || 0
        };

        const { data, error } = await supabase
            .from('accounts')
            .insert([newAccount])
            .select()
            .single();

        if (error) {
            console.error('Error adding account:', error);
            alert('Error al guardar la cuenta: ' + error.message);
            return;
        }

        if (data) {
            const adapted = {
                ...data,
                balance: `${data.balance < 0 ? '-' : ''}$${Math.abs(data.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                type: a.type, // Keep original UI type label
                credit_limit: parseFloat(data.credit_limit || 0)
            };
            setAccounts([...accounts, adapted]);
        }
    };

    const updateAccount = async (updated: any) => {
        const isAhorro = updated.type === 'Ahorro';
        const finalDbType = updated.type === 'Tarjeta de Crédito' ? 'credito' :
            updated.type === 'Efectivo' ? 'efectivo' : 'banco';

        const { error } = await supabase
            .from('accounts')
            .update({
                name: isAhorro ? `${updated.name} \u200B` : updated.name,
                type: finalDbType,
                balance: parseFloat(updated.balance.replace('$', '').replace(',', '')) || 0,
                bank: updated.bank || '',
                color: updated.color || '#f9a8a8',
                last4: updated.last4 || '',
                credit_limit: parseFloat(updated.credit_limit) || 0
            })
            .eq('id', updated.id);

        if (!error) {
            setAccounts(accounts.map(acc => acc.id === updated.id ? { ...acc, ...updated, credit_limit: parseFloat(updated.credit_limit) || 0 } : acc));
        } else {
            console.error('Error updating account:', error);
            alert('Error al actualizar la cuenta: ' + error.message);
            return;
        }
    };

    const deleteAccount = async (id: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta cuenta? Las transacciones pasadas se mantendrán en el histórico.')) {
            const { error } = await supabase
                .from('accounts')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting account:', error);
                return;
            }
            setAccounts(accounts.filter(a => a.id !== id));
        }
    };

    const updateCategories = async (updated: any[]) => {
        setIsLoading(true);

        try {
            // Identify deletions
            const currentIds = updated.map(c => c.id);
            const toDelete = categories.filter(c => !currentIds.includes(c.id) && c.id.length > 20);

            for (const cat of toDelete) {
                await supabase.from('categories').delete().eq('id', cat.id);
            }

            for (const cat of updated) {
                const isNew = cat.id.length < 20; // Numerical timestamp vs UUID

                if (isNew) {
                    const { error } = await supabase.from('categories').insert([{
                        user_id: MOCK_USER_ID,
                        name: cat.name,
                        color: cat.color,
                        icon: cat.icon,
                        type: 'gasto', // Default to gasto as per most common use case
                        subcategories: cat.subcategories
                    }]);
                    if (error) throw error;
                } else {
                    const { error } = await supabase.from('categories').update({
                        name: cat.name,
                        color: cat.color,
                        icon: cat.icon,
                        subcategories: cat.subcategories
                    }).eq('id', cat.id);
                    if (error) throw error;
                }
            }

            await fetchData();
        } catch (error: any) {
            console.error('Error syncing categories:', error);
            alert('Error al sincronizar categorías: ' + (error.message || 'Error desconocido'));
        } finally {
            setIsLoading(false);
        }
    };

    // --- Loan Helpers ---
    const addLoan = async (loan: any) => {
        const { error } = await supabase
            .from('loans')
            .insert([{ ...loan, user_id: MOCK_USER_ID }]);

        if (error) {
            console.error('Error adding loan:', error);
            alert('Error al guardar el préstamo: ' + error.message);
            return;
        }
        await fetchData();
    };

    const updateLoan = async (id: string, loan: any) => {
        const { error } = await supabase
            .from('loans')
            .update(loan)
            .eq('id', id);

        if (error) {
            console.error('Error updating loan:', error);
            return;
        }
        await fetchData();
    };

    const deleteLoan = async (id: string) => {
        if (!window.confirm('¿Eliminar este crédito?')) return;
        const { error } = await supabase.from('loans').delete().eq('id', id);
        if (error) console.error('Error deleting loan:', error);
        else await fetchData();
    };

    const addLoanPayment = async (loanId: string, payment: any) => {
        const { data: paymentData, error } = await supabase
            .from('loan_payments')
            .insert([{ ...payment, loan_id: loanId }])
            .select()
            .single();

        if (error) {
            console.error('Error adding loan payment:', error);
            return;
        }

        // Automatic transaction creation
        const loan = loans.find(l => l.id === loanId);
        await addTransaction({
            accountId: loan?.account_id || accounts[0]?.id,
            categoryId: loan?.category_id || (categories.find(c => c.name === 'Créditos')?.id) || categories[0]?.id,
            subcategory: loan?.subcategory || 'Personal',
            loanPaymentId: paymentData.id,
            amount: payment.amount_paid.toString(),
            type: 'Gasto',
            date: payment.payment_date,
            description: `Pago Crédito: ${loan?.name}${payment.is_installment ? ' (Cuota)' : ''}`
        });

        await fetchData();
    };

    const deleteLoanPayment = async (paymentId: string) => {
        if (!window.confirm('¿Eliminar este pago? Se borrará también del historial de transacciones.')) return;

        const { error } = await supabase
            .from('loan_payments')
            .delete()
            .eq('id', paymentId);

        if (error) {
            console.error('Error deleting loan payment:', error);
            alert('Error al eliminar el pago: ' + error.message);
            return;
        }

        await fetchData();
    };

    const updateLoanPayment = async (paymentId: string, payment: any) => {
        // 1. Update loan_payment
        const { error: payError } = await supabase
            .from('loan_payments')
            .update(payment)
            .eq('id', paymentId);

        if (payError) {
            console.error('Error updating payment:', payError);
            alert('Error al actualizar el pago: ' + payError.message);
            return;
        }

        // 2. Update transaction
        const { error: txError } = await supabase
            .from('transactions')
            .update({
                amount: parseFloat(payment.amount_paid),
                date: payment.payment_date
            })
            .eq('loan_payment_id', paymentId);

        if (txError) {
            console.error('Error updating associated transaction:', txError);
        }

        await fetchData();
    };

    const renderPage = () => {
        if (isLoading) {
            return (
                <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <div className="spinner">Cargando tus finanzas...</div>
                </div>
            );
        }

        switch (currentPage) {
            case 'dashboard':
                return (
                    <Dashboard
                        transactions={transactions}
                        accounts={accounts}
                        categories={categories}
                        budgets={budgets}
                        loans={loans}
                        installmentPlans={installmentPlans}
                        onAddTransaction={addTransaction}
                        onUpdateTransaction={updateTransaction}
                        onDeleteTransaction={deleteTransaction}
                        onAddBudget={addBudget}
                        onUpdateBudget={updateBudget}
                        onDeleteBudget={deleteBudget}
                    />
                );
            case 'transacciones':
                return (
                    <Transacciones
                        transactions={transactions}
                        accounts={accounts}
                        categories={categories}
                        onAddTransaction={addTransaction}
                        onUpdateTransaction={updateTransaction}
                        onDeleteTransaction={deleteTransaction}
                    />
                );
            case 'cuentas':
                return (
                    <Cuentas
                        accounts={accounts}
                        transactions={transactions}
                        installmentPlans={installmentPlans}
                        onAdd={addAccount}
                        onUpdate={updateAccount}
                        onDelete={deleteAccount}
                    />
                );
            case 'categorias':
                return (
                    <Categorias
                        categories={categories}
                        onUpdate={updateCategories}
                    />
                );
            case 'bebe':
                return (
                    <BabySection
                        transactions={transactions}
                        categories={categories}
                        onUpdateTransaction={updateTransaction}
                        onDeleteTransaction={deleteTransaction}
                    />
                );
            case 'tasa-cero':
                return (
                    <Installments
                        plans={installmentPlans}
                        accounts={accounts}
                        categories={categories}
                        onAddPlan={addInstallmentPlan}
                        onUpdatePlan={updateInstallmentPlan}
                        onDeletePlan={deleteInstallmentPlan}
                    />
                );
            case 'creditos':
                return (
                    <Loans
                        loans={loans}
                        payments={loanPayments}
                        accounts={accounts}
                        categories={categories}
                        onAddLoan={addLoan}
                        onUpdateLoan={updateLoan}
                        onDeleteLoan={deleteLoan}
                        onAddPayment={addLoanPayment}
                        onUpdatePayment={updateLoanPayment}
                        onDeletePayment={deleteLoanPayment}
                    />
                );
            default:
                return (
                    <Dashboard
                        transactions={transactions}
                        accounts={accounts}
                        categories={categories}
                        budgets={budgets}
                        loans={loans}
                        installmentPlans={installmentPlans}
                        onAddTransaction={addTransaction}
                        onUpdateTransaction={updateTransaction}
                        onDeleteTransaction={deleteTransaction}
                        onAddBudget={addBudget}
                        onUpdateBudget={updateBudget}
                        onDeleteBudget={deleteBudget}
                    />
                );
        }
    };

    if (isLoading) {
        return (
            <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
                <div className="loading-spinner"></div>
                <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Cargando tus finanzas...</p>
                <div style={{ fontSize: '0.8rem', color: '#ccc' }}>ID: {MOCK_USER_ID}</div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Sidebar activePage={currentPage} onNavigate={setCurrentPage} />



            {error && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: '#ff5252',
                    color: 'white',
                    padding: '12px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <span>⚠️ {error}</span>
                    <button onClick={() => { setError(null); fetchData(); }} style={{ background: 'white', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }}>Reintentar</button>
                </div>
            )}

            <main className="main-content">
                {renderPage()}
            </main>

            <nav className="bottom-nav mobile-only glass">
                <button
                    className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('dashboard')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    <span>Resumen</span>
                </button>
                <button
                    className={`nav-item ${currentPage === 'transacciones' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('transacciones')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="20" x2="12" y2="10"></line>
                        <line x1="18" y1="20" x2="18" y2="4"></line>
                        <line x1="6" y1="20" x2="6" y2="16"></line>
                    </svg>
                    <span>Historial</span>
                </button>
                <button
                    className={`nav-item ${currentPage === 'cuentas' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('cuentas')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                        <line x1="2" y1="10" x2="22" y2="10"></line>
                    </svg>
                    <span>Cuentas</span>
                </button>
                <button
                    className={`nav-item ${currentPage === 'categorias' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('categorias')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                        <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                    <span>Categorías</span>
                </button>
                <button
                    className={`nav-item ${currentPage === 'tasa-cero' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('tasa-cero')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span>Tasa 0</span>
                </button>
                <button
                    className={`nav-item ${currentPage === 'creditos' ? 'active' : ''}`}
                    onClick={() => setCurrentPage('creditos')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    <span>Créditos</span>
                </button>
            </nav>

            <style>{`
                .spinner {
                    font-size: 1.2rem;
                    color: var(--accent-primary);
                    font-weight: 500;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
                .bottom-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: var(--bottom-nav-height);
                    background: var(--bg-secondary);
                    border-top: 1px solid var(--accent-soft);
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    z-index: 1000;
                    padding: 0 0.5rem;
                }
                @media (min-width: 768px) {
                    .bottom-nav { display: none; }
                }
            `}</style>
        </div>
    );
};

export default App;
