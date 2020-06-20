module.exports = {
  up: queryInterface => queryInterface.bulkInsert('TravelRegions',
    [
      {
        id: '1001',
        region: 'East Africa',
        description: 'Kenya, Uganda and Rwanda',
        createdAt: '2019-10-05T08:36:11.170Z',
        updatedAt: '2019-10-05T08:36:11.170Z',
      },
      {
        id: '1002',
        region: 'West Africa',
        description: 'Nigeria',
        createdAt: '2019-10-05T09:37:11.170Z',
        updatedAt: '2019-10-05T09:37:11.170Z',
      },
      {
        id: '9999',
        region: 'Default Region',
        description: 'Fallback Region for countries that don\'t have regions yet',
        createdAt: '2019-10-05T09:38:11.170Z',
        updatedAt: '2019-10-05T09:38:11.170Z',
      }
    ], {}),

  down: queryInterface => queryInterface.bulkDelete('TravelRegions', null, {})
};
