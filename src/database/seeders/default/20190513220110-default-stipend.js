module.exports = {
  up: queryInterface => queryInterface.bulkInsert('TravelStipends',
    [
      {
        amount: '30',
        country: 'Default',
        createdAt: '2006-10-05T08:36:11.170Z',
        updatedAt: '2006-10-05T08:36:11.170Z',
      }
    ], {}),

  down: queryInterface => queryInterface.bulkDelete('TravelStipends', null, {})
};
