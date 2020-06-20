export const reminderTemplates = [
  {
    id: 300,
    name: 'Visa reminder',
    from: 'test.admin@andela.com',
    subject: 'Visa expiring',
    message: 'Your visa will soon expire',
    createdBy: 8379
  },
  {
    id: 301,
    name: 'Passport reminder',
    from: 'test.admin@andela.com',
    subject: 'Passport expiring',
    message: 'Your passport is about to expire',
    createdBy: 8379
  },
];

export const reminderConditions = [
  {
    id: 400,
    conditionName: 'Travel Readiness reminder for visa',
    documentType: 'Visa',
    userId: '-LMIzC-bCc10w7Uqc7-B',
    createdAt: '2019-01-04 012:11:52.181+01',
    updatedAt: '2019-01-16 012:11:52.181+01',
  },
  {
    id: 401,
    conditionName: 'Travel Readiness reminder for Passport',
    documentType: 'Passport',
    userId: '-LMIzC-bCc10w7Uqc7-B',
    createdAt: '2019-01-04 012:11:52.181+01',
    updatedAt: '2019-01-16 012:11:52.181+01',
  },
];

export const reminders = [
  {
    id: 1,
    frequency: '2 Weeks',
    createdAt: '2019-01-20T02:49:43.328Z',
    updatedAt: '2019-01-20T02:49:43.328Z',
    conditionId: 400,
    reminderEmailTemplateId: '300'
  },
  {
    id: 2,
    frequency: '5 Weeks',
    createdAt: '2019-01-20T02:49:43.328Z',
    updatedAt: '2019-01-20T02:49:43.328Z',
    conditionId: 400,
    reminderEmailTemplateId: '300'
  },
  {
    id: 3,
    frequency: '2 Weeks',
    createdAt: '2019-01-20T02:49:43.328Z',
    updatedAt: '2019-01-20T02:49:43.328Z',
    conditionId: 401,
    reminderEmailTemplateId: '301'
  },
  {
    id: 4,
    frequency: '5 Weeks',
    createdAt: '2019-01-20T02:49:43.328Z',
    updatedAt: '2019-01-20T02:49:43.328Z',
    conditionId: 401,
    reminderEmailTemplateId: '301'
  }
];

export const reasonForDisabling = { reason: 'This is no longer necessary' };
export const incompleteReasonForDisabling = { reason: 'This' };
