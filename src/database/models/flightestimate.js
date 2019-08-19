module.exports = (sequelize, DataTypes) => {
  const FlightEstimate = sequelize.define('FlightEstimate', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    createdBy: {
      allowNull: false,
      type: DataTypes.STRING
    },
    amount: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    deletedAt: {
      type: DataTypes.DATE
    },
    originCountryId: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
    originRegionId: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
    destinationCountryId: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
    destinationRegionId: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
  }, { paranoid: true });
  FlightEstimate.associate = (models) => {
    FlightEstimate.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
      targetKey: 'userId'
    });
    FlightEstimate.belongsTo(models.Country, {
      foreignKey: 'originCountryId',
      as: 'originCountry',
      targetKey: 'id'
    });
    FlightEstimate.belongsTo(models.TravelRegions, {
      foreignKey: 'originRegionId',
      as: 'originRegion',
      targetKey: 'id'
    });
    FlightEstimate.belongsTo(models.Country, {
      foreignKey: 'destinationCountryId',
      as: 'destinationCountry',
      targetKey: 'id'
    });
    FlightEstimate.belongsTo(models.TravelRegions, {
      foreignKey: 'destinationRegionId',
      as: 'destinationRegion',
      targetKey: 'id'
    });
  };
  return FlightEstimate;
};
