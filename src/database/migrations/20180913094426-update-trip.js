module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Trips', 'travelCompletion',
    {
      allowNull: false,
      type: Sequelize.ENUM('true', 'false'),
      defaultValue: 'false'
    }
  ),
  down: (queryInterface) => {
    const { sequelize } = queryInterface;
    return sequelize.transaction((transaction) => {
      const queryList = [];
      queryList.push(queryInterface.sequelize
        .query('DROP TYPE IF EXISTS "enum_Trips_travelCompletion" CASCADE',
          { transaction }));
      return Promise.all(queryList);
    });
  }
};
