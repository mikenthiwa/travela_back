module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Rooms', [
    {
      id: 'RknCqCEwot',
      roomName: 'Room 1',
      roomType: 'Non-Ensuite',
      bedCount: 4,
      isDeleted: false,
      faulty: false,
      createdAt: '2019-03-21T11:17:14.977Z',
      updatedAt: '2019-03-21T11:17:14.977Z',
      guestHouseId: '10948'
    },
    {
      id: 'u0XAapkwYh',
      roomName: 'Room 2',
      roomType: 'Ensuite',
      bedCount: 4,
      isDeleted: false,
      faulty: false,
      createdAt: '2019-03-21T11:17:14.977Z',
      updatedAt: '2019-03-21T11:17:14.977Z',
      guestHouseId: '10948'
    }
  ]),
  down: queryInterface => queryInterface.bulkDelete('Rooms')
};
