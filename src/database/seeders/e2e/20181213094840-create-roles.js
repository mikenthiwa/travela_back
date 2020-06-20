module.exports = {
  // eslint-disable-next-line
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
      /* eslint-disable-line */
    'Roles',
    [
      {
        id: 10948,
        roleName: 'Super Administrator',
        description: 'Can perform all task on travela',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 29187,
        roleName: 'Travel Administrator',
        description: 'Can view and approve all request on  travela',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 339458,
        roleName: 'Travel Team Member',
        description: 'Can view all request made on travela',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 401938,
        roleName: 'Requester',
        description: 'Can make travel request',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 53019,
        roleName: 'Manager',
        description: 'Can request and approve travel request ',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
      {
        id: 60000,
        roleName: 'budgetChecker',
        description: 'Can request and approve travel request ',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
      },
    ],
    {},
  ),

  down: (
    queryInterface,
    Sequelize, //eslint-disable-line
  ) => queryInterface.bulkDelete('Roles', null, {}),
};
