module.exports = {
  up: queryInterface => queryInterface.bulkInsert('GuestHouses', [
    {
      id: '10948',
      houseName: 'Guest House B',
      location: 'Nairobi, Kenya',
      bathRooms: 3,
      imageUrl: 'https://res.cloudinary.com/authors-haven/image/upload/v1553167046/rxpwhtlhrzr5s1i5i8gt.jpg',
      disabled: false,
      createdAt: '2019-03-21T11:17:14.928Z',
      updatedAt: '2019-03-21T11:17:14.928Z',
      userId: '-LSsFyueC086niFc9rrz',
    }
  ]),
  down: queryInterface => queryInterface.bulkDelete('GuestHouses')
};
