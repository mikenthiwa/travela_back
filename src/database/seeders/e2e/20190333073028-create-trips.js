module.exports = {
  // eslint-disable-next-line
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    /* eslint-disable-line */
    'Trips',
    [
      {
        id: 'uPOvo4kLlW',
        origin: 'Lagos, Nigeria',
        destination: 'Nairobi, Kenya',
        bedId: 6,
        returnDate: '2019-04-20',
        departureDate: '2019-04-16',
        requestId: 'DYFYU4ML-',
        createdAt: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + 2}`,
        updatedAt: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + 1}`,
        otherTravelReasons: 'ALC'
      }
    ],
    {},
  ),

  down: (
    queryInterface,
    Sequelize, //eslint-disable-line
  ) => queryInterface.bulkDelete('Trips', null, {}),
};
