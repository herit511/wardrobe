import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

const recentItems = [
  { name: 'Denim Jacket', time: '2 days ago', color: '#6B8FB5' },
  { name: 'White Tee', time: '4 days ago', color: '#F5F0EB' },
  { name: 'Knit Sweater', time: '1 week ago', color: '#C4A882' },
  { name: 'Sunglasses', time: '1 week ago', color: '#2C2C2C' },
  { name: 'Cashmere Scarf', time: '2 weeks ago', color: '#D4A030' },
]

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="dashboard-page" id="dashboard-page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section animate-fade-in-up">
          <div className="hero-content">
            <div className="hero-weather">
              <span className="weather-icon">☀️</span>
              <span className="weather-text">22°C · Sunny</span>
            </div>
            <h1 className="hero-title heading-italic">What should I wear today?</h1>
            <p className="hero-subtitle">
              Based on your schedule and today's sunny 22°C weather, we've curated a breathable yet professional look.
            </p>
            <button className="btn btn-primary hero-btn" onClick={() => navigate('/outfits')} id="get-suggestions-btn">
              <span className="sparkle">✨</span> Get Outfit Suggestions
            </button>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="stats-section">
          <div className="stat-card card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="stat-icon">👔</div>
            <div className="stat-value">124</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat-card card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="stat-icon">👗</div>
            <div className="stat-value">42</div>
            <div className="stat-label">Outfits Created</div>
          </div>
          <div className="stat-card card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="stat-icon">❤️</div>
            <div className="stat-value">15</div>
            <div className="stat-label">Favorite Pieces</div>
          </div>
          <div className="stat-card card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="stat-icon">📦</div>
            <div className="stat-value">5</div>
            <div className="stat-label">Added This Month</div>
          </div>
        </section>

        {/* Today's Suggestion */}
        <section className="suggestion-section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="section-title heading-italic">Today's Suggestion</h2>
          <div className="outfit-preview card">
            <div className="outfit-items">
              <div className="outfit-item">
                <div className="outfit-item-img" style={{ background: 'linear-gradient(135deg, #1B2A4A, #2D4A7A)' }}>
                  <span className="item-emoji">👔</span>
                </div>
                <div className="outfit-item-info">
                  <h3>Navy Silk Shirt</h3>
                  <span className="badge badge-amber">Light & Breathable</span>
                </div>
              </div>
              <div className="outfit-connector">+</div>
              <div className="outfit-item">
                <div className="outfit-item-img" style={{ background: 'linear-gradient(135deg, #D4A882, #E8D5C0)' }}>
                  <span className="item-emoji">👖</span>
                </div>
                <div className="outfit-item-info">
                  <h3>Classic Beige Trousers</h3>
                  <span className="badge badge-amber">Relaxed Fit</span>
                </div>
              </div>
              <div className="outfit-connector">+</div>
              <div className="outfit-item">
                <div className="outfit-item-img" style={{ background: 'linear-gradient(135deg, #C4956A, #D4A882)' }}>
                  <span className="item-emoji">👞</span>
                </div>
                <div className="outfit-item-info">
                  <h3>Tan Leather Loafers</h3>
                  <span className="badge badge-amber">Handcrafted Italian</span>
                </div>
              </div>
            </div>
            <div className="outfit-actions">
              <button className="btn btn-primary" id="wear-this-btn">Wear This</button>
              <button className="btn btn-secondary">🔄 Shuffle</button>
            </div>
          </div>
        </section>

        {/* Recently Added */}
        <section className="recent-section animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="section-header">
            <h2 className="section-title heading-italic">Recently Added</h2>
            <button className="btn btn-ghost" onClick={() => navigate('/closet')}>View All →</button>
          </div>
          <div className="recent-scroll">
            {recentItems.map((item, i) => (
              <div key={i} className="recent-card card" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
                <div className="recent-img" style={{ background: item.color }}>
                  <span style={{ fontSize: '2rem' }}>{['🧥', '👕', '🧶', '🕶️', '🧣'][i]}</span>
                </div>
                <div className="recent-info">
                  <h4>{item.name}</h4>
                  <span className="recent-time">Added {item.time}</span>
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
