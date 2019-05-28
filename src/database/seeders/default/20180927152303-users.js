module.exports = {
  // eslint-disable-next-line
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
      /* eslint-disable-line */
    'Users',
    [
      {
        id: 1099,
        fullName: 'Loice Meyo',
        email: 'loice.meyo@andela.com',
        userId: '-LMgZQKq6MXAj_41iRWi',
        passportName: 'Loice Meyo',
        department: 'Success',
        occupation: 'software developer',
        manager: 'Samuel Kubai',
        gender: 'female',
        location: 'Nairobi',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        
      },
      {
        id: 1200,
        fullName: 'John Snow',
        email: 'john.snow@andela.com',
        userId: '-LJlsimdclse9s',
        passportName: 'John Snow',
        department: 'Success',
        occupation: 'software developer',
        manager: 'Samuel Kubai',
        gender: 'male',
        location: 'Lagos',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        
      }
    ],
    {},
  ),

  down: (
    queryInterface,
    Sequelize, //eslint-disable-line
  ) => queryInterface.bulkDelete('Users', null, {}),
};
