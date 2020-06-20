module.exports = {
  up: (queryInterface, Sequelize) => queryInterface
    .createTable('ChecklistItems', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      requiresFiles: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      deleteReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      destinationName: {
        type: Sequelize.STRING,
        allowNull: false
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
  down: queryInterface => queryInterface.dropTable('ChecklistItems')
};
