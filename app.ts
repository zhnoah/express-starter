import express from 'express';
import authRoutes from './routes/auth';
import authenticateToken from './middleware/authenticateToken';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);

// 受保护的路由示例
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: `Hello ${(req as any).user.userId}, this is a protected route!` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API server is running on port ${PORT}`);
});
