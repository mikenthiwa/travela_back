module.exports = {
  up: queryInterface => queryInterface.bulkInsert('UserRoles',
    [
      {
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        userId: 1,
        roleId: 10948,
      },
      {
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        userId: 1,
        roleId: 29187,
      },
      {
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        userId: 1,
        roleId: 53019,
      },
      {
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        userId: 1,
        roleId: 339458,
      },
      {
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        userId: 1,
        roleId: 401938,
      }
    ], {}),

  down: queryInterface => queryInterface.bulkDelete('UserRoles', null, {})
};
