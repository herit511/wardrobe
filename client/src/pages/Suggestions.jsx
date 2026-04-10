import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Sparkles, AlertTriangle, Shirt, Save } from 'lucide-react'
import { api } from '../api'
import { getColorName, getOptimizedUrl } from '../utils'
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
  const [advisorFeedback, setAdvisorFeedback] = useState(null)

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
        setAdvisorFeedback(null)
      } else { 
        setAdvisorFeedback(res.advisorFeedback)
        
        if (res.code === "NO_TOPS") setError("None of your tops suit this occasion. Try switching to Casual or add appropriate tops.");
        else if (res.code === "NO_BOTTOMS") setError("None of your bottoms suit this occasion. Try switching the occasion or add appropriate bottoms.");
        else if (res.code === "NO_GYM_TOPS") setError("Add athletic tops (t-shirt, tank top) for gym outfit suggestions.");
        else if (!res.advisorFeedback) setError(res.message);
        
        setOutfits([])
        setGaps(null)
        setVersatility(null)
        setCulturalContext(null)
      }
    } catch (err) {
      if (err.name === 'TypeError' || err.message.includes('fetch')) {
        setError('Network connection lost. Please check your internet and try again.');
      } else {
        setError(err.message || 'Failed to generate outfits'); 
      }
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
      navigate('/outfits')
    } catch (err) { console.error('Wear error:', err.message) }
    finally { setSavingAction(null) }
  }

  const handleSaveOutfit = async (outfit) => {
    setSavingAction({ id: outfit.id, type: 'save' })
    try {
      const itemIds = outfit.items.map(i => i._id)
      const saveRes = await api.post('/outfits', { 
        title: outfit.title, 
        occasion, 
        items: itemIds,
        // Pass all styling metadata for persistence
        personality: outfit.personality,
        signatureMove: outfit.signatureMove,
        feelLine: outfit.feelLine,
        colorStory: outfit.colorStory,
        microStyling: outfit.microStyling,
        finishingMove: outfit.finishingMove,
        wowReason: outfit.wowReason,
        // Context
        weather: temperature,
        selectedVibe: outfit.selectedVibe,
        relaxedMatch: outfit.relaxedMatch,
        confidence: outfit.confidence,
        generationContext: {
            weather: temperature,
            occasion,
            selectedVibe: outfit.selectedVibe,
            relaxedMatch: outfit.relaxedMatch,
            confidence: outfit.confidence
        }
      })
      if (!saveRes.success) throw new Error(saveRes.message || 'Failed to save')
      navigate('/outfits')
    } catch (err) { console.error('Save error:', err.message) }
    finally { setSavingAction(null) }
  }

  return (
    <div className="outfits-page" id="suggestions-page">
      <div className="container" style={{ width: '100%' }}>
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
            {outfits.length === 0 && !loading && (
              <div className="advisor-dashboard animate-fade-in" style={{ padding: '40px', background: '#ffffff', borderRadius: '16px', border: '1px solid #EBE4DD', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <h2 className="heading-italic" style={{ color: '#1B2A4A', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <AlertTriangle size={24} color="#F39C12" /> Wardrobe Advisor
                    </h2>
                    <p style={{ color: '#6B7B8D', marginBottom: '24px' }}>
                      {advisorFeedback?.message || "A few more items will unlock new outfit combinations for this look."}
                    </p>

                    {advisorFeedback?.missingCategories?.length > 0 ? (
                      <div style={{ marginBottom: '30px' }}>
                        <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94A3B8', marginBottom: '15px' }}>What To Add Next</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {advisorFeedback.missingCategories.map((gap, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: '#FDF8F5', borderRadius: '8px', borderLeft: '4px solid #E67E22' }}>
                              <Shirt size={18} color="#E67E22" />
                              <span style={{ fontWeight: 500, color: '#1B2A4A' }}>{gap}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: '30px', padding: '20px', background: '#FAFAF8', borderRadius: '8px', borderLeft: '4px solid #94A3B8' }}>
                        <p style={{ margin: 0, color: '#6B7B8D', fontSize: '0.9rem' }}>Your basics are covered — adding variety in colours and styles will unlock new looks.</p>
                      </div>
                    )}

                    <button className="btn btn-primary" onClick={() => navigate('/add-item')}>Add Items to Closet</button>
                  </div>

                  <div style={{ flex: '1 1 300px', padding: '24px', background: '#F8F9FA', borderRadius: '12px', border: '1px solid #EBE4DD' }}>
                    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#1B2A4A', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} /> Stylist Tips
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {advisorFeedback?.suggestedItems?.map((sug, idx) => (
                        <div key={idx}>
                          <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#1B2A4A' }}>{sug.tip}</p>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7B8D' }}>{sug.reason}</p>
                        </div>
                      ))}
                      {advisorFeedback?.topRecommendation && (
                        <div style={{ marginTop: '10px', padding: '15px', background: '#1B2A4A', color: 'white', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8, letterSpacing: '0.5px', marginBottom: '6px', fontFamily: 'Poppins, sans-serif' }}>QUICK WIN</div>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem', lineHeight: 1.5, fontFamily: 'Poppins, sans-serif' }}>{advisorFeedback.topRecommendation}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {outfits.map((outfit, i) => {
              try {
                const breakdown = outfit.breakdown || {};
                const personalColor = breakdown['Personal color'];
                const shoePairing = breakdown['Shoe pairing'];

                return (
                <div key={outfit.id || i} className="outfit-card card animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
                  {personalColor && (
                    <div style={{ background: '#FDF8F5', color: '#8B5A2B', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>◉</span> {personalColor.reason}
                    </div>
                  )}
                  
                  <div className="outfit-card-header">
                    <div>
                      <h2 className="outfit-card-title heading-italic" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <Sparkles size={16} strokeWidth={1.5} className="sparkle-sm sparkle" /> {outfit.title}
                      </h2>
                      {outfit.description && (
                        <p style={{ fontStyle: 'italic', color: '#6B7B8D', fontSize: '0.9rem', marginBottom: '8px' }}>
                          {outfit.description}
                        </p>
                      )}
                      <div className="outfit-tags">
                        {outfit.tags && outfit.tags.map(tag => <span key={tag} className="badge badge-amber">{tag}</span>)}
                        {outfit.moodBoard && outfit.moodBoard.map((mood, idx) => (
                          <span key={idx} style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: '400' }}>· {mood}</span>
                        ))}
                      </div>
                    </div>
                    <div className="match-score">
                      <div className="match-circle" style={{ background: (outfit.confidence || outfit.match) < 70 ? '#94A3B8' : 'linear-gradient(135deg, var(--color-orange), var(--color-amber))' }}>
                        <span className="match-value">{outfit.confidence || outfit.match}%</span>
                      </div>
                      <span className="match-label">Match Trust</span>
                    </div>
                  </div>

                  {outfit.relaxedMatch && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFF7ED', color: '#C2410C', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #FFEDD5', marginBottom: '10px' }}>
                      <AlertTriangle size={12} /> Best possible match from your wardrobe
                      {outfit.relaxationReasons && (
                        <span style={{ fontWeight: 400, opacity: 0.7 }} title={outfit.relaxationReasons.join(', ')}> (diversity relaxed)</span>
                      )}
                    </div>
                  )}

                  {outfit.feelLine && (
                    <div style={{ margin: '12px 0', padding: '6px 12px', background: '#FFF7ED', borderLeft: '3px solid #F97316', borderRadius: '4px', fontSize: '0.85rem', color: '#9A3412', fontWeight: '500' }}>
                      {outfit.feelLine}
                    </div>
                  )}

                  <div className="outfit-card-items" style={{ margin: '15px 0' }}>
                    {outfit.items && outfit.items.map((item, j) => (
                      <div key={j} className="outfit-card-item">
                        <div className="outfit-card-item-img" style={{ backgroundImage: item.imageUrl ? `url(${getOptimizedUrl(item.imageUrl, 400)})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#F5E6D3' }}></div>
                        <div className="outfit-card-item-type" style={{ textTransform: 'capitalize' }}>{item.category || item.type}</div>
                        <div className="outfit-card-item-name" style={{ textTransform: 'capitalize', fontSize: '14px' }}>
                          {getColorName(item.color)} {item.subCategory ? item.subCategory.replace('_', ' ') : item.name?.replace(`${item.color} `, '') || ''}
                        </div>
                      </div>
                    ))}
                  </div>

                  {outfit.signatureMove && (
                    <div style={{ 
                      margin: '20px 0', 
                      padding: '18px', 
                      background: 'linear-gradient(135deg, #1B2A4A 0%, #2D3E5E 100%)', 
                      borderRadius: '12px', 
                      color: '#FFFFFF',
                      boxShadow: '0 4px 12px rgba(27, 42, 74, 0.15)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1, transform: 'scale(2)' }}>
                        <Sparkles size={64} />
                      </div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Signature Move</h3>
                      <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: '500', fontStyle: 'italic', lineHeight: 1.4 }}>"{outfit.signatureMove}"</p>
                    </div>
                  )}

                  <div className="outfit-card-reason" style={{ marginBottom: '15px' }}>
                    <p>"{outfit.explanation}"</p>
                    {outfit.wowReason && (
                      <p style={{ marginTop: '8px', fontSize: '0.85rem', color: '#1B2A4A', fontWeight: '500' }}>
                        ✨ <span style={{ textDecoration: 'underline dotted', cursor: 'help' }} title={outfit.wowReason}>Why heads turn</span>
                      </p>
                    )}
                  </div>

                  {outfit.colorStory && (
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1B2A4A' }}>Color Story</h4>
                        {outfit.colorStory.emotion && (
                          <span className="badge badge-amber" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{outfit.colorStory.emotion}</span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7B8D' }}>{outfit.colorStory.story}</p>
                    </div>
                  )}

                  {outfit.microStyling && outfit.microStyling.length > 0 && (
                    <div style={{ marginBottom: '15px', padding: '12px', background: '#F8F9FA', borderRadius: '8px', border: '1px solid #EBE4DD' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#1B2A4A', fontWeight: '600' }}>How to wear it</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {outfit.microStyling.map((style, idx) => (
                          <div key={idx} style={{ fontSize: '0.85rem', display: 'flex', gap: '6px' }}>
                            <span style={{ fontWeight: '600', color: '#1B2A4A', whiteSpace: 'nowrap' }}>{style.item}:</span>
                            <span style={{ color: '#6B7B8D' }}>{style.tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {outfit.finishingMove && (
                    <div style={{ marginBottom: '15px' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#1B2A4A' }}>Finishing Move</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7B8D' }}>{outfit.finishingMove.primary}</p>
                    </div>
                  )}

                  {shoePairing && (
                    <div style={{ marginBottom: '15px', padding: '10px 15px', borderRadius: '8px', fontSize: '0.9rem', background: shoePairing.score < 7 ? '#FDECEA' : shoePairing.score >= 8 ? '#EAFaf1' : '#F8F9FA', color: shoePairing.score < 7 ? '#E74C3C' : shoePairing.score >= 8 ? '#27AE60' : '#1B2A4A' }}>
                      {shoePairing.score < 7 ? `⚠ ${shoePairing.reason}` : shoePairing.score >= 8 ? `✓ ${shoePairing.reason}` : shoePairing.reason}
                    </div>
                  )}

                  {outfit.warnings && outfit.warnings.length > 0 && (
                    <div style={{ marginBottom: '15px', padding: '10px 15px', borderRadius: '8px', fontSize: '0.9rem', background: '#FFF8E7', border: '1px solid #F5DEC0', color: '#D35400' }}>
                      <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {outfit.warnings.map((w, idx) => (
                          <li key={idx}>⚠ {w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {outfit.trends && outfit.trends.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                      {outfit.trends.map((trend, idx) => (
                        <span key={idx} style={{ fontSize: '0.75rem', padding: '4px 10px', background: '#F1F5F9', color: '#475569', borderRadius: '100px', fontWeight: '500' }}>
                          ◉ {trend.name || trend}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="outfit-card-actions">
                    <button className="btn btn-primary outfit-wear-btn" onClick={() => handleWearThis(outfit)} disabled={savingAction?.id === outfit.id} title="Log as worn today and save">
                      {savingAction?.id === outfit.id && savingAction?.type === 'wear' ? 'Logging...' : <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shirt size={16} strokeWidth={1.5} /> Wear This</div>}
                    </button>
                    <button className="btn btn-ghost" onClick={() => handleSaveOutfit(outfit)} disabled={savingAction?.id === outfit.id} title="Save for later without marking worn">
                      {savingAction?.id === outfit.id && savingAction?.type === 'save' ? 'Saving...' : <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={16} strokeWidth={1.5} /> Save</div>}
                    </button>
                  </div>
                </div>
                )
              } catch (e) {
                console.error("Failed to render outfit", e);
                return (
                  <div key={i} className="outfit-card card" style={{ padding: '20px', borderLeft: '4px solid #E74C3C' }}>
                    <h3 style={{ margin: 0, color: '#E74C3C', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={20} /> Unable to display this outfit
                    </h3>
                    <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#6B7B8D' }}>
                      There was a problem preparing this specific suggestion. The formatting engine encountered an incomplete object.
                    </p>
                  </div>
                );
              }
            })}
            
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
