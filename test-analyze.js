const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

async function testAnalyze() {
    try {
        // Create a dummy image
        const imgPath = path.join(__dirname, 'dummy.jpg');
        if (!fs.existsSync(imgPath)) {
            // Write a tiny valid base64 1x1 jpeg
            const base64Data = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";
            fs.writeFileSync(imgPath, Buffer.from(base64Data, 'base64'));
        }

        // Register a temporary user to get a token
        const randomEmail = `testuser${Date.now()}@example.com`;
        const regRes = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: randomEmail,
            password: 'password123'
        });
        const token = regRes.data.token;
        console.log("Logged in:", !!token);

        // Upload to analyze
        const formData = new FormData();
        formData.append('image', fs.createReadStream(imgPath));
        
        console.log("Sending to /analyze...");
        const res = await axios.post('http://localhost:5000/api/items/analyze', formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("Analyze Response:", res.data);

        // Try posting to /api/items
        const formData2 = new FormData();
        formData2.append('image', fs.createReadStream(imgPath));
        formData2.append('category', 'top');
        formData2.append('subCategory', 'tshirt');
        formData2.append('fit', 'regular');
        formData2.append('pattern', 'solid');
        formData2.append('color', '#000000');
        formData2.append('condition', 'new');
        formData2.append('occasion', 'Casual');
        formData2.append('season', 'summer');

        console.log("Sending to /api/items...");
        const saveRes = await axios.post('http://localhost:5000/api/items', formData2, {
            headers: {
                ...formData2.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("Save Response:", saveRes.data);

    } catch (e) {
        console.error("Error Details:", e.response ? e.response.data : e.message);
    }
}
testAnalyze();
