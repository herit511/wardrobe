import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import './AddItem.css'

const categories = ['top', 'bottom', 'footwear', 'outerwear']
const subCategories = {
  top: ['shirt', 'tshirt', 'vest'],
  bottom: ['jeans', 'trousers', 'cargo', 'shorts'],
  footwear: ['sneakers', 'formal_shoes', 'boots', 'slides'],
  outerwear: ['coat', 'blazer', 'hoodie', 'jacket', 'sweater'],
}
const fits = ['slim', 'regular', 'relaxed', 'oversized', 'boxy']
const patterns = ['solid', 'striped', 'checked', 'graphic', 'printed']
const occasionOptions = ['casual', 'party', 'office', 'streetwear', 'gym', 'ethnic']
const seasonOptions = ['summer', 'monsoon', 'winter', 'all_season']
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
    category: 'outerwear',
    subCategory: 'coat',
    color: '#D4A882',
    pattern: 'solid',
    fit: 'oversized',
    occasion: ['casual'],
    season: ['winter'],
    condition: 'new',
  })

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result)
        setScanning(true)
        // Simulate AI scanning
        setTimeout(() => {
          setScanning(false)
          setScanned(true)
        }, 2000)
      }
      reader.readAsDataURL(file)
    }
  }

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
    formData.append('pattern', form.pattern)
    formData.append('fit', form.fit)
    formData.append('condition', form.condition)
    form.occasion.forEach(o => formData.append('occasion', o))
    form.season.forEach(s => formData.append('season', s))

    try {
      const res = await api.post('/items', formData)
      if (res.success) {
        navigate('/closet')
      } else {
        setError(res.message || 'Failed to save item')
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
                  <div className="upload-icon">📸</div>
                  <h3>Drag & drop your photo here</h3>
                  <p>or click to browse</p>
                  <span className="upload-formats">Supports JPG, PNG, JPEG</span>
                </div>
              ) : (
                <div className="upload-preview-wrapper">
                  <img src={preview} alt="Preview" className="upload-preview-img" />
                  {scanning && (
                    <div className="scan-overlay">
                      <div className="scan-line"></div>
                      <div className="scan-text">
                        <span className="sparkle">✨</span> AI is Scanning...
                      </div>
                      <p className="scan-desc">Identifying fabric weight, color palette, and silhouette details.</p>
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
                <h2><span className="sparkle">✨</span> AI-Detected Details</h2>
                {scanned && <span className="badge badge-orange">AI Analyzed</span>}
              </div>
              {error && <div className="error-message" style={{ color: '#E87040', marginBottom: '1rem', padding: '0 20px', fontSize: '0.9rem' }}>{error}</div>}

              <div className="details-grid">
                <div className="form-group">
                  <label>
                    Category
                    {scanned && <span className="ai-badge">AI Suggested</span>}
                  </label>
                  <select
                    className="input-field"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: subCategories[e.target.value]?.[0] || '' })}
                    id="category-select"
                  >
                    {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Sub-Category
                    {scanned && <span className="ai-badge">AI Suggested</span>}
                  </label>
                  <select
                    className="input-field"
                    value={form.subCategory}
                    onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
                    id="subcategory-select"
                  >
                    {(subCategories[form.category] || []).map(sc => (
                      <option key={sc} value={sc}>{sc.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Color
                    {scanned && <span className="ai-badge">AI Suggested</span>}
                  </label>
                  <div className="color-picker-row">
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="color-input"
                      id="color-picker"
                    />
                    <input
                      type="text"
                      className="input-field"
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Pattern
                    {scanned && <span className="ai-badge">AI Suggested</span>}
                  </label>
                  <select
                    className="input-field"
                    value={form.pattern}
                    onChange={(e) => setForm({ ...form, pattern: e.target.value })}
                    id="pattern-select"
                  >
                    {patterns.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Fit
                    {scanned && <span className="ai-badge">AI Suggested</span>}
                  </label>
                  <select
                    className="input-field"
                    value={form.fit}
                    onChange={(e) => setForm({ ...form, fit: e.target.value })}
                    id="fit-select"
                  >
                    {fits.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Occasion</label>
                <div className="multi-chips">
                  {occasionOptions.map(o => (
                    <button
                      key={o}
                      type="button"
                      className={`chip ${form.occasion.includes(o) ? 'active' : ''}`}
                      onClick={() => toggleMultiSelect('occasion', o)}
                    >
                      {o.charAt(0).toUpperCase() + o.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Season</label>
                <div className="multi-chips">
                  {seasonOptions.map(s => (
                    <button
                      key={s}
                      type="button"
                      className={`chip ${form.season.includes(s) ? 'active' : ''}`}
                      onClick={() => toggleMultiSelect('season', s)}
                    >
                      {s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
