import { Router } from 'express';
import { getGithubData, syncGithubData } from '../controllers/githubController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken as any);

router.get('/:projectId', getGithubData);
router.post('/:projectId/sync', syncGithubData);

export default router;
