import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Closet.css'

const categories = ['All', 'Tops', 'Bottoms', 'Footwear', 'Outerwear']
const seasons = ['All', 'Summer', 'Winter', 'Monsoon', 'All Season']
const occasions = ['All', 'Casual', 'Office', 'Party', 'Streetwear']

const sampleItems = [
  { id: 1, name: 'Cashmere Crewneck', brand: 'Everlane', season: 'Winter', category: 'Tops', color: '#C4A882', emoji: '🧶', fav: true },
  { id: 2, name: 'Selvedge Denim', brand: "Levi's Premium", season: 'All Season', category: 'Bottoms', color: '#2C3E50', emoji: '👖', fav: false },
  { id: 3, name: 'Tassel Loafers', brand: 'G.H. Bass', season: 'All Season', category: 'Footwear', color: '#8B6914', emoji: '👞', fav: true },
  { id: 4, name: 'Classic Trench', brand: 'Burberry', season: 'Monsoon', category: 'Outerwear', color: '#D4A882', emoji: '🧥', fav: false },
  { id: 5, name: 'Silk Button Down', brand: 'Cuyana', season: 'Summer', category: 'Tops', color: '#F5F0EB', emoji: '👔', fav: true },
  { id: 6, name: 'Wool Midi Skirt', brand: 'Theory', season: 'Winter', category: 'Bottoms', color: '#4A4A4A', emoji: '👗', fav: false },
  { id: 7, name: 'Sport Runners', brand: 'Nike', season: 'All Season', category: 'Footwear', color: '#1A1A1A', emoji: '👟', fav: false },
  { id: 8, name: 'Linen Blazer', brand: 'Massimo Dutti', season: 'Summer', category: 'Outerwear', color: '#E8D5C0', emoji: '🧥', fav: true },
]

function Closet() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSeason, setActiveSeason] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = sampleItems.filter(item => {
    const matchCategory = activeCategory === 'All' || item.category === activeCategory
    const matchSeason = activeSeason === 'All' || item.season === activeSeason
    const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSeason && matchSearch
  })

  return (
    <div className="closet-page" id="closet-page">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <div>
            <h1 className="page-title heading-italic">My Closet</h1>
            <p className="page-subtitle">Curate your personal collection of timeless pieces.</p>
          </div>
          <div className="header-stats">
            <span className="badge badge-amber">{sampleItems.length} Items</span>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="filter-categories">
            {categories.map(cat => (
              <button
                key={cat}
                className={`chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
                id={`filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="filter-right">
            <select
              className="filter-select"
              value={activeSeason}
              onChange={(e) => setActiveSeason(e.target.value)}
              id="season-filter"
            >
              {seasons.map(s => <option key={s} value={s}>{s === 'All' ? 'All Seasons' : s}</option>)}
            </select>
            <div className="search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="closet-search"
              />
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="items-grid">
          {filteredItems.map((item, i) => (
            <div
              key={item.id}
              className="item-card card animate-fade-in-up"
              style={{ animationDelay: `${0.15 + i * 0.05}s` }}
              id={`item-${item.id}`}
            >
              <div className="item-img" style={{ background: item.color }}>
                <span className="item-emoji-lg">{item.emoji}</span>
                <button className={`fav-btn ${item.fav ? 'fav-active' : ''}`}>
                  {item.fav ? '❤️' : '🤍'}
                </button>
                <div className="item-overlay">
                  <button className="btn btn-primary btn-sm">Edit</button>
                  <button className="btn btn-secondary btn-sm">Delete</button>
                </div>
              </div>
              <div className="item-info">
                <div className="item-category-badge">
                  <span className="badge badge-orange">{item.category}</span>
                </div>
                <h3 className="item-name">{item.name}</h3>
                <p className="item-brand">{item.brand} · {item.season}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="empty-state animate-fade-in">
            <div className="empty-icon">👗</div>
            <h2>No items found</h2>
            <p>Try changing your filters or add new items to your closet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/add-item')}>Add First Item</button>
          </div>
        )}

        {/* FAB */}
        <button className="fab" onClick={() => navigate('/add-item')} id="add-item-fab">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </div>
  )
}

export default Closet
