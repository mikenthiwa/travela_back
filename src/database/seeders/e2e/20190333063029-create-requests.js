module.exports = {
  // eslint-disable-next-line
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    /* eslint-disable-line */
    'Requests',
    [
      {
        id: 'DYFYU4ML-',
        name: 'Travela Test',
        manager: 'Travela Test',
        gender: 'Female',
        department: 'Talent & Development',
        role: 'Software developer',
        status: 'Open',
        userId: '-LSsFyueC086niFc9rrz',
        tripType: 'return',
        createdAt: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + 2}`,
        updatedAt: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + 1}`,
        picture: 'https://lh5.googleusercontent.com/-PbuF53uxx4U/AAAAAAAAAAI/AAAAAAAAAAA/ACHi3rdjr4eMvuGvkumbC20tfiQsn0RwLw/s50-mo/photo.jpg',
        stipendBreakdown: '[{"subTotal":800,"location":"Nairobi","dailyRate":200,"duration":4,"centerExists":true}]'
      }
    ],
    {},
  ),

  down: (
    queryInterface,
    Sequelize, //eslint-disable-line
  ) => queryInterface.bulkDelete('Requests', null, {}),
};
