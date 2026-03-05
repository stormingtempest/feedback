export const mockDashboardData = {
  user: {
    id: '1',
    name: 'User Test',
    email: 'user@test.com',
    points: 1250,
    level: 5,
    levelTitle: 'Expert Critic',
    nextLevelPoints: 2000,
    missions: [
      { id: 'm1', title: 'Find a bug', description: 'Report at least one bug', points: 200, completed: false },
      { id: 'm2', title: 'First Impression', description: 'Complete the survey', points: 150, completed: false },
      { id: 'm3', title: 'Bug Hunter', description: 'Report a UI issue', points: 300, completed: false },
      { id: 'm4', title: 'Feature Architect', description: 'Suggest a new feature', points: 500, completed: false }
    ],
    achievements: [
      { id: 'a1', label: 'Pioneer', icon: 'Star', color: 'text-yellow-500', description: 'One of the first users', unlocked: true },
      { id: 'a2', label: 'Critic', icon: 'Target', color: 'text-red-500', description: 'Gave 10 feedbacks', unlocked: false },
    ]
  },
  activeProjects: [
    { id: 'p1', name: 'Mobile App Beta', companyName: 'Acme Corp', description: 'Test the new features of our mobile app.', progress: 50 },
    { id: 'p2', name: 'Website Redesign', companyName: 'Acme Corp', description: 'Give feedback on the new landing page.', progress: 0 },
    { id: 'p3', name: 'TempestLabs', companyName: 'TempestLabs', description: 'Revolutionizing feedback collection.', progress: 0 },
  ],
  history: [
    { id: 'h1', projectName: 'Mobile App Beta', date: '2023-10-25', status: 'Completed' as const, progress: 100, points: 50, description: 'Great app!' },
    { id: 'h2', projectName: 'Website Redesign', date: '2023-10-26', status: 'Pending' as const, progress: 0, points: 0, description: '' },
  ]
};

export const mockCompanyData = {
  company: {
    id: 'c1',
    name: 'Acme Corp',
    logoUrl: '',
    aiProvider: 'openai',
    projects: [
      {
        id: 'p1',
        name: 'Mobile App',
        description: 'Main mobile application',
        campaigns: [
          {
            id: 'camp1',
            name: 'Beta Testing',
            status: 'Active',
            progress: 65,
            questions: [
              { id: 'q1', text: 'How do you rate the UI?', style: 'rating', points: 50 },
              { id: 'q2', text: 'Any bugs found?', style: 'text', points: 100 }
            ],
            badge: { icon: '🚀', name: 'Beta Explorer', message: 'Thanks for testing our beta!' },
            missions: [
              { id: 'm1', title: 'Find a bug', description: 'Report at least one bug', points: 200 }
            ],
            responseBonus: 100,
            feedbacks: [
              { id: 'f1', userId: 'u1', internalRating: 5, internalTags: ['UI'], description: 'Looks great', createdAt: '2023-10-25' },
              { id: 'f2', userId: 'u2', internalRating: 3, internalTags: ['Bug'], description: 'Crashes on login', createdAt: '2023-10-26' }
            ]
          }
        ]
      },
      {
        id: 'p2',
        name: 'TempestLabs',
        description: 'Revolutionizing feedback collection.',
        campaigns: [
          {
            id: 'camp2',
            name: 'FeedbackHub',
            status: 'Active',
            progress: 10,
            questions: [
              { id: 'q1', text: 'How intuitive is the feedback submission process?', style: 'rating', points: 50 },
              { id: 'q2', text: 'What features would you like to see next?', style: 'text', points: 100 },
              { id: 'q3', text: 'Rate the speed of the application.', style: 'rating', points: 50 },
              { id: 'q4', text: 'Is the dashboard layout clear?', style: 'rating', points: 50 },
              { id: 'q5', text: 'Any other suggestions for improvement?', style: 'text', points: 100 }
            ],
            badge: { icon: '🌪️', name: 'Tempest Pioneer', message: 'You weathered the storm and helped us build the future!' },
            missions: [
              { id: 'm1', title: 'First Impression', description: 'Complete the survey', points: 150 },
              { id: 'm2', title: 'Bug Hunter', description: 'Report a UI issue', points: 300 },
              { id: 'm3', title: 'Feature Architect', description: 'Suggest a new feature', points: 500 }
            ],
            responseBonus: 250,
            feedbacks: []
          }
        ]
      }
    ]
  },
  stats: {
    totalProjects: 1,
    totalCampaigns: 1,
    totalFeedbacks: 2,
    statusMetrics: {
      unanswered: 1,
      averageResponseTime: 24,
      directives: { 'UI': 1, 'Bug': 1 }
    },
    evolution: {
      '2023-10-25': { sum: 5, count: 1 },
      '2023-10-26': { sum: 3, count: 1 }
    },
    typeDistribution: {
      'UI': 1,
      'Bug': 1
    },
    categoryMeasures: {
      'Design': { sum: 5, count: 1 },
      'Performance': { sum: 3, count: 1 }
    },
    topUsers: [
      ['u1', 1],
      ['u2', 1]
    ]
  }
};

export const mockAdminData = {
  organizations: 5,
  projects: 12,
  users: 150,
  managers: 8,
  moderators: 3,
  moderation: {
    pending: 15,
    approved: 120,
    rejected: 45,
    total: 180
  }
};

export const mockOrganizations = [
  { id: 'c1', name: 'Acme Corp', managerName: 'John Doe', managerEmail: 'john@acme.com', status: 'active' },
  { id: 'c2', name: 'Globex', managerName: 'Jane Smith', managerEmail: 'jane@globex.com', status: 'active' },
  { id: 'c3', name: 'Soylent Corp', managerName: 'Bob Ross', managerEmail: 'bob@soylent.com', status: 'inactive' },
];
