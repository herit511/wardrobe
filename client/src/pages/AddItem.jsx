import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Sparkles, Pipette } from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import { api } from '../api'
import { colorMap } from '../utils'
import './AddItem.css'

const categories = ['top', 'bottom', 'footwear', 'outerwear', 'accessories']
const subCategories = {
  top: ['shirt', 'tshirt', 'polo', 'vest'],
  bottom: ['jeans', 'trousers', 'cargo', 'shorts'],
  footwear: ['sneakers', 'formal_shoes', 'boots', 'slides', 'sport'],
  outerwear: ['coat', 'blazer', 'hoodie', 'jacket', 'sweater'],
  accessories: ['ring', 'chain', 'watch', 'belt', 'cap'],
}
const fits = ['slim', 'regular', 'relaxed', 'oversized', 'boxy']
const patterns = ['solid', 'striped', 'checked', 'graphic', 'printed']
const occasionOptions = [
  { value: 'casual', label: 'Casual' },
  { value: 'office', label: 'Office' },
  { value: 'business formal', label: 'Business Formal' },
  { value: 'party', label: 'Party' },
  { value: 'date night', label: 'Date Night' },
  { value: 'gym', label: 'Gym' },
  { value: 'wedding guest', label: 'Wedding Guest' },
  { value: 'ethnic', label: 'Ethnic / Traditional' },
  { value: 'pooja / puja', label: 'Puja / Religious' },
  { value: 'festival', label: 'Festival' }
]
const weatherOptions = ['hot', 'mild', 'cold']
const conditions = ['new', 'good', 'worn']

