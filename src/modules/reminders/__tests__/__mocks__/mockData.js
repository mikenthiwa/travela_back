const date = new Date();
const ajustedDate = new Date(date.setDate(date.getDate() + 5))
  .toISOString().split('T')[0];

export const reminderTemplates = [
  {
    id: 300,
    name: 'Visa reminder',
    from: 'test.admin@andela.com',
    cc: 'test.admin2@andela.com',
    subject: 'Visa expiring',
    message: 'Your visa will soon expire',
    createdBy: 8379
  },
  {
    id: 301,
    name: 'Passport reminder',
    from: 'test.admin@andela.com',
    cc: 'test.admin2@andela.com',
    subject: 'Passport expiring',
    message: 'Your passport is about to expire',
    createdBy: 8379
  },
];

export const reminderPayload = {
  conditionName: 'Travel Readiness reminder',
  documentType: 'Passport',
  reminders: [{
    frequency: '2 Weeks',
    reminderEmailTemplateId: '300'
  },
  {
    frequency: '5 Days',
    reminderEmailTemplateId: '301'
  }
  ]
};

export const duplicateFrequencyReminder = {
  conditionName: 'Travel Readiness reminder with duplicate frequency',
  documentType: 'Passport',
  reminders: [{
    frequency: '2 Weeks',
    reminderEmailTemplateId: '300'
  },
  {
    frequency: '2 Weeks',
    reminderEmailTemplateId: '301'
  }
  ]
};

export const reminderPayloadWithInvalidTemplate = {
  conditionName: 'Travel Readiness reminder',
  documentType: 'Passport',
  reminders: [{
    frequency: '2 Weeks',
    reminderEmailTemplateId: '999'
  },
  {
    frequency: '5 Days',
    reminderEmailTemplateId: '1000'
  }
  ]
};

export const reminderPayloadWithoutTemplate = {
  conditionName: 'Travel Readiness reminder',
  documentType: 'Passport',
  reminders: [{
    frequency: '2 Weeks',
  },
  ]
};

export const reminderPayloadWithoutConditionName = {
  documentType: 'Passport',
  reminders: [{
    frequency: '2 Weeks',
    reminderEmailTemplateId: '300'
  },
  {
    frequency: '5 Days',
    reminderEmailTemplateId: '301'
  }
  ]
};

export const reminderPayloadWithInvalidDocumentType = {
  conditionName: 'Travel Readiness reminder',
  documentType: 'Certificate',
  reminders: [{
    frequency: '2 Weeks',
    reminderEmailTemplateId: '300'
  },
  {
    frequency: '5 Days',
    reminderEmailTemplateId: '301'
  }
  ]
};

export const reminderPayloadWithInvalidFrequency = {
  conditionName: 'Travel Readiness reminder',
  documentType: 'Passport',
  reminders: [{
    frequency: '1 Weeks',
    reminderEmailTemplateId: '300'
  },
  {
    frequency: '3 minutes',
    reminderEmailTemplateId: '301'
  }
  ]
};

export const reminderPayloadTwo = {
  condition: {
    conditionName: 'Passport renewal reminder',
    documentType: 'Passport',
  },
  reminders: [
    {
      frequency: '2 Weeks',
      id: 50,
      reminderEmailTemplateId: '300'
    },
    {
      frequency: '5 Days',
      id: 200,
      reminderEmailTemplateId: '301'
    }
  ]
};

export const updateReminderPayloads = {
  getReminderToUpdateOne: (reminderId1, reminderId2, {
    conditionName,
    documentType,
    frequency1,
    frequency2
  }) => ({
    conditionName,
    documentType,
    reminders: [{
      frequency: frequency1,
      id: reminderId1,
      reminderEmailTemplateId: '300'
    },
    {
      frequency: frequency2,
      id: reminderId2,
      reminderEmailTemplateId: '301'
    }
    ]
  }),

  addNewFrequency: (reminderId1, reminderId2, {
    conditionName,
    documentType,
    frequency1,
    frequency2
  }) => ({
    conditionName,
    documentType,
    reminders: [{
      frequency: frequency1,
      id: reminderId1,
      reminderEmailTemplateId: '300'
    },
    {
      frequency: frequency2,
      id: reminderId2,
      reminderEmailTemplateId: '301'
    },
    {
      frequency: '15 Weeks',
      reminderEmailTemplateId: '301'
    }
    ]
  }),

  singleFrequency: id => ({
    conditionName: 'Visa readiness',
    documentType: 'Passport',
    reminders: [{
      frequency: '11 Weeks',
      id,
      reminderEmailTemplateId: '300'
    }
    ]
  }),
};

export const frequency = '5 Days';

export const documentsData = [
  {
    id: 'SyOyr_AtC',
    type: 'visa',
    data: {
      entryType: 'Business',
      country: 'Kenya',
      dateOfIssue: '02-01-2018',
      expiryDate: '06-01-2018',
      cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
    },
    userId: '-FCbaka-ljvhsus83-B',
    createdAt: '2019-01-04 012:11:52.181+01',
    updatedAt: '2019-01-16 012:11:52.181+01',
  },
  {
    id: 'b9gnYkdzG',
    type: 'visa',
    data: {
      entryType: 'Business',
      country: 'Kenya',
      dateOfIssue: '02-01-2018',
      expiryDate: '06-01-2018',
      cloudinaryUrl: 'https://res.cloudinary.com/ined/image/upload/v1538568663/Logo_blue_2x.png'
    },
    userId: '-Flo-RenXiunbs-sIUm',
    createdAt: '2019-01-04 012:11:52.181+01',
    updatedAt: '2019-01-16 012:11:52.181+01',
  },
  {
    id: 'pk42DLnx4C',
    type: 'passport',
    data: {
      passportNumber: 'qw357etrty',
      nationality: 'kenyan',
      dateOfBirth: '1970-01-01',
      dateOfIssue: '2018-11-01',
      placeOfIssue: 'Kenya',
      expiryDate: ajustedDate,
      cloudinaryUrl: 'https://res.cloudinary.com/dbk8ky2'
    },
    userId: '-FCbaka-ljvhsus83-B',
    createdAt: '2019-01-04 012:11:52.181+01',
    updatedAt: '2019-01-16 012:11:52.181+01',
  },
];
