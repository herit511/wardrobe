import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../api'
import './Outfits.css'

function Suggestions() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const occasion = searchParams.get('occasion') || 'Casual'
  const temperature = searchParams.get('temperature') || 'mild'
  
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingAction, setSavingAction] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { 
    generateOutfits()
  }, [occasion, temperature])

  const generateOutfits = async () => {
    setLoading(true); setError('')
    try {
      const res = await api.get(`/outfits/generate?occasion=${occasion}&temperature=${temperature}`)
      if (res.success) setOutfits(res.data)
      else { setError(res.message); setOutfits([]) }
    } catch (err) {
      setError(err.message || 'Failed to generate outfits'); setOutfits([])
    } finally { setLoading(false) }
  }

  const handleWearThis = async (outfit) => {
    setSavingAction({ id: outfit.id, type: 'wear' })
    try {
      const itemIds = outfit.items.map(i => i._id)
      const saveRes = await api.post('/outfits', { title: outfit.title, occasion, items: itemIds })
      if (!saveRes.success) throw new Error(saveRes.message || 'Failed to save')
      const wearRes = await api.post(`/outfits/${saveRes.data._id}/wear`, {})
      if (!wearRes.success) throw new Error(wearRes.message)
      alert('🎉 Outfit logged as worn today! You can find it in your Saved outfits.')
      navigate('/outfits')
    } catch (err) { alert(`Error: ${err.message}`) }
    finally { setSavingAction(null) }
  }

  const handleSaveOutfit = async (outfit) => {
    setSavingAction({ id: outfit.id, type: 'save' })
    try {
      const itemIds = outfit.items.map(i => i._id)
      const saveRes = await api.post('/outfits', { title: outfit.title, occasion, items: itemIds })
      if (!saveRes.success) throw new Error(saveRes.message || 'Failed to save')
      alert('💾 Outfit saved!')
      navigate('/outfits')
    } catch (err) { alert(`Error: ${err.message}`) }
    finally { setSavingAction(null) }
  }

  return (
    <div className="outfits-page" id="suggestions-page">
      <div className="container" style={{maxWidth: '900px'}}>
        <button className="btn btn-ghost" onClick={() => navigate('/outfits')} style={{marginBottom: '20px'}}>
          ← Back to Outfits
        </button>
        
        <div className="outfits-header animate-fade-in-up">
          <h1 className="page-title heading-italic">
            <span className="sparkle">✨</span> AI Outfit Suggestions
          </h1>
          <p className="page-subtitle">
            Perfectly styled for a {temperature} {occasion.toLowerCase()} day.
          </p>
        </div>

        {error && (
          <div style={{ background: '#FDECEA', color: '#E74C3C', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#1B2A4A' }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }} className="sparkle-lg">✨</div>
            <h2>Curating your perfect looks...</h2>
            <p style={{color: '#6B7B8D', marginTop: '10px'}}>AI is pairing up your tops, bottoms, and footwear</p>
          </div>
        ) : (
          <div className="outfits-grid" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {outfits.length === 0 && !error ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6B7B8D' }}>No outfits could be generated with your current closet items.</div>
            ) : outfits.map((outfit, i) => (
              <div key={outfit.id} className="outfit-card card animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
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
                  <button className="btn btn-primary outfit-wear-btn" onClick={() => handleWearThis(outfit)} disabled={savingAction?.id === outfit.id} title="Log as worn today and save">
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
      </div>
    </div>
  )
}

export default Suggestions
