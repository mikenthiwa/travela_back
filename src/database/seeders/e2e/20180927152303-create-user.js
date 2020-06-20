module.exports = {
  // eslint-disable-next-line
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
      /* eslint-disable-line */
    'Users',
    [
      {
        fullName: 'Travela Test',
        email: 'travela-test@andela.com',
        userId: '-LSsFyueC086niFc9rrz',
        passportName: 'Travela Test',
        department: 'Talent & Development',
        occupation: 'Software developer',
        manager: 'Travela Test',
        gender: 'Female',
        location: 'Nairobi',
        createdAt: '2018-08-15 012:11:53.181+01',
        updatedAt: '2018-08-15 012:11:53.181+01',
        picture: 'https://lh5.googleusercontent.com/-PbuF53uxx4U/AAAAAAAAAAI/AAAAAAAAAAA/AGDgw-i0-XeoeYYk7TpfNBvulhV0oFM6eg/mo/photo.jpg?sz=50'
      },
      {
        fullName: 'John Doe',
        email: 'john.doe@andela.com',
        userId: '-LMgZQKq6MXAj_41iRWi',
        passportName: 'John Doe',
        department: 'Talent & Development',
        occupation: 'Software developer',
        manager: 'Travela Test',
        gender: 'Male',
        location: 'Lagos',
        createdAt: '2018-08-15 012:11:53.181+01',
        updatedAt: '2018-08-15 012:11:53.181+01',
        picture: 'https://lh5.googleusercontent.com/-PbuF53uxx4U/AAAAAAAAAAI/AAAAAAAAAAA/AGDgw-i0-XeoeYYk7TpfNBvulhV0oFM6eg/mo/photo.jpg?sz=50'
      },
      {
        fullName: 'John Snow',
        email: 'john.snow@andela.com',
        userId: '-LMfhfu756fhvgf764',
        passportName: 'John Snow',
        department: 'Talent & Development',
        occupation: 'Software developer',
        manager: 'Travela Test',
        gender: 'Male',
        location: 'Nairobi',
        createdAt: '2018-08-15 012:11:53.181+01',
        updatedAt: '2018-08-15 012:11:53.181+01',
        picture: 'https://lh5.googleusercontent.com/-PbuF53uxx4U/AAAAAAAAAAI/AAAAAAAAAAA/AGDgw-i0-XeoeYYk7TpfNBvulhV0oFM6eg/mo/photo.jpg?sz=50'
      },
    ],
    {},
  ),

  down: (
    queryInterface,
    Sequelize, //eslint-disable-line
  ) => queryInterface.bulkDelete('Users', null, {}),
};
