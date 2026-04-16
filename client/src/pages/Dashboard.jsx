import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Sparkles, Shirt, Layers, Package, Shuffle, ArrowRight } from 'lucide-react'
import { api } from '../api'
import { getColorName, getOptimizedUrl } from '../utils'
import { useAuth } from '../context/AuthContext'
import { buildWeeklyWardrobeTips } from '../utils/wardrobeTips'
import SkeletonCard from '../components/SkeletonCard'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [allOutfits, setAllOutfits] = useState([])
  const [todaysOutfit, setTodaysOutfit] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [outfitLoading, setOutfitLoading] = useState(true)
  const [savingAction, setSavingAction] = useState(false)
  const [outfitError, setOutfitError] = useState('')
  const [fetchError, setFetchError] = useState(null)
  const [weatherData, setWeatherData] = useState({ temp: '22', desc: 'Sunny', city: 'your location' })
  const [userPreferences, setUserPreferences] = useState({
    dailySuggestion: true,
    weeklyTips: true,
    trendAlerts: false,
  })
  const [trendTips, setTrendTips] = useState([])
  const [trendTipsLoading, setTrendTipsLoading] = useState(false)

  useEffect(() => {
    fetchDashboardData();
    fetchLiveWeather();
  }, [])

  useEffect(() => {
    const prefs = user?.preferences || {}
    setUserPreferences({
      dailySuggestion: prefs.dailySuggestion ?? true,
      weeklyTips: prefs.weeklyTips ?? true,
      trendAlerts: prefs.trendAlerts ?? false,
    })
  }, [user])

  useEffect(() => {
    if (userPreferences.trendAlerts) {
      fetchTrendTips()
    }
  }, [userPreferences.trendAlerts])

  const fetchTrendTips = async () => {
    setTrendTipsLoading(true)
    try {
      const res = await api.get('/stats/trend-tips')
      if (res.success) {
        setTrendTips(Array.isArray(res.data) ? res.data : [])
      }
    } catch (err) {
      console.error('Failed to fetch trend tips:', err)
      setTrendTips([])
    } finally {
      setTrendTipsLoading(false)
    }
  }

  const fetchLiveWeather = async () => {
    try {
      // 1. Get location from IP
      const ipRes = await fetch('https://ipapi.co/json/')
      const ipData = await ipRes.json()
      const city = ipData.city || 'your city'
      const lat = ipData.latitude
      const lon = ipData.longitude

      if (lat && lon) {
        // 2. Fetch weather from Open-Meteo (Free, no key)
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
        const wData = await wRes.json()
        if (wData.current_weather) {
          const code = wData.current_weather.weathercode
          const temp = Math.round(wData.current_weather.temperature)
          
          // Basic translation mapping
          let desc = 'Clear'
          if (code === 0) desc = 'Sunny'
          else if (code <= 3) desc = 'Partly Cloudy'
          else if (code >= 51 && code <= 65) desc = 'Rainy'
          else if (code >= 71 && code <= 77) desc = 'Snowy'
          else if (code >= 95) desc = 'Thunderstorm'
          else if (code >= 45) desc = 'Foggy'

          setWeatherData({ temp: temp, desc: desc, city: city })
        }
      }
    } catch (err) { console.error('Failed to load live weather:', err) }
  }

  const fetchDashboardData = async () => {
    setOutfitError('')
    setFetchError(null)
    setLoading(true)
    try {
      const [statsRes, itemsRes] = await Promise.all([
        api.get('/stats'),
        api.get('/items?limit=5&sort=-createdAt')
      ])
      
      if (statsRes.success) setStats(statsRes.data)
      if (itemsRes.success) setItems(itemsRes.data)
      setLoading(false) // Instant counters

      // Load heavy outfits separately
      setOutfitLoading(true)
      try {
        const outfitRes = await api.get('/outfits/generate?occasion=Casual&temperature=mild')
        if (outfitRes.success && outfitRes.data.length > 0) {
          setAllOutfits(outfitRes.data)
          const randomIndex = Math.floor(Math.random() * outfitRes.data.length)
          setTodaysOutfit(outfitRes.data[randomIndex])
        }
      } catch (oErr) {
        console.error("Outfit generation failed:", oErr)
        setOutfitError("Could not generate a new suggestion right now.")
      }
    } catch (err) {
      console.error("Dashboard fetch failed:", err)
      setFetchError(err.message || "Failed to load dashboard data. Please check your connection.")
    } finally {
      setLoading(false)
      setOutfitLoading(false)
    }
  }

  const handleWearThis = async () => {
    if (!todaysOutfit) return;
    setSavingAction(true); setOutfitError('');
    try {
      const itemIds = todaysOutfit.items.map(i => i._id || i);
      const saveRes = await api.post('/outfits', { 
        title: "Today's Random Pick", 
        occasion: 'casual', 
        items: itemIds 
      });
      if (!saveRes.success) throw new Error(saveRes.message || 'Failed to save');
      const wearRes = await api.post(`/outfits/${saveRes.data._id}/wear`, {});
      if (!wearRes.success) throw new Error(wearRes.message);
      navigate('/outfits')
    } catch (err) {
      setOutfitError(err.message);
    } finally {
      setSavingAction(false);
    }
  }

  const handleShuffle = () => {
    if (allOutfits.length <= 1) return;
    setOutfitLoading(true);
    setTimeout(() => {
      let randomIndex = Math.floor(Math.random() * allOutfits.length);
      if (todaysOutfit) {
        let attempts = 0;
        // Try up to 5 times to pick a different outfit, falling back to random if very small array
        while (allOutfits[randomIndex].id === todaysOutfit.id && attempts < 5) {
          randomIndex = Math.floor(Math.random() * allOutfits.length);
          attempts++;
        }
      }
      setTodaysOutfit(allOutfits[randomIndex]);
      setOutfitLoading(false);
    }, 300); // 300ms simulated loading for a smooth fade transition effect
  }

  const totalItems = stats?.totalItems || 0

  const addedThisMonth = stats?.addedThisMonth || 0
  const recentItems = items // Already limited by API query
  const weeklyTips = buildWeeklyWardrobeTips({ stats, weatherData })

  return (
    <div className="dashboard-page" id="dashboard-page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section animate-fade-in-up">
          <div className="hero-content">
            <div className="hero-weather">
              <Sun size={20} strokeWidth={1.5} className="weather-icon" />
              <span className="weather-text">{weatherData.temp}°C · {weatherData.desc} ({weatherData.city})</span>
            </div>
            <h1 className="hero-title heading-italic">What should I wear today?</h1>
            <p className="hero-subtitle">
              Based on your schedule and today's {weatherData.desc.toLowerCase()} {weatherData.temp}°C weather in {weatherData.city}, we've curated a breathable yet tailored look.
            </p>
            <button className="btn btn-primary hero-btn" onClick={() => navigate('/outfits')} id="get-suggestions-btn">
              <Sparkles size={16} strokeWidth={1.5} /> Get Outfit Suggestions
            </button>
          </div>
        </section>

        {fetchError && (
          <div className="error-banner animate-fade-in" style={{ marginBottom: '20px', padding: '15px', background: '#FDECEA', color: '#E74C3C', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{fetchError}</span>
            <button className="btn btn-ghost btn-xs" onClick={fetchDashboardData} style={{ color: '#E74C3C', border: '1px solid #E74C3C' }}>Retry</button>
          </div>
        )}

        {/* Stats Cards */}
        <section className="stats-section">
          <div className="stat-card card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon"><Shirt size={24} strokeWidth={1.5} /></div>
            <div className="stat-value">{loading ? '-' : totalItems}</div>
            <div className="stat-label uppercase-label">Total Items</div>
          </div>
          <div className="stat-card card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon"><Layers size={24} strokeWidth={1.5} /></div>
            <div className="stat-value">{loading ? '-' : stats?.totalOutfits || 0}</div>
            <div className="stat-label uppercase-label">Outfits Created</div>
          </div>
          <div className="stat-card card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="stat-icon"><Layers size={24} strokeWidth={1.5} /></div>
            <div className="stat-value">{loading ? '-' : stats?.totalOutfits || 0}</div>
            <div className="stat-label uppercase-label">Outfits Saved</div>
          </div>
          <div className="stat-card card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="stat-icon"><Package size={24} strokeWidth={1.5} /></div>
            <div className="stat-value">{loading ? '-' : addedThisMonth}</div>
            <div className="stat-label uppercase-label">Added This Month</div>
          </div>
        </section>

        {/* Daily Outfit Suggestion */}
        {userPreferences.dailySuggestion && (
          <section className="suggestion-section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="section-title heading-italic">Daily Outfit Suggestion</h2>
            <p style={{ color: '#6B7B8D', marginBottom: '10px' }}>Get a fresh outfit idea every morning.</p>
            <div className="outfit-preview card" style={{
                opacity: outfitLoading ? 0.6 : 1,
                transition: 'opacity 0.3s ease',
                minHeight: '200px'
            }}>
              {outfitLoading && !todaysOutfit ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6B7B8D' }}>Loading suggestion...</div>
              ) : todaysOutfit ? (
                <>
                  <div className="outfit-items">
                    {todaysOutfit.items.map((item, index) => (
                      <div key={item._id || index} style={{ display: 'flex', alignItems: 'center' }}>
                        <div className="outfit-item">
                          <div className="outfit-item-img" style={{
                              backgroundImage: `url(${getOptimizedUrl(item.imageUrl, 400)})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundColor: '#F5E6D3'
                          }}>
                          </div>
                          <div className="outfit-item-info">
                            <h3 style={{ textTransform: 'capitalize' }}>{item.name}</h3>
                            <span className="badge badge-amber">{item.type}</span>
                          </div>
                        </div>
                        {index < todaysOutfit.items.length - 1 && <div className="outfit-connector">+</div>}
                      </div>
                    ))}
                  </div>
                  {outfitError && <p style={{ color: '#E74C3C', fontSize: '0.9rem', marginBottom: '10px' }}>{outfitError}</p>}
                  <div className="outfit-actions">
                    <button className="btn btn-primary" id="wear-this-btn" onClick={handleWearThis} disabled={savingAction || outfitLoading}>
                      {savingAction ? 'Logging...' : 'Wear This'}
                    </button>
                    <button className="shuffle-btn" onClick={handleShuffle} disabled={outfitLoading || savingAction || allOutfits.length <= 1}>
                      <Shuffle size={16} strokeWidth={1.5} /> Shuffle
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: '30px', textAlign: 'center', color: '#6B7B8D' }}>
                  <p>Add at least 1 Top, 1 Bottom, and 1 Footwear to see daily suggestions!</p>
                  <button className="btn btn-primary" style={{ marginTop: '15px' }} onClick={() => navigate('/add-item')}>Add Items</button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Weekly Wardrobe Tips */}
        {userPreferences.weeklyTips && (
          <section className="insights-section animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
            <h2 className="section-title heading-italic">Weekly Wardrobe Tips</h2>
            <p className="insights-subtitle">Style tips based on your wardrobe analysis.</p>
            <div className="card insights-panel">
              <div className="tips-list">
                {weeklyTips.map((tip, idx) => (
                  <div key={idx} className="tip-card">
                    <div className={`tip-priority ${tip.priority}`}>
                      {tip.priority} priority
                    </div>
                    <div className="tip-title">{tip.title}</div>
                    <div className="tip-detail">{tip.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trend Alerts */}
        {userPreferences.trendAlerts && (
          <section className="insights-section animate-fade-in-up" style={{ animationDelay: '0.38s' }}>
            <h2 className="section-title heading-italic">Trend Alerts</h2>
            <p className="insights-subtitle">Get notified about new fashion trends.</p>
            <div className="card insights-panel">
              {trendTipsLoading ? (
                <div className="trend-loading">Fetching latest trend insights...</div>
              ) : (
                <div className="trend-grid">
                  {trendTips.map((tip, idx) => (
                    <a
                      key={`${tip.title}-${idx}`}
                      href={tip.link || '#'}
                      target={tip.link ? '_blank' : undefined}
                      rel={tip.link ? 'noreferrer' : undefined}
                      className="trend-card"
                    >
                      <div className="trend-source">{tip.source || `Trend #${idx + 1}`}</div>
                      <div className="trend-title">{tip.title}</div>
                      <div className="trend-insight">{tip.insight}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Recently Added */}
        <section className="recent-section animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="section-header">
            <h2 className="section-title heading-italic">Recently Added</h2>
            <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => navigate('/closet')}>
              View All <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>
          <div className="recent-scroll">
            {loading && <SkeletonCard count={4} type="list" />}
            {recentItems.length === 0 && !loading && (
              <div className="empty-state animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', width: '100%', textAlign: 'center' }}>
                <Shirt size={48} strokeWidth={1} style={{ marginBottom: '16px', color: '#1B2A4A', opacity: 0.3 }} />
                <h3 style={{ marginBottom: '8px', color: '#1B2A4A' }}>Your wardrobe is empty</h3>
                <p style={{ marginBottom: '20px', fontSize: '0.95rem', color: '#6B7B8D' }}>Start digitizing your clothes to get personalized AI suggestions.</p>
                <button className="btn btn-primary" onClick={() => navigate('/add-item')}>Start Bulk Setup</button>
              </div>
            )}
            {!loading && recentItems.map((item, i) => (
              <div key={item._id} className="recent-card card" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                <div className="recent-img" style={{ backgroundImage: `url(${getOptimizedUrl(item.imageUrl, 400)})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#F5E6D3' }}>
                </div>
                <div className="recent-info">
                  <h4 style={{ textTransform: 'capitalize' }}>{getColorName(item.color)} {item.subCategory.replace('_', ' ')}</h4>
                  <span className="recent-time">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
