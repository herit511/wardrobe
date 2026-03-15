import { useState, useEffect } from 'react'
import { api } from '../api'
import { getColorName } from '../utils'
import './Outfits.css'

const occasionOptions = ['Casual', 'Office', 'Party', 'Date Night', 'Gym', 'Streetwear']

const trendingStyles = [
  { name: 'Modern Classic', emoji: '🎩' },
  { name: 'Earth Tones', emoji: '🌿' },
  { name: 'Urban Active', emoji: '🏙️' },
  { name: 'Resort Wear', emoji: '🏖️' },
]

function Outfits() {
  const [selectedOccasion, setSelectedOccasion] = useState('Casual')
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(false)
  const [savingAction, setSavingAction] = useState(null) // tracks ID and action
  const [error, setError] = useState('')

  useEffect(() => {
    generateOutfits()
  }, []) // Generate on initial load

  const toggleOccasion = (occasion) => {
    setSelectedOccasion(occasion)
  }

  const generateOutfits = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/outfits/generate?occasion=${selectedOccasion}`)
      if (res.success) {
        setOutfits(res.data)
      } else {
        setError(res.message)
        setOutfits([])
      }
    } catch (err) {
      setError(err.message || 'Failed to generate outfits')
      setOutfits([])
    } finally {
      setLoading(false)
    }
  }

  const handleOutfitAction = async (outfit, action) => {
    setSavingAction({ id: outfit.id, type: action })
    try {
      // 1. Save the outfit first
      const itemIds = outfit.items.map(i => i._id);
      const saveRes = await api.post('/outfits', {
        title: outfit.title,
        occasion: selectedOccasion,
        items: itemIds
      });

      if (!saveRes.success) throw new Error(saveRes.message || 'Failed to save');

      const realOutfitId = saveRes.data._id;

      // 2. If it's a "wear" action, mark it worn
      if (action === 'wear') {
        const wearRes = await api.post(`/outfits/${realOutfitId}/wear`, {});
        if (!wearRes.success) throw new Error(wearRes.message);
        alert('🎉 Awesome choice! Outfit marked as worn today and saved to your favorites.');
      } else {
        alert('❤️ Outfit saved to your favorites.');
      }
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      setSavingAction(null)
    }
  }

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
                    <button
                      key={occ}
                      className={`chip ${selectedOccasion === occ ? 'active' : ''}`}
                      onClick={() => setSelectedOccasion(occ)}
                      id={`occasion-${occ.toLowerCase().replace(' ', '-')}`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sidebar-section">
                <div className="weather-widget">
                  <span className="weather-big-icon">☀️</span>
                  <div>
                    <div className="weather-temp">22°C</div>
                    <div className="weather-desc">Sunny, Perfect for Linen</div>
                  </div>
                </div>
              </div>

              <button 
                className="btn btn-primary sidebar-generate" 
                id="generate-outfits-btn"
                onClick={generateOutfits}
                disabled={loading}
              >
                <span className="sparkle">✨</span> {loading ? 'Generating...' : 'Generate Outfits'}
              </button>

              <div className="sidebar-section">
                <label className="sidebar-label">Trending Styles</label>
                <div className="trending-mini">
                  {trendingStyles.slice(0, 2).map(t => (
                    <div key={t.name} className="trending-mini-card">
                      <span>{t.emoji}</span>
                      <span>{t.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="outfits-main">
            <div className="outfits-header animate-fade-in-up">
              <h1 className="page-title heading-italic">
                <span className="sparkle">✨</span> AI Recommendations
              </h1>
              <p className="page-subtitle">Based on your wardrobe and today's weather</p>
            </div>

            {error && (
              <div style={{ background: '#FDECEA', color: '#E74C3C', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px' }}>
                <span style={{ marginRight: '10px' }}>⚠️</span> {error}
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
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6B7B8D' }}>
                    No outfits generated yet. Try generating some!
                  </div>
                ) : (
                  outfits.map((outfit, i) => (
                    <div key={outfit.id} className="outfit-card card animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.15}s` }} id={`outfit-${outfit.id}`}>
                      <div className="outfit-card-header">
                        <div>
                          <h2 className="outfit-card-title heading-italic">
                            <span className="sparkle-sm">✨</span> {outfit.title}
                          </h2>
                          <div className="outfit-tags">
                            {outfit.tags.map(tag => (
                              <span key={tag} className="badge badge-amber">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div className="match-score">
                          <div className="match-circle">
                            <span className="match-value">{outfit.match}%</span>
                          </div>
                          <span className="match-label">Match</span>
                        </div>
                      </div>

                      <div className="outfit-card-items">
                        {outfit.items.map((item, j) => (
                          <div key={j} className="outfit-card-item">
                            <div className="outfit-card-item-img" style={{ 
                                backgroundImage: `url(${item.imageUrl})`, 
                                backgroundSize: 'cover', 
                                backgroundPosition: 'center',
                                backgroundColor: '#F5E6D3' 
                            }}>
                            </div>
                            <div className="outfit-card-item-type">{item.type}</div>
                            <div className="outfit-card-item-name" style={{ textTransform: 'capitalize', fontSize: '14px' }}>
                              {item.name}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="outfit-card-reason">
                        <p>"{outfit.explanation}"</p>
                      </div>

                      <div className="outfit-card-actions">
                        <button 
                          className="btn btn-primary outfit-wear-btn" 
                          id={`wear-outfit-${outfit.id}`}
                          onClick={() => handleOutfitAction(outfit, 'wear')}
                          disabled={savingAction?.id === outfit.id}
                        >
                          {savingAction?.id === outfit.id && savingAction?.type === 'wear' ? 'Saving...' : 'Wear This'}
                        </button>
                        <button 
                          className="btn btn-ghost" 
                          onClick={() => handleOutfitAction(outfit, 'save')}
                          disabled={savingAction?.id === outfit.id}
                        >
                          {savingAction?.id === outfit.id && savingAction?.type === 'save' ? 'Saving...' : '❤️ Save'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Trending Styles */}
            <section className="trending-section animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <h2 className="section-title heading-italic">Trending Styles</h2>
              <div className="trending-grid">
                {trendingStyles.map(style => (
                  <div key={style.name} className="trending-card card">
                    <span className="trending-emoji">{style.emoji}</span>
                    <span className="trending-name">{style.name}</span>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Outfits
