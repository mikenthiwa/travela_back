module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Conditions',
    'disabled',
    {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  ),

  down: queryInterface => queryInterface.removeColumn('Conditions', 'disabled')
};
