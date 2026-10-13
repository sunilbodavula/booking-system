import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { getAuthUser } from '../middleware/authenticate';

export const register = async (req: Request, res: Response): Promise<void> => {
  res.status(201).json(await authService.register(req.body));
};

export const login = async (req: Request, res: Response): Promise<void> => {
  res.json(await authService.login(req.body));
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  res.json(await authService.refresh(req.body.refreshToken));
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  await authService.logout(req.body.refreshToken);
  res.status(204).send();
};

export const me = async (_req: Request, res: Response): Promise<void> => {
  res.json(await authService.getProfile(getAuthUser(res).id));
};