import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI, Type } from '@google/genai';
import { ok, notFound, handle, requireRole } from '@/lib/api';

export const POST = (req: NextRequest) =>
  handle(async () => {
    const user = await requireRole(req, 'COMPANY');
    const { forceRegenerate } = await req.json();

    const company = await prisma.company.findFirst({
      where: { managerId: user.id },
      include: {
        insights: { orderBy: { createdAt: 'desc' } },
        projects: { include: { campaigns: { include: { feedbacks: { where: { moderationStatus: 'Approved' }, take: 20, orderBy: { createdAt: 'desc' } } } } } },
        campaigns: { where: { projectId: null }, include: { feedbacks: { where: { moderationStatus: 'Approved' }, take: 20, orderBy: { createdAt: 'desc' } } } },
      },
    });

    if (!company) notFound('Company not found');
    if (company!.insights.length > 0 && !forceRegenerate) return ok({ insights: company!.insights });

    const allFeedbacks: { project: string; content: string; rating: number | null; category: string }[] = [];
    company!.projects.forEach((p) => p.campaigns.forEach((c) => c.feedbacks.forEach((f) => allFeedbacks.push({ project: p.name, content: f.description, rating: f.internalRating, category: f.category }))));
    company!.campaigns.forEach((c) => c.feedbacks.forEach((f) => allFeedbacks.push({ project: 'Unassigned', content: f.description, rating: f.internalRating, category: f.category })));

    if (allFeedbacks.length === 0) return ok({ insights: [] });

    // eslint-disable-next-line no-useless-assignment
    let generatedInsights: { title: string; description: string; priority: string }[] = [];
    const apiKey = company!.apiKey || process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const modelName = company!.apiModel?.includes('gemini') ? company!.apiModel : 'gemini-2.5-pro-preview-05-06';
        const prompt = `Analyze the following user feedbacks for our company.\n\nCompany Context: ${company!.aiContext || 'Not provided'}\nCompany Goals: ${company!.aiGoals || 'Not provided'}\n\nFeedbacks:\n${JSON.stringify(allFeedbacks.slice(0, 30))}\n\nProvide 3 specific actionable insights. Each insight must have a priority: 'High', 'Medium', or 'Low'.`;
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, priority: { type: Type.STRING } } } },
          },
        });
        generatedInsights = JSON.parse(response.text || '[]');
      } catch {
        generatedInsights = [{ title: 'AI Generation Failed', description: 'Could not generate insights. Please check your API Key.', priority: 'High' }];
      }
    } else {
      const avgRating = allFeedbacks.reduce((acc, f) => acc + (f.rating || 0), 0) / allFeedbacks.length;
      generatedInsights = avgRating < 3
        ? [{ title: 'Critical: Low User Satisfaction', description: 'Recent feedback indicates a drop in satisfaction. Investigate immediately.', priority: 'High' }]
        : [{ title: 'Maintain Momentum', description: 'User satisfaction is stable. Consider running a new campaign.', priority: 'Low' }];
      generatedInsights.push({ title: 'Feedback Volume', description: `You have received ${allFeedbacks.length} new feedbacks recently.`, priority: 'Medium' });
    }

    await prisma.insight.deleteMany({ where: { companyId: company!.id } });
    const savedInsights = await Promise.all(
      generatedInsights.map((i) => prisma.insight.create({ data: { title: i.title, description: i.description, priority: i.priority, companyId: company!.id } }))
    );
    return ok({ insights: savedInsights });
  });
