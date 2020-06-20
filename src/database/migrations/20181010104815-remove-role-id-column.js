module.exports = {
  up: queryInterface => (
    queryInterface.removeColumn('Users', 'roleId')
  ),
  down: (queryInterface, Sequelize) => (
    queryInterface.addColumn('Users', 'roleId',
      {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 401938
      })
  )
};
