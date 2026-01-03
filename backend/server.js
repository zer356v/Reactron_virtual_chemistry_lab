import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Routes
import chemicalsRoute from './routes/chemicalsRoute.js';
import lessonsRoute from './routes/lessonsRoute.js';
import experimentRoute from './routes/experimentRoute.js';
import reactionRoute from './routes/reactionRoute.js';

// 🔥 IMPORTANT: Load dotenv FIRST
dotenv.config();

// 🔥 THEN import keepalive (needs env variables)
import './keepalive.js';

const app = express();
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

console.log("Loaded ENV:", {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_PUBLISHABLE_KEY
});

// Routes
app.use('/api/chemicals', chemicalsRoute);
app.use('/api/lessons', lessonsRoute);
app.use('/api/add-experiment', experimentRoute);
app.use('/api/reaction', reactionRoute);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});