import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { Media } from './models/Media.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Real-time Socket.IO Engine
initSocket(server);

// Database Connection
connectDB();

// Trust reverse proxy (e.g. Render / Heroku / Nginx) for HTTPS headers
app.set('trust proxy', 1);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);

// Support large payloads (up to 50 MB) for high-resolution images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded local images statically
const uploadsStaticPath = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsStaticPath)) {
  fs.mkdirSync(uploadsStaticPath, { recursive: true });
}
// Serve uploaded images: first check disk cache; if missing (e.g. after Render redeploy), seamlessly fetch from MongoDB Atlas Media
app.use('/uploads', express.static(uploadsStaticPath));
app.get('/uploads/:filename', async (req, res, next) => {
  try {
    const filename = req.params.filename;
    const diskPath = path.join(uploadsStaticPath, filename);

    // 1. If exists on disk cache
    if (fs.existsSync(diskPath)) {
      return res.sendFile(diskPath);
    }

    // 2. Fallback to MongoDB Atlas permanent storage
    const media = await Media.findOne({ filename });
    if (media && media.data) {
      // Re-hydrate disk cache for subsequent requests
      try {
        fs.writeFileSync(diskPath, media.data);
      } catch (writeErr) {
        // Non-blocking
      }
      res.set('Content-Type', media.contentType || 'image/jpeg');
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(media.data);
    }

    // 3. If file not found anywhere
    return res.status(404).send('Upload not found');
  } catch (err) {
    next(err);
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: "Ni'maah Luxe",
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);

// Serve Built React Frontend in Production (Render / Railway single-service deploy)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(
    express.static(frontendDistPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
      },
    })
  );

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
      return next();
    }
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(
    `[Ni'maah Luxe Server] Running on port ${PORT} with Socket.IO enabled in ${process.env.NODE_ENV || 'development'} mode`
  );
});
