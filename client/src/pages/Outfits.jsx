import { useState } from 'react'
import './Outfits.css'

const occasionOptions = ['Casual', 'Office', 'Party', 'Date Night', 'Gym', 'Streetwear']

const outfitSuggestions = [
  {
    id: 1,
    title: 'Coastal Weekend',
    match: 98,
    tags: ['Casual', 'Summer'],
    explanation: 'The linen keeps you cool in 22°C heat, while the loafers add a touch of casual elegance for your coastal walk.',
    items: [
      { type: 'Top', name: 'Linen Shirt', color: '#E8D5C0', emoji: '👔' },
      { type: 'Bottom', name: 'Chino Shorts', color: '#C4A882', emoji: '🩳' },
      { type: 'Shoes', name: 'Leather Loafers', color: '#8B6914', emoji: '👞' },
    ],
  },
  {
    id: 2,
    title: 'Smart Urban',
    match: 92,
    tags: ['Smart Casual', 'City'],
    explanation: 'White denim creates a crisp, sunny silhouette. The navy polo provides the perfect contrast for a refined weekend look.',
    items: [
      { type: 'Top', name: 'Navy Polo', color: '#1B2A4A', emoji: '👕' },
      { type: 'Bottom', name: 'White Denim', color: '#F5F0EB', emoji: '👖' },
      { type: 'Shoes', name: 'Clean Sneakers', color: '#FFFFFF', emoji: '👟' },
    ],
  },
]

const trendingStyles = [
  { name: 'Modern Classic', emoji: '🎩' },
  { name: 'Earth Tones', emoji: '🌿' },
  { name: 'Urban Active', emoji: '🏙️' },
  { name: 'Resort Wear', emoji: '🏖️' },
]

function Outfits() {
  const [selectedOccasions, setSelectedOccasions] = useState(['Casual'])

  const toggleOccasion = (occasion) => {
    setSelectedOccasions(prev =>
      prev.includes(occasion)
        ? prev.filter(o => o !== occasion)
        : [...prev, occasion]
    )
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
                      className={`chip ${selectedOccasions.includes(occ) ? 'active' : ''}`}
                      onClick={() => toggleOccasion(occ)}
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

              <button className="btn btn-primary sidebar-generate" id="generate-outfits-btn">
                <span className="sparkle">✨</span> Generate Outfits
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

            <div className="outfit-cards">
              {outfitSuggestions.map((outfit, i) => (
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
                        <div className="outfit-card-item-img" style={{ background: item.color }}>
                          <span style={{ fontSize: '2.5rem' }}>{item.emoji}</span>
                        </div>
                        <div className="outfit-card-item-type">{item.type}</div>
                        <div className="outfit-card-item-name">{item.name}</div>
                      </div>
                    ))}
                  </div>

                  <div className="outfit-card-reason">
                    <p>"{outfit.explanation}"</p>
                  </div>

                  <div className="outfit-card-actions">
                    <button className="btn btn-primary outfit-wear-btn" id={`wear-outfit-${outfit.id}`}>
                      Wear This
                    </button>
                    <button className="btn btn-ghost">❤️ Save</button>
                    <button className="btn btn-ghost">🔄 Regenerate</button>
                  </div>
                </div>
              ))}
            </div>

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
