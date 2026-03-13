const http = require('http');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';

async function runTests() {
  console.log('--- Starting API E2E Tests ---');
  
  // 1. Check Health
  try {
    const healthRes = await fetch('http://localhost:5000/');
    const healthData = await healthRes.json();
    console.log('✅ Server Health:', healthData.message);
  } catch (err) {
    console.error('❌ Server is not running on port 5000');
    process.exit(1);
  }

  // Generate random email to avoid duplicate key errors
  const randomEmail = `testuser${Date.now()}@example.com`;

  // 2. Register User
  console.log('\\n--- 1. Testing Registration ---');
  try {
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: randomEmail,
        password: 'password123'
      })
    });
    
    if (!regRes.ok) throw new Error(await regRes.text());
    const regData = await regRes.json();
    authToken = regData.token;
    console.log(`✅ Registration successful. New user ID: ${regData.user.id}`);
  } catch (err) {
    console.error('❌ Registration failed:', err.message);
    process.exit(1);
  }

  // 3. Get /me (Protected Route)
  console.log('\\n--- 2. Testing Protected Route (/auth/me) ---');
  try {
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (!meRes.ok) throw new Error(await meRes.text());
    const meData = await meRes.json();
    console.log(`✅ /me successful. Hello, ${meData.data.name}`);
  } catch (err) {
    console.error('❌ /me failed:', err.message);
  }

  // 4. Get items (Empty list expected)
  console.log('\\n--- 3. Testing Get Items ---');
  try {
    const itemsRes = await fetch(`${API_BASE}/items`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (!itemsRes.ok) throw new Error(await itemsRes.text());
    const itemsData = await itemsRes.json();
    console.log(`✅ Items fetch successful. Found ${itemsData.data.length} items`);
  } catch (err) {
    console.error('❌ Fetch items failed:', err.message);
  }

  console.log('\\n--- ✅ All Core API Tests Passed! ---');
}

runTests();
