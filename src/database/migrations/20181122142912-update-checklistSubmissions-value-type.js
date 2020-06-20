module.exports = {
  up: (queryInterface) => {
    const query = 'ALTER TABLE "ChecklistSubmissions" alter column "value" TYPE TEXT';
    return queryInterface.sequelize.query(query);
  },

  down: (queryInterface) => {
    const query = 'ALTER TABLE "ChecklistSubmissions" alter column "value" TYPE VARCHAR';
    return queryInterface.sequelize.query(query);
  }
};
