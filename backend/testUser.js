const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
require('dotenv').config();

const testUser = async () => {
    await connectDB();

    try {
        // Test 1: Create a user
        const user = new User({
            username: 'testuser',
            email: 'test@exapmple.com',
            password: 'password123',
            bio: 'I love books!',
        });

        await user.save();
        console.log('User saved:', user);

        // Test 2 verify password hashing
        console.log('Is password hashed:', user.password !== 'password123');

        // Test 3 test comparePassword method
        const isMatch = await user.comparePassword('password123');
        console.log('Password match:', isMatch);

        // Duplicate user
        const duplicateUser = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: 'anotherpass',
        });

        try {
            await duplicateUser.save();
        } catch (error) {
            console.log('Duplicate username error:', error.message);
        }

        console.log('Favorites default:', user.favorites);
        console.log('Books added count default:', user.booksAddedCount);
        console.log('Timestamps:', user.createdAt, user.updatedAt);

    } catch (error) {
        console.error('Error:', err.message);
    } finally {
        mongoose.connection.close();
    }
};

testUser();