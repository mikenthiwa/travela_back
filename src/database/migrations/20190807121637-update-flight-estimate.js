module.exports = {
  up: (queryInterface, Sequelize) => Promise
    .all([queryInterface.addColumn('FlightEstimates', 'originCountryId',
      {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        allowNull: true,
        references: {
          model: 'Countries',
          key: 'id',
          as: 'originCountry'
        }
      }),
    queryInterface.addColumn('FlightEstimates', 'originRegionId',
      {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        allowNull: true,
        references: {
          model: 'TravelRegions',
          key: 'id',
          as: 'originRegion',
        }
      }),
    queryInterface.addColumn('FlightEstimates', 'destinationCountryId',
      {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        allowNull: true,
        references: {
          model: 'Countries',
          key: 'id',
          as: 'destinationCountry',
        }
      }),
    queryInterface.addColumn('FlightEstimates', 'destinationRegionId',
      {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        allowNull: true,
        references: {
          model: 'TravelRegions',
          key: 'id',
          as: 'destinationRegion',
        }
      }),
    queryInterface.removeColumn('FlightEstimates', 'originCountry'),
    queryInterface.removeColumn('FlightEstimates', 'destinationCountry'),
    queryInterface.removeColumn('FlightEstimates', 'originRegion'),
    queryInterface.removeColumn('FlightEstimates', 'destinationRegion')]),

  down: (queryInterface, Sequelize) => Promise
    .all([queryInterface.addColumn('FlightEstimates', 'originCountry', {
      type: Sequelize.STRING,
    }),
    queryInterface.addColumn('FlightEstimates', 'destinationCountry', {
      type: Sequelize.STRING,
    }),
    queryInterface.addColumn('FlightEstimates', 'originRegion', {
      type: Sequelize.STRING,
    }),
    queryInterface.addColumn('FlightEstimates', 'destinationRegion', {
      type: Sequelize.STRING,
    }),
    queryInterface.removeColumn('FlightEstimates', 'originRegionId'),
    queryInterface.removeColumn('FlightEstimates', 'destinationCountryId'),
    queryInterface.removeColumn('FlightEstimates', 'originCountryId'),
    queryInterface.removeColumn('FlightEstimates', 'destinationRegionId')
    ])
};
