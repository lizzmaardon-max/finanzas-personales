import React, { useState } from 'react';
import '../styles/dashboard.css';

interface CategoriasProps {
    categories: any[];
    onUpdate: (updated: any[]) => void;
}

const Categorias: React.FC<CategoriasProps> = ({ categories, onUpdate }) => {
    const [showCatForm, setShowCatForm] = useState(false);
    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [showSubForm, setShowSubForm] = useState<string | null>(null);
    const [newCat, setNewCat] = useState({ name: '', color: '#f9a8a8', icon: '📁' });
    const [newSub, setNewSub] = useState('');
    const [expandedCatId, setExpandedCatId] = useState<string | null>(null);

    const colors = ['#f9a8a8', '#68b6a3', '#82aaff', '#c792ea', '#ffcb6b', '#a8d8ea', '#ff9f43', '#1dd1a1', '#212529'];
    const emojis = ['📁', '👶', '🍎', '🏠', '🚗', '🏥', '🎮', '🎓', '👗', '🍽️', '🍿', '💡', '🛠️', '✈️', '🐶', '🏀', '💻', '🎁', '💰'];

    const resetCatForm = () => {
        setNewCat({ name: '', color: '#f9a8a8', icon: '📁' });
        setEditingCatId(null);
        setShowCatForm(false);
    };

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCatId) {
            const updated = categories.map(cat =>
                cat.id === editingCatId ? { ...cat, name: newCat.name, color: newCat.color, icon: newCat.icon } : cat
            );
            onUpdate(updated);
        } else {
            const category = {
                id: Date.now().toString(),
                name: newCat.name,
                color: newCat.color,
                icon: newCat.icon,
                subcategories: []
            };
            onUpdate([...categories, category]);
        }
        resetCatForm();
    };

    const handleEditCategory = (cat: any) => {
        setNewCat({ name: cat.name, color: cat.color, icon: cat.icon || '📁' });
        setEditingCatId(cat.id);
        setShowCatForm(true);
    };

    const handleAddSubcategory = (catId: string) => {
        if (!newSub.trim()) return;
        const updated = categories.map(cat => {
            if (cat.id === catId) {
                return { ...cat, subcategories: [...cat.subcategories, newSub.trim()] };
            }
            return cat;
        });
        onUpdate(updated);
        setNewSub('');
        setShowSubForm(null);
    };

    const handleDeleteSubcategory = (catId: string, subName: string) => {
        const updated = categories.map(cat => {
            if (cat.id === catId) {
                return { ...cat, subcategories: cat.subcategories.filter((s: string) => s !== subName) };
            }
            return cat;
        });
        onUpdate(updated);
    };

    const handleDeleteCategory = (catId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría y todas sus subcategorías?')) {
            onUpdate(categories.filter(cat => cat.id !== catId));
        }
    };

    return (
        <div className="main-content">
            <header className="header">
                <div className="header-info">
                    <h1>Categorías</h1>
                    <p className="header-subtitle">Organiza tus gastos con categorías personalizadas</p>
                </div>
                <button className="btn-add" onClick={() => setShowCatForm(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nueva Categoría
                </button>
            </header>

            <div className="masonry-grid">
                {categories.map(cat => (
                    <section
                        key={cat.id}
                        className="section-card category-card"
                        style={{
                            background: `linear-gradient(135deg, #ffffff 0%, ${cat.color}15 100%)`,
                            borderLeft: `5px solid ${cat.color}`,
                            padding: '0.75rem',
                            borderRadius: '1.25rem',
                        }}
                    >
                        <div
                            className="card-header"
                            onClick={() => setExpandedCatId(expandedCatId === cat.id ? null : cat.id)}
                            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{cat.icon || '📁'}</span>
                                <div className="category-tag-piquis" style={{
                                    backgroundColor: cat.color,
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '0.72rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    boxShadow: `0 2px 8px ${cat.color}33`,
                                    maxWidth: '100px'
                                }}>
                                    {cat.name}
                                </div>
                            </div>
                            <div className="card-actions" onClick={e => e.stopPropagation()}>
                                <button className="btn-icon" onClick={() => handleEditCategory(cat)} style={{ padding: '4px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button className="btn-icon delete" onClick={() => handleDeleteCategory(cat.id)} style={{ padding: '4px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className={`collapsible-content ${expandedCatId !== cat.id ? 'is-collapsed' : ''}`} style={{
                            maxHeight: expandedCatId === cat.id ? '400px' : '0',
                            marginTop: expandedCatId === cat.id ? '12px' : '0'
                        }}>
                            <div className="subcategories-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {cat.subcategories.map((sub: string) => (
                                    <div key={sub} className="subcategory-item-piquis" style={{ padding: '6px 10px', fontSize: '0.75rem' }}>
                                        <span>{sub}</span>
                                        <button
                                            className="btn-delete-sub"
                                            onClick={() => handleDeleteSubcategory(cat.id, sub)}
                                        >×</button>
                                    </div>
                                ))}
                                <button
                                    className="btn-add-sub-piquis"
                                    onClick={() => setShowSubForm(cat.id)}
                                    style={{
                                        background: 'none',
                                        border: '1px dashed var(--accent-medium)',
                                        borderRadius: '10px',
                                        padding: '6px 10px',
                                        fontSize: '0.75rem',
                                        cursor: 'pointer',
                                        color: 'var(--text-muted)',
                                        fontWeight: 600,
                                        width: '100%',
                                        textAlign: 'left'
                                    }}
                                >
                                    + Subcategoría
                                </button>
                            </div>
                        </div>

                        {showSubForm === cat.id && (
                            <div className="inline-add-input" style={{ marginTop: '1rem', display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    className="small-input-piquis"
                                    placeholder="Nueva subcategoría..."
                                    value={newSub}
                                    style={{ flex: 1, height: '40px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--accent-soft)', outline: 'none' }}
                                    onChange={e => setNewSub(e.target.value)}
                                    autoFocus
                                    onKeyPress={e => e.key === 'Enter' && handleAddSubcategory(cat.id)}
                                />
                                <button
                                    onClick={() => handleAddSubcategory(cat.id)}
                                    style={{
                                        height: '40px',
                                        padding: '0 15px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        backgroundColor: cat.color,
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >OK</button>
                                <button
                                    onClick={() => setShowSubForm(null)}
                                    style={{ height: '40px', padding: '0 10px', borderRadius: '10px', border: 'none', background: 'none', color: 'var(--text-light)', cursor: 'pointer' }}
                                >✕</button>
                            </div>
                        )}
                    </section>
                ))}
            </div>

            {showCatForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <header className="modal-header">
                            <h2>{editingCatId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                            <button className="btn-close" onClick={resetCatForm}>&times;</button>
                        </header>
                        <form onSubmit={handleAddCategory}>
                            <div className="form-group">
                                <label>Nombre de la Categoría</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Entretenimiento, Educación"
                                    value={newCat.name}
                                    onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Elige un ícono</label>
                                <div className="emoji-picker-piquis" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(6, 1fr)',
                                    gap: '8px',
                                    padding: '12px',
                                    backgroundColor: 'var(--bg-primary)',
                                    borderRadius: '16px'
                                }}>
                                    {emojis.map(emoji => (
                                        <div
                                            key={emoji}
                                            className={`emoji-option ${newCat.icon === emoji ? 'active' : ''}`}
                                            onClick={() => setNewCat({ ...newCat, icon: emoji })}
                                            style={{
                                                fontSize: '1.5rem',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                padding: '8px',
                                                borderRadius: '10px',
                                                backgroundColor: newCat.icon === emoji ? 'white' : 'transparent',
                                                boxShadow: newCat.icon === emoji ? '0 4px 8px rgba(0,0,0,0.05)' : 'none'
                                            }}
                                        >
                                            {emoji}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Color distintivo</label>
                                <div className="color-picker-piquis" style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '10px',
                                    padding: '12px',
                                    backgroundColor: 'var(--bg-primary)',
                                    borderRadius: '16px'
                                }}>
                                    {colors.map(c => (
                                        <div
                                            key={c}
                                            className={`color-option ${newCat.color === c ? 'active' : ''}`}
                                            style={{
                                                backgroundColor: c,
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                cursor: 'pointer',
                                                border: newCat.color === c ? '3px solid white' : 'none',
                                                boxShadow: newCat.color === c ? `0 0 0 2px ${c}` : 'none'
                                            }}
                                            onClick={() => setNewCat({ ...newCat, color: c })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={resetCatForm}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categorias;
