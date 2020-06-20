module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.changeColumn(
    'ReminderEmailTemplates', 'message', {
      type: Sequelize.TEXT
    }
  ),

  down: (queryInterface, Sequelize) => queryInterface.changeColumn(
    'ReminderEmailTemplates', 'message', {
      type: Sequelize.TEXT
    }
  )
};
