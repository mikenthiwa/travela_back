module.exports = {
  up: queryInterface => (
    queryInterface.removeColumn('Comments', 'userName')
  ),
  down: (queryInterface, Sequelize) => (
    queryInterface.addColumn('Comments', 'userName',
      {
        type: Sequelize.STRING,
        allowNull: true,
      })
  )
};
