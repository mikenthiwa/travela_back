module.exports = {
  up: queryInterface => (
    queryInterface.removeColumn('Comments', 'picture')
  ),
  down: (queryInterface, Sequelize) => (
    queryInterface.addColumn('Comments', 'picture',
      {
        type: Sequelize.STRING,
        allowNull: true,
      })
  )
};
