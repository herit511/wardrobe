import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Sparkles, Pipette } from 'lucide-react'
import CustomSelect from '../components/CustomSelect'
import { api } from '../api'
import { colorMap } from '../utils'
import './AddItem.css'

const categories = ['top', 'bottom', 'footwear', 'outerwear', 'accessories']
const subCategories = {
  top: ['shirt', 'tshirt', 'polo', 'vest'],
  bottom: ['jeans', 'trousers', 'cargo', 'shorts', 'joggers'],
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
  const bulkFileRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('single')
  const [hasExistingItems, setHasExistingItems] = useState(true)
  const [bulkFiles, setBulkFiles] = useState([])
  const [bulkPreviewUrls, setBulkPreviewUrls] = useState([])
  const [bulkDrafts, setBulkDrafts] = useState([])
  const [bulkImporting, setBulkImporting] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [bulkMessage, setBulkMessage] = useState('')
  const [bulkStep, setBulkStep] = useState('select')
  const [bulkEditingId, setBulkEditingId] = useState(null)

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

  useEffect(() => {
    let isActive = true

    const loadClosetState = async () => {
      try {
        const res = await api.get('/items?limit=1&page=1')
        if (!isActive) return

        const totalItems = res.pagination?.total || 0
        const hasItems = totalItems > 0
        setHasExistingItems(hasItems)

        if (!hasItems) {
          setMode('bulk')
        }
      } catch (err) {
        if (isActive) {
          setHasExistingItems(true)
        }
      }
    }

    loadClosetState()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    return () => {
      bulkPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [bulkPreviewUrls])

  const resetMode = (nextMode) => {
    setMode(nextMode)
    setError('')
    setBulkMessage('')
    setBulkStep('select')
    setBulkEditingId(null)
  }

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
                'cargo pants': ['bottom', 'cargo'], 'joggers': ['bottom', 'joggers'],
                'sweatpants': ['bottom', 'joggers'], 'jacket': ['outerwear', 'jacket'],
                'blazer': ['outerwear', 'blazer'], 'suit jacket': ['outerwear', 'blazer'],
                'denim jacket': ['outerwear', 'jacket'], 'leather jacket': ['outerwear', 'jacket'],
                'bomber jacket': ['outerwear', 'jacket'], 'trench coat': ['outerwear', 'coat'],
                'overcoat': ['outerwear', 'coat'], 'parka': ['outerwear', 'coat'],
                'cardigan': ['outerwear', 'sweater'], 'vest': ['top', 'vest'],
                'ring': ['accessories', 'ring'], 'chain': ['accessories', 'chain'],
                'watch': ['accessories', 'watch'], 'belt': ['accessories', 'belt'],
                'cap': ['accessories', 'cap'],
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

  const handleBulkFileChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 20)

    setError('')
    setBulkMessage('')
    setBulkDrafts([])
    setBulkStep('select')
    setBulkEditingId(null)
    bulkPreviewUrls.forEach((url) => URL.revokeObjectURL(url))
    setBulkFiles(files)
    setBulkPreviewUrls(files.map((file) => URL.createObjectURL(file)))
  }

  const handleBulkSubmit = async (e) => {
    e.preventDefault()

    if (!bulkFiles.length) {
      setError('Please choose at least one image to import.')
      return
    }

    setBulkImporting(true)
    setError('')
    setBulkMessage('')

    const formData = new FormData()
    bulkFiles.forEach((file) => {
      formData.append('images', file)
    })

    try {
      const res = await api.post('/items/bulk-preview', formData)
      if (res.success) {
        setBulkDrafts(res.data || [])
        setBulkStep('review')
        setBulkEditingId(null)
        setBulkMessage(`Reviewed ${res.summary?.analyzed ?? res.data?.length ?? 0} item${(res.summary?.analyzed ?? res.data?.length ?? 0) === 1 ? '' : 's'}. Remove anything you do not want to save.`)
      } else {
        setError(res.message || 'Failed to import your items.')
      }
    } catch (err) {
      setError(err.message || 'Failed to import your items.')
    } finally {
      setBulkImporting(false)
    }
  }

  const removeBulkDraft = (clientId) => {
    const index = bulkDrafts.findIndex((draft) => draft.clientId === clientId)
    if (index < 0) return

    if (bulkEditingId === clientId) {
      setBulkEditingId(null)
    }

    setBulkDrafts((prev) => prev.filter((draft) => draft.clientId !== clientId))

    setBulkFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
    setBulkPreviewUrls((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index)
      return next
    })
  }

  const openBulkEditor = (clientId) => {
    setBulkEditingId((prev) => (prev === clientId ? null : clientId))
  }

  const updateBulkDraft = (clientId, updates) => {
    setBulkDrafts((prev) => prev.map((draft) => {
      if (draft.clientId !== clientId) return draft

      const nextDraft = { ...draft, ...updates }

      if (Object.prototype.hasOwnProperty.call(updates, 'category')) {
        nextDraft.subCategory = subCategories[updates.category]?.[0] || nextDraft.subCategory
      }

      return nextDraft
    }))
  }

  const toggleBulkDraftMultiSelect = (clientId, field, value) => {
    setBulkDrafts((prev) => prev.map((draft) => {
      if (draft.clientId !== clientId) return draft

      const currentValues = Array.isArray(draft[field]) ? draft[field] : []
      const nextValues = currentValues.includes(value)
        ? currentValues.filter((entry) => entry !== value)
        : [...currentValues, value]

      return { ...draft, [field]: nextValues }
    }))
  }

  const handleBulkSave = async () => {
    if (!bulkDrafts.length) {
      setError('Add at least one reviewed item before saving.')
      return
    }

    setBulkSaving(true)
    setError('')
    setBulkMessage('')

    const formData = new FormData()
    bulkFiles.forEach((file) => {
      formData.append('images', file)
    })
    formData.append('items', JSON.stringify(bulkDrafts))

    try {
      const res = await api.post('/items/bulk-save', formData)
      if (res.success) {
        setBulkMessage(res.message || 'Saved your reviewed items.')
        setBulkFiles([])
        setBulkPreviewUrls([])
        setBulkDrafts([])
        setBulkStep('select')
        if (bulkFileRef.current) {
          bulkFileRef.current.value = ''
        }
        navigate('/closet')
      } else {
        setError(res.message || 'Failed to save your reviewed items.')
      }
    } catch (err) {
      setError(err.message || 'Failed to save your reviewed items.')
    } finally {
      setBulkSaving(false)
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
    if (submitting) return;
    
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
          <h1 className="page-title heading-italic">
            {mode === 'bulk' ? 'Set Up Your Closet Fast' : 'Curate Your Style'}
          </h1>
          <p className="page-subtitle">
            {mode === 'bulk'
              ? 'Upload multiple clothing photos once and let AI catalog them automatically.'
              : 'Upload a piece and let our AI handle the cataloging for you.'}
          </p>
          <div className="setup-toggle" role="tablist" aria-label="Add item mode">
            <button
              type="button"
              className={`setup-toggle-btn ${mode === 'bulk' ? 'active' : ''}`}
              onClick={() => resetMode('bulk')}
            >
              Bulk setup
            </button>
            <button
              type="button"
              className={`setup-toggle-btn ${mode === 'single' ? 'active' : ''}`}
              onClick={() => resetMode('single')}
            >
              Single item
            </button>
          </div>
          {!hasExistingItems && (
            <div className="first-run-banner">
              <strong>New account setup:</strong> import a few pieces at once so your closet is ready faster.
            </div>
          )}
        </div>

        {mode === 'bulk' ? (
          <form className="bulk-import-layout" onSubmit={handleBulkSubmit}>
            <div className="bulk-import-card card animate-fade-in-up">
              <div className="details-header">
                <h2 className="heading-italic" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={24} strokeWidth={1.5} className="sparkle" />
                  Bulk Closet Setup
                </h2>
                <span className="badge badge-orange">One-time setup</span>
              </div>
              {bulkStep === 'select' ? (
                <>
                  <p className="bulk-copy">
                    Drop multiple images, let the AI detect each item, then review them before saving.
                  </p>
                  <div
                    className="bulk-upload-zone"
                    onClick={() => bulkFileRef.current?.click()}
                  >
                    <Camera size={44} strokeWidth={1.5} />
                    <h3>Choose several wardrobe photos</h3>
                    <p>Supports JPG, PNG, and JPEG. You can add up to 20 images at once.</p>
                    <span className="upload-formats">Minimal work, auto-detected by AI</span>
                    <input
                      type="file"
                      ref={bulkFileRef}
                      accept="image/jpeg,image/png,image/jpg"
                      multiple
                      onChange={handleBulkFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>

                  {bulkPreviewUrls.length > 0 && (
                    <div className="bulk-preview-section">
                      <div className="bulk-preview-header">
                        <h3>Selected photos</h3>
                        <span>{bulkPreviewUrls.length} item{bulkPreviewUrls.length === 1 ? '' : 's'}</span>
                      </div>
                      <div className="bulk-preview-grid">
                        {bulkPreviewUrls.map((url, index) => (
                          <div className="bulk-preview-item" key={`${url}-${index}`}>
                            <img src={url} alt={`Selected upload ${index + 1}`} />
                            <span>{bulkFiles[index]?.name || `Item ${index + 1}`}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {error && <div className="error-message" style={{ color: '#E87040', marginTop: '1rem' }}>{error}</div>}
                  {bulkMessage && <div className="success-message">{bulkMessage}</div>}

                  <div className="details-actions">
                    <button
                      type={bulkFiles.length > 0 ? 'submit' : 'button'}
                      className="btn btn-primary"
                      disabled={bulkImporting}
                      onClick={() => {
                        if (!bulkFiles.length) {
                          bulkFileRef.current?.click()
                        }
                      }}
                    >
                      {bulkImporting
                        ? 'Reviewing...'
                        : bulkFiles.length > 0
                          ? `Review ${bulkFiles.length} Item${bulkFiles.length === 1 ? '' : 's'}`
                          : 'Choose Files'}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => navigate('/closet')}>
                      Go to Closet
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="bulk-copy">
                    Review the AI-detected details below. Remove anything you do not want before saving.
                  </p>

                  {bulkMessage && <div className="success-message">{bulkMessage}</div>}
                  {error && <div className="error-message" style={{ color: '#E87040', marginTop: '1rem' }}>{error}</div>}

                  <div className="bulk-review-grid">
                    {bulkDrafts.map((draft) => {
                      const itemIndex = bulkDrafts.findIndex((candidate) => candidate.clientId === draft.clientId)
                      const isEditing = bulkEditingId === draft.clientId
                      return (
                        <div className={`bulk-review-card ${isEditing ? 'editing' : ''}`} key={draft.clientId}>
                          <div className="bulk-review-image-wrap">
                            <img src={bulkPreviewUrls[itemIndex]} alt={draft.fileName} />
                            <div className="bulk-card-actions">
                              <button
                                type="button"
                                className="bulk-edit-btn"
                                onClick={() => openBulkEditor(draft.clientId)}
                                title="Edit this item"
                              >
                                {isEditing ? 'Close' : 'Edit'}
                              </button>
                              <button
                                type="button"
                                className="bulk-remove-btn"
                                onClick={() => removeBulkDraft(draft.clientId)}
                                title="Remove this item"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="bulk-review-body">
                            <strong className="bulk-review-title">{draft.fileName}</strong>
                            <div className="bulk-review-meta">
                              <span className="badge badge-orange">{draft.category}</span>
                              <span>{draft.subCategory.replace('_', ' ')}</span>
                            </div>
                            <div className="bulk-review-swatches">
                              <span className="bulk-color-swatch" style={{ backgroundColor: draft.color }} />
                              <span>{draft.color}</span>
                            </div>
                            <div className="bulk-review-tags">
                              <span>{draft.fit || 'regular'} fit</span>
                              <span>{(draft.pattern || 'solid').replace('_', ' ')}</span>
                            </div>
                            <p className="bulk-review-small">Occasion: {draft.occasion.join(', ')}</p>
                            <p className="bulk-review-small">Weather: {draft.weather.join(', ')}</p>

                            {isEditing && (
                              <div className="bulk-edit-panel">
                                <div className="bulk-edit-panel-header">
                                  <h4>Edit Item</h4>
                                  <button 
                                    type="button" 
                                    className="btn btn-ghost" 
                                    style={{ padding: '6px 12px', fontSize: '0.85rem' }} 
                                    onClick={() => setBulkEditingId(null)}
                                  >
                                    Done
                                  </button>
                                </div>

                                <div className="bulk-edit-grid">
                                  <div className="form-group">
                                    <label>Category</label>
                                    <CustomSelect
                                      options={categories.map((c) => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))}
                                      value={draft.category}
                                      onChange={(val) => updateBulkDraft(draft.clientId, { category: val })}
                                      id={`bulk-category-${draft.clientId}`}
                                    />
                                  </div>

                                  <div className="form-group">
                                    <label>Sub-Category</label>
                                    <CustomSelect
                                      options={(subCategories[draft.category] || []).map((sc) => ({ value: sc, label: sc.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) }))}
                                      value={draft.subCategory}
                                      onChange={(val) => updateBulkDraft(draft.clientId, { subCategory: val })}
                                      id={`bulk-subcategory-${draft.clientId}`}
                                    />
                                  </div>

                                  <div className="form-group">
                                    <label>Color</label>
                                    <div className="bulk-edit-color-row">
                                      <input
                                        type="color"
                                        value={draft.color}
                                        onChange={(e) => updateBulkDraft(draft.clientId, { color: e.target.value })}
                                        className="custom-color-picker"
                                      />
                                      <span className="bulk-edit-color-value">{draft.color}</span>
                                    </div>
                                  </div>

                                  <div className="form-group">
                                    <label>Fit</label>
                                    <CustomSelect
                                      options={fits.map((f) => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))}
                                      value={draft.fit || ''}
                                      onChange={(val) => updateBulkDraft(draft.clientId, { fit: val })}
                                      id={`bulk-fit-${draft.clientId}`}
                                    />
                                  </div>

                                  <div className="form-group">
                                    <label>Pattern</label>
                                    <CustomSelect
                                      options={patterns.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))}
                                      value={draft.pattern || 'solid'}
                                      onChange={(val) => updateBulkDraft(draft.clientId, { pattern: val })}
                                      id={`bulk-pattern-${draft.clientId}`}
                                    />
                                  </div>

                                  <div className="form-group">
                                    <label>Condition</label>
                                    <div className="bulk-edit-chip-row">
                                      {conditions.map((condition) => (
                                        <button
                                          key={condition}
                                          type="button"
                                          className={`chip ${draft.condition === condition ? 'active' : ''}`}
                                          onClick={() => updateBulkDraft(draft.clientId, { condition })}
                                        >
                                          {condition.charAt(0).toUpperCase() + condition.slice(1)}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="form-group bulk-edit-section">
                                  <label>Occasion</label>
                                  <div className="bulk-edit-chip-row">
                                    {occasionOptions.map((occ) => (
                                      <button
                                        key={occ.value}
                                        type="button"
                                        className={`chip ${(draft.occasion || []).includes(occ.value) ? 'active' : ''}`}
                                        onClick={() => toggleBulkDraftMultiSelect(draft.clientId, 'occasion', occ.value)}
                                      >
                                        {occ.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="form-group bulk-edit-section">
                                  <label>Weather</label>
                                  <div className="bulk-edit-chip-row">
                                    <button
                                      type="button"
                                      className={`chip ${(draft.weather || []).length === 3 ? 'active' : ''}`}
                                      onClick={() => updateBulkDraft(draft.clientId, { weather: (draft.weather || []).length === 3 ? [] : ['hot', 'mild', 'cold'] })}
                                    >
                                      All Season
                                    </button>
                                    {weatherOptions.map((weather) => (
                                      <button
                                        key={weather}
                                        type="button"
                                        className={`chip ${(draft.weather || []).includes(weather) && (draft.weather || []).length < 3 ? 'active' : ''}`}
                                        onClick={() => toggleBulkDraftMultiSelect(draft.clientId, 'weather', weather)}
                                      >
                                        {weather.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="details-actions">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setBulkStep('select')}
                      disabled={bulkSaving}
                    >
                      Back to upload
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleBulkSave}
                      disabled={bulkSaving || bulkDrafts.length === 0}
                    >
                      {bulkSaving ? 'Saving...' : `Save ${bulkDrafts.length} Item${bulkDrafts.length === 1 ? '' : 's'}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>
        ) : (
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
                    {colorMap.filter(c => ['#000000', '#FFFFFF', '#1B2A4A', '#808080', '#D2B48C', '#E87040', '#ffd700'].includes(c.hex.toLowerCase())).map(c => (
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
        )}
      </div>
    </div>
  )
}

export default AddItem
