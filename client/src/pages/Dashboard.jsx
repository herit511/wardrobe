import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Sparkles, Shirt, Layers, Heart, Package, Shuffle, ArrowRight } from 'lucide-react'
import { api } from '../api'
import { getColorName } from '../utils'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [todaysOutfit, setTodaysOutfit] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [outfitLoading, setOutfitLoading] = useState(true)
  const [weatherData, setWeatherData] = useState({ temp: '22', desc: 'Sunny', city: 'your location' })

  useEffect(() => {
    fetchDashboardData();
    fetchLiveWeather();
  }, [])

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
      const outfitRes = await api.get('/outfits/generate?occasion=Casual&temperature=mild')
      if (outfitRes.success && outfitRes.data.length > 0) {
        setTodaysOutfit(outfitRes.data[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setOutfitLoading(false)
    }
  }

  const totalItems = stats?.totalItems || 0
  const favoritePieces = stats?.favoriteCount || 0
  const addedThisMonth = stats?.addedThisMonth || 0
  const recentItems = items // Already limited by API query

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

        {/* Stats Cards */}
        <section className="stats-section">
          <div className="stat-card card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon"><Shirt size={24} strokeWidth={1.5} /></div>
            <div className="stat-value">{loading ? '-' : totalItems}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-card card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon"><Layers size={24} strokeWidth={1.5} /></div>
            <div className="stat-value">{loading ? '-' : stats?.totalOutfits || 0}</div>
            <div className="stat-label">Outfits Created</div>
          </div>
          <div className="stat-card card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="stat-icon"><Heart size={24} strokeWidth={1.5} /></div>
            <div className="stat-value">{loading ? '-' : favoritePieces}</div>
            <div className="stat-label">Favorite Pieces</div>
          </div>
          <div className="stat-card card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="stat-icon"><Package size={24} strokeWidth={1.5} /></div>
            <div className="stat-value">{loading ? '-' : addedThisMonth}</div>
            <div className="stat-label">Added This Month</div>
          </div>
        </section>

        {/* Today's Suggestion */}
        <section className="suggestion-section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="section-title heading-italic">Today's Suggestion</h2>
          <div className="outfit-preview card">
            {outfitLoading ? (
               <div style={{ padding: '40px', textAlign: 'center', color: '#6B7B8D' }}>Loading suggestion...</div>
            ) : todaysOutfit ? (
              <>
                <div className="outfit-items">
                  {todaysOutfit.items.map((item, index) => (
                    <div key={item._id || index} style={{ display: 'flex', alignItems: 'center' }}>
                      <div className="outfit-item">
                        <div className="outfit-item-img" style={{ 
                            backgroundImage: `url(${item.imageUrl})`, 
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
                      {index < todaysOutfit.items.length - 1 && <div className="outfit-connector" style={{ alignSelf: 'flex-start', paddingTop: '55px', paddingLeft: '15px' }}>+</div>}
                    </div>
                  ))}
                </div>
                <div className="outfit-actions">
                  <button className="btn btn-primary" id="wear-this-btn" onClick={() => alert('Outfit saved! (In-progress)')}>Wear This</button>
                  <button className="shuffle-btn" onClick={fetchDashboardData}>
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

        {/* Recently Added */}
        <section className="recent-section animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="section-header">
            <h2 className="section-title heading-italic">Recently Added</h2>
            <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => navigate('/closet')}>
              View All <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>
          <div className="recent-scroll">
            {recentItems.length === 0 && !loading && <div style={{ padding: '20px', color: '#666' }}>No items added yet.</div>}
            {recentItems.map((item, i) => (
              <div key={item._id} className="recent-card card" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                <div className="recent-img" style={{ backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#F5E6D3' }}>
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
