import { Request, Response } from 'express';
import { getUserMemory, recordTechPreference } from '../services/memoryService';
import { performSemanticSearch } from '../services/semanticSearchService';
import { processMeetingTranscript, getMeetingNotes } from '../services/meetingNotesService';

// Long-Term Memory
export async function getMemoryHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || req.query.userId || '60d0fe4f5311236168a109ca';
    const memory = await getUserMemory(String(userId));
    return res.json({ success: true, memory });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function savePreferenceHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || req.body.userId || '60d0fe4f5311236168a109ca';
    const { category, value } = req.body;
    const memory = await recordTechPreference(String(userId), category, value);
    return res.json({ success: true, memory });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Semantic Search
export async function searchHandler(req: Request, res: Response) {
  try {
    const { projectId, query } = req.query;
    if (!projectId || !query) {
      return res.status(400).json({ success: false, message: 'projectId and query are required' });
    }
    const results = await performSemanticSearch(String(projectId), String(query));
    return res.json({ success: true, query, totalResults: results.length, results });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// AI Meeting Notes
export async function uploadMeetingNoteHandler(req: Request, res: Response) {
  try {
    const { projectId, title, transcript } = req.body;
    if (!projectId || !transcript) {
      return res.status(400).json({ success: false, message: 'projectId and transcript are required' });
    }
    const data = await processMeetingTranscript(projectId, title, transcript);
    return res.json({ success: true, ...data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMeetingNotesHandler(req: Request, res: Response) {
  try {
    const { projectId } = req.params;
    const notes = await getMeetingNotes(projectId);
    return res.json({ success: true, notes });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
