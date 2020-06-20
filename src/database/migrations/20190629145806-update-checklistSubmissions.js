const query1 = `UPDATE "ChecklistSubmissions" SET "userUpload"="userResponse", "userResponse"=NULL
                WHERE "userResponse" LIKE '{%'`;
const query2 = 'UPDATE "ChecklistSubmissions" SET "userResponse"=REPLACE("userResponse", \'"\', \'\')';

const query3 = 'UPDATE "ChecklistSubmissions" SET "userResponse"=\'yes\' WHERE "userUpload"!=\'{}\'';

const query4 = `UPDATE "ChecklistSubmissions" SET "userResponse"=CONCAT('"',"userResponse", '"')
                WHERE "userResponse" IS NOT NULL`;

const query5 = `UPDATE "ChecklistSubmissions" SET "userResponse"="userUpload", "userUpload"='{}'
                WHERE "userUpload" LIKE '{%' AND "userResponse" IS NULL`;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('ChecklistSubmissions', 'value', 'userResponse');
    await queryInterface.addColumn('ChecklistSubmissions', 'userUpload', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '{}'
    });
    await queryInterface.sequelize.query(query1);
    await queryInterface.sequelize.query(query2);
    await queryInterface.sequelize.query(query3);
  },
  down: async (queryInterface) => {
    await queryInterface.sequelize.query(query4);
    await queryInterface.sequelize.query(query5);
    await queryInterface.renameColumn('ChecklistSubmissions', 'userResponse', 'value');
    await queryInterface.removeColumn('ChecklistSubmissions', 'userUpload');
  }
};
