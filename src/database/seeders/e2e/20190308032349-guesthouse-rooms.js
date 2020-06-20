module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Rooms',
    [
      {
        id: '1',
        roomName: 'room1',
        roomType: 'Ensuite',
        bedCount: 1,
        faulty: 'FALSE',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        guestHouseId: '4',
        isDeleted: 'FALSE'
      },
      {
        id: '2',
        roomName: 'room2',
        roomType: 'Ensuite',
        bedCount: 1,
        faulty: 'FALSE',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        guestHouseId: '4',
        isDeleted: 'FALSE'
      }
    ], {}),

  down: queryInterface => queryInterface.bulkDelete('Rooms', null, {})
};
