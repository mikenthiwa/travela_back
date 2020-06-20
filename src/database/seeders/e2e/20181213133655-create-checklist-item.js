module.exports = {
  up: queryInterface => queryInterface.bulkInsert('ChecklistItems',
    [
      {
        id: '1',
        name: 'Travel Ticket Details',
        requiresFiles: false,
        deleteReason: null,
        destinationName: 'Lagos, Nigeria',
        createdAt: '2018-10-05T08:36:11.170Z',
        updatedAt: '2018-10-05T08:36:11.170Z',
      },
      {
        id: '2',
        name: 'Passport',
        requiresFiles: false,
        deleteReason: null,
        destinationName: 'Nairobi, Kenya',
        createdAt: '2018-10-05T08:36:11.170Z',
        updatedAt: '2018-10-05T08:36:11.170Z',
      },
    ], {}),

  down: queryInterface => queryInterface.bulkDelete('ChecklistItems', null, {})
};
