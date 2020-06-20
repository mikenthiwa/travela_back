module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Trips', 'otherTravelReasons',
    {
      type: Sequelize.STRING,
      allowNull: true,
    }
  ),

  down: queryInterface => queryInterface.removeColumn('Trips', 'otherTravelReasons')
};
