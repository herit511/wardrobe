import { useState, useEffect } from 'react'
import { api } from '../api'
import { getColorName } from '../utils'
import './Outfits.css'

const occasionOptions = ['Casual', 'Office', 'Party', 'Date Night', 'Gym', 'Streetwear']

function Outfits() {
  const [activeTab, setActiveTab] = useState('generate')
  const [selectedOccasion, setSelectedOccasion] = useState('Casual')
  const [temperature, setTemperature] = useState('mild')
  const [outfits, setOutfits] = useState([])
  const [savedOutfits, setSavedOutfits] = useState([])
  const [loading, setLoading] = useState(false)
  const [savedLoading, setSavedLoading] = useState(false)
  const [savingAction, setSavingAction] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { 
    generateOutfits()
    fetchSavedOutfits()
  }, [])

  const generateOutfits = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get(`/outfits/generate?occasion=${selectedOccasion}&temperature=${temperature}`)
      if (res.success) setOutfits(res.data)
      else { setError(res.message); setOutfits([]) }
    } catch (err) {
      setError(err.message || 'Failed to generate outfits'); setOutfits([])
    } finally { setLoading(false) }
  }

  const fetchSavedOutfits = async () => {
    setSavedLoading(true)
    try {
      const res = await api.get('/outfits')
      if (res.success) setSavedOutfits(res.data)
    } catch (err) { console.error('Failed to fetch saved outfits:', err) }
    finally { setSavedLoading(false) }
  }

  const handleWearThis = async (outfit) => {
    setSavingAction({ id: outfit.id, type: 'wear' })
    try {
      const itemIds = outfit.items.map(i => i._id)
      const saveRes = await api.post('/outfits', { title: outfit.title, occasion: selectedOccasion, items: itemIds })
      if (!saveRes.success) throw new Error(saveRes.message || 'Failed to save')
      const wearRes = await api.post(`/outfits/${saveRes.data._id}/wear`, {})
      if (!wearRes.success) throw new Error(wearRes.message)
      alert('🎉 Outfit logged as worn today! You can find it in your Saved outfits.')
      fetchSavedOutfits()
    } catch (err) { alert(`Error: ${err.message}`) }
    finally { setSavingAction(null) }
  }

  const handleSaveOutfit = async (outfit) => {
    setSavingAction({ id: outfit.id, type: 'save' })
    try {
      const itemIds = outfit.items.map(i => i._id)
      const saveRes = await api.post('/outfits', { title: outfit.title, occasion: selectedOccasion, items: itemIds })
      if (!saveRes.success) throw new Error(saveRes.message || 'Failed to save')
      alert('💾 Outfit saved! Find it in the Saved tab.')
      fetchSavedOutfits()
    } catch (err) { alert(`Error: ${err.message}`) }
    finally { setSavingAction(null) }
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
          {/* Sidebar */}
          <aside className="outfits-sidebar animate-fade-in-up">
            <div className="sidebar-card card">
              <h3 className="sidebar-title">Style Your Day</h3>
              <p className="sidebar-desc">Refine your AI suggestions</p>

                  <div className="sidebar-section">
                    <label className="sidebar-label">Occasion</label>
                    <div className="occasion-chips">
                      {occasionOptions.map(occ => (
                        <button key={occ} className={`chip ${selectedOccasion === occ ? 'active' : ''}`} onClick={() => setSelectedOccasion(occ)} id={`occasion-${occ.toLowerCase().replace(' ', '-')}`}>
                          {occ}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="sidebar-section">
                    <label className="sidebar-label" style={{ marginTop: '20px' }}>Simulated Weather</label>
                    <div className="weather-widget" style={{ padding: '0', background: 'transparent', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', cursor: 'pointer' }}>
                      <button 
                        className={`chip ${temperature === 'hot' ? 'active' : ''}`} 
                        onClick={() => setTemperature('hot')} 
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', fontSize: '1rem', background: temperature === 'hot' ? '#FDECEA' : '#fff' }}
                      >
                        <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>☀️</span>
                        Hot
                      </button>
                      <button 
                        className={`chip ${temperature === 'mild' ? 'active' : ''}`} 
                        onClick={() => setTemperature('mild')} 
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', fontSize: '1rem', background: temperature === 'mild' ? '#EBF5FF' : '#fff' }}
                      >
                        <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>⛅</span>
                        Mild
                      </button>
                      <button 
                        className={`chip ${temperature === 'cold' ? 'active' : ''}`} 
                        onClick={() => setTemperature('cold')} 
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', fontSize: '1rem', background: temperature === 'cold' ? '#F0F4F8' : '#fff' }}
                      >
                        <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>❄️</span>
                        Cold
                      </button>
                    </div>
                  </div>
                  <button className="btn btn-primary sidebar-generate" id="generate-outfits-btn" onClick={generateOutfits} disabled={loading}>
                    <span className="sparkle">✨</span> {loading ? 'Generating...' : 'Generate AI Outfits'}
                  </button>

                  <div className="sidebar-section" style={{ marginTop: '30px' }}>
                    <h4 style={{ color: '#1B2A4A', marginBottom: '8px' }}>Saved Outfits</h4>
                    <p style={{ color: '#6B7B8D', fontSize: '0.9rem', lineHeight: '1.5' }}>
                      <strong>❤️ Favorited</strong> outfits are shown first below.
                    </p>
                    <button className="btn btn-secondary sidebar-generate" onClick={fetchSavedOutfits} disabled={savedLoading} style={{ marginTop: '12px', width: '100%' }}>
                      🔄 {savedLoading ? 'Loading...' : 'Refresh Saved'}
                    </button>
                  </div>
            </div>
          </aside>

          {/* Main */}
          <main className="outfits-main">
            <div className="outfits-header animate-fade-in-up">
              <h1 className="page-title heading-italic">
                <span className="sparkle">✨</span> AI Outfit Suggestions
              </h1>
              <p className="page-subtitle">
                Based on your wardrobe, weather, and occasion 
              </p>
            </div>

            {/* GENERATE SECTION */}
                {error && (
                  <div style={{ background: '#FDECEA', color: '#E74C3C', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px' }}>
                    ⚠️ {error}
                  </div>
                )}
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#1B2A4A' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✨</div>
                    AI is pairing up your tops, bottoms, and footwear...
                  </div>
                ) : (
                  <div className="outfit-cards">
                    {outfits.length === 0 && !error ? (
                      <div style={{ textAlign: 'center', padding: '20px', color: '#6B7B8D' }}>No outfits generated yet. Try generating some!</div>
                    ) : outfits.map((outfit, i) => (
                      <div key={outfit.id} className="outfit-card card animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.15}s` }} id={`outfit-${outfit.id}`}>
                        <div className="outfit-card-header">
                          <div>
                            <h2 className="outfit-card-title heading-italic">
                              <span className="sparkle-sm">✨</span> {outfit.title}
                            </h2>
                            <div className="outfit-tags">
                              {outfit.tags.map(tag => <span key={tag} className="badge badge-amber">{tag}</span>)}
                            </div>
                          </div>
                          <div className="match-score">
                            <div className="match-circle"><span className="match-value">{outfit.match}%</span></div>
                            <span className="match-label">Match</span>
                          </div>
                        </div>

                        <div className="outfit-card-items">
                          {outfit.items.map((item, j) => (
                            <div key={j} className="outfit-card-item">
                              <div className="outfit-card-item-img" style={{ backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#F5E6D3' }}></div>
                              <div className="outfit-card-item-type">{item.type}</div>
                              <div className="outfit-card-item-name" style={{ textTransform: 'capitalize', fontSize: '14px' }}>{item.name}</div>
                            </div>
                          ))}
                        </div>

                        <div className="outfit-card-reason"><p>"{outfit.explanation}"</p></div>

                        <div className="outfit-card-actions">
                          <button className="btn btn-primary outfit-wear-btn" id={`wear-outfit-${outfit.id}`} onClick={() => handleWearThis(outfit)} disabled={savingAction?.id === outfit.id} title="Log as worn today and save">
                            {savingAction?.id === outfit.id && savingAction?.type === 'wear' ? 'Logging...' : '👕 Wear This'}
                          </button>
                          <button className="btn btn-ghost" onClick={() => handleSaveOutfit(outfit)} disabled={savingAction?.id === outfit.id} title="Save for later without marking worn">
                            {savingAction?.id === outfit.id && savingAction?.type === 'save' ? 'Saving...' : '💾 Save for Later'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

            {/* SAVED SECTION */}
            <div className="outfits-header animate-fade-in-up" style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid #EBE4DD' }}>
              <h1 className="page-title heading-italic">
                💾 My Saved Outfits
              </h1>
              <p className="page-subtitle">
                {savedOutfits.length} saved · {savedOutfits.filter(o => o.isFavorite).length} favorited
              </p>
            </div>
                {savedLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#1B2A4A' }}>Loading your saved outfits...</div>
                ) : sortedSavedOutfits.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6B7B8D' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👗</div>
                    <h3 style={{ marginBottom: '8px', color: '#1B2A4A' }}>No saved outfits yet</h3>
                    <p>Generate some outfits and save your favorites!</p>
                    <button className="btn btn-primary" style={{ marginTop: '15px' }} onClick={() => setActiveTab('generate')}>✨ Generate Outfits</button>
                  </div>
                ) : (
                  <div className="outfit-cards">
                    {sortedSavedOutfits.map((outfit, i) => (
                      <div key={outfit._id} className="outfit-card card animate-fade-in-up" style={{ animationDelay: `${0.1 + i * 0.1}s`, border: outfit.isFavorite ? '2px solid #E87040' : undefined }}>
                        <div className="outfit-card-header">
                          <div>
                            <h2 className="outfit-card-title heading-italic">
                              {outfit.isFavorite ? '❤️' : '💾'} {outfit.title}
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
                            {outfit.isFavorite ? '❤️ Favorited' : '🤍 Favorite'}
                          </button>
                          <button 
                            className="btn btn-ghost"
                            onClick={() => deleteOutfit(outfit._id)}
                            style={{ color: '#E74C3C' }}
                            title="Delete this outfit"
                          >
                            🗑️ Remove
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
