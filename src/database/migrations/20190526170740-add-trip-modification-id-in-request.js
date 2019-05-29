module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Requests', 'tripModificationId',
    {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'TripModifications',
        key: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    }
  ),

  down: queryInterface => Promise.all([
    queryInterface.removeConstraint('Requests', 'Requests_tripModificationId_fkey'),
    queryInterface.removeColumn('Requests', 'tripModificationId')
  ])
};
