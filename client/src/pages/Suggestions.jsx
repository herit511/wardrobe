import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Sparkles, AlertTriangle, Shirt, Save, Crown, ShieldAlert, Info } from 'lucide-react'
import { api } from '../api'
import { applyStyleIntelligence } from './fashionStylingEngine'
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
  const [versatility, setVersatility] = useState(null)
  const [culturalContext, setCulturalContext] = useState(null)
  const [loading, setLoading] = useState(true)
  const [savingAction, setSavingAction] = useState(null)
  const [error, setError] = useState('')
  const [outfitError, setOutfitError] = useState('')
  const [advisorFeedback, setAdvisorFeedback] = useState(null)
  const [responseMode, setResponseMode] = useState('results')

  useEffect(() => {
    generateOutfits()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occasion, temperature, preferredSubCategory])

  const generateOutfits = async () => {
    setLoading(true)
    setError('')
    setOutfitError('')

    try {
      const params = new URLSearchParams({ occasion, temperature })
      if (undertone) params.append('undertone', undertone)
      if (skinDepth) params.append('skinDepth', skinDepth)
      if (bodyType) params.append('bodyType', bodyType)
      if (archetype) params.append('archetype', archetype)
      if (preferredSubCategory) params.append('preferredSubCategory', preferredSubCategory)

      const res = await api.get(`/outfits/generate?${params.toString()}`)
      const responseOutfits = Array.isArray(res?.outfits)
        ? res.outfits
        : Array.isArray(res?.data)
          ? res.data
          : []

      if (res?.mode === 'advisor' && responseOutfits.length === 0) {
        setResponseMode('consultation')
        setAdvisorFeedback(res?.advisorFeedback || null)
        setOutfitError(res?.advisorFeedback?.message || 'Wardrobe Advisor is ready to consult.')
        setOutfits([])
        setVersatility(null)
        setCulturalContext(null)
        return
      }

      const styledOutfits = applyStyleIntelligence(responseOutfits, occasion, temperature)
      setOutfits(styledOutfits)
      setVersatility(res?.versatility || null)
      setCulturalContext(res?.culturalContext || null)
      setAdvisorFeedback(res?.advisorFeedback || null)
      setResponseMode('results')
    } catch (err) {
      if (err.name === 'TypeError' || String(err.message || '').includes('fetch')) {
        setError('Network connection lost. Please check your internet and try again.')
      } else {
        setError(err.message || 'Failed to generate outfits')
      }
      setOutfits([])
      setVersatility(null)
      setCulturalContext(null)
      setAdvisorFeedback(null)
      setResponseMode('results')
    } finally {
      setLoading(false)
    }
  }

  const sortedOutfits = useMemo(() => {
    return [...outfits].sort((a, b) => {
      const scoreA = Number(a?.score?.totalScore || 0)
      const scoreB = Number(b?.score?.totalScore || 0)
      return scoreB - scoreA
    })
  }, [outfits])

  const consultationView = responseMode === 'consultation' && sortedOutfits.length === 0
  const showRoadmap = Boolean(advisorFeedback && (advisorFeedback.topRecommendation || (advisorFeedback.suggestedItems || []).length))

  const ratingMeta = (ratingText = '') => {
    const text = String(ratingText)
    if (text.includes('10/10 Masterpiece')) {
      return { className: 'rating-gold', icon: <Crown size={14} /> }
    }
    if (text.includes('8/10 Professional')) {
      return { className: 'rating-silver', icon: <ShieldAlert size={14} /> }
    }
    if (text.includes('6/10 Baseline')) {
      return { className: 'rating-baseline', icon: <Info size={14} /> }
    }
    return { className: 'rating-muted', icon: <Sparkles size={14} /> }
  }

  const handleWearThis = async (outfit) => {
    setSavingAction({ id: outfit.id, type: 'wear' })
    try {
      const itemIds = outfit.items.map(i => i._id)
      const saveRes = await api.post('/outfits', {
        title: outfit.title,
        occasion,
        items: itemIds,
        personality: outfit.personality,
        outfitName: outfit.outfitName,
        signatureMove: outfit.signatureMove,
        antiTip: outfit.antiTip,
        culturalRef: outfit.culturalRef,
        youllBeRememberedFor: outfit.youllBeRememberedFor,
        threeSecond: outfit.threeSecond,
        feelLine: outfit.feelLine,
        colorStory: outfit.colorStory,
        microStyling: outfit.microStyling,
        upgradePath: outfit.upgradePath,
        wearThreeWays: outfit.wearThreeWays,
        photographersNote: outfit.photographersNote,
        occasionTransition: outfit.occasionTransition,
        finishingMove: outfit.finishingMove,
        wowReason: outfit.wowReason,
        visualRating: outfit.visualRating,
        stylistRoadmapNote: outfit.stylistRoadmapNote,
        weather: temperature,
        selectedVibe: outfit.selectedVibe,
        relaxedMatch: outfit.relaxedMatch,
        confidence: outfit.confidence,
        generationContext: {
          weather: temperature,
          occasion,
          selectedVibe: outfit.selectedVibe,
          relaxedMatch: outfit.relaxedMatch,
          confidence: outfit.confidence,
          visualRating: outfit.visualRating,
        }
      })
      if (!saveRes.success) throw new Error(saveRes.message || 'Failed to save')
      const wearRes = await api.post(`/outfits/${saveRes.data._id}/wear`, {})
      if (!wearRes.success) throw new Error(wearRes.message)
      navigate('/outfits')
    } catch (err) {
      console.error('Wear error:', err.message)
    } finally {
      setSavingAction(null)
    }
  }

  const handleSaveOutfit = async (outfit) => {
    setSavingAction({ id: outfit.id, type: 'save' })
    try {
      const itemIds = outfit.items.map(i => i._id)
      const saveRes = await api.post('/outfits', {
        title: outfit.title,
        occasion,
        items: itemIds,
        personality: outfit.personality,
        outfitName: outfit.outfitName,
        signatureMove: outfit.signatureMove,
        antiTip: outfit.antiTip,
        culturalRef: outfit.culturalRef,
        youllBeRememberedFor: outfit.youllBeRememberedFor,
        threeSecond: outfit.threeSecond,
        feelLine: outfit.feelLine,
        colorStory: outfit.colorStory,
        microStyling: outfit.microStyling,
        upgradePath: outfit.upgradePath,
        wearThreeWays: outfit.wearThreeWays,
        photographersNote: outfit.photographersNote,
        occasionTransition: outfit.occasionTransition,
        finishingMove: outfit.finishingMove,
        wowReason: outfit.wowReason,
        visualRating: outfit.visualRating,
        stylistRoadmapNote: outfit.stylistRoadmapNote,
        weather: temperature,
        selectedVibe: outfit.selectedVibe,
        relaxedMatch: outfit.relaxedMatch,
        confidence: outfit.confidence,
        generationContext: {
          weather: temperature,
          occasion,
          selectedVibe: outfit.selectedVibe,
          relaxedMatch: outfit.relaxedMatch,
          confidence: outfit.confidence,
          visualRating: outfit.visualRating,
        }
      })
      if (!saveRes.success) throw new Error(saveRes.message || 'Failed to save')
      navigate('/outfits')
    } catch (err) {
      console.error('Save error:', err.message)
    } finally {
      setSavingAction(null)
    }
  }

  const renderOutfitCard = (outfit, i) => {
    try {
      const card = outfit.card || {}
      const vibe = card.vibe || outfit.outfitName || 'Styled Outfit'
      const oneLine = card.oneLine || outfit.description || ''
      const feelLine = card.feelLine || outfit.feelLine || ''
      const theMove = card.theMove || outfit.signatureMove || 'Keep the proportions clean and intentional.'
      const howToWear = Array.isArray(card.howToWear) ? card.howToWear : []
      const dont = card.dont || outfit.antiTip || 'Do not over-style this look.'
      const grade = String(outfit?.score?.grade || 'B').toUpperCase()
      const totalScore = typeof outfit?.score?.totalScore === 'number'
        ? outfit.score.totalScore.toFixed(1).replace(/\.0$/, '')
        : '0'
      const visualRating = String(outfit?.visualRating || outfit?.score?.visualRating || '')
      const rating = ratingMeta(visualRating)
      const gradeClass = grade === 'A' ? 'grade-a' : grade === 'B' ? 'grade-b' : grade === 'C' ? 'grade-c' : 'grade-d'

      const itemSummary = (outfit.items || [])
        .map((item) => {
          const itemName = item.subCategory
            ? item.subCategory.replace('_', ' ')
            : (item.name || item.type || 'item')
          return `${getColorName(item.color)} ${itemName}`
        })
        .join(', ')

      const accessorySummary = Array.isArray(outfit.accessories) && outfit.accessories.length > 0
        ? outfit.accessories
            .map((acc) => (typeof acc === 'string' ? acc : (acc.name || acc.item || '')))
            .filter(Boolean)
            .join(', ')
        : ''

      return (
        <div key={outfit.id || i} className="outfit-card outfit-card-redesign card animate-fade-in-up" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
          <div className="outfit-hero-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h2 className="outfit-vibe-name">{vibe}</h2>
              {visualRating && (
                <span className={`outfit-visual-rating ${rating.className}`} title={visualRating}>
                  {rating.icon}
                  <span>{visualRating}</span>
                </span>
              )}
            </div>
            <span className={`outfit-grade-badge ${gradeClass}`}>{grade}</span>
          </div>

          {visualRating === '6/10 Baseline' && (
            <div className="outfit-baseline-note">
              This is a solid start. See the Roadmap below to elevate this look.
            </div>
          )}

          {oneLine && <p className="outfit-one-line">{oneLine}</p>}
          {feelLine && <p className="outfit-feel-line">"{feelLine}"</p>}

          <section className="outfit-block outfit-block-move">
            <h3 className="outfit-block-title">✦ THE MOVE</h3>
            <p className="outfit-block-text">{theMove}</p>
          </section>

          <section className="outfit-block">
            <h3 className="outfit-block-title">HOW TO WEAR IT</h3>
            <ul className="outfit-wear-list">
              {howToWear.slice(0, 3).map((entry, idx) => (
                <li key={`${entry.item || 'item'}-${idx}`} className="outfit-wear-item">
                  <span className="outfit-wear-bullet">•</span>
                  <span>
                    <span className="outfit-wear-item-name">{entry.item || 'item'}</span>
                    <span>: {entry.tip || ''}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="outfit-block outfit-block-dont">
            <h3 className="outfit-block-title">⚠ DON'T</h3>
            <p className="outfit-block-text">{dont}</p>
          </section>

          <section className="outfit-block outfit-block-items">
            <div className="outfit-card-items outfit-card-items-compact">
              {(outfit.items || []).map((item, idx) => {
                const itemName = item.subCategory
                  ? item.subCategory.replace('_', ' ')
                  : (item.name || item.type || 'item')

                return (
                  <div key={`${itemName}-${idx}`} className="outfit-card-item">
                    <div
                      className="outfit-card-item-img outfit-card-item-img-compact"
                      style={{
                        backgroundImage: item.imageUrl ? `url(${getOptimizedUrl(item.imageUrl, 400)})` : 'none',
                        backgroundColor: '#F5E6D3'
                      }}
                    ></div>
                    <div className="outfit-card-item-type" style={{ textTransform: 'capitalize' }}>
                      {item.category || item.type || 'Item'}
                    </div>
                    <div className="outfit-card-item-name" style={{ textTransform: 'capitalize', fontSize: '13px' }}>
                      {getColorName(item.color)} {itemName}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="outfit-block outfit-block-meta">
            <p className="outfit-meta-line"><strong>Items:</strong> {itemSummary}</p>
            <p className="outfit-meta-line"><strong>Score:</strong> {totalScore}/10</p>
            {visualRating && <p className="outfit-meta-line"><strong>Tier:</strong> {visualRating}</p>}
            {accessorySummary && <p className="outfit-meta-accessories">Accessories: {accessorySummary}</p>}
          </section>

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
      console.error('Failed to render outfit', e)
      return (
        <div key={i} className="outfit-card card" style={{ padding: '20px', borderLeft: '4px solid #E74C3C' }}>
          <h3 style={{ margin: 0, color: '#E74C3C', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} /> Unable to display this outfit
          </h3>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: '#6B7B8D' }}>
            There was a problem preparing this specific suggestion. The formatting engine encountered an incomplete object.
          </p>
        </div>
      )
    }
  }

  const roadmapPanel = (
    <div className="advisor-dashboard animate-fade-in" style={{ padding: '34px', background: '#ffffff', borderRadius: '18px', border: '1px solid #EBE4DD', boxShadow: '0 12px 32px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <AlertTriangle size={22} color="#F39C12" />
        <h2 className="heading-italic" style={{ margin: 0, color: '#1B2A4A' }}>Stylist&apos;s Roadmap</h2>
      </div>
      <p style={{ color: '#6B7B8D', marginTop: 0, lineHeight: 1.6 }}>
        {advisorFeedback?.message || advisorFeedback?.topRecommendation || 'Refine the weakest category to lift the score.'}
      </p>
      {advisorFeedback?.topRecommendation && (
        <div style={{ marginBottom: '16px', padding: '16px', background: '#1B2A4A', color: 'white', borderRadius: '12px' }}>
          <div style={{ fontSize: '0.72rem', letterSpacing: '0.8px', textTransform: 'uppercase', opacity: 0.75, marginBottom: '6px' }}>Top Recommendation</div>
          <div style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{advisorFeedback.topRecommendation}</div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
        {(advisorFeedback?.suggestedItems || []).map((sug, idx) => (
          <div key={idx} style={{ padding: '14px', borderRadius: '12px', background: '#FAFAF8', border: '1px solid #E8E2DA' }}>
            <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#1B2A4A' }}>{sug.tip}</p>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#6B7B8D', lineHeight: 1.5 }}>{sug.reason}</p>
          </div>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="outfits-page" id="suggestions-page">
        <div className="container" style={{ width: '100%' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/outfits')} style={{ marginBottom: '20px' }}>
            ← Back to Outfits
          </button>
          <div style={{ textAlign: 'center', padding: '60px', color: '#1B2A4A' }}>
            <div style={{ marginBottom: '15px', color: '#1B2A4A' }}><Sparkles size={48} strokeWidth={1.5} className="sparkle-lg sparkle" /></div>
            <h2 className="heading-italic">Curating your perfect looks...</h2>
            <p style={{ color: '#6B7B8D', marginTop: '10px' }}>AI is pairing up your tops, bottoms, and footwear</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="outfits-page" id="suggestions-page">
      <div className="container" style={{ width: '100%' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/outfits')} style={{ marginBottom: '20px' }}>
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

        {outfitError && (
          <div style={{ background: '#FFF8E7', color: '#8A5A00', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #F5DEC0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <AlertTriangle size={18} strokeWidth={1.5} /> {outfitError}
            </div>
            {advisorFeedback?.topRecommendation && (
              <p style={{ margin: '10px 0 0 26px', color: '#6B7B8D' }}>
                Suggestion: {advisorFeedback.topRecommendation}
              </p>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {culturalContext && culturalContext.type === 'festival' && (
            <div style={{ background: '#FFF8E7', border: '1px solid #F5DEC0', padding: '20px', borderRadius: '12px' }}>
              <h3 className="heading-italic" style={{ color: '#D35400', marginBottom: '15px', marginTop: 0 }}>Festival Color Guide</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                {['diwali', 'holi', 'navratri', 'eid'].map(fest => {
                  const fData = culturalContext.data[fest]
                  if (!fData) return null
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

          {consultationView ? (
            <div className="advisor-dashboard animate-fade-in" style={{ padding: '36px', background: '#ffffff', borderRadius: '18px', border: '1px solid #EBE4DD', boxShadow: '0 12px 32px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 340px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FFF8E7', color: '#8A5A00', padding: '6px 12px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '14px' }}>
                    <AlertTriangle size={14} /> Wardrobe Advisor Consultation
                  </div>
                  <h2 className="heading-italic" style={{ color: '#1B2A4A', margin: '0 0 10px' }}>
                    Your wardrobe needs a stronger base before the system can generate graded outfits.
                  </h2>
                  <p style={{ color: '#6B7B8D', marginBottom: '18px', lineHeight: 1.6 }}>
                    {advisorFeedback?.message || 'The wardrobe is too incomplete for a graded result. Add the roadmap items below to unlock better fits.'}
                  </p>
                  {advisorFeedback?.topRecommendation && (
                    <div style={{ marginBottom: '18px', padding: '16px 18px', background: '#1B2A4A', color: 'white', borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.72rem', letterSpacing: '0.8px', textTransform: 'uppercase', opacity: 0.75, marginBottom: '6px' }}>Top Recommendation</div>
                      <div style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{advisorFeedback.topRecommendation}</div>
                    </div>
                  )}
                  <button className="btn btn-primary" onClick={() => navigate('/add-item')}>Add Items to Closet</button>
                </div>
                <div style={{ flex: '1 1 320px', padding: '22px', background: '#F8F9FA', borderRadius: '14px', border: '1px solid #EBE4DD' }}>
                  <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#1B2A4A', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} /> Stylist&apos;s Roadmap
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {(advisorFeedback?.suggestedItems || []).map((sug, idx) => (
                      <div key={idx} style={{ padding: '14px', borderRadius: '12px', background: 'white', border: '1px solid #E8E2DA' }}>
                        <p style={{ margin: '0 0 6px 0', fontWeight: 700, color: '#1B2A4A' }}>{sug.tip}</p>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#6B7B8D', lineHeight: 1.5 }}>{sug.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="outfits-grid" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {sortedOutfits.map(renderOutfitCard)}
            </div>
          )}

          {showRoadmap && !consultationView && (
            roadmapPanel
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
    </div>
  )
}

export default Suggestions
