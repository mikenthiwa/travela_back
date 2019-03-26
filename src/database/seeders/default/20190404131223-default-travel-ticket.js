
module.exports = {
  up: queryInterface => queryInterface.bulkInsert('ChecklistItems',
    [
      {
        id: '2',
        name: 'Travel Ticket',
        requiresFiles: true,
        deleteReason: null,
        destinationName: 'Default',
        createdAt: '2017-10-05T08:36:11.170Z',
        updatedAt: '2017-10-05T08:36:11.170Z',
      }
    ], {}),

  down: queryInterface => queryInterface.bulkDelete('ChecklistItems', null, {})
};
