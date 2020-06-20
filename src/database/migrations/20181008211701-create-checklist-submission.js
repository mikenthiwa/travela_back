module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .createTable('ChecklistSubmissions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      value: {
        type: Sequelize.STRING
      },
      tripId: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'Trips',
          key: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        }
      },
      checklistItemId: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    }),
  down: queryInterface => queryInterface.dropTable('ChecklistSubmissions')
};
