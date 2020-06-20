module.exports = {
  up: queryInterface => queryInterface.bulkInsert(
    'ReminderEmailTemplates',
    [
      {
        id: '1',
        name: 'Visa Expires',
        from: 'andrew.hinga@andela.com',
        cc: 'slyvia.wanjiku@andela.com',
        subject: 'Replace the expired Visa',
        message: 'Book an appointment',
        createdAt: '2019-03-27 012:11:52.181+01',
        updatedAt: '2019-03-27 012:11:52.181+01',
        deletedAt: null,
        createdBy: 1
      },
      {
        id: '2',
        name: 'Passport Registration',
        from: 'andrew.hinga@andela.com',
        cc: 'slyvia.wanjiku@andela.com',
        subject: 'Template 1 Template 1',
        message: 'Template 1 Template 1 Template 1 Template 1 Template 1 Template 1',
        createdAt: '2019-03-27 012:11:52.181+01',
        updatedAt: '2019-03-27 012:11:52.181+01',
        deletedAt: null,
        createdBy: 1
      },
      {
        id: '3',
        name: 'Passport Renewal',
        from: 'andrew.hinga@andela.com',
        cc: 'slyvia.wanjiku@andela.com',
        subject: 'Template 2 Template 2',
        message: 'Template 1 Template 1 Template 1 Template 1 Template 1 Template 1',
        createdAt: '2019-03-27 012:12:52.181+01',
        updatedAt: '2019-03-27 012:12:52.181+01',
        deletedAt: null,
        createdBy: 1
      }
    ],
    {}
  ),

  down: queryInterface => queryInterface.bulkDelete('ReminderEmailTemplates', null, {})
};
