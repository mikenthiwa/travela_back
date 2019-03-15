module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'ChecklistSubmissions', 'documentId',
    {
      type: Sequelize.STRING,
      allowNull: true,
      references: {
        model: 'TravelReadinessDocuments',
        key: 'id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      }
    }
  ),
  down: queryInterface => queryInterface.removeColumn('ChecklistSubmissions', 'documentId')
};
