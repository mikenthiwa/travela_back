module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Maintainances', 'deletedAt',
    {
      allowNull: true,
      type: Sequelize.DATE
    }
  ),
  down: queryInterface => queryInterface.removeColumn('Maintainances', 'deletedAt')
};
