const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testOutfits() {
    try {
        console.log("--- Testing AI Outfit Generator ---");
        
        // 1. Register a temporary user to get token
        const randomEmail = `testuser${Date.now()}@example.com`;
        const regRes = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Style Tester',
            email: randomEmail,
            password: 'password123'
        });
        const token = regRes.data.token;
        console.log("Logged in with new account.");

        // 2. Add 5 items to their wardrobe so AI has enough to work with
        const items = [
            { category: 'top', subCategory: 'tshirt', color: '#000000', fit: 'regular', pattern: 'solid', season: 'summer' },
            { category: 'top', subCategory: 'hoodie', color: '#808080', fit: 'oversized', pattern: 'graphic', season: 'winter' },
            { category: 'bottom', subCategory: 'jeans', color: '#000080', fit: 'slim', pattern: 'solid', season: 'all_season' },
            { category: 'bottom', subCategory: 'shorts', color: '#F5F5DC', fit: 'regular', pattern: 'solid', season: 'summer' },
            { category: 'footwear', subCategory: 'sneakers', color: '#FFFFFF', fit: 'regular', pattern: 'solid', season: 'all_season' },
            { category: 'outerwear', subCategory: 'jacket', color: '#000000', fit: 'regular', pattern: 'solid', season: 'winter' },
        ];

        console.log("Populating 6 dummy items to closet...");
        const imgPath = path.join(__dirname, 'dummy.png');
        
        for (const i of items) {
            const formData = new FormData();
            formData.append('image', fs.createReadStream(imgPath));
            formData.append('category', i.category);
            formData.append('subCategory', i.subCategory);
            formData.append('color', i.color);
            formData.append('fit', i.fit);
            formData.append('pattern', i.pattern);
            formData.append('season[]', i.season);
            formData.append('occasion[]', 'casual');
            formData.append('condition', 'new');

            await axios.post('http://localhost:5000/api/items', formData, {
                headers: { 
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${token}` 
                }
            });
        }
        
        // 3. Trigger Generation
        console.log("Asking Gemini AI for Outfits...");
        const genRes = await axios.get('http://localhost:5000/api/outfits/generate?occasion=Casual&temperature=mild', {
             headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("\n✅ AI Output:");
        console.log(JSON.stringify(genRes.data, null, 2));

    } catch (e) {
        console.error("❌ Test Failed:", e);
        if (e.response) {
            console.error(e.response.data);
        }
    }
}
testOutfits();
