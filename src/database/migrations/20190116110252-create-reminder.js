module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Reminders', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    frequency: {
      allowNull: false,
      type: Sequelize.STRING
    },
    conditionId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      allowNull: false,
      references: {
        model: 'Conditions',
        key: 'id',
        as: 'conditions',
      },
    },
    reminderEmailTemplateId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      allowNull: false,
      references: {
        model: 'ReminderEmailTemplates',
        key: 'id',
        as: 'reminderEmailTemplates',
      },
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

  down: queryInterface => queryInterface.dropTable('Reminders')
};
