module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Requests', 'stipend',
    {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    }
  ),
  down: queryInterface => queryInterface.removeColumn('Requests', 'stipend')
};
