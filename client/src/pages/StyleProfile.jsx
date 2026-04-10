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

const undertoneOptions = [
  { value: 'warm', label: 'Warm', hex: '#F4C4A0' },
  { value: 'cool', label: 'Cool', hex: '#F8D0CD' },
  { value: 'neutral', label: 'Neutral', hex: '#EAC6AD' }
]

const skinDepthOptions = [
  { value: 'fair', label: 'Fair', hex: '#FCEEE3' },
  { value: 'light', label: 'Light', hex: '#F4DBCE' },
  { value: 'medium', label: 'Medium', hex: '#DAB292' },
  { value: 'tan', label: 'Tan', hex: '#B37A59' },
  { value: 'deep', label: 'Deep', hex: '#7B4A31' },
  { value: 'rich', label: 'Rich', hex: '#462312' }
]

const bodyTypeOptions = [
  { value: 'hourglass', label: 'Hourglass' },
  { value: 'pear', label: 'Pear' },
  { value: 'apple', label: 'Apple' },
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'inverted triangle', label: 'Inverted Triangle' },
  { value: 'petite', label: 'Petite' },
  { value: 'tall', label: 'Tall' },
  { value: 'average', label: 'Average' }
]

function StyleProfile() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  
  const [selectedStyles, setSelectedStyles] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedFit, setSelectedFit] = useState('')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [undertone, setUndertone] = useState('')
  const [skinDepth, setSkinDepth] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Pre-fill if editing existing DNA
  useEffect(() => {
    if (user && user.styleDna) {
      if (user.styleDna.archetypes?.length) setSelectedStyles(user.styleDna.archetypes)
      else setSelectedStyles(['Minimalist'])
      
      if (user.styleDna.preferredColors?.length) setSelectedColors(user.styleDna.preferredColors)
      else setSelectedColors(['#1A1A1A', '#F5F5F5', '#1B2A4A'])
      
      if (user.styleDna.preferredFit) setSelectedFit(user.styleDna.preferredFit)
      else setSelectedFit('Regular')

      if (user.styleDna.brands?.length) setSelectedBrands(user.styleDna.brands)

      if (user.styleDna.undertone) setUndertone(user.styleDna.undertone)
      if (user.styleDna.skinDepth) setSkinDepth(user.styleDna.skinDepth)
      if (user.styleDna.bodyType) setBodyType(user.styleDna.bodyType)
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

  const calculateCompletion = () => {
    let completed = 0;
    if (selectedStyles.length > 0) completed++;
    if (bodyType) completed++;
    if (undertone) completed++;
    if (skinDepth) completed++;
    if (selectedColors.length > 0) completed++;
    if (selectedFit) completed++;
    if (selectedBrands.length > 0) completed++;
    return Math.round((completed / 7) * 100);
  }

  const completionPercent = calculateCompletion()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg('')
    try {
      const styleDna = {
        archetypes: selectedStyles,
        preferredColors: selectedColors,
        preferredFit: selectedFit,
        brands: selectedBrands,
        undertone,
        skinDepth,
        bodyType
      }
      const res = await api.put('/auth/preferences', { styleDna })
      if (res.success) {
        const isEditing = user?.styleDna?.archetypes?.length > 0
        window.location.href = isEditing ? '/profile' : '/dashboard'
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save preferences')
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

        {errorMsg && (
          <div style={{ background: '#FDECEA', color: '#E74C3C', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Style Personality */}
          <section className="style-section animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
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

          {/* Body Type */}
          <section className="style-section animate-fade-in-up" style={{ animationDelay: '0.06s' }}>
            <h2 className="section-title heading-italic">Body Type</h2>
            <div className="fit-options">
              {bodyTypeOptions.map(bType => (
                <button type="button" key={bType.value} className={`fit-option ${bodyType === bType.value ? 'active' : ''}`} onClick={() => setBodyType(bType.value)} style={{ minWidth: '100px' }}>
                  <div className="fit-icon">
                    <svg width="40" height="60" viewBox="0 0 40 60">
                      {bType.value === 'hourglass' && <path d="M12 15 Q20 30 12 45 L28 45 Q20 30 28 15 Z" fill="currentColor" opacity="0.4"/>}
                      {bType.value === 'pear' && <path d="M16 15 L24 15 L32 45 L8 45 Z" fill="currentColor" opacity="0.4"/>}
                      {bType.value === 'apple' && <ellipse cx="20" cy="30" rx="14" ry="16" fill="currentColor" opacity="0.4"/>}
                      {bType.value === 'rectangle' && <rect x="12" y="15" width="16" height="30" fill="currentColor" opacity="0.4"/>}
                      {bType.value === 'inverted triangle' && <path d="M8 15 L32 15 L24 45 L16 45 Z" fill="currentColor" opacity="0.4"/>}
                      {bType.value === 'petite' && <rect x="14" y="24" width="12" height="21" fill="currentColor" opacity="0.4"/>}
                      {bType.value === 'tall' && <rect x="15" y="12" width="10" height="36" fill="currentColor" opacity="0.4"/>}
                      {bType.value === 'average' && <rect x="13" y="15" width="14" height="30" rx="2" fill="currentColor" opacity="0.4"/>}
                      <circle cx="20" cy="8" r="5" fill="currentColor" opacity="0.5" />
                    </svg>
                  </div>
                  <span className="fit-label">{bType.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Skin Undertone */}
          <section className="style-section animate-fade-in-up" style={{ animationDelay: '0.07s' }}>
            <h2 className="section-title heading-italic">Skin Undertone</h2>
            <div className="color-grid">
              {undertoneOptions.map(tone => (
                <div key={tone.value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div
                    className={`color-swatch ${undertone === tone.value ? 'selected' : ''}`}
                    style={{ backgroundColor: tone.hex }}
                    onClick={() => setUndertone(tone.value)}
                    title={tone.label}
                  >
                    {undertone === tone.value && <span className="swatch-check">✓</span>}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{tone.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Skin Depth */}
          <section className="style-section animate-fade-in-up" style={{ animationDelay: '0.08s' }}>
            <h2 className="section-title heading-italic">Skin Depth</h2>
            <div className="color-grid">
              {skinDepthOptions.map(depth => (
                <div key={depth.value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div
                    className={`color-swatch ${skinDepth === depth.value ? 'selected' : ''}`}
                    style={{ backgroundColor: depth.hex }}
                    onClick={() => setSkinDepth(depth.value)}
                    title={depth.label}
                  >
                    {skinDepth === depth.value && <span className="swatch-check">✓</span>}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{depth.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Color Preferences */}
          <section className="style-section animate-fade-in-up" style={{ animationDelay: '0.09s' }}>
            <h2 className="section-title heading-italic">Preferred Clothing Colors</h2>
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
