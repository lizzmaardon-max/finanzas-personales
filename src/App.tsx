import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transacciones from './pages/Transacciones';
import Cuentas from './pages/Cuentas';
import Categorias from './pages/Categorias';
import { supabase } from './lib/supabase';
import './styles/dashboard.css';

const MOCK_USER_ID = '0e3405eb-3972-4238-b533-e740709748cb';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

            if (accountsData) {
                setAccounts(accountsData.map(a => ({
                    ...a,
                    balance: `${a.balance < 0 ? '-' : ''}$${Math.abs(parseFloat(a.balance)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    type: a.type === 'banco' ? 'Cuenta de Ahorro' :
                        a.type === 'credito' ? 'Tarjeta de Crédito' :
                            a.type === 'efectivo' ? 'Efectivo' : 'Billetera Digital'
                })));
            }

            // Fetch Transactions
            const { data: transactionsData } = await supabase
                .from('transactions')
                .select('*, category:categories(name, icon, color)')
                .eq('user_id', MOCK_USER_ID)
                .order('date', { ascending: false });

            if (transactionsData) {
                // Adapt to the frontend transaction format if necessary
                const adaptedTransactions = transactionsData.map(t => ({
                    ...t,
                    amount: `${t.type === 'Ingreso' ? '+' : '-'}$${parseFloat(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    category: t.category ? t.category.name : t.category_id
                }));
                setTransactions(adaptedTransactions);
            }

            // Fetch Categories
            const { data: categoriesData } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', MOCK_USER_ID);

            if (categoriesData && categoriesData.length > 0) {
                setCategories(categoriesData.map(c => ({
                    ...c,
                    subcategories: c.subcategories || []
                })));
            } else {
                // Default categories with subcategories as requested by the user
                setCategories([
                    { id: '1', name: 'Alimentación', color: '#f9a8a8', icon: '🍎', subcategories: ['Supermercado', 'Restaurantes', 'Antojos'] },
                    { id: '2', name: 'Vivienda', color: '#82aaff', icon: '🏠', subcategories: ['Alquiler', 'Mantenimiento del hogar', 'Reparaciones', 'Muebles / decoración', 'Artículos del hogar'] },
                    { id: '3', name: 'Transporte', color: '#68b6a3', icon: '🚗', subcategories: ['Gasolina', 'Transporte Público', 'Taller / Mantenimiento'] },
                    { id: '4', name: 'Servicios', color: '#c792ea', icon: '💡', subcategories: ['Energía', 'Agua', 'Internet', 'Celular'] },
                ]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addTransaction = async (t: any) => {
        // Find category ID from name
        const categoryObj = categories.find(c => t.category.includes(c.name));
        const accountObj = accounts.find(a => a.name === t.method);

        const newTransaction = {
            user_id: MOCK_USER_ID,
            account_id: accountObj?.id,
            category_id: categoryObj?.id,
            amount: parseFloat(t.amount.replace(/[^\d.-]/g, '')),
            type: t.type,
            date: t.date,
            description: t.subcategory || ''
        };

        const { data, error } = await supabase
            .from('transactions')
            .insert([newTransaction])
            .select('*, category:categories(name, icon, color)')
            .single();

        if (error) {
            console.error('Error adding transaction:', error);
            return;
        }

        if (data) {
            const adapted = {
                ...data,
                amount: `${data.type === 'Ingreso' ? '+' : '-'}$${parseFloat(data.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                category: data.category ? data.category.name : data.category_id
            };
            setTransactions([adapted, ...transactions]);
        }
    };

    const addAccount = async (a: any) => {
        // Map UI type to Database Enum
        const dbType = a.type === 'Cuenta de Ahorro' ? 'banco' :
            a.type === 'Tarjeta de Crédito' ? 'credito' :
                a.type === 'Efectivo' ? 'efectivo' : 'banco';

        const newAccount = {
            user_id: MOCK_USER_ID,
            name: a.name,
            type: dbType,
            balance: parseFloat(a.balance.replace('$', '').replace(',', '')) || 0,
            bank: a.bank || '',
            color: a.color || '#f9a8a8',
            last4: a.last4 || ''
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
                type: a.type // Keep original UI type label
            };
            setAccounts([...accounts, adapted]);
        }
    };

    const updateAccount = async (updated: any) => {
        const dbType = updated.type === 'Cuenta de Ahorro' ? 'banco' :
            updated.type === 'Tarjeta de Crédito' ? 'credito' :
                updated.type === 'Efectivo' ? 'efectivo' : 'banco';

        const { error } = await supabase
            .from('accounts')
            .update({
                name: updated.name,
                type: dbType,
                balance: parseFloat(updated.balance.replace('$', '').replace(',', '')) || 0,
                bank: updated.bank || '',
                color: updated.color || '#f9a8a8',
                last4: updated.last4 || ''
            })
            .eq('id', updated.id);

        if (error) {
            console.error('Error updating account:', error);
            alert('Error al actualizar la cuenta: ' + error.message);
            return;
        }

        setAccounts(accounts.map(a => a.id === updated.id ? updated : a));
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
        // Find which categories changed to update Supabase
        // For development speed, we'll sync the whole set if it's small, 
        // or just update the local state and provide a button to "Save Changes" if it grows.
        // For now, let's update a single category when modified in the component.
        setCategories(updated);

        // Example: Sync to Supabase if ID is UUID (persisted)
        for (const cat of updated) {
            if (cat.id.length > 20) { // Simple UUID check
                await supabase
                    .from('categories')
                    .update({
                        name: cat.name,
                        color: cat.color,
                        icon: cat.icon,
                        subcategories: cat.subcategories
                    })
                    .eq('id', cat.id);
            }
        }
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
                        onAddTransaction={addTransaction}
                    />
                );
            case 'transacciones':
                return (
                    <Transacciones
                        transactions={transactions}
                        accounts={accounts}
                    />
                );
            case 'cuentas':
                return (
                    <Cuentas
                        accounts={accounts}
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
            default:
                return (
                    <Dashboard
                        transactions={transactions}
                        accounts={accounts}
                        categories={categories}
                        onAddTransaction={addTransaction}
                    />
                );
        }
    };

    return (
        <div className="app-container">
            <Sidebar activePage={currentPage} onNavigate={setCurrentPage} />
            {renderPage()}
            <style>{`
                .spinner {
                    font-size: 1.2rem;
                    color: var(--primary);
                    font-weight: 500;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
};

export default App;
