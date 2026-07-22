import UserMemory from '../models/UserMemory';
import Project from '../models/Project';
import mongoose from 'mongoose';

export async function getUserMemory(userId: string) {
  let memory = await UserMemory.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  if (!memory) {
    // Seed default realistic preferences for demo
    memory = await UserMemory.create({
      userId: new mongoose.Types.ObjectId(userId),
      preferences: [
        { category: 'Authentication', value: 'JWT', usageCount: 4, lastUsed: new Date(Date.now() - 30 * 24 * 3600 * 1000), confidence: 95 },
        { category: 'Database', value: 'MongoDB', usageCount: 5, lastUsed: new Date(Date.now() - 30 * 24 * 3600 * 1000), confidence: 92 },
        { category: 'Styling', value: 'Tailwind CSS', usageCount: 6, lastUsed: new Date(Date.now() - 15 * 24 * 3600 * 1000), confidence: 98 },
        { category: 'State Management', value: 'Zustand', usageCount: 3, lastUsed: new Date(Date.now() - 45 * 24 * 3600 * 1000), confidence: 85 }
      ],
      projectHistory: [
        { projectName: 'E-Commerce Core (Last Month)', techStack: ['JWT', 'MongoDB', 'Tailwind CSS', 'Node.js'], createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000) },
        { projectName: 'Analytics Engine', techStack: ['JWT', 'MongoDB', 'Redis', 'Express'], createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000) }
      ]
    });
  }
  return memory;
}

export async function recordTechPreference(userId: string, category: string, value: string) {
  let memory = await UserMemory.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  if (!memory) {
    memory = new UserMemory({ userId: new mongoose.Types.ObjectId(userId), preferences: [] });
  }

  const existing = memory.preferences.find(p => p.category.toLowerCase() === category.toLowerCase());
  if (existing) {
    existing.value = value;
    existing.usageCount += 1;
    existing.lastUsed = new Date();
    existing.confidence = Math.min(100, existing.confidence + 5);
  } else {
    memory.preferences.push({
      category,
      value,
      usageCount: 1,
      lastUsed: new Date(),
      confidence: 85
    });
  }

  memory.lastUpdated = new Date();
  await memory.save();
  return memory;
}
