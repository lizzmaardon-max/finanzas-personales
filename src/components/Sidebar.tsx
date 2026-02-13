import React from 'react';

interface SidebarProps {
    activePage: string;
    onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
    const navItems = [
        {
            id: 'dashboard',
            label: 'Resumen',
            icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        },
        {
            id: 'transacciones',
            label: 'Historial',
            icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        },
        {
            id: 'cuentas',
            label: 'Cuentas',
            icon: <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        },
        {
            id: 'categorias',
            label: 'Etiquetas',
            icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        },
        {
            id: 'bebe',
            label: 'Bebé',
            icon: <circle cx="12" cy="12" r="10" />
        },
        {
            id: 'tasa-cero',
            label: 'Tasa Cero',
            icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        }
    ];

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <div
                        key={item.id}
                        className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => onNavigate(item.id)}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {item.icon}
                        </svg>
                        <span>{item.label}</span>
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
