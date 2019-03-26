module.exports = {
  up: queryInterface => queryInterface.bulkInsert(
    'Rooms',
    [
      {
        id: '12313',
        roomName: 'Room 1',
        roomType: 'Ensuite',
        bedCount: 1,
        faulty: false,
        guestHouseId: '12312',
        isDeleted: false,
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      }
    ],
    {},
  ),
  down: queryInterface => queryInterface.bulkDelete('Rooms', null, {}),
};
