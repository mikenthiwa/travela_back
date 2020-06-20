module.exports = {
  // eslint-disable-next-line
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    // eslint-disable-next-line
    'HelpResources',
    [
      {
        id: 10784,
        link: 'Travel Intranet',
        title: 'https://sites.google.com/andela.com/travel-intranet/home?authuser=0',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 10785,
        link: 'Andela Policy',
        title: 'https://docs.google.com/document/d/1ZqJ3OAF-7NfJAgkzMBdiMoTrsftTWJp9tNhV8eOe1d8/edit',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      }
    ],
    {},
  ),

  down: (
    queryInterface,
    Sequelize, //eslint-disable-line
  ) => queryInterface.bulkDelete('HelpResources', null, {}),
};
