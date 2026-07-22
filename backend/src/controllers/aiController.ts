import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import Project from '../models/Project';
import Task from '../models/Task';
import { Roadmap, Milestone } from '../models/Roadmap';
import Document from '../models/Document';
import ChatSession from '../models/ChatSession';
import SprintHistory from '../models/SprintHistory';
import Report from '../models/Report';
import DecisionLog from '../models/DecisionLog';
import { GoogleGenAI } from '@google/genai';
import PDFDocument from 'pdfkit';
import { runMultiAgentPlanning } from '../services/langgraphAgent';
import { runScrumMasterAgent } from '../services/scrumMasterAgent';
import { runCodeReviewAgent } from '../services/codeReviewAgent';
import { runRecommendationEngine } from '../services/recommendationEngine';
import { runGapAnalysis } from '../services/gapAnalysisService';
import { runStackRecommendation } from '../services/stackRecommendationService';
import { generateDailyStandup } from '../services/standupService';
import { generateExecutiveReport, AudienceType } from '../services/executiveReportService';
import { calculateProjectHealth } from '../services/healthService';

const getAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// 1. AI Document Intelligence (PRD Multi-Agent Planner Pipeline)
export const analyzePRD = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, documentId } = req.body;

    if (!projectId || !documentId) {
      return res.status(400).json({ error: 'projectId and documentId are required' });
    }

    const project = await Project.findById(projectId);
    const doc = await Document.findById(documentId);

    if (!project || !doc) {
      return res.status(404).json({ error: 'Project or Document not found' });
    }

    const ai = getAIClient();
    if (!ai) {
      // Mock agent planning output if no API Key
      // Generate some dummy roadmap milestones and issues
      const roadmap = await Roadmap.findOneAndUpdate(
        { projectId },
        { goals: ['Setup basic infrastructure', 'Implement core user flow', 'Finalize API integrations'] },
        { new: true, upsert: true }
      );

      // Create a default milestone
      const milestone = new Milestone({
        roadmapId: roadmap._id,
        title: 'MVP Foundation',
        description: 'Complete basic structure based on PRD',
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'pending'
      });
      await milestone.save();

      // Create mock tasks
      const task1 = new Task({
        projectId,
        milestoneId: milestone._id,
        title: 'Set up Next.js frontend',
        description: 'Configure TypeScript, Tailwind CSS, and TanStack query dependencies.',
        status: 'todo',
        priority: 'high',
        storyPoints: 3,
        estimatedHours: 6,
        labels: ['frontend', 'setup']
      });
      await task1.save();

      const task2 = new Task({
        projectId,
        milestoneId: milestone._id,
        title: 'Configure Node/Express backend routes',
        description: 'Set up basic routing, model schemas, and error middlewares.',
        status: 'todo',
        priority: 'high',
        storyPoints: 5,
        estimatedHours: 10,
        labels: ['backend', 'setup']
      });
      await task2.save();

      project.status = 'active';
      await project.save();

      // Run Requirement Gap Analysis on extracted PRD text
      const gapResult = runGapAnalysis(doc.extractedText || '', ['Set up Next.js frontend', 'Configure Node/Express backend routes']);
      const gapReport = new Report({
        projectId,
        type: 'gap',
        title: 'AI Requirement Gap Analysis',
        summary: `Scanned ${gapResult.totalCategories} requirement categories. ${gapResult.coveredCount} covered, ${gapResult.missingCount} gaps detected. Coverage: ${gapResult.coveragePercent}%.`,
        details: gapResult
      });
      await gapReport.save();

      // Run Architecture Stack Recommendation
      const stackResult = runStackRecommendation(doc.extractedText || '', ['Set up Next.js frontend', 'Configure Node/Express backend routes']);
      const stackReport = new Report({
        projectId,
        type: 'stack',
        title: 'AI Architecture Recommendation',
        summary: `Recommended ${stackResult.recommendations.length} stack components with ${stackResult.overallConfidence}% overall confidence. Detected ${stackResult.prdSignals} PRD signals.`,
        details: stackResult
      });
      await stackReport.save();

      // Run Daily Standup Generation
      const mockTasks = await Task.find({ projectId });
      const standupResult = generateDailyStandup(mockTasks, project);
      const standupReport = new Report({
        projectId,
        type: 'standup',
        title: `Daily AI Standup - ${standupResult.date}`,
        summary: standupResult.summary,
        details: standupResult
      });
      await standupReport.save();

      // Create Initial AI Decision Logs
      await DecisionLog.create([
        {
          projectId,
          title: 'Authentication Prioritized',
          category: 'prioritization',
          reason: 'Payment and User Profile features depend directly on Authentication and Session Management.',
          confidence: 94,
          impact: 'high',
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        },
        {
          projectId,
          title: 'Timeline & Milestone Buffer Adjusted',
          category: 'timeline',
          reason: 'Added a 5-day contingency buffer due to potential API dependency delay.',
          confidence: 88,
          impact: 'medium',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ]);

      return res.json({
        success: true,
        message: 'Project successfully analyzed (Demo Mock Output)',
        milestonesCount: 1,
        tasksCount: 2
      });
    }

    // Call LLM executing LangGraph Multi-Agent logic
    const result = await runMultiAgentPlanning(doc.extractedText || '');

    // Update DB
    const roadmap = await Roadmap.findOneAndUpdate(
      { projectId },
      { goals: result.goals || [] },
      { new: true, upsert: true }
    );

    // Save Milestones
    await Milestone.deleteMany({ roadmapId: roadmap._id });
    const milestonePromises = (result.milestones || []).map((m: any, idx: number) => {
      return new Milestone({
        roadmapId: roadmap._id,
        title: m.title,
        description: m.description,
        targetDate: new Date(Date.now() + (idx + 1) * 14 * 24 * 60 * 60 * 1000),
        status: 'pending'
      }).save();
    });
    const savedMilestones = await Promise.all(milestonePromises);
    const mainMilestoneId = savedMilestones[0]?._id;

    // Save Tasks
    await Task.deleteMany({ projectId });
    const savedTaskMap = new Map<string, any>();
    
    // First pass: save the task documents (without DB dependencies)
    for (const t of (result.tasks || [])) {
      const newTask = new Task({
        projectId,
        milestoneId: mainMilestoneId,
        title: t.title,
        description: t.description,
        status: 'backlog',
        priority: t.priority || 'medium',
        storyPoints: t.storyPoints || 2,
        estimatedHours: t.estimatedHours || 4,
        labels: t.labels || [],
        acceptanceCriteria: t.acceptanceCriteria || [],
        dependencies: []
      });
      await newTask.save();
      savedTaskMap.set(t.id, newTask);
    }

    // Second pass: resolve dependencies using the savedTaskMap and update the task documents
    for (const t of (result.tasks || [])) {
      if (t.dependencies && t.dependencies.length > 0) {
        const dbTask = savedTaskMap.get(t.id);
        if (dbTask) {
          const resolvedIds = t.dependencies
            .map((depId: string) => savedTaskMap.get(depId)?._id)
            .filter(Boolean);
          
          if (resolvedIds.length > 0) {
            dbTask.dependencies = resolvedIds;
            await dbTask.save();
          }
        }
      }
    }

    // Save Risk Assessment as a Report
    const riskReport = new Report({
      projectId,
      type: 'risk',
      title: 'AI Multi-Agent Risk Analysis',
      summary: `Detected ${result.risks?.length || 0} critical delivery risks.`,
      details: { risks: result.risks || [] }
    });
    await riskReport.save();

    // Save Research Recommendations as a Report
    if (result.research) {
      const researchReport = new Report({
        projectId,
        type: 'project',
        title: 'AI Research & Architecture Audit',
        summary: `Extracted architectural style, technological stacks, and suggested best practices.`,
        details: result.research
      });
      await researchReport.save();
    }

    project.status = 'active';
    project.riskScore = result.risks?.length ? Math.min(100, result.risks.length * 20) : 10;
    await project.save();

    // Run Requirement Gap Analysis
    const taskTitles = (result.tasks || []).map((t: any) => t.title);
    const gapResult = runGapAnalysis(doc.extractedText || '', taskTitles);
    const gapReport = new Report({
      projectId,
      type: 'gap',
      title: 'AI Requirement Gap Analysis',
      summary: `Scanned ${gapResult.totalCategories} requirement categories. ${gapResult.coveredCount} covered, ${gapResult.missingCount} gaps detected. Coverage: ${gapResult.coveragePercent}%.`,
      details: gapResult
    });
    await gapReport.save();

    // Run Architecture Stack Recommendation
    const stackResult = runStackRecommendation(doc.extractedText || '', taskTitles);
    const stackReport = new Report({
      projectId,
      type: 'stack',
      title: 'AI Architecture Recommendation',
      summary: `Recommended ${stackResult.recommendations.length} stack components with ${stackResult.overallConfidence}% overall confidence. Detected ${stackResult.prdSignals} PRD signals.`,
      details: stackResult
    });
    await stackReport.save();

    // Run Daily Standup Generation
    const dbTasks = await Task.find({ projectId });
    const standupResult = generateDailyStandup(dbTasks, project);
    const standupReport = new Report({
      projectId,
      type: 'standup',
      title: `Daily AI Standup - ${standupResult.date}`,
      summary: standupResult.summary,
      details: standupResult
    });
    await standupReport.save();

    res.json({
      success: true,
      message: 'PRD parsed and loaded into planning backlog.',
      milestonesCount: savedMilestones.length,
      tasksCount: result.tasks?.length || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 2. AI Chat Companion (Streaming SSE + memory updates)
export const streamChat = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, message } = req.body;
    const userId = req.user?.id;

    if (!projectId || !message) {
      return res.status(400).json({ error: 'projectId and message are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    let session = await ChatSession.findOne({ projectId, userId });
    if (!session) {
      session = new ChatSession({ projectId, userId, messages: [] });
    }

    session.messages.push({ sender: 'user', content: message, timestamp: new Date() });

    const systemInstruction = `
      You are the AI Engineering Manager ("ProjectPilot") for the project: "${project.name}".
      Project Overview: ${project.description || 'No description provided'}.
      
      Respond directly to developer or stakeholder questions in an analytical, professional tone. Use neat Markdown.
      Wrap suggested short questions inside custom tags at the end of the text. Format exactly:
      [Suggest: Question?]
    `;

    const ai = getAIClient();
    if (!ai) {
      // Mock static reply for missing API keys
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.write(`data: ${JSON.stringify({ text: `This is a mock assistant response for **${project.name}**.\n\n[Suggest: What should we build next?]` })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const contents = session.messages.map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-1.5-flash',
      contents: contents,
      config: { systemInstruction, temperature: 0.7 }
    });

    let completeResponse = '';
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        completeResponse += text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    session.messages.push({ sender: 'assistant', content: completeResponse, timestamp: new Date() });
    await session.save();

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 3. AI Content Generator
export const generateContent = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, contentType, style, length } = req.body;

    if (!projectId || !contentType) {
      return res.status(400).json({ error: 'projectId and contentType are required' });
    }

    const project = await Project.findById(projectId);
    const tasks = await Task.find({ projectId });

    if (!project) return res.status(404).json({ error: 'Project not found' });

    let reportType: 'weekly' | 'sprint' | 'project' | 'risk' | null = null;
    if (contentType === 'weekly_report') reportType = 'weekly';
    else if (contentType === 'sprint_report') reportType = 'sprint';
    else if (contentType === 'project_report') reportType = 'project';
    else if (contentType === 'risk_report') reportType = 'risk';

    const ai = getAIClient();
    if (!ai) {
      const content = `### Mocked Generated ${contentType.replace('_', ' ').toUpperCase()} Document\n\n` +
        `*   **Project**: ${project.name}\n` +
        `*   **Tone/Style**: ${style || 'Professional'}\n` +
        `*   **Length**: ${length || 'Medium'}\n\n` +
        `This is a mock generation of ${contentType.replace('_', ' ')} documentation. Please configure GEMINI_API_KEY for dynamic generations.`;

      let reportId = null;
      if (reportType) {
        const report = new Report({
          projectId,
          type: reportType,
          title: `${contentType.replace('_', ' ').toUpperCase()} - ${new Date().toLocaleDateString()}`,
          summary: `Mocked AI executive summary for ${contentType.replace('_', ' ')} details.`,
          details: { markdown: content }
        });
        await report.save();
        reportId = report._id;
      }
      return res.json({ content, reportId });
    }

    const sprints = await SprintHistory.find({ projectId });
    const content = await runScrumMasterAgent({
      contentType,
      projectName: project.name,
      projectDescription: project.description || '',
      tasks,
      sprints,
      style,
      length
    });

    let reportId = null;
    if (reportType) {
      const report = new Report({
        projectId,
        type: reportType,
        title: `${contentType.replace('_', ' ').toUpperCase()} - ${new Date().toLocaleDateString()}`,
        summary: content.slice(0, 500) + '...',
        details: { markdown: content }
      });
      await report.save();
      reportId = report._id;
    }

    res.json({ content, reportId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Download Report PDF
export const downloadReportPDF = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // Report ID
    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report-${report.type}-${id}.pdf`);

    doc.pipe(res);

    // Title Section
    doc.fillColor('#4338CA').fontSize(24).text('ProjectPilot AI Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#6B7280').fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1.5);

    // Metadata
    doc.fillColor('#1F2937').fontSize(14).text(`Report Type: ${report.type.toUpperCase()}`);
    doc.text(`Title: ${report.title}`);
    doc.moveDown(1);

    // Horizontal Rule
    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1.5);

    // Summary
    doc.fontSize(16).fillColor('#111827').text('Executive Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#374151').text(report.summary, { lineGap: 4 });
    doc.moveDown(2);

    // Details / Data Table
    if (report.details && typeof report.details === 'object') {
      doc.fontSize(16).fillColor('#111827').text('Structural Analysis Details', { underline: true });
      doc.moveDown(0.5);

      const risks = (report.details as any).risks || [];
      const markdown = (report.details as any).markdown;
      if (markdown) {
        // Strip basic markdown tags for clean PDFKit output formatting
        const cleanText = markdown.replace(/[#*`_-]/g, '');
        doc.fontSize(11).fillColor('#1F2937').text(cleanText, { lineGap: 4 });
      } else if (risks.length > 0) {
        risks.forEach((risk: any, index: number) => {
          doc.fontSize(12).fillColor('#B91C1C').text(`Risk ${index + 1}: ${risk.title || risk}`);
          if (risk.mitigation) {
            doc.fontSize(11).fillColor('#1F2937').text(`Mitigation: ${risk.mitigation}`);
          }
          doc.moveDown(0.5);
        });
      } else {
        doc.fontSize(11).fillColor('#1F2937').text(JSON.stringify(report.details, null, 2));
      }
    }

    doc.end();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 5. AI Pull Request Review
export const reviewPR = async (req: AuthRequest, res: Response) => {
  try {
    const { prTitle, prDescription, diffText } = req.body;

    if (!prTitle || !diffText) {
      return res.status(400).json({ error: 'prTitle and diffText are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return res.json({
        success: true,
        review: `### Mock AI Code Review for: "${prTitle}"\n\n` +
          `*   **Performance**: Optimize looping constructs in target files.\n` +
          `*   **Security**: Ensure variables are sanitized before database queries.\n` +
          `*   **Architecture**: Separation of database queries from Express controller route logic.\n` +
          `*   **Readability**: Shorten functions to keep it under 30 lines.\n` +
          `*   **Testing**: Add unit tests checking boundary conditions.`
      });
    }

    const reviewContent = await runCodeReviewAgent({ prTitle, prDescription, diffText });
    res.json({ success: true, review: reviewContent });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 6. AI Smart Recommendations
export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const tasks = await Task.find({ projectId });
    const sprints = await SprintHistory.find({ projectId });

    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      return res.json({
        success: true,
        recommendations: `### Mock Recommendations for: "${project.name}"\n\n` +
          `*   **Next Task**: Implement MongoDB database model configurations.\n` +
          `*   **Sprint Priority**: Resolve blocked issue #12 first to unblock task #14.\n` +
          `*   **Roadmap**: Add buffer milestone for frontend deployment QA.\n` +
          `*   **Velocity**: Conduct pair programming to resolve complex task blockers.`
      });
    }

    const recommendations = await runRecommendationEngine({
      projectName: project.name,
      projectDescription: project.description || '',
      tasks,
      sprints,
      riskScore: project.riskScore || 0
    });

    res.json({ success: true, recommendations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 7. Get or Generate Daily AI Standup
export const getDailyStandup = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const tasks = await Task.find({ projectId });
    const standupData = generateDailyStandup(tasks, project);

    // Save or update today's standup report
    const report = await Report.findOneAndUpdate(
      { projectId, type: 'standup' },
      {
        title: `Daily AI Standup - ${standupData.date}`,
        summary: standupData.summary,
        details: standupData,
        createdAt: new Date()
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, standup: standupData, report });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// 8. Generate Audience-Tailored Executive Report
export const getExecutiveReport = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, audience } = req.body;
    if (!projectId) return res.status(400).json({ error: 'projectId is required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const tasks = await Task.find({ projectId });
    const milestones = await Milestone.find({ roadmapId: { $exists: true } });
    const sprints = await SprintHistory.find({ projectId });
    const health = await calculateProjectHealth(projectId);

    const targetAudience: AudienceType = (['ceo', 'pm', 'developer', 'investor'].includes(audience) ? audience : 'ceo') as AudienceType;
    const reportData = generateExecutiveReport(project, tasks, milestones, health, targetAudience);

    res.json({ success: true, report: reportData });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
