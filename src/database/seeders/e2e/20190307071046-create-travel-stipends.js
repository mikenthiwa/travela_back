module.exports = {
  up: queryInterface => queryInterface.bulkInsert(
    'TravelStipends',
    [
      {
        id: 10948,
        amount: 232,
        createdBy: '-LSsFyueC086niFc9rrz',
        centerId: 12345,
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 20948,
        amount: 200,
        createdBy: '-LSsFyueC086niFc9rrz',
        centerId: 23456,
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 30948,
        amount: 300,
        createdBy: '-LSsFyueC086niFc9rrz',
        centerId: 34567,
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 40948,
        amount: 100,
        createdBy: '-LSsFyueC086niFc9rrz',
        centerId: 56789,
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 50948,
        amount: 1000,
        createdBy: '-LSsFyueC086niFc9rrz',
        centerId: 45678,
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 70948,
        amount: 123,
        createdBy: '-LSsFyueC086niFc9rrz',
        centerId: 67890,
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
    ],
    {},
  ),

  down:
    queryInterface => queryInterface.bulkDelete('TravelStipends', null, {}),
};
