module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeConstraint('ChecklistOrigins', 'ChecklistOrigins_checklistId_fkey', {
      references: {
        table: 'Checklists',
        field: 'id'
      }
    });
    await queryInterface.addConstraint('ChecklistOrigins', ['checklistId'], {
      type: 'foreign key',
      name: 'ChecklistOrigins_checklistId_fkey',
      references: {
        table: 'Checklists',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('ChecklistOrigins', 'ChecklistOrigins_checklistId_fkey', {
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  }
};
