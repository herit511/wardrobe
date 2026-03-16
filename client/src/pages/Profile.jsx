import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { getColorName } from '../utils'
import './Profile.css'

function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Edit Profile State
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  
  // Change Password State
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })

  // Preferences State
  const [preferences, setPreferences] = useState({
    dailySuggestion: true,
    weeklyTips: true,
    trendAlerts: false
  })

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email })
      if (user.preferences) {
        setPreferences({
          dailySuggestion: user.preferences.dailySuggestion ?? true,
          weeklyTips: user.preferences.weeklyTips ?? true,
          trendAlerts: user.preferences.trendAlerts ?? false
        })
      }
    }
    fetchStats()
  }, [user])

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats')
      if (res.success) setStats(res.data)
    } catch (err) { console.error('Failed to load stats:', err) }
    finally { setLoading(false) }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put('/auth/profile', profileForm)
      if (res.success) {
        setEditingProfile(false)
        window.location.reload() // Reload to refresh AuthContext
      }
    } catch (err) { alert(err.response?.data?.message || 'Update failed') }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword.length < 6) return alert("New password must be at least 6 characters.")
    try {
      const res = await api.put('/auth/password', passwordForm)
      if (res.success) {
        alert('Password updated successfully')
        setChangingPassword(false)
        setPasswordForm({ currentPassword: '', newPassword: '' })
      }
    } catch (err) { alert(err.response?.data?.message || 'Password update failed') }
  }

  const handleTogglePreference = async (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] }
    setPreferences(newPrefs)
    try {
      await api.put('/auth/preferences', { preferences: newPrefs })
    } catch (err) {
      // revert on failure
      setPreferences(preferences)
      console.error('Failed to update preferences:', err)
    }
  }

  const handleDeleteAccount = async () => {
    const confirm = window.confirm('Are you strictly sure you want to delete your account? This action cannot be undone and all data will be lost.')
    if (confirm) {
      try {
        await api.del('/auth/account')
        logout()
        navigate('/login')
      } catch (err) { alert('Failed to delete account') }
    }
  }

  const categoryLabels = { top: 'Tops', bottom: 'Bottoms', footwear: 'Footwear', outerwear: 'Outerwear' }
  const categoryColors = { top: 'var(--color-orange)', bottom: 'var(--color-amber)', footwear: 'var(--color-navy)', outerwear: 'var(--color-text-muted)' }
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="profile-page" id="profile-page">
      <div className="container">
        {/* Profile Header */}
        <section className="profile-header-section animate-fade-in-up">
          <div className="profile-avatar-lg">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="profile-info">
            <h1 className="profile-name heading-italic">{user?.name || 'User'}</h1>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-member">Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => setEditingProfile(!editingProfile)}>
            {editingProfile ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </section>

        {/* Stats */}
        <section className="profile-stats animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="profile-stat">
            <div className="stat-value">{loading ? '-' : (stats?.totalItems || 0)}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="profile-stat">
            <div className="stat-value">{loading ? '-' : (stats?.totalTimesWorn || 0)}</div>
            <div className="stat-label">Outfits Worn</div>
          </div>
          <div className="profile-stat">
            <div className="stat-value-text">{loading ? '-' : (stats?.totalOutfits || 0)} Saved</div>
            <div className="stat-label">Outfits</div>
          </div>
        </section>

        <div className="profile-grid">
          {/* 1. Recent Outfit History — FULL WIDTH ON TOP */}
          <div className="card profile-card full-width animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-header">
              <h3>📅 Recent Outfit History</h3>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              {stats && stats.recentWornHistory.length > 0 ? (
                stats.recentWornHistory.map((entry, i) => {
                  const d = new Date(entry.date)
                  return (
                    <div key={i} style={{ 
                      display: 'flex', alignItems: 'center', gap: '15px', 
                      padding: '12px 0', 
                      borderBottom: i < stats.recentWornHistory.length - 1 ? '1px solid #eee' : 'none' 
                    }}>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        {entry.items && entry.items.map((item, j) => (
                          <div key={j} style={{ 
                            width: '50px', height: '50px', borderRadius: '8px', 
                            backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : 'none',
                            backgroundSize: 'cover', backgroundPosition: 'center',
                            backgroundColor: '#F5E6D3', border: '2px solid #fff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }} title={`${item.category} - ${item.subCategory}`}></div>
                        ))}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1B2A4A' }}>{entry.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6B7B8D' }}>{entry.occasion}</div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7B8D', flexShrink: 0 }}>
                        {dayNames[d.getDay()]}, {d.toLocaleDateString()}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div style={{ color: '#6B7B8D', padding: '20px 0', textAlign: 'center' }}>
                  {loading ? 'Loading...' : 'No outfits worn yet. Wear your first outfit!'}
                </div>
              )}
            </div>
          </div>

          {/* 2. Wardrobe Insights — LEFT side */}
          <div className="card profile-card animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <div className="card-header">
              <h3>📊 Wardrobe Insights</h3>
            </div>
            <div className="insights-content">
              <div className="insight-chart">
                <h4>Category Distribution</h4>
                <div className="distribution-bars">
                  {stats && Object.entries(stats.categoryDistribution).length > 0 ? (
                    Object.entries(stats.categoryDistribution).map(([cat, pct]) => (
                      <div className="dist-row" key={cat}>
                        <span className="dist-label">{categoryLabels[cat] || cat}</span>
                        <div className="dist-bar-track"><div className="dist-bar-fill" style={{ width: `${pct}%`, background: categoryColors[cat] || 'var(--color-orange)' }}></div></div>
                        <span className="dist-percent">{pct}%</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#6B7B8D', padding: '10px 0' }}>
                      {loading ? 'Loading...' : 'Add items to see your distribution'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Style DNA — RIGHT side */}
          <div className="card profile-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-header">
              <h3>🧬 Style DNA</h3>
              <button className="btn btn-ghost btn-xs" onClick={() => navigate('/style-profile')}>Edit</button>
            </div>
            <div className="style-dna-content">
              <div className="dna-row">
                <span className="dna-label">Archetypes</span>
                <div className="dna-tags">
                  {user?.styleDna?.archetypes?.length > 0 ? (
                    user.styleDna.archetypes.map(arc => <span key={arc} className="badge badge-orange">{arc}</span>)
                  ) : (
                    <span className="badge badge-orange">Minimalist</span>
                  )}
                </div>
              </div>
              <div className="dna-row">
                <span className="dna-label">Preferred Colors</span>
                <div className="dna-colors">
                  {user?.styleDna?.preferredColors?.length > 0 ? (
                    user.styleDna.preferredColors.map(c => <div key={c} className="dna-color-dot" style={{ backgroundColor: c }}></div>)
                  ) : (
                    ['#1A1A1A', '#F5F5F5', '#1B2A4A', '#D4C4A8', '#6B7F4A'].map(c => <div key={c} className="dna-color-dot" style={{ backgroundColor: c }}></div>)
                  )}
                </div>
              </div>
              <div className="dna-row">
                <span className="dna-label">Preferred Fit</span>
                <span className="badge badge-amber">{user?.styleDna?.preferredFit || 'Regular'}</span>
              </div>
            </div>
          </div>

          {/* 3. Account Settings — LEFT bottom */}
          <div className="card profile-card animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
            <div className="card-header">
              <h3>⚙️ Account Settings</h3>
            </div>
            
            <div className="settings-list">
              {editingProfile ? (
                <form onSubmit={handleUpdateProfile} style={{ padding: '0 20px 20px' }}>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label>Name</label>
                    <input type="text" className="form-control" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} required />
                  </div>
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label>Email</label>
                    <input type="email" className="form-control" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm">Save Profile</button>
                </form>
              ) : (
                <>
                  <div className="settings-row">
                    <span className="settings-label">Email</span>
                    <span className="settings-value">{user?.email}</span>
                  </div>
                  <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span className="settings-label">Password</span>
                      <span className="settings-value">••••••••••••</span>
                      <button className="btn btn-ghost btn-xs" onClick={() => setChangingPassword(!changingPassword)}>
                        {changingPassword ? 'Cancel' : 'Change'}
                      </button>
                    </div>
                    {changingPassword && (
                      <form onSubmit={handleChangePassword} style={{ width: '100%', marginTop: '10px', background: '#F8F9FA', padding: '15px', borderRadius: '8px' }}>
                        <input type="password" placeholder="Current Password" required value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} style={{ width: '100%', marginBottom: '10px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                        <input type="password" placeholder="New Password" required value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} style={{ width: '100%', marginBottom: '15px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                        <button type="submit" className="btn btn-primary btn-sm">Update Password</button>
                      </form>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 3. Preferences — RIGHT bottom */}
          <div className="card profile-card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="card-header">
              <h3>🔔 Preferences</h3>
            </div>
            <div className="preferences-list">
              <div className="pref-row">
                <div>
                  <div className="pref-title">Daily Outfit Suggestion</div>
                  <div className="pref-desc">Get a fresh outfit idea every morning</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={preferences.dailySuggestion} onChange={() => handleTogglePreference('dailySuggestion')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="pref-row">
                <div>
                  <div className="pref-title">Weekly Wardrobe Tips</div>
                  <div className="pref-desc">Style tips based on your wardrobe analysis</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={preferences.weeklyTips} onChange={() => handleTogglePreference('weeklyTips')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="pref-row">
                <div>
                  <div className="pref-title">Trend Alerts</div>
                  <div className="pref-desc">Get notified about new fashion trends</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={preferences.trendAlerts} onChange={() => handleTogglePreference('trendAlerts')} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="danger-zone animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <button className="btn btn-ghost logout-btn" id="logout-btn" onClick={() => { logout(); navigate('/login'); }}>Log Out</button>
          <button className="btn btn-ghost danger-btn" id="delete-account-btn" onClick={handleDeleteAccount}>Delete Account</button>
        </div>
      </div>
    </div>
  )
}

export default Profile
