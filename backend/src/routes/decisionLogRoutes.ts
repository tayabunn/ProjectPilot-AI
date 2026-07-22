import { Router } from 'express';
import { getDecisionLogs, createDecisionLog } from '../controllers/decisionLogController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken as any);

router.get('/:projectId', getDecisionLogs as any);
router.post('/', createDecisionLog as any);

export default router;
