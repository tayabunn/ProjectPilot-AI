import { Router } from 'express';
import { analyzePRD, streamChat, generateContent, downloadReportPDF, reviewPR, getRecommendations, getDailyStandup, getExecutiveReport } from '../controllers/aiController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken as any);

router.post('/analyze-prd', analyzePRD as any);
router.post('/chat', streamChat as any);
router.post('/generate-content', generateContent as any);
router.get('/reports/:id/pdf', downloadReportPDF as any);
router.post('/review-pr', reviewPR as any);
router.post('/recommendations', getRecommendations as any);
router.get('/standup/:projectId', getDailyStandup as any);
router.post('/executive-report', getExecutiveReport as any);

export default router;
