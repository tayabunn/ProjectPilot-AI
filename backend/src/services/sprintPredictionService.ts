import Task from '../models/Task';
import SprintHistory from '../models/SprintHistory';

export class SprintPredictionService {
  static async getBurndownPrediction(projectId: string) {
    const tasks = await Task.find({ projectId });
    
    const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 2), 0);
    const completedPoints = tasks.filter(t => t.status === 'done').reduce((sum, t) => sum + (t.storyPoints || 2), 0);
    const remainingPoints = totalPoints - completedPoints;

    // Calculate velocity (e.g. 18 SP/week based on team history)
    const currentVelocity = 18; // SP per week
    const dailyVelocity = currentVelocity / 7; // ~2.57 SP/day

    // Estimate days needed to finish remaining points
    const daysNeeded = Math.ceil(remainingPoints / (dailyVelocity || 1));
    
    // Assume 14-day sprint cycle, currently on day 10
    const totalSprintDays = 14;
    const currentDay = 10;
    const daysLeftInSprint = totalSprintDays - currentDay;

    const daysLate = daysNeeded > daysLeftInSprint ? daysNeeded - daysLeftInSprint : 0;
    const isLate = daysLate > 0;

    // Generate daily burndown data points (ideal vs actual vs predicted)
    const burndownData = [];
    let actualPointsTrack = totalPoints;
    let predictedPointsTrack = totalPoints;

    for (let day = 1; day <= totalSprintDays + daysLate; day++) {
      const ideal = Math.max(0, Math.round(totalPoints - (totalPoints / totalSprintDays) * day));
      
      let actual: number | null = null;
      let predicted: number | null = null;

      if (day <= currentDay) {
        // Historical actuals
        const dayProgress = (completedPoints / currentDay) * day;
        actual = Math.max(0, Math.round(totalPoints - dayProgress));
        predicted = actual;
      } else {
        // Future prediction trajectory
        const daysBeyondCurrent = day - currentDay;
        predicted = Math.max(0, Math.round(totalPoints - completedPoints - (dailyVelocity * daysBeyondCurrent)));
      }

      burndownData.push({
        day: `Day ${day}`,
        ideal,
        actual,
        predicted
      });
    }

    return {
      currentVelocity, // e.g. 18 SP/week
      totalPoints,
      completedPoints,
      remainingPoints,
      totalSprintDays,
      currentDay,
      predictedCompletionDays: currentDay + daysNeeded,
      daysLate,
      status: isLate ? `Sprint finishes ${daysLate} days late` : 'On track for sprint target',
      statusColor: isLate ? 'amber' : 'green',
      burndownData
    };
  }
}
