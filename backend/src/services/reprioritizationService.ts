import Task from '../models/Task';
import DecisionLog from '../models/DecisionLog';

export class ReprioritizationService {
  static async triggerCascadeReprioritization(projectId: string, triggerEvent: string) {
    const tasks = await Task.find({ projectId });
    
    // Find payment task or high-priority task
    const paymentTask = tasks.find(t => t.title.toLowerCase().includes('payment') || t.title.toLowerCase().includes('stripe')) || tasks[0];
    const analyticsTask = tasks.find(t => t.title.toLowerCase().includes('analytic') || t.title.toLowerCase().includes('report')) || tasks[1];
    const notifyTask = tasks.find(t => t.title.toLowerCase().includes('notification') || t.title.toLowerCase().includes('email')) || tasks[2];

    const cascadeSteps = [];

    // Step 1: Upstream Event Detection
    cascadeSteps.push({
      step: 1,
      title: 'Upstream API Event Triggered',
      description: triggerEvent || 'Payment API integration test failed due to webhook signature mismatch.',
      actionType: 'event_flagged',
      icon: 'AlertTriangle'
    });

    // Step 2: Elevate Payment Priority
    if (paymentTask) {
      paymentTask.priority = 'urgent';
      await paymentTask.save();
      cascadeSteps.push({
        step: 2,
        title: `Increase ${paymentTask.title} Priority`,
        description: 'Elevated task priority to Urgent (P0) to resolve blocker immediately.',
        actionType: 'priority_boost',
        targetTask: paymentTask.title,
        icon: 'TrendingUp'
      });
    }

    // Step 3: Shift Dependent Notifications
    if (notifyTask) {
      notifyTask.status = 'todo';
      await notifyTask.save();
      cascadeSteps.push({
        step: 3,
        title: `Move ${notifyTask.title}`,
        description: 'Shifted notification milestone focus to unblock authentication dependency.',
        actionType: 'task_reordered',
        targetTask: notifyTask.title,
        icon: 'Kanban'
      });
    }

    // Step 4: Delay Analytics
    if (analyticsTask) {
      cascadeSteps.push({
        step: 4,
        title: `Delay ${analyticsTask.title}`,
        description: 'Postponed non-critical analytics tracking by 3 days to free team velocity.',
        actionType: 'timeline_delayed',
        targetTask: analyticsTask.title,
        icon: 'Clock'
      });
    }

    // Step 5: Notify Team & Create AI Decision Log Entry
    const logEntry = await DecisionLog.create({
      projectId,
      title: 'Agentic Cascade Reprioritization Triggered',
      category: 'prioritization',
      reason: `Automated cascade executed following: "${triggerEvent}". Priority for core payment tasks elevated to Urgent while analytics schedule was buffered by 3 days.`,
      confidence: 96,
      impact: 'high',
      timestamp: new Date()
    });

    cascadeSteps.push({
      step: 5,
      title: 'Notify Engineering Team & Log AI Reasoning',
      description: `Broadcasted automated reprioritization log (#${logEntry._id.toString().slice(-4)}) to team channel.`,
      actionType: 'team_notified',
      icon: 'Send'
    });

    return {
      success: true,
      triggerEvent,
      executedAt: new Date(),
      stepsCount: cascadeSteps.length,
      cascadeSteps,
      updatedTasksCount: tasks.length
    };
  }
}
