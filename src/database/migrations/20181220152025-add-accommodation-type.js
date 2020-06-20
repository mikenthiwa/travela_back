module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn(
    'Trips', 'accommodationType',
    {
      type: Sequelize.ENUM('Residence', 'Hotel Booking', 'Not Required'),
      allowNull: true,
      defaultValue: 'Residence'
    }
  ),

  down: queryInterface => queryInterface.sequelize
    .query(`
      ALTER TABLE "Trips" DROP COLUMN "accommodationType";
      DROP TYPE IF EXISTS "enum_Trips_accommodationType";
    `)
};
