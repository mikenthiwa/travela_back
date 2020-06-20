module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Users', 'deletedAt',
    {
      allowNull: true,
      type: Sequelize.DATE
    }
  ),
  down: queryInterface => queryInterface.removeColumn('Users', 'deletedAt')
};
