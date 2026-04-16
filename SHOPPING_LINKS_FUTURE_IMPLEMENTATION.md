# Future Implementation Details for Shopping Links in Wardrobe Advisor

## Problem Addressed
Previously, the fallback Wardrobe Advisor mapped AI-generated sentences like "No tops — add a white tee" to product categories, which resulted in shopping links missing or failing to render on the frontend because the string matching ("fuzzy matching") was too fragile.

## The Solution We Had Implemented

### Backend Approach (routes/outfitRoutes.js)
Instead of returning an array of items for each gap, we created a hardcoded dictionary that mapped the chosen occasion directly to an exact, high-converting Google Shopping search term (e.g. occasion 'ethnic' -> 'kurta churidar set'). The backend then called `fetchShoppingProducts` using this exact string and returned the unified list in a property called `topRecommendationLinks` inside `advisorFeedback`.

```javascript
// Added near the top of routes/outfitRoutes.js
const OCCASION_QUICK_WIN_SEARCH_TERMS = {
    'casual': "white t-shirt beige chinos",
    'office': "light blue dress shirt brown loafers",
    'business formal': "white dress shirt oxford shoes",
    'party': "burgundy shirt slim dark jeans",
    'date night': "olive green henley sweater",
    'gym': "athletic workout joggers",
    'wedding guest': "blazer dress chinos",
    'ethnic': "kurta churidar set",
    'pooja / puja': "white cream kurta",
    'festival': "designer kurta sherwani"
};

// In the /generate route, when outfitsToStyle.length === 0 or engineResults.success === false
let topRecommendationLinks = [];
try {
    const searchTarget = OCCASION_QUICK_WIN_SEARCH_TERMS[engineOccasion] || "everyday essentials";
    topRecommendationLinks = await fetchShoppingProducts(searchTarget, brands, fitPref);
} catch (e) {
    console.error("[Shopping Integration] Failed to retrieve products:", e.message);
}

// Then include topRecommendationLinks in the advisorFeedback object that gets returned to the client.
```

### Frontend Approach (client/src/pages/Suggestions.jsx)
We modified the Wardrobe Advisor UI to cleanly iterate over `advisorFeedback.topRecommendationLinks` without any complex filtering or mapping logic.

```jsx
{advisorFeedback?.topRecommendationLinks?.length > 0 ? (
  <div style={{ marginBottom: '30px' }}>
    <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94A3B8', marginBottom: '15px' }}>What To Add Next</h3>
    <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px', paddingLeft: '4px', WebkitOverflowScrolling: 'touch' }} className="hide-scrollbar">
      {advisorFeedback.topRecommendationLinks.map((link, linkIdx) => (
        <a key={linkIdx} href={link.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', minWidth: '140px', width: '140px', textDecoration: 'none', color: 'inherit', background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0, transition: 'transform 0.2s ease, box-shadow 0.2s ease' }} onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}} onMouseLeave={e => {e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'}}>
          <div style={{ height: '120px', width: '100%', background: `url(${link.thumbnail || 'https://via.placeholder.com/150'}) center/cover no-repeat`, borderBottom: '1px solid #f1f5f9' }}></div>
          <div style={{ padding: '10px' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{link.source}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1E293B', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3, marginBottom: '6px', height: '2.6em' }} title={link.title}>{link.title}</div>
            <div style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 600 }}>{link.price}</div>
          </div>
        </a>
      ))}
    </div>
  </div>
) : (
  <div style={{ marginBottom: '30px', padding: '20px', background: '#FAFAF8', borderRadius: '8px', borderLeft: '4px solid #94A3B8' }}>
    <p style={{ margin: 0, color: '#6B7B8D', fontSize: '0.9rem' }}>Your basics are covered — adding variety in colours and styles will unlock new looks.</p>
  </div>
)}
```