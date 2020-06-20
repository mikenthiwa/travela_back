module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Comments', 'documentId',
    {
      type: Sequelize.STRING,
      references: {
        model: 'TravelReadinessDocuments',
        key: 'id',
        as: 'documentId',
      },
      allowNull: true,
    }
  ),
  down: queryInterface => queryInterface.removeColumn('Comments', 'documentId')
};
