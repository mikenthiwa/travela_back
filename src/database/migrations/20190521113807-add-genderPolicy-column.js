module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn('GuestHouses', 'genderPolicy', {
    allowNull: false,
    type: Sequelize.STRING,
    defaultValue: 'Unisex'
  }),
  down: queryInterface => queryInterface.removeColumn('GuestHouses', 'genderPolicy')
};
