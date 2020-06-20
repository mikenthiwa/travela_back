module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Trips', 'deletedAt',
    {
      allowNull: true,
      type: Sequelize.DATE
    }
  ),
  down: queryInterface => queryInterface.removeColumn('Trips', 'deletedAt')
};
