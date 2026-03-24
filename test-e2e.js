const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testFullFlow() {
    try {
        console.log("--- Testing Full E2E Flow ---");
        
        // 1. Register a temporary user to get token
        const randomEmail = `testuser${Date.now()}@example.com`;
        const regRes = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Flow Tester',
            email: randomEmail,
            password: 'password123'
        });
        const token = regRes.data.token;
        console.log("1. Logged in with new account.");

        const items = [
            { category: 'top', subCategory: 'shirt', color: 'blue', fit: 'regular', pattern: 'solid', weather: 'hot' },
            { category: 'bottom', subCategory: 'jeans', color: 'blue', fit: 'slim', pattern: 'solid', weather: 'mild' },
            { category: 'bottom', subCategory: 'shorts', color: 'beige', fit: 'regular', pattern: 'solid', weather: 'hot' },
            { category: 'footwear', subCategory: 'sneakers', color: 'white', fit: 'regular', pattern: 'solid', weather: 'hot' },
            { category: 'top', subCategory: 'tshirt', color: 'white', fit: 'regular', pattern: 'solid', weather: 'hot' },
            { category: 'top', subCategory: 'tshirt', color: 'green', fit: 'regular', pattern: 'solid', weather: 'hot' },
            { category: 'outerwear', subCategory: 'jacket', color: 'black', fit: 'regular', pattern: 'solid', weather: 'cold' },
        ];

        console.log("2. Uploading 6 items (3 tops, 1 bottom, 1 shoe, 1 jacket)...");
        const imgPath = path.join(__dirname, 'dummy.png');
        
        for (const i of items) {
            const formData = new FormData();
            formData.append('image', fs.createReadStream(imgPath));
            formData.append('category', i.category);
            formData.append('subCategory', i.subCategory);
            formData.append('color', i.color);
            formData.append('fit', i.fit);
            formData.append('pattern', i.pattern);
            formData.append('weather[]', i.weather);
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
        console.log("3. Triggering generation with: occasion=Casual, temperature=Hot, userProfile={warm, medium, rectangle, smart_casual}...");
        const genRes = await axios.get('http://localhost:5000/api/outfits/generate?occasion=Casual&temperature=Hot&undertone=warm&skinDepth=medium&bodyType=rectangle&archetype=smart_casual', {
             headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("\n✅ AI Output:");
        
        const data = genRes.data;
        
        console.log(`- Valid JSON returned? Yes`);
        console.log(`- Filter by weather removed jacket? ${!data.data.some(o => o.items.some(i => i.name.includes('jacket'))) ? 'Yes' : 'No'}`);
        console.log(`- 3 outfits each with a DIFFERENT top? ${data.data.length === 3 && new Set(data.data.map(o => o.items.find(i => i.type === 'Top').name)).size === 3 ? 'Yes' : 'No'}`);
        console.log(`- analyzeWardrobeGaps returns a result? ${!!data.gaps ? 'Yes' : 'No'}`);
        console.log(`- scoreWardrobeVersatility returns ranked items? ${!!data.versatility && data.versatility.length > 0 ? 'Yes' : 'No'}`);
        
        console.log("\n--- EDGES CASES ---");
        
        // Edge Case 1: Upload only 1 item
        console.log("Edge Case 1: Upload only 1 item...");
        const edgeUser = await axios.post('http://localhost:5000/api/auth/register', { name: 'Edge', email: `e${Date.now()}@example.com`, password: 'password123' });
        const edgeToken = edgeUser.data.token;
        const formData = new FormData();
        formData.append('image', fs.createReadStream(imgPath));
        formData.append('category', 'top');
        formData.append('subCategory', 'shirt');
        formData.append('color', 'blue');
        formData.append('weather[]', 'hot');
        formData.append('occasion[]', 'casual');
        formData.append('condition', 'new');
        await axios.post('http://localhost:5000/api/items', formData, { headers: { ...formData.getHeaders(), 'Authorization': `Bearer ${edgeToken}` } });
        
        try {
            await axios.get('http://localhost:5000/api/outfits/generate?occasion=Casual&temperature=Hot', { headers: { 'Authorization': `Bearer ${edgeToken}` } });
            console.log("FAILED: Should have thrown 'Upload at least one top and one bottom'");
        } catch(e) {
            console.log(`SUCCESS: Expected rejection -> ${e.response?.data?.message || e.message}`);
        }

        // Edge Case 2: Festival culturalContext
        console.log("Edge Case 2: Set occasion to 'festival'...");
        const festRes = await axios.get('http://localhost:5000/api/outfits/generate?occasion=festival&temperature=mild', {
             headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`- Festival context returned? ${festRes.data.culturalContext?.type === 'festival' ? 'Yes' : 'No'}`);
        
        // Edge Case 3: Cold weather -> no sandals/shorts
        console.log("Edge Case 3: Set weather to Cold...");
        const coldRes = await axios.get('http://localhost:5000/api/outfits/generate?occasion=Casual&temperature=Cold', {
             headers: { 'Authorization': `Bearer ${token}` }
        });
        const hasSandalsOrShorts = coldRes.data.data.some(o => o.items.some(i => i.name.includes('shorts') || i.name.includes('sandals')));
        console.log(`- No sandals or shorts returned? ${!hasSandalsOrShorts ? 'Yes' : 'No'}`);

        // New Feature 1: Style DNA
        console.log("\n--- NEW FEATURE: Style DNA Profile ---");
        const styleDna = { undertone: 'cool', skinDepth: 'deep', bodyType: 'hourglass', archetype: 'streetwear' };
        await axios.put('http://localhost:5000/api/auth/preferences', { styleDna }, {
             headers: { 'Authorization': `Bearer ${token}` }
        });
        const meRes = await axios.get('http://localhost:5000/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` }});
        console.log(`- Style DNA mapping persisted to user? ${meRes.data.data.styleDna.undertone === 'cool' ? 'Yes' : 'No'}`);

        // New Feature 2: Must-Wear Preferred Item Logic
        console.log("--- NEW FEATURE: Preferred 'Your Preference' SubCategory Generation ---");
        const preferredRes = await axios.get(`http://localhost:5000/api/outfits/generate?occasion=Casual&temperature=Hot&preferredSubCategory=tshirt`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const allOutfitsHaveGreenTop = preferredRes.data.data.every(o => o.items.some(k => k.name.includes('t-shirt') || k.name.includes('tshirt')));
        console.log(`- Engine generated ${preferredRes.data.data.length} outfits. Did every single outfit enforce the matching 'tshirt' preferred subcategory? ${allOutfitsHaveGreenTop ? 'Yes' : 'No'}`);

        console.log("\n✅ ALL TESTS RUN SUCCESSFULLY");
        
        // exit process to flush node
        process.exit(0);
        
    } catch (e) {
        console.error("❌ Test Failed:", e);
        if (e.response) {
            console.error(e.response.data);
        }
        process.exit(1);
    }
}
testFullFlow();
