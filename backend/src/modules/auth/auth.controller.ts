import { Request, Response } from 'express';
import { authService } from './auth.service';
import { asyncHandler } from '../../middlewares/errorHandler';
import { AuthRequest } from '../../middlewares/auth';

class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    
    const result = await authService.register(username, email, password);
    
    res.status(201).json({
      status: 'success',
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    const result = await authService.login(email, password);
    
    res.json({
      status: 'success',
      data: result,
    });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    
    const tokens = await authService.refresh(refreshToken);
    
    res.json({
      status: 'success',
      data: tokens,
    });
  });

  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { refreshToken } = req.body;
    
    const result = await authService.logout(userId, refreshToken);
    
    res.json({
      status: 'success',
      data: result,
    });
  });

  me = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    
    const user = await authService.getCurrentUser(userId);
    
    res.json({
      status: 'success',
      data: { user },
    });
  });
}

export const authController = new AuthController();
