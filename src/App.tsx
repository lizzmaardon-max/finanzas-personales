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

            if (accountsData) setAccounts(accountsData);

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

            if (categoriesData) {
                setCategories(categoriesData.map(c => ({
                    ...c,
                    subcategories: c.subcategories || []
                })));
            } else {
                // Default categories if none exist
                setCategories([
                    { id: '1', name: 'Alimentación', color: '#f9a8a8', icon: '🍎', subcategories: ['Supermercado', 'Restaurantes'] },
                    { id: '2', name: 'Vivienda', color: '#82aaff', icon: '🏠', subcategories: ['Alquiler', 'Servicios', 'Mantenimiento'] },
                    { id: '3', name: 'Transporte', color: '#68b6a3', icon: '🚗', subcategories: ['Gasolina', 'Transporte Público'] },
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
        const newAccount = {
            user_id: MOCK_USER_ID,
            name: a.name,
            type: a.type.toLowerCase(), // effective mapping to enum
            balance: parseFloat(a.balance) || 0
        };

        const { data, error } = await supabase
            .from('accounts')
            .insert([newAccount])
            .select()
            .single();

        if (error) {
            console.error('Error adding account:', error);
            return;
        }

        if (data) {
            setAccounts([...accounts, data]);
        }
    };

    const updateAccount = async (updated: any) => {
        const { error } = await supabase
            .from('accounts')
            .update({
                name: updated.name,
                type: updated.type.toLowerCase(),
                balance: parseFloat(updated.balance)
            })
            .eq('id', updated.id);

        if (error) {
            console.error('Error updating account:', error);
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
        // For simplicity, we'll just update the local state for now
        // A full implementation would sync each changed category
        setCategories(updated);
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
