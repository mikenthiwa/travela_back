module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'GuestHouses', 'disabled',
    {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  ),
  down: queryInterface => queryInterface.removeColumn('GuestHouses', 'disabled')
};
