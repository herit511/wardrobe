import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera, Pencil } from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import { api } from '../api'
import { colorMap } from '../utils'
import './AddItem.css'

const categories = ['top', 'bottom', 'footwear', 'outerwear', 'accessories']
const subCategories = {
  top: ['shirt', 'tshirt', 'vest'],
  bottom: ['jeans', 'trousers', 'cargo', 'shorts'],
  footwear: ['sneakers', 'formal_shoes', 'boots', 'slides', 'sport'],
  outerwear: ['coat', 'blazer', 'hoodie', 'jacket', 'sweater'],
  accessories: ['ring', 'chain', 'watch', 'belt', 'cap'],
}
const fits = ['slim', 'regular', 'relaxed', 'oversized', 'boxy']
const patterns = ['solid', 'striped', 'checked', 'graphic', 'printed']
const occasionOptions = ['casual', 'party', 'office', 'streetwear', 'gym', 'ethnic']
const seasonOptions = ['summer', 'monsoon', 'winter', 'all_season']
const conditions = ['new', 'good', 'worn']

function EditItem() {
  const navigate = useNavigate()
  const { id } = useParams()
  const fileRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [newImageSelected, setNewImageSelected] = useState(false)

  const [form, setForm] = useState({
    category: 'top',
    subCategory: '',
    color: '#000000',
    pattern: 'solid',
    fit: 'regular',
    occasion: [],
    season: [],
    condition: 'good',
  })

  useEffect(() => {
    fetchItem()
  }, [id])

  const fetchItem = async () => {
    try {
      const res = await api.get(`/items/${id}`)
      if (res.success) {
        const item = res.data
        setForm({
          category: item.category || 'top',
          subCategory: item.subCategory || '',
          color: item.color || '#000000',
          pattern: item.pattern || 'solid',
          fit: item.fit || 'regular',
          occasion: item.occasion || [],
          season: item.season || [],
          condition: item.condition || 'good',
        })
        setPreview(item.imageUrl)
      }
    } catch (err) {
      setError('Failed to load item details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewImageSelected(true)
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result)
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
    setSubmitting(true)
    setError('')

    try {
      let res
      if (newImageSelected && fileRef.current?.files?.[0]) {
        // If a new image was uploaded, send as FormData
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
        res = await api.put(`/items/${id}`, formData)
      } else {
        // No new image, send JSON
        res = await api.put(`/items/${id}`, {
          category: form.category,
          subCategory: form.subCategory,
          color: form.color,
          pattern: form.pattern,
          fit: form.fit,
          condition: form.condition,
          occasion: form.occasion,
          season: form.season,
        })
      }

      if (res.success) {
        navigate('/closet')
      } else {
        setError(res.message || 'Failed to update item')
      }
    } catch (err) {
      setError(err.message || 'Failed to update item')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="additem-page" id="edit-item-page">
        <div className="container" style={{ textAlign: 'center', padding: '60px 0', color: '#1B2A4A' }}>
          Loading item details...
        </div>
      </div>
    )
  }

  return (
    <div className="additem-page" id="edit-item-page">
      <div className="container">
        <div className="page-header animate-fade-in-up">
          <h1 className="page-title heading-italic">Edit Item</h1>
          <p className="page-subtitle">Update the details of your clothing item.</p>
        </div>

        <form className="additem-layout" onSubmit={handleSubmit}>
          {/* Left: Image Preview */}
          <div className="upload-area animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div
              className={`upload-zone card has-preview`}
              onClick={() => fileRef.current?.click()}
              id="edit-upload-zone"
            >
              <div className="upload-preview-wrapper">
                {preview ? (
                  <img src={preview} alt="Preview" className="upload-preview-img" />
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon"><Camera size={48} strokeWidth={1.5} /></div>
                    <h3>No image available</h3>
                  </div>
                )}
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
              </div>
              <input
                type="file"
                ref={fileRef}
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="edit-file-input"
              />
            </div>
          </div>

          {/* Right: Details Form */}
          <div className="details-panel animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="card details-card">
              <div className="details-header">
                <h2 className="heading-italic" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Pencil size={24} strokeWidth={1.5} /> Item Details</h2>
              </div>
              {error && <div className="error-message" style={{ color: '#E87040', marginBottom: '1rem', padding: '0 20px', fontSize: '0.9rem' }}>{error}</div>}

              <div className="details-grid">
                <div className="form-group">
                  <label>Category</label>
                  <CustomSelect
                    options={categories.map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
                    value={form.category}
                    onChange={(val) => setForm({ ...form, category: val, subCategory: subCategories[val]?.[0] || '' })}
                    id="edit-category-select"
                  />
                </div>

                <div className="form-group">
                  <label>Sub-Category</label>
                  <CustomSelect
                    options={(subCategories[form.category] || []).map(sc => ({ value: sc, label: sc.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }))}
                    value={form.subCategory}
                    onChange={(val) => setForm({ ...form, subCategory: val })}
                    id="edit-subcategory-select"
                  />
                </div>

                <div className="form-group">
                  <label>Color</label>
                  <div className="color-picker-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
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
                      style={{ width: '32px', height: '32px', cursor: 'pointer', border: '1px solid var(--color-border)', borderRadius: '50%', padding: '0', background: 'none' }}
                    />
                    <div style={{ flex: '1 1 200px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#666', display: 'block', marginBottom: '4px' }}>Or pick by name:</span>
                      <CustomSelect
                        options={[
                          { value: form.color, label: 'Current Color' },
                          ...Array.from(new Set(colorMap.map(c => c.name))).sort().map(name => ({ value: colorMap.find(c => c.name === name).hex, label: name }))
                        ]}
                        value={form.color}
                        onChange={(val) => setForm({ ...form, color: val })}
                        id="edit-color-name-select"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Pattern</label>
                  <CustomSelect
                    options={patterns.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
                    value={form.pattern}
                    onChange={(val) => setForm({ ...form, pattern: val })}
                    id="edit-pattern-select"
                  />
                </div>

                <div className="form-group">
                  <label>Fit</label>
                  <CustomSelect
                    options={fits.map(f => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))}
                    value={form.fit}
                    onChange={(val) => setForm({ ...form, fit: val })}
                    id="edit-fit-select"
                  />
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
                <button type="submit" className="btn btn-primary" id="update-item-btn" disabled={submitting}>
                  {submitting ? 'Updating...' : '✓ Update Item'}
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

export default EditItem
