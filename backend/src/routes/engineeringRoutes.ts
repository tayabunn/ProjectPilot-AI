import { Router } from 'express';
import { getBurndownPrediction, getSmartAssignment, triggerReprioritization } from '../controllers/engineeringController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken as any);

router.get('/burndown/:projectId', getBurndownPrediction as any);
router.get('/assignment/:taskId', getSmartAssignment as any);
router.post('/reprioritize/:projectId', triggerReprioritization as any);

export default router;
