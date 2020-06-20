module.exports = {
  up: queryInterface => queryInterface.bulkInsert('UserRoles',
    [
      {
        createdAt: '2018-08-14 012:11:51.181+01',
        updatedAt: '2018-08-14 012:11:51.181+01',
        userId: 1098,
        roleId: '10948',
      }
    ], {}),

  down: queryInterface => queryInterface.bulkDelete('UserRoles', null, {})
};
