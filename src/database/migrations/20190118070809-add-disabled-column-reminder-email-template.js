module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'ReminderEmailTemplates',
    'disabled',
    {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  ),

  down: queryInterface => queryInterface.removeColumn('ReminderEmailTemplates', 'disabled')
};
