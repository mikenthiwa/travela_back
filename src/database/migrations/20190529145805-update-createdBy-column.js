module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.changeColumn(
    'TravelStipends', 'createdBy', {
      type: Sequelize.STRING,
      allowNull: true,
    }
  ),

  down: (queryInterface, Sequelize) => queryInterface.changeColumn(
    'TravelStipends', 'createdBy', {
      type: Sequelize.STRING,
      allowNull: true,
    }
  )
};
