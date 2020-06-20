module.exports = {
  up: queryInterface => queryInterface.bulkInsert(
    'GuestHouses',
    [
      {
        id: '12312',
        houseName: 'Travel Team Guest House',
        location: 'Lagos, Nigeria',
        bathRooms: 1,
        imageUrl: 'guest.com',
        userId: '-LSsFyueC086niFc9rrz',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      }
    ],
    {},
  ),

  down: queryInterface => queryInterface.bulkDelete('GuestHouses', null, {}),
};
