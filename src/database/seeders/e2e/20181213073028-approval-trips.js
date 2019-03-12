module.exports = {
  // eslint-disable-next-line
    up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
        /* eslint-disable-line */
    'Trips',
    [
      {
        id: '1',
        origin: 'Nairobi, Kenya',
        destination: 'Lagos, Nigeria',
        bedId: null,
        returnDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + 5}`,
        departureDate: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + 2}`,
        requestId: '3451',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: '2',
        origin: 'Kampala',
        destination: 'Nairobi',
        bedId: null,
        returnDate: '2018-10-16',
        departureDate: '2018-09-16',
        requestId: '3459',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: '3',
        origin: 'Kampala',
        destination: 'Nairobi',
        bedId: null,
        returnDate: '2018-10-16',
        departureDate: '2018-09-16',
        requestId: '3458',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: '4',
        origin: 'Kampala',
        destination: 'Nairobi',
        bedId: null,
        returnDate: '2018-10-16',
        departureDate: '2018-09-16',
        requestId: '34510',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: '5',
        origin: 'Kampala',
        destination: 'Nairobi',
        bedId: null,
        returnDate: '2018-10-16',
        departureDate: '2018-09-16',
        requestId: '3452',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      }
    ],
    {},
  ),

  down: (
    queryInterface,
      Sequelize, //eslint-disable-line
  ) => queryInterface.bulkDelete('Trips', null, {}),
};
