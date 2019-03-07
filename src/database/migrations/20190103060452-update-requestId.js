module.exports = {
  up: (queryInterface, Sequelize) => (
    queryInterface.changeColumn('Comments', 'requestId',
      {
        type: Sequelize.STRING,
        allowNull: true,
      })
  ),
  down: (queryInterface, Sequelize) => (
    queryInterface.changeColumn('Comments', 'requestId',
      {
        type: Sequelize.STRING,
        allowNull: true,
      })
  )
};
