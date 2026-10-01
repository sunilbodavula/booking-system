import express, { Application } from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.routes';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use('/api', healthRoutes);

export default app;