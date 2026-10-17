import express, { Application } from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes';
import resourceRoutes from './routes/resource.routes';
import bookingRoutes from './routes/booking.routes';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import { authenticate } from './middleware/authenticate';

import { globalLimiter } from './middleware/rateLimit';

const app: Application = express();

app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(globalLimiter);

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/resources', authenticate, resourceRoutes);
app.use('/api/bookings', authenticate, bookingRoutes);

app.use((req, res) => {
    res.status(404).json({status: 404, message: `Route ${req.method} ${req.originalUrl} not found`});
})
app.use(errorHandler);

export default app;