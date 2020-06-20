module.exports = {
  up: queryInterface => queryInterface.bulkInsert(
    'Centers',
    [
      {
        id: 12345,
        location: 'Lagos, Nigeria',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 23456,
        location: 'Nairobi, Kenya',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 34567,
        location: 'Kigali, Rwanda',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 45678,
        location: 'New York, United States',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 56789,
        location: 'Kampala, Uganda',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 67890,
        location: 'San Francisco, United States',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 78901,
        location: 'Austin, United States',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
    ],
    {},
  ),
  
  down: queryInterface => queryInterface.bulkDelete('Centers', null, {}),
};
