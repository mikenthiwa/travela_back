module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Trips', 'travelReasons',
    {
      type: Sequelize.INTEGER,
      onDelete: 'set null',
      allowNull: true,
      references: {
        model: 'TravelReasons',
        key: 'id',
        as: 'travelReasons',
      },
    }
  ),
  down: queryInterface => queryInterface.removeColumn('Trips', 'travelReasons')
};
