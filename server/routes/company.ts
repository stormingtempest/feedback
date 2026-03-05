import express from 'express';
import { prisma } from '../prisma.js';
import { GoogleGenAI, Type } from '@google/genai';

const router = express.Router();

// Get Company Dashboard Data
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    console.log('Received userId:', userId);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'COMPANY') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    console.log('Searching for company for user:', user.name, 'tag:', user.companyTag);
    let company;
    
    if (user.companyTag) {
        company = await prisma.company.findUnique({
          where: { tag: user.companyTag },
          include: {
            projects: {
              include: {
                campaigns: {
                  include: {
                    feedbacks: {
                      where: { moderationStatus: 'Approved' },
                      orderBy: { createdAt: 'desc' }
                    }
                  }
                }
              }
            },
            campaigns: {
              where: { projectId: null },
              include: {
                feedbacks: {
                  where: { moderationStatus: 'Approved' },
                  orderBy: { createdAt: 'desc' }
                }
              }
            }
          }
        });
    } else {
        company = await prisma.company.findFirst({
          where: { managerId: userId },
          include: {
            projects: {
              include: {
                campaigns: {
                  include: {
                    feedbacks: {
                      where: { moderationStatus: 'Approved' },
                      orderBy: { createdAt: 'desc' }
                    }
                  }
                }
              }
            },
            campaigns: {
              where: { projectId: null },
              include: {
                feedbacks: {
                  where: { moderationStatus: 'Approved' },
                  orderBy: { createdAt: 'desc' }
                }
              }
            }
          }
        });
    }
    console.log('Company found:', company);

    if (!company) {
      // Debug: find all companies to see if any have a managerId
      const allCompanies = await prisma.company.findMany();
      console.log('All companies in DB:', allCompanies);
      
      // Fallback: return the first company if it exists
      if (allCompanies.length > 0) {
        console.log('Returning first company as fallback');
        company = await prisma.company.findUnique({
          where: { id: allCompanies[0].id },
          include: {
            projects: {
              include: {
                campaigns: {
                  include: {
                    feedbacks: {
                      where: { moderationStatus: 'Approved' },
                      orderBy: { createdAt: 'desc' }
                    }
                  }
                }
              }
            },
            campaigns: {
              where: { projectId: null },
              include: {
                feedbacks: {
                  where: { moderationStatus: 'Approved' },
                  orderBy: { createdAt: 'desc' }
                }
              }
            }
          }
        });
      } else {
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    // Fetch all feedbacks for the company to calculate stats
    const projectIds = company.projects ? company.projects.map(p => p.id) : [];
    const allFeedbacks = await prisma.feedback.findMany({
      where: {
        OR: [
          { campaign: { projectId: { in: projectIds } } },
          { campaign: { companyId: company.id } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats
    let totalFeedbacks = allFeedbacks.length;
    let totalProjects = company.projects ? company.projects.length : 0;
    let totalCampaigns = company.campaigns ? company.campaigns.length : 0;
    
    if (company.projects) {
      company.projects.forEach(p => {
        totalCampaigns += p.campaigns ? p.campaigns.length : 0;
      });
    }

    // 1. Distribution by type
    const typeDistribution = allFeedbacks.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 2. Measures by game category (assuming category is used for game category)
    const categoryMeasures = allFeedbacks.reduce((acc, f) => {
      if (f.ratings && typeof f.ratings === 'object') {
        Object.entries(f.ratings as Record<string, number>).forEach(([key, val]) => {
          if (!acc[key]) acc[key] = { sum: 0, count: 0 };
          acc[key].sum += val;
          acc[key].count += 1;
        });
      }
      return acc;
    }, {} as Record<string, { sum: number, count: number }>);

    // 3. Evolution of averages (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const evolution = allFeedbacks
      .filter(f => f.createdAt >= thirtyDaysAgo && f.internalRating)
      .reduce((acc, f) => {
        const date = f.createdAt.toISOString().split('T')[0];
        if (!acc[date]) acc[date] = { sum: 0, count: 0 };
        acc[date].sum += f.internalRating!;
        acc[date].count += 1;
        return acc;
      }, {} as Record<string, { sum: number, count: number }>);

    // 4. Top users (by feedback count)
    const userFeedbackCount = allFeedbacks.reduce((acc, f) => {
      acc[f.userId] = (acc[f.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topUsers = Object.entries(userFeedbackCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // 5. Feedback status metrics
    const statusMetrics = {
      unanswered: allFeedbacks.filter(f => !f.companyResponse).length,
      averageResponseTime: 0, // Simplified for now
      directives: allFeedbacks.reduce((acc, f) => {
        // Assuming status maps to directives
        acc[f.status] = (acc[f.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    res.json({
      company,
      stats: {
        totalProjects,
        totalCampaigns,
        totalFeedbacks,
        typeDistribution,
        categoryMeasures,
        evolution,
        topUsers,
        statusMetrics
      }
    });
  } catch (error) {
    console.error('Error fetching company dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update AI Settings
router.put('/settings', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { aiContext, aiGoals, aiProvider, apiKey, apiModel, name, logoUrl } = req.body;

    const company = await prisma.company.findFirst({ where: { managerId: userId } });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: { 
        aiContext, 
        aiGoals,
        aiProvider,
        apiKey,
        apiModel,
        name,
        logoUrl
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate AI Insights
router.post('/insights', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { forceRegenerate } = req.body;

    const company = await prisma.company.findFirst({
      where: { managerId: userId },
      include: {
        insights: {
            orderBy: { createdAt: 'desc' }
        },
        projects: {
          include: {
            campaigns: {
              include: {
                feedbacks: { where: { moderationStatus: 'Approved' }, take: 20, orderBy: { createdAt: 'desc' } }
              }
            }
          }
        },
        campaigns: {
          where: { projectId: null },
          include: {
            feedbacks: { where: { moderationStatus: 'Approved' }, take: 20, orderBy: { createdAt: 'desc' } }
          }
        }
      }
    });

    if (!company) return res.status(404).json({ message: 'Company not found' });

    // If insights exist and not forcing regeneration, return existing
    if (company.insights.length > 0 && !forceRegenerate) {
        return res.json({ insights: company.insights });
    }

    // Collect recent feedbacks
    const allFeedbacks: any[] = [];
    company.projects.forEach(p => {
      p.campaigns.forEach(c => {
        c.feedbacks.forEach(f => {
            allFeedbacks.push({ project: p.name, content: f.description, rating: f.internalRating, category: f.category });
        });
      });
    });
    company.campaigns.forEach(c => {
      c.feedbacks.forEach(f => {
          allFeedbacks.push({ project: 'Unassigned', campaign: c.name, content: f.description, rating: f.internalRating, category: f.category });
      });
    });

    if (allFeedbacks.length === 0) {
      return res.json({ insights: [] });
    }

    // Generate new insights using Gemini (or mock if no key)
    let generatedInsights = [];

    const apiKey = company.apiKey || process.env.GEMINI_API_KEY;

    if (apiKey && (company.aiProvider === 'gemini' || !company.aiProvider || company.aiProvider === 'openai')) { 
        // Note: For now, we default to Gemini even if OpenAI is selected, 
        // as we are in a Google environment. In a real app, we would switch SDKs.
        try {
            const ai = new GoogleGenAI({ apiKey: apiKey });
            const modelName = company.apiModel && company.apiModel.includes('gemini') ? company.apiModel : 'gemini-3.1-pro-preview';
            
            const prompt = `
              Analyze the following recent user feedbacks for our company.
              
              Company Context: ${company.aiContext || 'Not provided'}
              Company Goals: ${company.aiGoals || 'Not provided'}
              
              Feedbacks:
              ${JSON.stringify(allFeedbacks.slice(0, 30))}
              
              Provide 3 specific insights or actionable recommendations based on this data.
              For each insight, assign a priority: 'High' (Red/Urgent), 'Medium' (Yellow), or 'Low' (Green).
              
              Output JSON format:
              [
                { "title": "...", "description": "...", "priority": "High" }
              ]
            `;

            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      priority: { type: Type.STRING }
                    }
                  }
                }
              }
            });
            
            generatedInsights = JSON.parse(response.text || '[]');
        } catch (e) {
            console.error("AI Generation failed, falling back to mock", e);
            generatedInsights = [
                { title: "AI Generation Failed", description: "Could not generate insights. Please check your API Key.", priority: "High" }
            ];
        }
    } else {
        // Mock generation based on stats
        const avgRating = allFeedbacks.reduce((acc, f) => acc + (f.rating || 0), 0) / allFeedbacks.length;
        if (avgRating < 3) {
            generatedInsights.push({ 
                title: "Critical: Low User Satisfaction", 
                description: "Recent feedback indicates a drop in user satisfaction. Investigate 'Gameplay' issues immediately.", 
                priority: "High" 
            });
        } else {
            generatedInsights.push({ 
                title: "Maintain Momentum", 
                description: "User satisfaction is stable. Consider running a new campaign to engage top users.", 
                priority: "Low" 
            });
        }
        generatedInsights.push({
            title: "Feedback Volume",
            description: `You have received ${allFeedbacks.length} new feedbacks recently. Review pending items.`,
            priority: "Medium"
        });
    }

    // Save generated insights to DB
    await prisma.insight.deleteMany({ where: { companyId: company.id } });
    
    const savedInsights = [];
    for (const insight of generatedInsights) {
        const saved = await prisma.insight.create({
            data: {
                title: insight.title,
                description: insight.description,
                priority: insight.priority,
                companyId: company.id
            }
        });
        savedInsights.push(saved);
    }

    res.json({ insights: savedInsights });

  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create Project
router.post('/projects', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { name, description } = req.body;

    const company = await prisma.company.findFirst({ where: { managerId: userId } });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const project = await prisma.project.create({
      data: {
        name,
        description,
        companyId: company.id
      }
    });

    res.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create Campaign
router.post('/campaigns', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { name, description, projectId, questions, badgeConfig, missions, feedbackBonus } = req.body;

    const company = await prisma.company.findFirst({ where: { managerId: userId } });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        companyId: company.id,
        projectId: projectId || null,
        questions: questions || [],
        badgeConfig: badgeConfig || {},
        missions: missions || [],
        feedbackBonus: feedbackBonus || 50
      }
    });

    res.json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update Campaign
router.put('/campaigns/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const { id } = req.params;
    const { name, description, questions, badgeConfig, missions, feedbackBonus, status } = req.body;

    const company = await prisma.company.findFirst({ where: { managerId: userId } });
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const campaign = await prisma.campaign.update({
      where: { id, companyId: company.id },
      data: {
        name,
        description,
        questions,
        badgeConfig,
        missions,
        feedbackBonus,
        status
      }
    });

    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
