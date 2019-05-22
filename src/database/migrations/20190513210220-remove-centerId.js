module.exports = {
  up: async (queryInterface, Sequelize) => (
    Promise.all([
      await queryInterface.removeConstraint(
        'TravelStipends', 'TravelStipends_centerId_fkey'
      ),
      await queryInterface.addColumn(
        'TravelStipends', 'country',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Default'
        }
      ),
      await queryInterface.sequelize.query(
        `select "TravelStipends"."id" as "id", "Centers"."location" as "location" from
        "TravelStipends" inner join "Centers" on "TravelStipends"."centerId"="Centers"."id"`,
        { type: Sequelize.QueryTypes.SELECT }
      ).then((rows) => {
        rows.forEach((row) => {
          queryInterface.sequelize.query(`UPDATE "TravelStipends" SET "country"='${row.location}'
          WHERE "id"=${row.id}`);
        });
      }),
      await queryInterface.removeColumn('TravelStipends', 'centerId')
    ])
  ),
  down: (queryInterface, Sequelize) => (
    Promise.all([
      queryInterface.addColumn('TravelStipends', 'centerId',
        {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'Default'
        }),
      queryInterface.removeColumn('TravelStipends', 'country')
    ])
  )
};
