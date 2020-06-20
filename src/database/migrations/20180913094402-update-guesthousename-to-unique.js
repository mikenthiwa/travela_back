

module.exports = {
  // eslint-disable-next-line
  up: (queryInterface, Sequelize) => queryInterface.addConstraint(
    'GuestHouses', ['houseName'], {
      type: 'unique',
      name: 'custom_unique_constraint_housename'
    }
  ),

  down: queryInterface => queryInterface.removeColumn('GuestHouses', 'houseName')
};
