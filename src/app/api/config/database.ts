// const mysql = require('mysql2/promise');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require('mongoose');
import 'dotenv/config'; // Load environment variables from .env file

// MySQL Connection Pool
// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

// Check MySQL connection
// pool.getConnection()
//     .then(connection => {
//         console.log('MySQL connection successful');
//         connection.release(); // Release connection
//     })
//     .catch(err => {
//         console.error('MySQL connection failed:', err);
//     });

// Modified MongoDB Connection
let mongoInitialized = false;

const connectMongoDB = async () => {
    try {
        let mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error('MONGO_URI environment variable is not set');
        }
        if (!mongoURI.includes('directConnection=true')) {
            mongoURI += mongoURI.includes('?') ? '&directConnection=true' : '?directConnection=true';
        }

        await mongoose.connect(mongoURI, {
            autoIndex: false, // Disable automatic index creation
        });

        if (!mongoInitialized) {
            console.log('Using existing MongoDB connection');
            mongoInitialized = true;
        }

    } catch (error) {
        console.error('MongoDB connection failed:', error);
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
};

// Export connections
module.exports = {
    mongoose,
    connectMongoDB, // Export connection function
    // Lazy import to avoid build-time connection issues
    get initMongoDB() {
        return require('./initMongoDB');
    }
};
