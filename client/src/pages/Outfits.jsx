import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Sun, CloudSun, CloudSnow, Save, Shirt, Trash2, Share2, Plus, Heart } from 'lucide-react'
import { api } from '../api'
import { getColorName, getOptimizedUrl } from '../utils'
import './Outfits.css'

const occasionOptions = [
  { value: 'casual', label: 'Casual' },
  { value: 'office', label: 'Office' },
  { value: 'business formal', label: 'Business Formal' },
  { value: 'party', label: 'Party' },
  { value: 'date night', label: 'Date Night' },
  { value: 'gym', label: 'Gym' },
  { value: 'wedding guest', label: 'Wedding Guest' },
  { value: 'ethnic', label: 'Ethnic / Traditional' },
  { value: 'pooja / puja', label: 'Puja / Religious' },
  { value: 'festival', label: 'Festival' }
]

function Outfits() {
  const navigate = useNavigate()
  const [selectedOccasion, setSelectedOccasion] = useState('casual')
  const [temperature, setTemperature] = useState('mild')
  const [preferredSubCategories, setPreferredSubCategories] = useState([])
  const [selectedSpecificCategory, setSelectedSpecificCategory] = useState('all')
  const [closetItems, setClosetItems] = useState([])
  const [savedOutfits, setSavedOutfits] = useState([])
  const [savedLoading, setSavedLoading] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [savingWearId, setSavingWearId] = useState(null)
  const [filterOccasion, setFilterOccasion] = useState('All')
  const [toastMsg, setToastMsg] = useState({ type: '', text: '' })
  const [togglingFavId, setTogglingFavId] = useState(null)
  useEffect(() => { 
    fetchSavedOutfits()
    fetchClosetItems()
  }, [])

  const fetchClosetItems = async () => {
    try {
      const res = await api.get('/items?limit=100')
      if (res.success) setClosetItems(res.data)
    } catch (err) { console.error('Failed to fetch items:', err) }
  }

  const handleGenerateClick = () => {
    const params = new URLSearchParams({ occasion: selectedOccasion, temperature });
    if (preferredSubCategories.length > 0) params.append('preferredSubCategory', preferredSubCategories.join(','));
    
    navigate(`/suggestions?${params.toString()}`);
  }

  const togglePreference = (subCat) => {
    if (preferredSubCategories.includes(subCat)) {
      setPreferredSubCategories(prev => prev.filter(c => c !== subCat));
    } else {
      setPreferredSubCategories(prev => [...prev, subCat]);
    }
  }

  // Derive categories and subcategories from what the user actually owns
  const specificCategories = Array.from(
    new Set(closetItems.filter(i => i.category).map(i => i.category.toLowerCase()))
  ).sort();

  const uniqueSubCategories = Array.from(
    new Set(
      closetItems
        .filter(i => i.subCategory && (selectedSpecificCategory === 'all' || i.category?.toLowerCase() === selectedSpecificCategory))
        .map(i => i.subCategory)
    )
  ).sort();

  const fetchSavedOutfits = async () => {
    setSavedLoading(true)
    try {
      const res = await api.get('/outfits')
      if (res.success) setSavedOutfits(res.data)
    } catch (err) { console.error('Failed to fetch saved outfits:', err) }
    finally { setSavedLoading(false) }
  }

  const toggleFavoriteOutfit = async (outfitId) => {
    if (togglingFavId) return
    setTogglingFavId(outfitId)
    try {
      const res = await api.put(`/outfits/${outfitId}/favorite`, {})
      if (res.success && res.data) {
        setSavedOutfits(prev => prev.map(o => o._id === outfitId ? { ...o, isFavorite: res.data.isFavorite } : o))
      }
    } catch (err) { console.error(err) }
    finally { setTogglingFavId(null) }
  }
  const deleteOutfit = async (outfitId) => {
    try {
      const res = await api.del(`/outfits/${outfitId}`)
      if (res.success) setSavedOutfits(prev => prev.filter(o => o._id !== outfitId))
    } catch (err) { console.error('Failed to delete outfit:', err) }
    setDeleteConfirmId(null)
  }

  const handleShare = async (outfit) => {
    const text = `Check out this ${outfit.occasion} outfit I curated on Style DNA: ${outfit.title}!`;
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Style DNA', text, url });
      } catch (err) { console.log('Share canceled', err) }
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      setToastMsg({ type: 'success', text: 'Outfit link copied to clipboard!' });
      setTimeout(() => setToastMsg({ type: '', text: '' }), 3000);
    }
  }

  const handleWearSaved = async (outfit) => {
    setSavingWearId(outfit._id)
    setToastMsg({ type: '', text: '' })
    try {
      const wearRes = await api.post(`/outfits/${outfit._id}/wear`, {})
      if (!wearRes.success) throw new Error(wearRes.message)
      setSavedOutfits(prev => prev.map(o => o._id === outfit._id ? { ...o, wornHistory: [...o.wornHistory, { date: new Date() }] } : o))
      setToastMsg({ type: 'success', text: 'Outfit logged as worn today!' })
      setTimeout(() => setToastMsg({ type: '', text: '' }), 3000)
    } catch (err) {
      setToastMsg({ type: 'error', text: err.message || 'Failed to log outfit' })
    } finally {
      setSavingWearId(null)
    }
  }

  // Filter and Sort: newest first
  const filteredSavedOutfits = savedOutfits.filter(o => {
    const matchOccasion = filterOccasion === 'All' || o.occasion.toLowerCase() === filterOccasion.toLowerCase();
    const matchFavorite = filterOccasion === 'Favorites' ? o.isFavorite : true;
    return matchOccasion && matchFavorite;
  })
  const sortedSavedOutfits = [...filteredSavedOutfits].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return (
    <div className="outfits-page" id="outfits-page">
      <div className="container">
        <div className="outfits-layout">
          <main className="outfits-main" style={{ width: '100%' }}>
            {/* GENERATE SECTION */}
            <div className="card generate-card animate-fade-in-up">
              <div className="outfits-header" style={{ marginBottom: '20px' }}>
                <h1 className="page-title heading-italic">
                  <Sparkles size={24} strokeWidth={1.5} className="sparkle" /> Get Suggestions
                </h1>
                <p className="page-subtitle">
                  Tell AI your plans and we'll curate the perfect looks from your wardrobe.
                </p>
              </div>

              <div className="sidebar-section">
                <label className="uppercase-label">Occasion</label>
                <div className="occasion-chips">
                  {occasionOptions.map(occ => (
                    <button key={occ.value} className={`chip ${selectedOccasion === occ.value ? 'active' : ''}`} onClick={() => setSelectedOccasion(occ.value)} id={`occasion-${occ.value.replace(/[\s/]+/g, '-')}`}>
                      {occ.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="sidebar-section">
                <label className="uppercase-label">Simulated Weather</label>
                <div className="weather-widget">
                  <button 
                    className={`chip weather-chip ${temperature === 'hot' ? 'active' : ''}`} 
                    onClick={() => setTemperature('hot')} 
                  >
                    <Sun size={24} strokeWidth={1.5} />
                    Hot
                  </button>
                  <button 
                    className={`chip weather-chip ${temperature === 'mild' ? 'active' : ''}`} 
                    onClick={() => setTemperature('mild')} 
                  >
                    <CloudSun size={24} strokeWidth={1.5} />
                    Mild
                  </button>
                  <button 
                    className={`chip weather-chip ${temperature === 'cold' ? 'active' : ''}`} 
                    onClick={() => setTemperature('cold')} 
                  >
                    <CloudSnow size={24} strokeWidth={1.5} />
                    Cold
                  </button>
                </div>
              </div>

              {/* PREFERRED ITEM LOGIC */}
              <div className="style-profile-section" style={{ marginTop: '20px', padding: '15px', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #EBE4DD' }}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: '#1B2A4A', fontWeight: 500 }}>
                    Specific Pieces (Optional)
                  </label>
                  {specificCategories.length > 0 && (
                    <div className="occasion-chips" style={{ marginBottom: '10px' }}>
                      <button
                        className={`chip ${selectedSpecificCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedSpecificCategory('all')}
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      >
                        All Categories
                      </button>
                      {specificCategories.map((category) => (
                        <button
                          key={category}
                          className={`chip ${selectedSpecificCategory === category ? 'active' : ''}`}
                          onClick={() => setSelectedSpecificCategory(category)}
                          style={{ padding: '6px 14px', fontSize: '0.82rem', textTransform: 'capitalize' }}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="occasion-chips" style={{ marginBottom: '10px' }}>
                    {uniqueSubCategories.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#6B7B8D', margin: 0 }}>Add items to your closet first to select preferences.</p>
                    ) : (
                      uniqueSubCategories.map(sub => (
                        <button 
                          key={sub} 
                          className={`chip ${preferredSubCategories.includes(sub) ? 'active' : ''}`}
                          onClick={() => togglePreference(sub)}
                          style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                        >
                          {preferredSubCategories.includes(sub) ? '✓ ' : '+ '}
                          {sub.charAt(0).toUpperCase() + sub.slice(1).replace('_', ' ')}
                        </button>
                      ))
                    )}
                  </div>
                  {preferredSubCategories.length > 0 && (
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                      onClick={() => setPreferredSubCategories([])}
                    >
                      Clear selected pieces
                    </button>
                  )}
                  <p style={{ fontSize: '0.8rem', color: '#6B7B8D', marginTop: '8px', marginBottom: 0 }}>Select specific styles you want to wear (e.g. Jeans, Chain), and AI will build an outfit containing all of them.</p>
                </div>
              </div>
              
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '25px', padding: '15px', fontSize: '1.1rem' }} 
                onClick={handleGenerateClick}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Sparkles size={16} strokeWidth={1.5} className="sparkle" /> Generate My Outfits
                </div>
              </button>

              <div style={{ textAlign: 'center', marginTop: '15px' }}>
                <span style={{ fontSize: '0.9rem', color: '#6B7B8D' }}>or</span>
              </div>
              
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: '15px', padding: '15px', fontSize: '1.1rem' }} 
                onClick={() => navigate('/build-outfit')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Plus size={16} strokeWidth={1.5} /> Build Custom Outfit Manually
                </div>
              </button>
            </div>

            {/* SAVED SECTION */}
            {toastMsg.text && (
              <div style={{ padding: '12px 18px', borderRadius: '10px', marginBottom: '15px', fontSize: '0.9rem', background: toastMsg.type === 'error' ? '#FDECEA' : '#EAFaf1', color: toastMsg.type === 'error' ? '#E74C3C' : '#27AE60', textAlign: 'center', transition: 'all 0.3s ease' }}>
                {toastMsg.text}
              </div>
            )}
            <div className="outfits-header secondary animate-fade-in-up">
              <div className="header-flex">
                <div>
                  <h1 className="page-title heading-italic">
                    <Save size={20} strokeWidth={1.5} /> My Closet
                  </h1>
                  <p className="page-subtitle">
                    {savedOutfits.length} curated styles
                  </p>
                </div>
                <select className="filter-select" value={filterOccasion} onChange={e => setFilterOccasion(e.target.value)}>
                  <option value="All">All Occasions</option>
                  <option value="Favorites">My Favorites</option>
                  <option value="casual">Casual</option>
                  <option value="office">Office</option>
                  <option value="party">Party</option>
                  <option value="gym">Gym</option>
                  <option value="date night">Date Night</option>
                </select>
              </div>
            </div>
                {savedLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#1B2A4A' }}>Loading your saved outfits...</div>
                ) : sortedSavedOutfits.length === 0 ? (
                  <div className="empty-state animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #EBE4DD' }}>
                    <div style={{ marginBottom: '16px', color: '#1B2A4A', opacity: 0.3 }}><Shirt size={48} strokeWidth={1} /></div>
                    <h3 style={{ marginBottom: '8px', color: '#1B2A4A', fontSize: '1.4rem' }}>No saved outfits yet</h3>
                    <p style={{ color: '#6B7B8D', marginBottom: '24px', maxWidth: '300px' }}>Use the generator above to create fresh looks and save them here.</p>
                  </div>
                ) : (
                  <div className="outfit-cards">
                    {sortedSavedOutfits.map((outfit, i) => (
                      <div key={outfit._id} className="outfit-card card animate-fade-in-up" style={{ position: 'relative', overflow: 'hidden', animationDelay: `${0.1 + i * 0.1}s`, border: outfit.isFavorite ? '2px solid #E74C3C' : '1px solid #EBE4DD' }}>
                        
                        {deleteConfirmId === outfit._id && (
                          <div className="animate-fade-in" style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, padding: '20px', textAlign: 'center' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#1B2A4A', fontSize: '1.1rem' }}>Delete this outfit?</h4>
                            <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: '#6B7B8D' }}>This action cannot be undone.</p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button className="btn btn-ghost" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                              <button className="btn btn-primary" style={{ background: '#E74C3C', borderColor: '#E74C3C' }} onClick={() => deleteOutfit(outfit._id)}>Yes, Delete</button>
                            </div>
                          </div>
                        )}
                        {outfit.relaxedMatch && (
                          <div style={{ padding: '4px 10px', background: '#FFF7ED', color: '#C2410C', fontSize: '0.7rem', fontWeight: 700, borderRadius: '4px', display: 'inline-block', marginBottom: '10px' }}>
                            ✓ BEST POSSIBLE MATCH FROM CLOSET
                          </div>
                        )}

                        <div className="outfit-card-header">
                          <div>
                            <h2 className="outfit-card-title heading-italic">
                              <Save size={20} strokeWidth={1.5} /> {outfit.title}
                            </h2>
                            <div className="outfit-tags">
                              <span className="badge badge-amber">{outfit.occasion}</span>
                              {outfit.wornHistory && outfit.wornHistory.length > 0 && (
                                <span className="badge badge-amber">Worn {outfit.wornHistory.length}x</span>
                              )}
                              {outfit.generationContext?.confidence && (
                                <span className="badge badge-amber" style={{ opacity: 0.8 }}>{outfit.generationContext.confidence}% Match</span>
                              )}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#6B7B8D' }}>
                            {new Date(outfit.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {outfit.feelLine && (
                          <div style={{ margin: '8px 0', padding: '6px 12px', background: '#FFF7ED', borderLeft: '3px solid #F97316', borderRadius: '4px', fontSize: '0.8rem', color: '#9A3412', fontWeight: 600 }}>
                            {outfit.feelLine}
                          </div>
                        )}

                        <div className="outfit-card-items">
                          {outfit.items.map((item, j) => (
                            <div key={j} className="outfit-card-item">
                              <div className="outfit-card-item-img" style={{ backgroundImage: item.imageUrl ? `url(${getOptimizedUrl(item.imageUrl, 400)})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#F5E6D3' }}></div>
                              <div className="outfit-card-item-type" style={{ textTransform: 'capitalize' }}>{item.category || 'Item'}</div>
                              <div className="outfit-card-item-name" style={{ textTransform: 'capitalize', fontSize: '14px' }}>
                                {item.subCategory ? `${getColorName(item.color)} ${item.subCategory.replace('_', ' ')}` : 'Item'}
                              </div>
                            </div>
                          ))}
                        </div>

                        {outfit.signatureMove && (
                          <div style={{ marginBottom: '15px', padding: '12px', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #EBE4DD' }}>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '0.75rem', textTransform: 'uppercase', color: '#94A3B8' }}>Signature Move</h4>
                            <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic', color: '#1B2A4A' }}>"{outfit.signatureMove}"</p>
                          </div>
                        )}

                        {outfit.wornHistory && outfit.wornHistory.length > 0 && (
                          <div className="outfit-card-reason">
                            <p>Last worn: {new Date(outfit.wornHistory[outfit.wornHistory.length - 1].date).toLocaleDateString()}</p>
                          </div>
                        )}

                        <div className="outfit-card-actions">
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleWearSaved(outfit)}
                            disabled={savingWearId === outfit._id}
                            title="Log as worn today"
                            style={{ flex: 1 }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                              {savingWearId === outfit._id ? 'Logging...' : <><Shirt size={16} strokeWidth={1.5} /> Wear</>}
                            </div>
                          </button>

                          <button 
                            className={`btn ${outfit.isFavorite ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => toggleFavoriteOutfit(outfit._id)}
                            disabled={togglingFavId === outfit._id}
                            title={outfit.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                            style={{ flex: 1 }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                              <Heart 
                                size={16} 
                                fill={outfit.isFavorite ? "white" : "none"} 
                                stroke={outfit.isFavorite ? "white" : "#1B2A4A"} 
                                strokeWidth={outfit.isFavorite ? 0 : 2} 
                              /> 
                              {outfit.isFavorite ? 'Favorited' : 'Favorite'}
                            </div>
                          </button>
                          
                          <button className="btn btn-ghost" onClick={() => handleShare(outfit)} style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                              <Share2 size={16} strokeWidth={1.5} /> Share
                            </div>
                          </button>

                          <button 
                            className="btn btn-ghost"
                            onClick={() => setDeleteConfirmId(outfit._id)}
                            style={{ color: '#E74C3C', flex: 1 }}
                            title="Delete this outfit"
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                              <Trash2 size={16} strokeWidth={1.5} /> Remove
                            </div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Outfits
