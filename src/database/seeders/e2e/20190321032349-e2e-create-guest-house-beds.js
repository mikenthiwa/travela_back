module.exports = {
  up: queryInterface => queryInterface.bulkInsert(
    'Beds',
    [
      {
        id: '12314',
        bedName: 'Room 1',
        booked: false,
        roomId: '12313',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      }
    ],
    {},
  ),
  down: queryInterface => queryInterface.bulkDelete('Beds', null, {}),
};
