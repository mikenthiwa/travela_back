module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Approvals',
    [
      {
        requestId: '3451',
        status: 'Approved',
        approverId: 'Travela Test',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        deletedAt: null
      },
      {
        requestId: '3459',
        status: 'Open',
        approverId: 'Travela Test',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        deletedAt: null
      },
      {
        requestId: '3458',
        status: 'Open',
        approverId: 'Travela Test',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        deletedAt: null
      },
      {
        requestId: '34510',
        status: 'Open',
        approverId: 'Travela Test',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        deletedAt: null
      },
      {
        requestId: '3452',
        status: 'Rejected',
        approverId: 'Travela Test',
        createdAt: '2018-08-16 012:11:52.181+01',
        updatedAt: '2018-08-16 012:11:52.181+01',
        deletedAt: null
      },
    ],
    {}),

  down: (
    queryInterface,
    Sequelize, //eslint-disable-line
  ) => queryInterface.bulkDelete('Approvals', null, {}),
};
