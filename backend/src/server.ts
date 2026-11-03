// @ts-ignore -- @types/express is not installed in this project.
import express from 'express';
// @ts-ignore -- @types/cors is not installed in this project.
import cors from 'cors';
// @ts-ignore -- the route module is not currently resolvable by TypeScript.
import propertyRouter from './routes/property.routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api', propertyRouter);

// Health check endpoint
app.get('/', (req: any, res: any) => {
  res.json({ message: 'Avenue Stays & Properties API is running successfully' });
});

const PORT = (globalThis as any).process?.env?.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});