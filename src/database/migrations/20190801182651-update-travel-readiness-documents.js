
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('TravelReadinessDocuments', 'type');
    await queryInterface.removeColumn('TravelReadinessDocuments', 'deletedAt');
    await queryInterface.addColumn('TravelReadinessDocuments', 'type', {
      type: Sequelize.STRING,
      references: {
        model: 'DocumentTypes',
        key: 'name'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },
  down: queryInterface => queryInterface.dropTable('TravelReadinessDocuments',
    { cascade: true, force: true })
};
