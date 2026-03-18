import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Square, Flame, Briefcase, Flower2, Activity, Crown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import './StyleProfile.css'

const styleArchetypes = [
  { id: 'minimalist', name: 'Minimalist', desc: 'Clean · Structural · Neutral', icon: Square },
  { id: 'streetwear', name: 'Streetwear', desc: 'Urban · Bold · Casual', icon: Flame },
  { id: 'classic', name: 'Classic', desc: 'Timeless · Polished · Elegant', icon: Briefcase },
  { id: 'bohemian', name: 'Bohemian', desc: 'Flowy · Eclectic · Earthy', icon: Flower2 },
  { id: 'sporty', name: 'Sporty', desc: 'Athletic · Dynamic · Fresh', icon: Activity },
  { id: 'formal', name: 'Formal', desc: 'Sharp · Refined · Powerful', icon: Crown },
]

const colorPalette = [
  // Everyday Essentials (Normal / User friendly)
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'White', hex: '#F5F5F5' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Navy Blue', hex: '#000080' },
  { name: 'Light Blue', hex: '#ADD8E6' },
  { name: 'Red', hex: '#E32636' },
  { name: 'Green', hex: '#228B22' },
  { name: 'Yellow', hex: '#FFD700' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Brown', hex: '#8B4513' },
  
  // Premium / Chic Tones
  { name: 'Beige', hex: '#D4C4A8' },
  { name: 'Olive', hex: '#6B7F4A' },
  { name: 'Burgundy', hex: '#722F37' },
  { name: 'Sage', hex: '#9CAF88' },
  { name: 'Coral', hex: '#E87040' },
  { name: 'Lavender', hex: '#B8A9C9' },
  { name: 'Charcoal', hex: '#36454F' },
]

const fitOptions = ['Slim', 'Regular', 'Relaxed', 'Oversized', 'Boxy']
const brandOptions = ['Zara', 'H&M', 'Nike', 'Uniqlo', 'Gucci', 'Vintage/Thrift', 'Lululemon', 'ASOS']

function StyleProfile() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  
  const [selectedStyles, setSelectedStyles] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedFit, setSelectedFit] = useState('')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [saving, setSaving] = useState(false)

  // Pre-fill if editing existing DNA
  useEffect(() => {
    if (user && user.styleDna) {
      if (user.styleDna.archetypes?.length) setSelectedStyles(user.styleDna.archetypes)
      else setSelectedStyles(['Minimalist'])
      
      if (user.styleDna.preferredColors?.length) setSelectedColors(user.styleDna.preferredColors)
      else setSelectedColors(['#1A1A1A', '#F5F5F5', '#1B2A4A'])
      
      if (user.styleDna.preferredFit) setSelectedFit(user.styleDna.preferredFit)
      else setSelectedFit('Regular')
      if (user.styleDna.preferredFit) setSelectedFit(user.styleDna.preferredFit)
      else setSelectedFit('Regular')

      if (user.styleDna.brands?.length) setSelectedBrands(user.styleDna.brands)
    } else {
      setSelectedStyles(['Minimalist'])
      setSelectedColors(['#1A1A1A', '#F5F5F5', '#1B2A4A'])
      setSelectedFit('Regular')
      setSelectedBrands([])
    }
  }, [user])

  const toggleStyle = (id) => {
    setSelectedStyles(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const toggleColor = (hex) => {
    setSelectedColors(prev =>
      prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex]
    )
  }

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
  }

  const completionPercent = Math.min(100, (
    (selectedStyles.length > 0 ? 25 : 0) +
    (selectedColors.length > 0 ? 25 : 0) +
    (selectedFit ? 25 : 0) +
    (selectedBrands.length > 0 ? 25 : 0)
  ))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const styleDna = {
        archetypes: selectedStyles,
        preferredColors: selectedColors,
        preferredFit: selectedFit,
        brands: selectedBrands
      }
      const res = await api.put('/auth/preferences', { styleDna })
      if (res.success) {
        // If they already had styles, they came from Profile edit. Otherwise they are onboarding.
        const isEditing = user?.styleDna?.archetypes?.length > 0
        // Use window.location.href to hard reload and refresh the AuthContext user state
        window.location.href = isEditing ? '/profile' : '/dashboard'
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="style-page" id="style-profile-page">
      <div className="container">
        {/* Progress Bar */}
        <div className="profile-progress animate-fade-in-up">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionPercent}%` }}></div>
          </div>
          <span className="progress-label">Style Profile {completionPercent}% Complete</span>
        </div>

        <div className="page-header animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <h1 className="page-title heading-italic">Your Style DNA</h1>
          <p className="page-subtitle">Let's define your unique fashion blueprint.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Style Personality */}
          <section className="style-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="section-title heading-italic">Style Personality</h2>
            <p className="section-desc">Select up to 3 styles that resonate with you.</p>
            <div className="archetype-grid">
              {styleArchetypes.map(arch => (
                <div
                  key={arch.id}
                  className={`archetype-card card ${selectedStyles.includes(arch.name) ? 'selected' : ''}`}
                  onClick={() => toggleStyle(arch.name)}
                  id={`style-${arch.id}`}
                >
                  <span className="archetype-emoji"><arch.icon size={32} strokeWidth={1.5} /></span>
                  <h3 className="archetype-name">{arch.name}</h3>
                  <p className="archetype-desc">{arch.desc}</p>
                  {selectedStyles.includes(arch.name) && <div className="selected-check">✓</div>}
                </div>
              ))}
            </div>
          </section>

          {/* Color Preferences */}
          <section className="style-section animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="section-title heading-italic">Color Preferences</h2>
            <p className="section-desc">Pick your go-to colors for outfit recommendations.</p>
            <div className="color-grid">
              {colorPalette.map(color => (
                <div
                  key={color.hex}
                  className={`color-swatch ${selectedColors.includes(color.hex) ? 'selected' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => toggleColor(color.hex)}
                  title={color.name}
                  id={`color-${color.name.toLowerCase()}`}
                >
                  {selectedColors.includes(color.hex) && <span className="swatch-check">✓</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Preferred Fit */}
          <section className="style-section animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="section-title heading-italic">Preferred Fit</h2>
            <div className="fit-options">
              {fitOptions.map(fit => (
                <button
                  type="button"
                  key={fit}
                  className={`fit-option ${selectedFit === fit ? 'active' : ''}`}
                  onClick={() => setSelectedFit(fit)}
                  id={`fit-${fit.toLowerCase()}`}
                >
                  <div className="fit-icon">
                    <svg width="40" height="60" viewBox="0 0 40 60">
                      <rect
                        x={fit === 'Slim' ? 14 : fit === 'Regular' ? 11 : fit === 'Relaxed' ? 8 : fit === 'Oversized' ? 5 : 7}
                        y="15"
                        width={fit === 'Slim' ? 12 : fit === 'Regular' ? 18 : fit === 'Relaxed' ? 24 : fit === 'Oversized' ? 30 : 26}
                        height="35"
                        rx="4"
                        fill="currentColor"
                        opacity="0.3"
                      />
                      <circle cx="20" cy="10" r="6" fill="currentColor" opacity="0.4" />
                    </svg>
                  </div>
                  <span className="fit-label">{fit}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Brands */}
          <section className="style-section animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h2 className="section-title heading-italic">Brands & Stores You Love</h2>
            <div className="multi-chips occasion-chips">
              {brandOptions.map(brand => (
                <button
                  key={brand}
                  type="button"
                  className={`chip chip-lg ${selectedBrands.includes(brand) ? 'active' : ''}`}
                  onClick={() => toggleBrand(brand)}
                  id={`brand-${brand.toLowerCase().replace(/[\/\s]/g, '-')}`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </section>

          <div className="style-submit animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <button type="submit" className="btn btn-primary btn-lg" id="save-style-btn">
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default StyleProfile