function AddItem() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    category: '',
    subCategory: '',
    color: '#000000',
    pattern: '',
    fit: '',
    occasion: [],
    weather: [],
    condition: 'good',
  })

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result)
        setScanning(true)
        // Real AI Scanning with Gemini
        const analyzeImage = async (imageFile) => {
          try {
            const formData = new FormData();
            formData.append('image', imageFile);
            
            const res = await api.post('/items/analyze', formData);
            
            if (res.success && res.data) {
              const aiData = res.data;
              
              // Map AI name → category + subCategory
              const nameToCategory = {
                't-shirt': ['top', 'tshirt'], 'graphic tee': ['top', 'tshirt'], 'polo shirt': ['top', 'polo'],
                'shirt': ['top', 'shirt'], 'dress shirt': ['top', 'shirt'], 'blouse': ['top', 'shirt'],
                'tank top': ['top', 'vest'], 'crop top': ['top', 'vest'], 'sweater': ['outerwear', 'sweater'],
                'turtleneck': ['outerwear', 'sweater'], 'hoodie': ['outerwear', 'hoodie'],
                'sweatshirt': ['outerwear', 'hoodie'], 'jeans': ['bottom', 'jeans'],
                'slim jeans': ['bottom', 'jeans'], 'straight jeans': ['bottom', 'jeans'],
                'wide leg jeans': ['bottom', 'jeans'], 'chinos': ['bottom', 'trousers'],
                'trousers': ['bottom', 'trousers'], 'shorts': ['bottom', 'shorts'],
                'cargo pants': ['bottom', 'cargo'], 'joggers': ['bottom', 'trousers'],
                'sweatpants': ['bottom', 'trousers'], 'jacket': ['outerwear', 'jacket'],
                'blazer': ['outerwear', 'blazer'], 'suit jacket': ['outerwear', 'blazer'],
                'denim jacket': ['outerwear', 'jacket'], 'leather jacket': ['outerwear', 'jacket'],
                'bomber jacket': ['outerwear', 'jacket'], 'trench coat': ['outerwear', 'coat'],
                'overcoat': ['outerwear', 'coat'], 'parka': ['outerwear', 'coat'],
                'cardigan': ['outerwear', 'sweater'], 'vest': ['top', 'vest'],
                'sneakers': ['footwear', 'sneakers'], 'white sneakers': ['footwear', 'sneakers'],
                'chunky sneakers': ['footwear', 'sneakers'], 'loafers': ['footwear', 'formal_shoes'],
                'oxford shoes': ['footwear', 'formal_shoes'], 'derby shoes': ['footwear', 'formal_shoes'],
                'chelsea boots': ['footwear', 'boots'], 'ankle boots': ['footwear', 'boots'],
                'boots': ['footwear', 'boots'], 'sandals': ['footwear', 'slides'],
                'slides': ['footwear', 'slides'], 'heels': ['footwear', 'formal_shoes'],
                'block heels': ['footwear', 'formal_shoes'], 'mules': ['footwear', 'slides'],
                'flip flops': ['footwear', 'slides'],
              };

              // Map AI color name → hex
              const colorNameToHex = {
                'white': '#FFFFFF', 'black': '#000000', 'gray': '#808080', 'light gray': '#D3D3D3',
                'beige': '#F5F5DC', 'cream': '#FFFDD0', 'ivory': '#FFFFF0', 'off-white': '#FAF9F6',
                'camel': '#C19A6B', 'tan': '#D2B48C', 'taupe': '#483C32', 'charcoal': '#36454F',
                'brown': '#8B4513', 'dark brown': '#654321', 'navy': '#1B2A4A', 'blue': '#0000FF',
                'light blue': '#ADD8E6', 'royal blue': '#4169E1', 'sky blue': '#87CEEB',
                'cobalt': '#0047AB', 'denim': '#1560BD', 'green': '#008000', 'olive': '#808000',
                'khaki': '#F0E68C', 'forest green': '#228B22', 'sage': '#BCB88A', 'mint': '#98FF98',
                'emerald': '#50C878', 'red': '#FF0000', 'dark red': '#8B0000', 'crimson': '#DC143C',
                'maroon': '#800000', 'burgundy': '#800020', 'wine': '#722F37', 'pink': '#FFC0CB',
                'hot pink': '#FF69B4', 'blush': '#DE5D83', 'mauve': '#E0B0FF', 'rose': '#FF007F',
                'yellow': '#FFFF00', 'mustard': '#FFDB58', 'gold': '#FFD700', 'orange': '#FFA500',
                'coral': '#FF7F50', 'peach': '#FFCBA4', 'rust': '#B7410E', 'terracotta': '#E2725B',
                'purple': '#800080', 'lavender': '#E6E6FA', 'violet': '#8F00FF', 'plum': '#DDA0DD',
                'lilac': '#C8A2C8',
              };

              const matched = nameToCategory[(aiData.name || '').toLowerCase()];
              const hexColor = colorNameToHex[(aiData.color || '').toLowerCase()] || '#000000';
              // Map pattern — keep if it matches our enum, else use closest
              const patternMap = {
                'solid': 'solid', 'striped': 'striped', 'thin stripe': 'striped', 'wide stripe': 'striped',
                'checkered': 'checked', 'plaid': 'checked', 'tartan': 'checked', 'floral': 'printed',
                'small floral': 'printed', 'graphic': 'graphic', 'camo': 'printed',
                'animal': 'printed', 'paisley': 'printed', 'houndstooth': 'checked',
                'herringbone': 'checked', 'pinstripe': 'striped', 'polka': 'printed',
                'tie_dye': 'printed', 'geometric': 'graphic', 'abstract': 'graphic',
              };
              const mappedPattern = patternMap[(aiData.pattern || '').toLowerCase()] || 'solid';

              setForm(prev => ({
                ...prev,
                category: matched ? matched[0] : prev.category,
                subCategory: matched ? matched[1] : prev.subCategory,
                color: hexColor,
                pattern: mappedPattern,
                fit: aiData.fit || prev.fit,
                occasion: aiData.occasion || prev.occasion,
                weather: aiData.weather || prev.weather,
              }));
            }
          } catch (err) {
            console.error("AI Analysis Failed:", err);
            // Fallback manually if AI fails
          } finally {
            setScanning(false);
            setScanned(true);
          }
        };

        analyzeImage(file);
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEyeDropper = async () => {
    if (!window.EyeDropper) {
      alert('Your browser does not support the EyeDropper API');
      return;
    }
    const eyeDropper = new EyeDropper();
    try {
      const result = await eyeDropper.open();
      setForm(prev => ({ ...prev, color: result.sRGBHex }));
    } catch (e) {
      console.log('EyeDropper canceled or failed', e);
    }
  };

  const toggleMultiSelect = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!fileRef.current?.files?.[0]) {
      setError('Please upload an image of the item')
      return
    }

    setSubmitting(true)
    setError('')

    const formData = new FormData()
    formData.append('image', fileRef.current.files[0])
    formData.append('category', form.category)
    formData.append('subCategory', form.subCategory)
    formData.append('color', form.color)
    if (form.pattern) formData.append('pattern', form.pattern)
    if (form.fit) formData.append('fit', form.fit)
    formData.append('condition', form.condition)
    form.occasion.forEach(o => formData.append('occasion', o))
    form.weather.forEach(w => formData.append('weather', w))

    try {
      const res = await api.post('/items', formData)
      if (res.success) {
        navigate('/closet')
      } else {
        const errorMsg = res.errors ? res.errors.map(e => e.message).join('. ') : (res.message || 'Failed to save item');
        setError(errorMsg)
      }
    } catch (err) {
      setError(err.message || 'Failed to save item')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="additem-page" id="add-item-page">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <h1 className="page-title heading-italic">Curate Your Style</h1>
          <p className="page-subtitle">Upload a piece and let our AI handle the cataloging for you.</p>
        </div>

        <form className="additem-layout" onSubmit={handleSubmit}>
          {/* Left: Upload Area */}
          <div className="upload-area animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div
              className={`upload-zone card ${preview ? 'has-preview' : ''} ${scanning ? 'scanning' : ''}`}
              onClick={() => fileRef.current?.click()}
              id="upload-drop-zone"
            >
              {!preview ? (
                <div className="upload-placeholder">
                  <div className="upload-icon"><Camera size={48} strokeWidth={1.5} /></div>
                  <h3>Drag & drop your photo here</h3>
                  <p>or click to browse</p>
                  <span className="upload-formats">Supports JPG, PNG, JPEG</span>
                </div>
              ) : (
                <div className="upload-preview-wrapper" style={{ position: 'relative' }}>
                  <img src={preview} alt="Preview" className="upload-preview-img" style={{ borderRadius: '16px' }} />
                  {scanning && (
                    <div className="scan-overlay" style={{ borderRadius: '16px' }}>
                      <div className="scan-line"></div>
                      <div className="scan-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <Sparkles size={16} strokeWidth={1.5} className="sparkle" /> AI is Scanning...
                      </div>
                      <p className="scan-desc">Identifying fabric weight, color palette, and silhouette details.</p>
                    </div>
                  )}
                  {!scanning && (
                    <div className="edit-image-overlay" style={{ 
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer',
                      borderRadius: '16px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#1B2A4A', padding: '10px 20px', borderRadius: '24px', fontWeight: 600, fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                        <Camera size={16} strokeWidth={1.5} /> Change Photo
                      </span>
                    </div>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileRef}
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="file-input"
              />
            </div>
          </div>

          {/* Right: Details Form */}
          <div className="details-panel animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="card details-card">
              <div className="details-header">
                <h2 className="heading-italic" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sparkles size={24} strokeWidth={1.5} className="sparkle" /> AI-Detected Details</h2>
                {scanned && <span className="badge badge-orange">AI Analyzed</span>}
              </div>
              {error && <div className="error-message" style={{ color: '#E87040', marginBottom: '1rem', padding: '0 20px', fontSize: '0.9rem' }}>{error}</div>}

              <div className="details-grid">
                <div className="form-group">
                  <label>
                    Category
                    {scanned && <span className="ai-badge">AI Suggested</span>}
                  </label>
                  <CustomSelect
                    options={categories.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
                    value={form.category}
                    onChange={(val) => setForm({ ...form, category: val, subCategory: subCategories[val]?.[0] || '' })}
                    id="category-select"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Sub-Category
                    {scanned && <span className="ai-badge">AI Suggested</span>}
                  </label>
                  <CustomSelect
                    options={(subCategories[form.category] || []).map(sc => ({ value: sc, label: sc.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }))}
                    value={form.subCategory}
                    onChange={(val) => setForm({ ...form, subCategory: val })}
                    id="subcategory-select"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Color
                    {scanned && <span className="ai-badge">AI Suggested</span>}
                  </label>
                  <div className="color-picker-row" style={{ flexWrap: 'wrap' }}>
                    {colorMap.filter(c => ['#000000', '#FFFFFF', '#1B2A4A', '#808080', '#D2B48C', '#E87040'].includes(c.hex)).map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        className={`color-input ${form.color === c.hex ? 'active' : ''}`}
                        style={{ backgroundColor: c.hex, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                        onClick={() => setForm({ ...form, color: c.hex })}
                        title={c.name}
                      />
                    ))}
                    <input
                      type="color"
                      title="Custom Color Picker"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="custom-color-picker"
                    />
                    {window.EyeDropper && (
                      <button
                        type="button"
                        onClick={handleEyeDropper}
                        className="btn btn-ghost"
                        style={{ padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'var(--color-bg-warm)' }}
                        title="Pick color with eyedropper tool"
                      >
                        <Pipette size={18} strokeWidth={1.5} color="var(--color-navy)" />
                      </button>
                    )}
                    <div style={{ flex: '1 1 200px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '4px' }}>Or pick by name:</span>
                      <CustomSelect
                        options={[
                          { value: form.color, label: 'Custom / AI Matched' },
                          ...Array.from(new Set(colorMap.map(c => c.name))).sort().map(name => ({ value: colorMap.find(c => c.name === name).hex, label: name }))
                        ]}
                        value={form.color}
                        onChange={(val) => setForm({ ...form, color: val })}
                        id="color-name-select"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Pattern
                    {scanned && <span className="ai-badge">AI Suggested</span>}
                  </label>
                  <CustomSelect
                    options={patterns.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
                    value={form.pattern}
                    onChange={(val) => setForm({ ...form, pattern: val })}
                    id="pattern-select"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Fit
                    {scanned && <span className="ai-badge">AI Suggested</span>}
                  </label>
                  <CustomSelect
                    options={fits.map(f => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))}
                    value={form.fit}
                    onChange={(val) => setForm({ ...form, fit: val })}
                    id="fit-select"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Occasion</label>
                <div className="occasion-chips">
                  {occasionOptions.map(occ => (
                    <button
                      type="button"
                      key={occ.value}
                      className={`chip ${form.occasion.includes(occ.value) ? 'active' : ''}`}
                      onClick={() => toggleMultiSelect('occasion', occ.value)}
                      id={`additem-occ-${occ.value.replace(/ /g, '-')}`}
                    >
                      {occ.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Weather</label>
                <div className="multi-chips">
                    <button
                      key="all_season"
                      type="button"
                      className={`chip ${form.weather.length === 3 ? 'active' : ''}`}
                      onClick={() => setForm(prev => ({ ...prev, weather: prev.weather.length === 3 ? [] : ['hot', 'mild', 'cold'] }))}
                    >
                      All Season
                    </button>
                  {weatherOptions.map(w => (
                    <button
                      key={w}
                      type="button"
                      className={`chip ${form.weather.includes(w) && form.weather.length < 3 ? 'active' : ''}`}
                      onClick={() => toggleMultiSelect('weather', w)}
                    >
                      {w.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Condition</label>
                <div className="condition-radios">
                  {conditions.map(c => (
                    <label key={c} className={`condition-radio ${form.condition === c ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="condition"
                        value={c}
                        checked={form.condition === c}
                        onChange={(e) => setForm({ ...form, condition: e.target.value })}
                      />
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              <div className="details-actions">
                <button type="submit" className="btn btn-primary" id="save-item-btn" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save to Closet'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate('/closet')}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddItem
