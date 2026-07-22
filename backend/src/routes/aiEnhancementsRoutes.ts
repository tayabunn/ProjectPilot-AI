import { Router } from 'express';
import {
  getMemoryHandler,
  savePreferenceHandler,
  searchHandler,
  uploadMeetingNoteHandler,
  getMeetingNotesHandler
} from '../controllers/aiEnhancementsController';

const router = Router();

router.get('/memory', getMemoryHandler);
router.post('/memory', savePreferenceHandler);
router.get('/search', searchHandler);
router.post('/meeting-notes', uploadMeetingNoteHandler);
router.get('/meeting-notes/:projectId', getMeetingNotesHandler);

export default router;
