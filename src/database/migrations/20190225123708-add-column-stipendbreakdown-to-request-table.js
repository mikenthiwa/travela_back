module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Requests', 'stipendBreakdown',
    {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: ''
    }
  ),
  down: queryInterface => queryInterface.removeColumn('Requests', 'stipendBreakdown')
};
