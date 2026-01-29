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

    const colors = ['#f9a8a8', '#68b6a3', '#82aaff', '#c792ea', '#ffcb6b', '#a8d8ea', '#ff9f43', '#1dd1a1'];
    const emojis = ['📁', '🍎', '🏠', '🚗', '🏥', '🎮', '🎓', '👗', '🍽️', '🍿', '💡', '🛠️', '✈️', '🐶', '🏀', '💻', '🎁', '💰'];

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
                <h1>Categorías</h1>
                <button className="btn-add" onClick={() => setShowCatForm(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Nueva Categoría
                </button>
            </header>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                {categories.map(cat => (
                    <section key={cat.id} className="section-card glass category-card">
                        <div className="card-header" style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1.5rem' }}>{cat.icon || '📁'}</span>
                                <div className="category-name-tag" style={{ backgroundColor: cat.color }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff', fontWeight: 600 }}>{cat.name}</h3>
                                </div>
                            </div>
                            <div className="card-actions">
                                <button className="btn-icon" onClick={() => handleEditCategory(cat)} title="Editar">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                    </svg>
                                </button>
                                <button className="btn-icon delete" onClick={() => handleDeleteCategory(cat.id)} title="Eliminar">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="subcategories-list">
                            {cat.subcategories.map((sub: string) => (
                                <div key={sub} className="subcategory-item tag-pill">
                                    <span>{sub}</span>
                                    <button onClick={() => handleDeleteSubcategory(cat.id, sub)}>×</button>
                                </div>
                            ))}
                            <button
                                className="btn-add-sub"
                                onClick={() => setShowSubForm(cat.id)}
                                style={{ color: cat.color }}
                            >
                                + Agregar Subcategoría
                            </button>
                        </div>

                        {showSubForm === cat.id && (
                            <div className="inline-form">
                                <input
                                    type="text"
                                    placeholder="Nombre de subcategoría"
                                    value={newSub}
                                    onChange={e => setNewSub(e.target.value)}
                                    autoFocus
                                    onKeyPress={e => e.key === 'Enter' && handleAddSubcategory(cat.id)}
                                />
                                <div className="inline-actions">
                                    <button onClick={() => setShowSubForm(null)}>Cancelar</button>
                                    <button onClick={() => handleAddSubcategory(cat.id)} style={{ backgroundColor: cat.color, color: '#fff' }}>OK</button>
                                </div>
                            </div>
                        )}
                    </section>
                ))}
            </div>

            {showCatForm && (
                <div className="modal-overlay">
                    <div className="modal-content glass">
                        <h2 className="section-title">{editingCatId ? 'Editar Categoría' : 'Nueva Categoría Principal'}</h2>
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
                                <label>Representación (Emoji)</label>
                                <div className="emoji-picker">
                                    {emojis.map(emoji => (
                                        <div
                                            key={emoji}
                                            className={`emoji-option ${newCat.icon === emoji ? 'active' : ''}`}
                                            onClick={() => setNewCat({ ...newCat, icon: emoji })}
                                        >
                                            {emoji}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Color Representativo</label>
                                <div className="color-picker">
                                    {colors.map(c => (
                                        <div
                                            key={c}
                                            className={`color-option ${newCat.color === c ? 'active' : ''}`}
                                            style={{ backgroundColor: c }}
                                            onClick={() => setNewCat({ ...newCat, color: c })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={resetCatForm}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">{editingCatId ? 'Guardar Cambios' : 'Crear Categoría'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .category-name-tag {
                    padding: 6px 16px;
                    border-radius: 8px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .card-actions {
                    display: flex;
                    gap: 5px;
                }
                .emoji-picker {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    background: rgba(255,255,255,0.3);
                    padding: 10px;
                    border-radius: 12px;
                    max-height: 120px;
                    overflow-y: auto;
                }
                .emoji-option {
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 8px;
                    transition: all 0.2s;
                    line-height: 1;
                }
                .emoji-option:hover {
                    background: rgba(255,255,255,0.5);
                    transform: scale(1.1);
                }
                .emoji-option.active {
                    background: var(--accent-main);
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                .tag-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 12px;
                    background: rgba(255,255,255,0.5);
                    border: 1px solid rgba(0,0,0,0.05);
                    border-radius: 20px;
                    font-size: 0.85rem;
                    color: var(--text-main);
                    margin: 4px;
                }
                .tag-pill button {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    font-size: 1.1rem;
                    padding: 0;
                    line-height: 1;
                }
                .tag-pill button:hover {
                    color: var(--negative);
                }
                .subcategories-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 1rem;
                }
                .btn-add-sub {
                    background: none;
                    border: 1px dashed currentColor;
                    border-radius: 20px;
                    padding: 5px 15px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    opacity: 0.8;
                    transition: all 0.2s;
                }
                .btn-add-sub:hover {
                    opacity: 1;
                    background: rgba(255,255,255,0.3);
                }
                .inline-form {
                    background: rgba(255,255,255,0.3);
                    padding: 12px;
                    border-radius: 12px;
                    margin-top: 10px;
                }
                .inline-form input {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid rgba(0,0,0,0.1);
                    border-radius: 6px;
                    margin-bottom: 8px;
                    background: rgba(255,255,255,0.8);
                }
                .inline-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                }
                .inline-actions button {
                    padding: 4px 12px;
                    border-radius: 4px;
                    border: none;
                    font-size: 0.8rem;
                    cursor: pointer;
                }
                .btn-icon {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .btn-icon:hover {
                    background: rgba(0,0,0,0.05);
                }
                .btn-icon.delete:hover {
                    background: rgba(255,0,0,0.1);
                    color: var(--negative);
                }
            `}</style>
        </div>
    );
};

export default Categorias;
