const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function seedUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'test@test.com';
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name: 'Test User',
                email: email,
                password: '123456'
            });
            await user.save();
            console.log("Successfully created test@test.com with password 123456");
        } else {
            console.log("User already exists. Updating password to 123456");
            user.password = '123456';
            await user.save();
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedUser();
