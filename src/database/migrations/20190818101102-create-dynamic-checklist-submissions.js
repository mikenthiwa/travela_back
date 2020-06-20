

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('DynamicChecklistSubmissions', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.STRING
    },
    userId: {
      type: Sequelize.STRING,
      onDelete: 'CASCADE',
      allowNull: false,
      references: {
        model: 'Users',
        key: 'userId',
      },
    },
    requestId: {
      type: Sequelize.STRING,
      onDelete: 'CASCADE',
      allowNull: false,
      references: {
        model: 'Requests',
        key: 'id',
      },
    },
    completionCount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    isSubmitted: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    },
    checklist: {
      type: Sequelize.JSONB,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  }),
  down: queryInterface => queryInterface.dropTable('DynamicChecklistSubmissions',
    { cascade: true, force: true })
};
