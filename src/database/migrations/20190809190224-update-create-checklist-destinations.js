module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeConstraint('ChecklistDestinations', 'ChecklistDestinations_checklistId_fkey', {
      references: {
        table: 'Checklists',
        field: 'id'
      }
    });
    await queryInterface.addConstraint('ChecklistDestinations', ['checklistId'], {
      type: 'foreign key',
      name: 'ChecklistDestinations_checklistId_fkey',
      references: {
        table: 'Checklists',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('ChecklistDestinations', 'ChecklistDestinations_checklistId_fkey', {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  }
};
