module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Beds',
    [
      {
        id: 1,
        bedName: 'bed1',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        roomId: '1',
        booked: 'TRUE'
      },
      {
        id: 2,
        bedName: 'bed2',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        roomId: '2',
        booked: 'TRUE'
      }
    ], {}),
  down: queryInterface => queryInterface.bulkDelete('Beds', null, {})
};
