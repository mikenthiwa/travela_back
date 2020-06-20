module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Users', 'lastLogin', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    }
  ),

  down: queryInterface => queryInterface.removeColumn('Users', 'lastLogin')
};
