module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Countries',
    [
      {
        id: 100,
        regionId: 1001,
        country: 'Kenya',
        createdAt: '2019-10-05T08:36:11.170Z',
        updatedAt: '2019-10-05T08:36:11.170Z'
      },
      {
        id: 101,
        regionId: 1002,
        country: 'Nigeria',
        createdAt: '2019-10-05T09:37:11.170Z',
        updatedAt: '2019-10-05T09:37:11.170Z'
      }
    ],
    {}),

  down: queryInterface => queryInterface.bulkDelete('Countries', null, {})
};
