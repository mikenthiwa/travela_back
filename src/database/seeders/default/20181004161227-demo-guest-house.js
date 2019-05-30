module.exports = {
  up: queryInterface => queryInterface.bulkInsert('GuestHouses',
    [
      {
        id: 'guest-house-1',
        houseName: 'Mini flat-B',
        location: 'Lagos, Nigeria',
        bathRooms: '1',
        imageUrl: 'https://www.dropbox.com/s/c2n63x2jamh3ndv/guesthouse2.jpg?raw=1',
        genderPolicy: 'Unisex',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        userId: '-LJV4b1QTCYewOtk5F63'
      },
      {
        id: 'guest-house-2',
        houseName: 'Major flat-A',
        location: 'Nairobi, Kenya',
        bathRooms: '1',
        imageUrl: 'https://www.dropbox.com/s/jpv2axwo29qzl18/guesthouse1.jpg?raw=1',
        genderPolicy: 'Unisex',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        userId: '-LJV4b1QTCYewOtk5F63'
      }
    ], {}),

  down: queryInterface => queryInterface.bulkDelete('Person', null, {})
};
