import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import './Closet.css'

const categories = ['All', 'Tops', 'Bottoms', 'Footwear', 'Outerwear']
const seasons = ['All', 'Summer', 'Winter', 'Monsoon', 'All Season']
const occasions = ['All', 'Casual', 'Office', 'Party', 'Streetwear']

const colorMap = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Silver', hex: '#c0c0c0' },
  { name: 'Red', hex: '#ff0000' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Blue', hex: '#0000ff' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Dark Blue', hex: '#00008b' },
  { name: 'Light Blue', hex: '#add8e6' },
  { name: 'Cyan', hex: '#00ffff' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Green', hex: '#008000' },
  { name: 'Dark Green', hex: '#006400' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Yellow', hex: '#ffff00' },
  { name: 'Orange', hex: '#ffa500' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Magenta', hex: '#ff00ff' },
  { name: 'Pink', hex: '#ffc0cb' },
  { name: 'Brown', hex: '#a52a2a' },
  { name: 'Beige', hex: '#f5f5dc' }
];

function hexToRgb(hex) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return { r, g, b };
}

function getColorName(hexColor) {
  if (!hexColor || !hexColor.startsWith('#')) return hexColor;
  
  const { r, g, b } = hexToRgb(hexColor);
  let closestColor = hexColor;
  let minDistance = Infinity;
  
  for (const color of colorMap) {
    const rgb = hexToRgb(color.hex);
    // Use redmean approximation for better perceptual color distance
    const rmean = (r + rgb.r) / 2;
    const rDist = r - rgb.r;
    const gDist = g - rgb.g;
    const bDist = b - rgb.b;
    
    const weightR = 2 + rmean / 256;
    const weightG = 4.0;
    const weightB = 2 + (255 - rmean) / 256;
    
    const distance = weightR * rDist * rDist + weightG * gDist * gDist + weightB * bDist * bDist;
    
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color.name;
    }
  }
  return closestColor;
}

function Closet() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSeason, setActiveSeason] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await api.get('/items')
      if (res.success) setItems(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.del(`/items/${id}`)
      setItems(items.filter(item => item._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const filteredItems = items.filter(item => {
    const matchCategory = activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase() || item.category === activeCategory.replace(/s$/, '').toLowerCase() // Handle 'Tops' vs 'top'
    const matchSeason = activeSeason === 'All' || item.season.includes(activeSeason.toLowerCase()) || item.season.includes(activeSeason.toLowerCase().replace(' ', '_'))
    const searchString = `${item.category} ${item.subCategory} ${item.color}`.toLowerCase()
    const matchSearch = !searchQuery || searchString.includes(searchQuery.toLowerCase())
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
            <span className="badge badge-amber">{items.length} Items</span>
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#1B2A4A' }}>Loading closet...</div>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item, i) => (
              <div
                key={item._id}
                className="item-card card animate-fade-in-up"
                style={{ animationDelay: `${0.15 + i * 0.05}s` }}
                id={`item-${item._id}`}
              >
                <div className="item-img" style={{ backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#F5E6D3' }}>
                  <button className={`fav-btn ${item.userPreferenceScore > 0 ? 'fav-active' : ''}`}>
                    {item.userPreferenceScore > 0 ? '❤️' : '🤍'}
                  </button>
                  <div className="item-overlay">
                    <button className="btn btn-light btn-sm" onClick={() => alert('Edit page coming soon!')}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>Delete</button>
                  </div>
                </div>
                <div className="item-info">
                  <div className="item-category-badge">
                    <span className="badge badge-orange">{item.category}</span>
                  </div>
                  <h3 className="item-name" style={{ textTransform: 'capitalize' }}>{getColorName(item.color)} {item.subCategory.replace('_', ' ')}</h3>
                  <p className="item-brand">{item.condition} condition</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="empty-state animate-fade-in">
            <div className="empty-icon">👗</div>
            <h2>No items found</h2>
            <p>Try changing your filters or add new items to your closet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/add-item')}>Add First Item</button>
          </div>
        )}

      </div>
    </div>
  )
}

export default Closet
