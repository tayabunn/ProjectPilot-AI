import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import User from '../models/User';

export const authorizeRoles = (...roles: ('admin' | 'member' | 'guest')[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User context missing' });
    }

    try {
      const userRecord = await User.findById(req.user.id);
      if (!userRecord) {
        return res.status(404).json({ error: 'User record not found' });
      }

      if (!roles.includes(userRecord.role)) {
        return res.status(403).json({ error: `Forbidden: Access restricted to roles: [${roles.join(', ')}]` });
      }

      next();
    } catch (err: any) {
      next(err);
    }
  };
};
