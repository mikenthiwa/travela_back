const validccEmails = [
  'moses.muigai@andela.com',
  'gitau.moses@andela.com',
  'moffat.gitau@andela.com'
];

const reminderEmailTemplate = {
  id: 1,
  name: 'Visa Template',
  from: 'moses.gitau@andela.com',
  cc: validccEmails,
  subject: 'Your VISA will expire soon',
  message: 'Kindly update your VISA details. You are required to do so in the next 4 months'
};

const disabledReminderEmailTemplate = {
  id: 40,
  name: 'Disabled Visa Template',
  from: 'super.modon@andela.com',
  cc: validccEmails,
  subject: 'Your VISA will expire soon',
  message: 'Kindly update your VISA details. You are required to do so in the next 4 months',
  disabled: true
};

const reminderEmailTemplatePayload = {
  ...reminderEmailTemplate,
  cc: validccEmails.join(','),
  createdBy: 8378
};


const updatedReminderEmailTemplate = {
  name: 'Updated Visa Template',
  from: 'super.modo@andela.com',
  cc: validccEmails,
  subject: 'Your VISA will expire very soon',
  message: 'Kindly update your VISA details. You are required to do so in the next 3 months'
};

const successResponse = {
  name: 'Visa Template',
  from: 'moses.gitau@andela.com',
  cc: validccEmails.join(','),
  subject: 'Your VISA will expire soon',
  message: 'Kindly update your VISA details. You are required to do so in the next 4 months',
  createdBy: '-MUyHJmKrxA90lPNQ1FOLNm',
  updatedAt: '2019-01-15T18:26:00.427Z',
  createdAt: '2019-01-15T18:26:00.427Z',
  deletedAt: null
};

const emptyFieldsResponse = {
  success: false,
  message: 'Validation failed',
  errors: [
    {
      message: 'Email template name is required',
      name: 'name'
    },
    {
      message: 'Sender email address is required',
      name: 'from'
    },
    {
      message: 'Carbon copy should be a list of emails',
      name: 'cc'
    },
    {
      message: 'Email template subject is required',
      name: 'subject'
    },
    {
      message: 'Email template message is required',
      name: 'message'
    }
  ]
};

export default {
  validccEmails,
  reminderEmailTemplate,
  successResponse,
  emptyFieldsResponse,
  updatedReminderEmailTemplate,
  reminderEmailTemplatePayload,
  disabledReminderEmailTemplate
};
