module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ReminderDisableReasons', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    reason: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    reminderEmailTemplateId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      allowNull: true,
      references: {
        model: 'ReminderEmailTemplates',
        key: 'id',
        as: 'reminderEmailTemplate',
      },
    },
    conditionId: {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      allowNull: true,
      references: {
        model: 'Conditions',
        key: 'id',
        as: 'condition',
      },
    }
  }),
  down: queryInterface => queryInterface.dropTable('ReminderDisableReasons')
};
