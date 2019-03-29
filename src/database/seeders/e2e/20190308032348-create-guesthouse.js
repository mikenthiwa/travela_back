module.exports = {
  // eslint-disable-next-line
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    /* eslint-disable-line */
    'GuestHouses',
    [
      {
        id: '4',
        houseName: 'Qwetu',
        location: 'Nairobi, Kenya',
        bathRooms: 3,
        imageUrl: 'https://res.cloudinary.com/skybound/image/upload/s--GDp7KfXp--/v1553082791/frontend_upload/image_bd6dvy.jpg',
        userId: '-LMgZQKq6MXAj_41iRWi',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      }
    ],
    {},
  ),

  down: (
    queryInterface,
    Sequelize, //eslint-disable-line
  ) => queryInterface.bulkDelete('GuestHouses', null, {}),
};
