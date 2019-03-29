module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Beds', [
    {
      id: 9,
      bedName: 'bed 1',
      createdAt: '2019-03-27 16:47:03.09+01',
      updatedAt: '2019-03-27 16:47:03.09+01',
      roomId: 'RknCqCEwot'
    },
    {
      id: 10,
      bedName: 'bed 2',
      createdAt: '2019-03-27 16:47:03.09+01',
      updatedAt: '2019-03-27 16:47:03.09+01',
      roomId: 'RknCqCEwot'
    },
    {
      id: 3,
      bedName: 'bed 3',
      createdAt: '2019-03-27 16:47:03.09+01',
      updatedAt: '2019-03-27 16:47:03.09+01',
      roomId: 'RknCqCEwot'
    },
    {
      id: 4,
      bedName: 'bed 4',
      createdAt: '2019-03-27 16:47:03.09+01',
      updatedAt: '2019-03-27 16:47:03.09+01',
      roomId: 'RknCqCEwot'
    },
    {
      id: 5,
      bedName: 'bed 1',
      createdAt: '2019-03-27 16:47:03.09+01',
      updatedAt: '2019-03-27 16:47:03.09+01',
      roomId: 'u0XAapkwYh'
    },
    {
      id: 6,
      bedName: 'bed 2',
      createdAt: '2019-03-27 16:47:03.09+01',
      updatedAt: '2019-03-27 16:47:03.09+01',
      roomId: 'u0XAapkwYh'
    },
    {
      id: 7,
      bedName: 'bed 3',
      createdAt: '2019-03-27 16:47:03.09+01',
      updatedAt: '2019-03-27 16:47:03.09+01',
      roomId: 'u0XAapkwYh'
    },
    {
      id: 8,
      bedName: 'bed 4',
      createdAt: '2019-03-27 16:47:03.09+01',
      updatedAt: '2019-03-27 16:47:03.09+01',
      roomId: 'u0XAapkwYh'
    }
  ]),
  down: queryInterface => queryInterface.bulkDelete('Beds')
};
