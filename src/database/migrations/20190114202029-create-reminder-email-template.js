module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ReminderEmailTemplates', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    name: {
      allowNull: false,
      type: Sequelize.STRING
    },
    from: {
      allowNull: false,
      type: Sequelize.STRING
    },
    cc: {
      allowNull: true,
      type: Sequelize.STRING
    },
    subject: {
      allowNull: false,
      type: Sequelize.STRING
    },
    message: {
      allowNull: false,
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
    },
    createdBy: {
      allowNull: false,
      type: Sequelize.STRING,
      references: {
        model: 'Users',
        key: 'userId',
        onDelete: 'set null',
        as: 'creator'
      }
    },
  }),
  down: queryInterface => queryInterface.dropTable('ReminderEmailTemplates')
};
