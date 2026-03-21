const fs = require('fs');

const API_BASE = 'http://localhost:5000/api';
const dummyEmail = `uploadtest${Date.now()}@example.com`;

async function testUpload() {
  console.log('--- Testing Item Upload API ---');
  
  // 1. Create a 1x1 base64 PNG
  const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  
  // 2. Register user to get token
  try {
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Upload User', email: dummyEmail, password: 'password123' })
    });
    const regData = await regRes.json();
    const token = regData.token;

    // 3. Upload item using native FormData and Blob
    const form = new FormData();
    const blob = new Blob([buffer], { type: 'image/png' });
    form.append('image', blob, 'dummy.png');
    form.append('category', 'top');
    form.append('subCategory', 'tshirt');
    form.append('color', 'red');
    form.append('condition', 'new');
    form.append('occasion', 'casual');
    form.append('weather', 'hot');

    console.log('Uploading item...');
    const uploadRes = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: form
    });
    
    if (!uploadRes.ok) throw new Error(await uploadRes.text());
    const uploadData = await uploadRes.json();
    console.log(`✅ Upload successful. Item ID: ${uploadData.data._id}`);
    console.log(`✅ Cloudinary URL: ${uploadData.data.imageUrl}`);

  } catch (err) {
    console.error('❌ Upload failed:', err.message);
    process.exit(1);
  }
}

testUpload();
