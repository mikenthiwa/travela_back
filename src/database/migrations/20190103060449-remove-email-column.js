module.exports = {
  up: queryInterface => (
    queryInterface.removeColumn('Comments', 'userEmail')
  ),
  down: (queryInterface, Sequelize) => (
    queryInterface.addColumn('Comments', 'userEmail',
      {
        type: Sequelize.STRING,
        allowNull: true,
      })
  )
};
