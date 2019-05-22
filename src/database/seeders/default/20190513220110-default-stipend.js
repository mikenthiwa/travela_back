module.exports = {
  up: queryInterface => queryInterface.bulkInsert('TravelStipends',
    [
      {
        amount: '30',
        country: 'Default',
        createdBy: '-LJV4b1QTCYewOtk5F63',
        createdAt: '2006-10-05T08:36:11.170Z',
        updatedAt: '2006-10-05T08:36:11.170Z',
      }
    ], {}),

  down: queryInterface => queryInterface.bulkDelete('TravelStipends', null, {})
};
