import { useState, useEffect } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { Search, Shirt, MoreVertical, Edit2, Trash2, Heart, Droplets } from 'lucide-react'
import { api } from '../api'
import { getColorName, getOptimizedUrl } from '../utils'
import SkeletonCard from '../components/SkeletonCard'
import './Closet.css'

const categories = ['All', 'Tops', 'Bottoms', 'Footwear', 'Outerwear', 'Accessories']
const weatherFilters = ['All', 'Hot', 'Mild', 'Cold']

function Closet() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeWeather, setActiveWeather] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [togglingFav, setTogglingFav] = useState(null)
  const [togglingLaundry, setTogglingLaundry] = useState(null)

  useEffect(() => { 
    fetchItems() 
    const handleClickOutside = () => setActiveDropdown(null)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [])

  const fetchItems = async (pageNum = 1) => {
    try {
      const res = await api.get(`/items?page=${pageNum}&limit=500`)
      if (res.success) {
        if (pageNum === 1) setItems(res.data)
        else setItems(prev => [...prev, ...res.data])
        setHasMore(pageNum < res.pagination.pages)
        setPage(pageNum)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    try {
      await api.del(`/items/${id}`)
      setItems(items.filter(item => item._id !== id))
    } catch (err) { console.error(err) }
    setDeleteConfirmId(null)
  }

  const toggleFavorite = async (item) => {
    if (togglingFav) return
    setTogglingFav(item._id)
    try {
      const res = await api.put(`/items/${item._id}/favorite`, {})
      if (res.success && res.data) {
        setItems(prev => prev.map(i => i._id === item._id ? { ...i, userPreferenceScore: res.data.userPreferenceScore } : i))
      }
    } catch (err) { console.error(err) }
    finally { setTogglingFav(null) }
  }

  const toggleLaundry = async (item) => {
    if (togglingLaundry) return
    setTogglingLaundry(item._id)
    try {
      const res = await api.put(`/items/${item._id}/laundry`, {})
      if (res.success && res.data) {
        setItems(prev => prev.map(i => i._id === item._id ? { ...i, isLaundry: res.data.isLaundry } : i))
      }
    } catch (err) { console.error(err) }
    finally { setTogglingLaundry(null) }
  }

  const filteredItems = items.filter(item => {
    if (activeCategory !== 'All') {
      const matchCategory = item.category.toLowerCase() === activeCategory.toLowerCase() || item.category === activeCategory.replace(/s$/, '').toLowerCase()
      if (!matchCategory) return false
    }
    const matchWeather = activeWeather === 'All' || (item.weather && item.weather.includes(activeWeather.toLowerCase()))
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
    const searchString = `${item.category} ${item.subCategory || ''} ${item.brand || ''} ${getColorName(item.color)}`.toLowerCase()
    const matchSearch = !searchQuery || searchTerms.every(term => searchString.includes(term))
    return matchWeather && matchSearch
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

        <div className="closet-subnav">
          <NavLink to="/closet" end className={({isActive}) => `subnav-btn ${isActive ? 'active' : ''}`}>All Items</NavLink>
          <NavLink to="/favorites" className={({isActive}) => `subnav-btn ${isActive ? 'active' : ''}`}>Favorites</NavLink>
          <NavLink to="/laundry" className={({isActive}) => `subnav-btn ${isActive ? 'active' : ''}`}>Laundry</NavLink>
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
            <select className="filter-select" value={activeWeather} onChange={(e) => setActiveWeather(e.target.value)} id="weather-filter">
              {weatherFilters.map(w => <option key={w} value={w}>{w === 'All' ? 'All Weather' : w}</option>)}
            </select>
            <div className="search-box">
              <Search size={16} strokeWidth={2} />
              <input type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} id="closet-search" />
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <SkeletonCard count={8} type="grid" />
        ) : (
          <div className="items-grid">
            {filteredItems.map((item, i) => (
              <div key={item._id} className={`item-card card animate-fade-in-up ${activeDropdown === item._id ? 'has-dropdown' : ''}`} style={{ animationDelay: `${0.15 + i * 0.05}s` }} id={`item-${item._id}`}>
                <div className="item-img" style={{ backgroundImage: `url(${getOptimizedUrl(item.imageUrl, 400)})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#F5E6D3', position: 'relative' }}>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}
                    disabled={togglingFav === item._id}
                    style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', zIndex: 2, display: 'flex' }}
                  >
                    <Heart size={18} fill={item.userPreferenceScore > 0 ? "#E74C3C" : "none"} stroke={item.userPreferenceScore > 0 ? "#E74C3C" : "#1B2A4A"} />
                  </button>

                  <div className="item-actions-wrapper">
                    <button 
                      className={`more-actions-btn ${activeDropdown === item._id ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === item._id ? null : item._id); }}
                    >
                      <MoreVertical size={18} strokeWidth={2} />
                    </button>
                    
                    {activeDropdown === item._id && (
                      <div className="actions-dropdown animate-fade-in">
                        {!['footwear', 'accessories'].includes(item.category.toLowerCase()) && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); toggleLaundry(item); }}
                            disabled={togglingLaundry === item._id}
                          >
                            <Droplets size={14} /> {item.isLaundry ? 'Mark Clean' : 'Add to Laundry'}
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/edit-item/${item._id}`); }}>
                          <Edit2 size={14} /> Edit
                        </button>
                        <button className="delete-option" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); setDeleteConfirmId(item._id); }}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="item-info">
                  <div className="item-category-badge">
                    <span className="badge badge-orange">{item.category}</span>
                    {item.isLaundry && !['footwear', 'accessories'].includes(item.category.toLowerCase()) && <span className="badge badge-amber" style={{ marginLeft: '4px', background: '#FDECEA', color: '#E74C3C', border: '1px solid #E74C3C' }} title="In Laundry"><Droplets size={12} strokeWidth={2} /> Laundry</span>}
                  </div>
                  <h3 className="item-name" style={{ textTransform: 'capitalize' }}>{getColorName(item.color)} {item.subCategory.replace('_', ' ')}</h3>
                  <p className="item-brand">{item.isLaundry && !['footwear', 'accessories'].includes(item.category.toLowerCase()) ? 'Needs washing' : `${item.condition} condition`}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', marginBottom: '10px' }}>
            <button className="btn btn-secondary" onClick={() => fetchItems(page + 1)}>
              Load More Items
            </button>
          </div>
        )}

        {!loading && filteredItems.length === 0 && (
          <div className="empty-state animate-fade-in">
            <div className="empty-icon">
              <Shirt size={48} strokeWidth={1.5} style={{ color: '#1B2A4A' }} />
            </div>
            <h2 className="heading-italic">No items found</h2>
            <p>Try changing your filters or add new items to your closet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/add-item')}>Add First Item</button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="modal-overlay animate-fade-in" onClick={() => setDeleteConfirmId(null)}>
            <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
              <h3>Delete this item?</h3>
              <p>This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button className="btn btn-ghost" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
                <button className="btn btn-primary" style={{ background: '#E74C3C' }} onClick={() => handleDelete(deleteConfirmId)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Closet
