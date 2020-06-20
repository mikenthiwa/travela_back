module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeConstraint(
      'ReminderEmailTemplates', 'ReminderEmailTemplates_createdBy_fkey'
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "ReminderEmailTemplates" alter column "createdBy" 
          TYPE INTEGER USING "createdBy"::integer`
    );
    await queryInterface.sequelize.query(
      `ALTER TABLE "ReminderEmailTemplates" ADD CONSTRAINT "ReminderEmailTemplates_createdBy_fkey"
      FOREIGN KEY ("createdBy") REFERENCES "Users"(id) 
      ON DELETE CASCADE;`
    );
  },
  down: queryInterface => queryInterface.removeConstraint(
    'ReminderEmailTemplates', 'ReminderEmailTemplates_createdBy_fkey'
  ),
};
