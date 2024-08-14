import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// 注册接口
router.post('/register', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 检查用户是否已经存在
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: '账号已存在' });
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 创建新用户
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  // 返回新创建的用户（不包含密码）
  return res.status(201).json({ id: user.id, email: user.email });
});

// 登录接口
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 查找用户
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ message: '无效的用户名或密码' });
  }

  // 验证密码
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(400).json({ message: '无效的用户名或密码' });
  }

  // 生成 JWT
  const token = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: '1h' });

  // 返回 token
  return res.status(200).json({ token });
});

export default router;
