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

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats')
      if (res.success) setStats(res.data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const categoryLabels = {
    top: 'Tops',
    bottom: 'Bottoms',
    footwear: 'Footwear',
    outerwear: 'Outerwear'
  }
  const categoryColors = {
    top: 'var(--color-orange)',
    bottom: 'var(--color-amber)',
    footwear: 'var(--color-navy)',
    outerwear: 'var(--color-text-muted)'
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayEmojis = ['👔', '👕', '🧥', '👗', '👖', '👟', '🎽']

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
          <button className="btn btn-secondary" id="edit-profile-btn">Edit Profile</button>
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
          {/* Wardrobe Insights */}
          <div className="card profile-card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
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

          {/* Account Settings */}
          <div className="card profile-card animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <div className="card-header">
              <h3>⚙️ Account Settings</h3>
            </div>
            <div className="settings-list">
              <div className="settings-row">
                <span className="settings-label">Email</span>
                <span className="settings-value">{user?.email}</span>
              </div>
              <div className="settings-row">
                <span className="settings-label">Password</span>
                <span className="settings-value">••••••••••••</span>
                <button className="btn btn-ghost btn-xs">Change</button>
              </div>
            </div>
          </div>

          {/* Style DNA */}
          <div className="card profile-card animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="card-header">
              <h3>🧬 Style DNA</h3>
              <button className="btn btn-ghost btn-xs" onClick={() => navigate('/style-profile')}>Edit</button>
            </div>
            <div className="style-dna-content">
              <div className="dna-row">
                <span className="dna-label">Archetypes</span>
                <div className="dna-tags">
                  <span className="badge badge-orange">Minimalist</span>
                  <span className="badge badge-orange">Classic</span>
                </div>
              </div>
              <div className="dna-row">
                <span className="dna-label">Preferred Colors</span>
                <div className="dna-colors">
                  {['#1A1A1A', '#F5F5F5', '#1B2A4A', '#D4C4A8', '#6B7F4A'].map(c => (
                    <div key={c} className="dna-color-dot" style={{ backgroundColor: c }}></div>
                  ))}
                </div>
              </div>
              <div className="dna-row">
                <span className="dna-label">Preferred Fit</span>
                <span className="badge badge-amber">Regular</span>
              </div>
            </div>
          </div>

          {/* Recent Outfit History */}
          <div className="card profile-card full-width animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
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
                      {/* All outfit item thumbnails */}
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
                      {/* Outfit info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1B2A4A' }}>{entry.title}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6B7B8D' }}>{entry.occasion}</div>
                      </div>
                      {/* Date */}
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

          {/* Preferences / Notifications */}
          <div className="card profile-card full-width animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
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
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="pref-row">
                <div>
                  <div className="pref-title">Weekly Wardrobe Tips</div>
                  <div className="pref-desc">Style tips based on your wardrobe analysis</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="pref-row">
                <div>
                  <div className="pref-title">Trend Alerts</div>
                  <div className="pref-desc">Get notified about new fashion trends</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="danger-zone animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <button className="btn btn-ghost logout-btn" id="logout-btn" onClick={() => { logout(); navigate('/login'); }}>Log Out</button>
          <button className="btn btn-ghost danger-btn" id="delete-account-btn">Delete Account</button>
        </div>
      </div>
    </div>
  )
}

export default Profile
