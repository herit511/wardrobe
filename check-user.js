const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'test@test.com' });
        if (user) {
            console.log("User exists:", user.email);
            // Check password
            const isMatch = await user.matchPassword('123456');
            console.log("Password 123456 match:", isMatch);
        } else {
            console.log("User test@test.com DOES NOT EXIST in the database.");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUser();
