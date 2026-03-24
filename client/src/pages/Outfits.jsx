import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Sun, CloudSun, CloudSnow, Save, RefreshCw, Shirt, Heart, Trash2 } from 'lucide-react'
import { api } from '../api'
import { getColorName } from '../utils'
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
  const [preferredSubCategory, setPreferredSubCategory] = useState('')
  const [closetItems, setClosetItems] = useState([])
  const [savedOutfits, setSavedOutfits] = useState([])
  const [savedLoading, setSavedLoading] = useState(false)

  useEffect(() => { 
    fetchSavedOutfits()
    fetchClosetItems()
  }, [])

  const fetchClosetItems = async () => {
    try {
      const res = await api.get('/items')
      if (res.success) setClosetItems(res.data)
    } catch (err) { console.error('Failed to fetch items:', err) }
  }

  const handleGenerateClick = () => {
    const params = new URLSearchParams({ occasion: selectedOccasion, temperature });
    if (preferredSubCategory) params.append('preferredSubCategory', preferredSubCategory);
    
    navigate(`/suggestions?${params.toString()}`);
  }

  // Derive unique subcategories from what the user actually owns
  const uniqueSubCategories = Array.from(new Set(closetItems.filter(i => i.subCategory).map(i => i.subCategory))).sort();

  const fetchSavedOutfits = async () => {
    setSavedLoading(true)
    try {
      const res = await api.get('/outfits')
      if (res.success) setSavedOutfits(res.data)
    } catch (err) { console.error('Failed to fetch saved outfits:', err) }
    finally { setSavedLoading(false) }
  }



  const toggleFavoriteOutfit = async (outfitId) => {
    try {
      const res = await api.put(`/outfits/${outfitId}/favorite`, {})
      if (res.success) {
        setSavedOutfits(prev => prev.map(o => o._id === outfitId ? { ...o, isFavorite: !o.isFavorite } : o))
      }
    } catch (err) { console.error('Failed to toggle favorite:', err) }
  }

  const deleteOutfit = async (outfitId) => {
    if (!window.confirm('Remove this saved outfit?')) return
    try {
      const res = await api.del(`/outfits/${outfitId}`)
      if (res.success) setSavedOutfits(prev => prev.filter(o => o._id !== outfitId))
    } catch (err) { console.error('Failed to delete outfit:', err) }
  }

  // Sort: favorites first, then newest
  const sortedSavedOutfits = [...savedOutfits].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return (
    <div className="outfits-page" id="outfits-page">
      <div className="container">
        <div className="outfits-layout">
          <main className="outfits-main" style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            {/* GENERATE SECTION */}
            <div className="card" style={{ padding: '30px', marginBottom: '40px', background: 'linear-gradient(145deg, #ffffff, #fdfbf7)', border: '1px solid #EBE4DD' }}>
              <div className="outfits-header animate-fade-in-up" style={{ marginBottom: '20px' }}>
                <h1 className="page-title heading-italic" style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={24} strokeWidth={1.5} className="sparkle" /> Get Outfit Suggestions
                </h1>
                <p className="page-subtitle">
                  Tell AI your plans and we'll curate the perfect looks from your wardrobe.
                </p>
              </div>

              <div className="sidebar-section">
                <label className="sidebar-label">Occasion</label>
                <div className="occasion-chips">
                  {occasionOptions.map(occ => (
                    <button key={occ.value} className={`chip ${selectedOccasion === occ.value ? 'active' : ''}`} onClick={() => setSelectedOccasion(occ.value)} id={`occasion-${occ.value.replace(/[\s/]+/g, '-')}`}>
                      {occ.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="sidebar-section">
                <label className="sidebar-label" style={{ marginTop: '20px' }}>Simulated Weather</label>
                <div className="weather-widget" style={{ padding: '0', background: 'transparent', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', cursor: 'pointer' }}>
                  <button 
                    className={`chip ${temperature === 'hot' ? 'active' : ''}`} 
                    onClick={() => setTemperature('hot')} 
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 10px', fontSize: '1rem', background: temperature === 'hot' ? '#FDECEA' : '#fff' }}
                  >
                    <Sun size={24} strokeWidth={1.5} style={{ marginBottom: '8px' }} />
                    Hot
                  </button>
                  <button 
                    className={`chip ${temperature === 'mild' ? 'active' : ''}`} 
                    onClick={() => setTemperature('mild')} 
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 10px', fontSize: '1rem', background: temperature === 'mild' ? '#EBF5FF' : '#fff' }}
                  >
                    <CloudSun size={24} strokeWidth={1.5} style={{ marginBottom: '8px' }} />
                    Mild
                  </button>
                  <button 
                    className={`chip ${temperature === 'cold' ? 'active' : ''}`} 
                    onClick={() => setTemperature('cold')} 
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 10px', fontSize: '1rem', background: temperature === 'cold' ? '#F0F4F8' : '#fff' }}
                  >
                    <CloudSnow size={24} strokeWidth={1.5} style={{ marginBottom: '8px' }} />
                    Cold
                  </button>
                </div>
              </div>

              {/* PREFERRED ITEM LOGIC */}
              <div className="style-profile-section" style={{ marginTop: '20px', padding: '15px', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #EBE4DD' }}>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: '#1B2A4A', fontWeight: 500 }}>
                    Your Preference (Optional)
                  </label>
                  <select 
                    value={preferredSubCategory} 
                    onChange={e => setPreferredSubCategory(e.target.value)} 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #EBE4DD', background: '#fff' }}
                  >
                    <option value="">No preference, generate anything!</option>
                    {uniqueSubCategories.map(sub => (
                      <option key={sub} value={sub}>
                        {sub.charAt(0).toUpperCase() + sub.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: '0.8rem', color: '#6B7B8D', marginTop: '8px', marginBottom: 0 }}>Select a style you definitely want to wear (e.g. Jeans), and AI will build an outfit around it.</p>
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
            </div>

            {/* SAVED SECTION */}
            <div className="outfits-header animate-fade-in-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 className="page-title heading-italic" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={20} strokeWidth={1.5} /> My Saved Outfits
                  </h1>
                  <p className="page-subtitle">
                    {savedOutfits.length} saved · {savedOutfits.filter(o => o.isFavorite).length} favorited
                  </p>
                </div>
                <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={fetchSavedOutfits} disabled={savedLoading}>
                  <RefreshCw size={16} strokeWidth={1.5} /> Refresh
                </button>
              </div>
            </div>
                {savedLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#1B2A4A' }}>Loading your saved outfits...</div>
                ) : sortedSavedOutfits.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6B7B8D' }}>
                    <div style={{ marginBottom: '15px', color: '#1B2A4A' }}><Shirt size={48} strokeWidth={1.5} /></div>
                    <h3 style={{ marginBottom: '8px', color: '#1B2A4A' }}>No saved outfits yet</h3>
                    <p>Use the box above to generate some outfits and save your favorites!</p>
                  </div>
                ) : (
                  <div className="outfit-cards">
                    {sortedSavedOutfits.map((outfit, i) => (
                      <div key={outfit._id} className="outfit-card card animate-fade-in-up" style={{ animationDelay: `${0.1 + i * 0.1}s`, border: outfit.isFavorite ? '2px solid #E87040' : undefined }}>
                        <div className="outfit-card-header">
                          <div>
                            <h2 className="outfit-card-title heading-italic">
                              {outfit.isFavorite ? <Heart size={20} fill="currentColor" strokeWidth={0} /> : <Save size={20} strokeWidth={1.5} />} {outfit.title}
                            </h2>
                            <div className="outfit-tags">
                              <span className="badge badge-amber">{outfit.occasion}</span>
                              {outfit.isFavorite && <span className="badge badge-orange">Favorite</span>}
                              {outfit.wornHistory && outfit.wornHistory.length > 0 && (
                                <span className="badge badge-amber">Worn {outfit.wornHistory.length}x</span>
                              )}
                            </div>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#6B7B8D' }}>
                            {new Date(outfit.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="outfit-card-items">
                          {outfit.items.map((item, j) => (
                            <div key={j} className="outfit-card-item">
                              <div className="outfit-card-item-img" style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#F5E6D3' }}></div>
                              <div className="outfit-card-item-type" style={{ textTransform: 'capitalize' }}>{item.category || 'Item'}</div>
                              <div className="outfit-card-item-name" style={{ textTransform: 'capitalize', fontSize: '14px' }}>
                                {item.subCategory ? `${getColorName(item.color)} ${item.subCategory.replace('_', ' ')}` : 'Item'}
                              </div>
                            </div>
                          ))}
                        </div>

                        {outfit.wornHistory && outfit.wornHistory.length > 0 && (
                          <div className="outfit-card-reason">
                            <p>Last worn: {new Date(outfit.wornHistory[outfit.wornHistory.length - 1].date).toLocaleDateString()}</p>
                          </div>
                        )}

                        <div className="outfit-card-actions">
                          <button 
                            className={`btn ${outfit.isFavorite ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => toggleFavoriteOutfit(outfit._id)}
                            title={outfit.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {outfit.isFavorite ? <><Heart size={16} fill="currentColor" strokeWidth={0} /> Favorited</> : <><Heart size={16} strokeWidth={1.5} /> Favorite</>}
                            </div>
                          </button>
                          <button 
                            className="btn btn-ghost"
                            onClick={() => deleteOutfit(outfit._id)}
                            style={{ color: '#E74C3C' }}
                            title="Delete this outfit"
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
