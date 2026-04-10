import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, Save, Shirt } from 'lucide-react'
import { api } from '../api'
import { getColorName, getOptimizedUrl } from '../utils'
import './Closet.css' // Reuse Closet styles for grid
import './AddItem.css' // Reuse form styles

const categories = ['Tops', 'Bottoms', 'Footwear', 'Outerwear', 'Accessories']

function BuildOutfit() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('Tops')
  const [loading, setLoading] = useState(true)
  
  const [title, setTitle] = useState('')
  const [occasion, setOccasion] = useState('casual')
  const [selectedItems, setSelectedItems] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    // Only fetch clean items for building outfits
    api.get('/items?limit=100')
      .then(res => {
        if (res.success) setItems(res.data)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filteredItems = items.filter(item => {
    return item.category.toLowerCase() === activeCategory.toLowerCase() || item.category === activeCategory.replace(/s$/, '').toLowerCase()
  })

  const toggleSelect = (item) => {
    if (selectedItems.find(i => i._id === item._id)) {
      setSelectedItems(prev => prev.filter(i => i._id !== item._id))
    } else {
      setSelectedItems(prev => [...prev, item])
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setMsg({ type: '', text: '' })
    if (selectedItems.length < 2) {
      setMsg({ type: 'error', text: 'Please select at least 2 items to form an outfit.' })
      return
    }
    if (!title.trim()) {
      setMsg({ type: 'error', text: 'Please give your outfit a title.' })
      return
    }
    
    setSubmitting(true)
    try {
      const itemIds = selectedItems.map(i => i._id)
      const res = await api.post('/outfits', {
        title,
        occasion,
        items: itemIds,
        isManual: true
      })
      if (res.success) {
        navigate('/outfits')
      } else {
        setMsg({ type: 'error', text: res.message || 'Failed to save outfit' })
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'An error occurred' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="additem-page" style={{ paddingBottom: '100px' }}>
      <div className="container">
        <button 
          className="btn btn-ghost" 
          onClick={() => navigate('/outfits')} 
          style={{ marginBottom: '20px', padding: 0 }}
        >
          &larr; Back to Outfits
        </button>
        <div className="page-header animate-fade-in-up">
          <h1 className="page-title heading-italic">Builder</h1>
          <p className="page-subtitle">Select pieces to manually assemble a custom look.</p>
        </div>

        <div className="filter-bar card animate-fade-in-up" style={{ marginBottom: '20px' }}>
          <div className="filter-categories" style={{ overflowX: 'auto', display: 'flex' }}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading your wardrobe...</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state animate-fade-in" style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '12px' }}>
            <div style={{ opacity: 0.3, marginBottom: '15px' }}><Shirt size={48} /></div>
            <h3>No clean {activeCategory.toLowerCase()} available</h3>
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map(item => {
              const isSelected = selectedItems.find(i => i._id === item._id)
              return (
                <div 
                  key={item._id} 
                  className={`item-card card ${isSelected ? 'selected' : ''}`} 
                  onClick={() => toggleSelect(item)}
                  style={{ 
                    cursor: 'pointer', 
                    border: isSelected ? '2px solid #1B2A4A' : 'none',
                    transform: isSelected ? 'scale(0.98)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="item-img" style={{ backgroundImage: `url(${getOptimizedUrl(item.imageUrl, 400)})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#F5E6D3' }}>
                    {isSelected && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#1B2A4A', color: 'white', borderRadius: '50%', padding: '4px' }}>
                        <Check size={16} strokeWidth={2} />
                      </div>
                    )}
                  </div>
                  <div className="item-info">
                    <h3 className="item-name" style={{ textTransform: 'capitalize', margin: 0 }}>{getColorName(item.color)} {item.subCategory.replace('_', ' ')}</h3>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* Sticky Bottom Staging Area */}
      <div 
        className="staging-area animate-fade-in-up" 
        style={{ 
          position: 'fixed', bottom: 0, left: 0, right: 0, 
          background: '#fff', borderTop: '1px solid #EBE4DD', 
          padding: '15px 20px', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
          zIndex: 100
        }}
      >
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {selectedItems.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
              {selectedItems.map(item => (
                <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8F9FA', border: '1px solid #EBE4DD', padding: '6px 12px', borderRadius: '30px', fontSize: '0.85rem' }}>
                  <span style={{ textTransform: 'capitalize' }}>{item.subCategory.replace('_', ' ')}</span>
                  <button onClick={() => toggleSelect(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#E74C3C', display: 'flex', padding: 0 }}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {msg.text && (
            <div style={{ padding: '10px 15px', borderRadius: '8px', fontSize: '0.9rem', background: msg.type === 'error' ? '#FDECEA' : '#EAFaf1', color: msg.type === 'error' ? '#E74C3C' : '#27AE60' }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Outfit Title (e.g. Sharp Office Look)" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="input-field"
              style={{ flex: '2 1 200px', margin: 0 }}
              required
            />
            <select 
              value={occasion} 
              onChange={e => setOccasion(e.target.value)}
              className="input-field"
              style={{ flex: '1 1 120px', margin: 0, appearance: 'auto' }}
            >
              <option value="casual">Casual</option>
              <option value="office">Office</option>
              <option value="party">Party</option>
              <option value="gym">Gym</option>
              <option value="date night">Date Night</option>
            </select>
            <button type="submit" className="btn btn-primary" disabled={submitting || selectedItems.length < 2} style={{ flex: '1 1 auto', whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <Save size={16} /> {submitting ? 'Saving...' : `Save Outfit (${selectedItems.length})`}
              </div>
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}

export default BuildOutfit
