import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { getColorName } from '../utils'
import './Closet.css'

const categories = ['All', 'Favorites', 'Tops', 'Bottoms', 'Footwear', 'Outerwear', 'Accessories']
const seasons = ['All', 'Summer', 'Winter', 'Monsoon', 'All Season']

function Closet() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSeason, setActiveSeason] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const res = await api.get('/items')
      if (res.success) setItems(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return
    try {
      await api.del(`/items/${id}`)
      setItems(items.filter(item => item._id !== id))
    } catch (err) { console.error(err) }
  }

  const toggleFavorite = async (item) => {
    // Optimistic update
    const newScore = item.userPreferenceScore > 0 ? 0 : 1
    setItems(prev => prev.map(i => i._id === item._id ? { ...i, userPreferenceScore: newScore } : i))
    try {
      const res = await api.put(`/items/${item._id}/favorite`, {})
      if (!res.success) throw new Error('Failed')
    } catch (err) {
      // Revert on failure
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, userPreferenceScore: item.userPreferenceScore } : i))
      console.error('Failed to toggle favorite:', err)
    }
  }

  const filteredItems = items.filter(item => {
    if (activeCategory === 'Favorites') {
      if (item.userPreferenceScore <= 0) return false
    } else if (activeCategory !== 'All') {
      const matchCategory = item.category.toLowerCase() === activeCategory.toLowerCase() || item.category === activeCategory.replace(/s$/, '').toLowerCase()
      if (!matchCategory) return false
    }
    const matchSeason = activeSeason === 'All' || item.season.includes(activeSeason.toLowerCase()) || item.season.includes(activeSeason.toLowerCase().replace(' ', '_'))
    const searchString = `${item.category} ${item.subCategory} ${item.color}`.toLowerCase()
    const matchSearch = !searchQuery || searchString.includes(searchQuery.toLowerCase())
    return matchSeason && matchSearch
  })

  const favCount = items.filter(i => i.userPreferenceScore > 0).length

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
            {favCount > 0 && <span className="badge badge-orange">❤️ {favCount} Favorites</span>}
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
                {cat === 'Favorites' ? `❤️ ${cat}` : cat}
              </button>
            ))}
          </div>
          <div className="filter-right">
            <select className="filter-select" value={activeSeason} onChange={(e) => setActiveSeason(e.target.value)} id="season-filter">
              {seasons.map(s => <option key={s} value={s}>{s === 'All' ? 'All Seasons' : s}</option>)}
            </select>
            <div className="search-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} id="closet-search" />
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#1B2A4A' }}>Loading closet...</div>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item, i) => (
              <div key={item._id} className="item-card card animate-fade-in-up" style={{ animationDelay: `${0.15 + i * 0.05}s` }} id={`item-${item._id}`}>
                <div className="item-img" style={{ backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#F5E6D3' }}>
                  <button 
                    className={`fav-btn ${item.userPreferenceScore > 0 ? 'fav-active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                    title={item.userPreferenceScore > 0 ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {item.userPreferenceScore > 0 ? '❤️' : '🤍'}
                  </button>
                  <div className="item-overlay">
                    <button className="btn btn-light btn-sm" onClick={() => navigate(`/edit-item/${item._id}`)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>Delete</button>
                  </div>
                </div>
                <div className="item-info">
                  <div className="item-category-badge">
                    <span className="badge badge-orange">{item.category}</span>
                    {item.userPreferenceScore > 0 && <span className="badge badge-orange" style={{ marginLeft: '4px' }}>❤️</span>}
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
            <div className="empty-icon">{activeCategory === 'Favorites' ? '❤️' : '👗'}</div>
            <h2>{activeCategory === 'Favorites' ? 'No favorite items yet' : 'No items found'}</h2>
            <p>{activeCategory === 'Favorites' ? 'Tap the heart on any item to add it to your favorites.' : 'Try changing your filters or add new items to your closet.'}</p>
            {activeCategory !== 'Favorites' && (
              <button className="btn btn-primary" onClick={() => navigate('/add-item')}>Add First Item</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Closet
