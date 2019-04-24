module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Users',
    'bambooHrId',
    {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  ),

  down: queryInterface => queryInterface.removeColumn('Users', 'bambooHrId')
};
