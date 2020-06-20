module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Beds', 'booked',
    {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  ),
  down: queryInterface => queryInterface.removeColumn('Beds', 'booked')
};
