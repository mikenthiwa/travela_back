module.exports = {
  up: (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;
    return sequelize.transaction((transaction) => {
      const queryList = [];
      queryList.push(queryInterface.addColumn(
        'Trips',
        'checkStatus',
        {
          type: Sequelize.ENUM('Not Checked In', 'Checked In', 'Checked Out'),
          allowNull: false,
          defaultValue: 'Not Checked In',
        },
        { transaction }
      ));
      queryList.push(queryInterface.addColumn(
        'Trips',
        'checkInDate',
        Sequelize.DATE,
        { transaction }
      ));
      queryList.push(queryInterface.addColumn(
        'Trips',
        'checkOutDate',
        Sequelize.DATE,
        { transaction }
      ));
      queryList.push(queryInterface.addColumn(
        'Trips',
        'lastNotifyDate',
        Sequelize.DATE,
        { transaction }
      ));
      queryList.push(queryInterface.addColumn(
        'Trips',
        'notificationCount',
        {
          allowNull: false,
          defaultValue: 0,
          type: Sequelize.INTEGER
        },
        { transaction }
      ));
      return Promise.all(queryList);
    });
  },

  down: (queryInterface) => {
    const { sequelize } = queryInterface;
    return sequelize.transaction((transaction) => {
      const queryList = [];
      queryList.push(queryInterface.sequelize
        .query('DROP TYPE IF EXISTS "enum_Trips_checkStatus" CASCADE',
          { transaction }));
      queryList.push(queryInterface
        .removeColumn('Trips', 'checkInDate', { transaction }));
      queryList.push(queryInterface
        .removeColumn('Trips', 'checkOutDate', { transaction }));
      queryList.push(queryInterface
        .removeColumn('Trips', 'lastNotifyDate', { transaction }));
      queryList.push(queryInterface
        .removeColumn('Trips', 'notificationCount', { transaction }));
      return Promise.all(queryList);
    });
  }
};
