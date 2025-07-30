import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileUploadRouter } from './routes/fileUpload';
import { interviewRouter } from './routes/interview';
import { errorHandler, notFound } from './middleware/errorHandler';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Check if OpenAI API key is set
if (process.env.OPENAI_API_KEY) {
  console.log('OpenAI API key is set. Using real OpenAI API for interview questions.');
} else {
  console.warn('Warning: OpenAI API key is not set. Using mock data for development.');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/upload', fileUploadRouter);
app.use('/api/interview', interviewRouter);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Interview Question Generator API' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Start server
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`API Endpoints:\n- GET /\n- POST /api/upload/resume\n- POST /api/interview/generate`);
  console.log('='.repeat(50));
  console.log('Press Ctrl+C to stop the server');
});

// Handle server errors
server.on('error', (error: any) => {
  console.error('='.repeat(50));
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please choose a different port.`);
  } else {
    console.error('Server error:', error);
  }
  console.error('='.repeat(50));
  process.exit(1);
});
