import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Sparkles, AlertTriangle, Shirt, Save } from 'lucide-react'
import { api } from '../api'
import './Outfits.css'

function Suggestions() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const occasion = searchParams.get('occasion') || 'Casual'
  const temperature = searchParams.get('temperature') || 'mild'
  const undertone = searchParams.get('undertone') || ''
  const skinDepth = searchParams.get('skinDepth') || ''
  const bodyType = searchParams.get('bodyType') || ''
  const archetype = searchParams.get('archetype') || ''
  const preferredSubCategory = searchParams.get('preferredSubCategory') || ''
  
  const [outfits, setOutfits] = useState([])
  const [gaps, setGaps] = useState(null)
  const [versatility, setVersatility] = useState(null)
  const [culturalContext, setCulturalContext] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingAction, setSavingAction] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { 
    generateOutfits()
  }, [occasion, temperature, preferredSubCategory])

  const generateOutfits = async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ occasion, temperature })
      if (undertone) params.append('undertone', undertone)
      if (skinDepth) params.append('skinDepth', skinDepth)
      if (bodyType) params.append('bodyType', bodyType)
      if (archetype) params.append('archetype', archetype)
      if (preferredSubCategory) params.append('preferredSubCategory', preferredSubCategory)
      
      const res = await api.get(`/outfits/generate?${params.toString()}`)
      if (res.success) {
        setOutfits(res.data)
        setGaps(res.gaps)
        setVersatility(res.versatility)
        setCulturalContext(res.culturalContext)
      } else { 
        setError(res.message); 
        setOutfits([])
        setGaps(null)
        setVersatility(null)
        setCulturalContext(null)
      }
    } catch (err) {
      setError(err.message || 'Failed to generate outfits'); 
      setOutfits([])
      setGaps(null)
      setVersatility(null)
      setCulturalContext(null)
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
      alert('Outfit logged as worn today! You can find it in your Saved outfits.')
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
      alert('Outfit saved!')
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
          <h1 className="page-title heading-italic" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={24} strokeWidth={1.5} className="sparkle" /> AI Outfit Suggestions
          </h1>
          <p className="page-subtitle">
            Perfectly styled for a {temperature} {occasion.toLowerCase()} day.
          </p>
        </div>

        {error && (
          <div style={{ background: '#FDECEA', color: '#E74C3C', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} strokeWidth={1.5} /> {error}
          </div>
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#1B2A4A' }}>
            <div style={{ marginBottom: '15px', color: '#1B2A4A' }}><Sparkles size={48} strokeWidth={1.5} className="sparkle-lg sparkle" /></div>
            <h2 className="heading-italic">Curating your perfect looks...</h2>
            <p style={{color: '#6B7B8D', marginTop: '10px'}}>AI is pairing up your tops, bottoms, and footwear</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {culturalContext && culturalContext.type === 'festival' && (
              <div style={{ background: '#FFF8E7', border: '1px solid #F5DEC0', padding: '20px', borderRadius: '12px' }}>
                <h3 className="heading-italic" style={{ color: '#D35400', marginBottom: '15px', marginTop: 0 }}>Festival Color Guide</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                  {['diwali', 'holi', 'navratri', 'eid'].map(fest => {
                    const fData = culturalContext.data[fest];
                    if (!fData) return null;
                    return (
                      <div key={fest} style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #F5DEC0' }}>
                        <h4 style={{ margin: '0 0 10px 0', textTransform: 'capitalize', color: '#1B2A4A' }}>{fest}</h4>
                        {fData.preferred && (
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                            {fData.preferred.map((color, idx) => (
                              <div key={idx} title={color} style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: color.replace('deep ', '').replace('royal ', '').replace('peacock ', '').replace('pastel ', 'light'), border: '1px solid #ddd' }}></div>
                            ))}
                          </div>
                        )}
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7B8D' }}>{fData.note}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {culturalContext && culturalContext.type === 'ethnic' && (
              <div style={{ background: '#FFF8E7', border: '1px solid #F5DEC0', padding: '20px', borderRadius: '12px' }}>
                <h3 className="heading-italic" style={{ color: '#D35400', marginBottom: '15px', marginTop: 0 }}>Cultural Guidelines</h3>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#6B7B8D', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {culturalContext.data.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}

          <div className="outfits-grid" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {outfits.length === 0 && !error ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6B7B8D' }}>No outfits could be generated with your current closet items.</div>
            ) : outfits.map((outfit, i) => {
              const breakdown = outfit.breakdown || {};
              const personalColor = breakdown['Personal color'];
              const styleMatch = breakdown['Style match'];
              const shoePairing = breakdown['Shoe pairing'];

              const generalChecks = Object.entries(breakdown).filter(([k]) => !['Personal color', 'Style match', 'Shoe pairing'].includes(k));
              const problems = generalChecks.filter(x => x[1].score < 7);
              let showInBreakdown = [...problems];
              if (generalChecks.length > 0) {
                const highest = [...generalChecks].sort((a,b) => b[1].score - a[1].score)[0];
                if (!problems.some(p => p[0] === highest[0])) showInBreakdown.push(highest);
              }

              const rawTips = outfit.tips || [];
              const cleanTips = Array.from(new Set(rawTips.filter(t => t && t.trim() !== ''))).slice(0, 3);

              return (
              <div key={outfit.id} className="outfit-card card animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
                {personalColor && (
                  <div style={{ background: '#FDF8F5', color: '#8B5A2B', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>◉</span> {personalColor.reason}
                  </div>
                )}
                
                <div className="outfit-card-header">
                  <div>
                    <h2 className="outfit-card-title heading-italic" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16} strokeWidth={1.5} className="sparkle-sm sparkle" /> {outfit.title}
                    </h2>
                    <div className="outfit-tags">
                      {outfit.tags.map(tag => <span key={tag} className="badge badge-amber">{tag}</span>)}
                    </div>
                    {styleMatch && (
                      <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: '500', color: styleMatch.score >= 7 ? '#27AE60' : '#6B7B8D' }}>
                        {styleMatch.score >= 7 ? `✓ Matches your ${archetype || 'preferred'} style` : `ℹ Outside your usual ${archetype || 'preferred'} style`}
                      </div>
                    )}
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

                <div className="outfit-card-reason" style={{ marginBottom: '15px' }}><p>"{outfit.explanation}"</p></div>

                {shoePairing && (
                  <div style={{ marginBottom: '15px', padding: '10px 15px', borderRadius: '8px', fontSize: '0.9rem', background: shoePairing.score < 7 ? '#FDECEA' : shoePairing.score >= 8 ? '#EAFaf1' : '#F8F9FA', color: shoePairing.score < 7 ? '#E74C3C' : shoePairing.score >= 8 ? '#27AE60' : '#1B2A4A' }}>
                    {shoePairing.score < 7 ? `⚠ ${shoePairing.reason}` : shoePairing.score >= 8 ? `✓ ${shoePairing.reason}` : shoePairing.reason}
                  </div>
                )}



                {cleanTips.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#1B2A4A' }}>Styling Tips</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#6B7B8D', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {cleanTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="outfit-card-actions">
                  <button className="btn btn-primary outfit-wear-btn" onClick={() => handleWearThis(outfit)} disabled={savingAction?.id === outfit.id} title="Log as worn today and save">
                    {savingAction?.id === outfit.id && savingAction?.type === 'wear' ? 'Logging...' : <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shirt size={16} strokeWidth={1.5} /> Wear This</div>}
                  </button>
                  <button className="btn btn-ghost" onClick={() => handleSaveOutfit(outfit)} disabled={savingAction?.id === outfit.id} title="Save for later without marking worn">
                    {savingAction?.id === outfit.id && savingAction?.type === 'save' ? 'Saving...' : <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={16} strokeWidth={1.5} /> Save for Later</div>}
                  </button>
                </div>
              </div>
            )})}
            
            {/* WARDROBE GAP ANALYSIS */}
            {outfits.length > 0 && gaps && (
              <div className="gap-analysis-card" style={{ marginTop: '20px', padding: '25px', background: '#F8F9FA', borderRadius: '12px', border: '1px solid #EBE4DD' }}>
                <h2 className="heading-italic" style={{ marginBottom: '15px', color: '#1B2A4A' }}>Wardrobe Gap Analysis</h2>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#1B2A4A', marginBottom: '5px' }}>{gaps.topRecommendation}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#6B7B8D' }}>{gaps.reason}</p>
                </div>
                <p style={{ marginBottom: '15px', fontWeight: '500', color: '#1B2A4A' }}>Your wardrobe currently unlocks ~{gaps.currentOutfitCount} outfit combinations.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {gaps.gaps.map((gapStr, i) => {
                    const isWarning = gapStr.toLowerCase().includes('no') || gapStr.toLowerCase().includes('missing');
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', color: '#1B2A4A' }}>
                        <span style={{ fontSize: '1.2rem' }}>{isWarning ? '⚠' : 'ℹ'}</span>
                        <span>{gapStr}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* WARDROBE VERSATILITY */}
            {versatility && (
              <div className="versatility-card" style={{ marginTop: '20px', padding: '25px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #EBE4DD' }}>
                <h2 className="heading-italic" style={{ marginBottom: '5px', color: '#1B2A4A' }}>Your most versatile pieces</h2>
                <p style={{ fontSize: '0.9rem', color: '#6B7B8D', marginBottom: '20px' }}>These items unlock the most outfit combinations in your wardrobe.</p>
                
                {versatility.length < 3 ? (
                  <p style={{ color: '#1B2A4A' }}>Add more items to see versatility rankings.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {versatility.slice(0, 5).map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                        <div style={{ minWidth: '24px', height: '24px', borderRadius: '50%', background: '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #ddd', color: '#1B2A4A' }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, textTransform: 'capitalize', fontSize: '1rem', color: '#1B2A4A' }}>{item.item.color} {item.item.name}</h4>
                          <div style={{ width: '100%', height: '6px', background: '#F0F4F8', borderRadius: '3px', marginTop: '8px', marginBottom: '8px' }}>
                            <div style={{ height: '100%', background: '#1B2A4A', borderRadius: '3px', width: `${Math.min((item.versatilityScore / 15) * 100, 100)}%` }}></div>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7B8D' }}>{item.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

export default Suggestions
