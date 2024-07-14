import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDB } from './database/db.js'; // Importing named export connectDB

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "https://bloggg-git-main-sanjidas-projects-c5c31e10.vercel.app/", 
  methods: ["POST", "GET"], 
  credentials: true 
}));

app.options('*', cors()); 

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
    res.send('Server is running');
});


import Router from './routes/route.js';
app.use('/', Router);

const PORT = process.env.PORT || 8000;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;


connectDB(username, password)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running successfully on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err.message);
    process.exit(1); // Ensure to exit the process if the database connection fails
  });
