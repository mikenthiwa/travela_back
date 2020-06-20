module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Rooms', 'isDeleted',
    {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  ),
  down: queryInterface => queryInterface.removeColumn('Rooms', 'isDeleted')
};
