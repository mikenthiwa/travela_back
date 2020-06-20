module.exports = {
  up: queryInterface => queryInterface.bulkInsert(
    'Reminders',
    [
      {
        id: '1',
        frequency: '3 Weeks',
        conditionId: '1',
        reminderEmailTemplateId: '3',
        createdAt: '2019-03-29 18:42:51.086+03',
        updatedAt: '2019-03-29 18:42:51.086+03'
      },
      {
        id: '2',
        frequency: '1 Month',
        conditionId: '2',
        reminderEmailTemplateId: '2',
        createdAt: '2019-03-29 18:49:51.571+03',
        updatedAt: '2019-03-29 18:49:51.571+03'
      }
    ],
    {}
  ),

  down: queryInterface => queryInterface.bulkDelete('Reminders', null, {})
};
