module.exports = (sequelize, DataTypes) => {
  const FlightEstimate = sequelize.define('FlightEstimate', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    originRegion: {
      type: DataTypes.STRING,
    },
    destinationRegion: {
      type: DataTypes.STRING,
    },
    originCountry: {
      type: DataTypes.STRING,
    },
    destinationCountry: {
      type: DataTypes.STRING,
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
    }
  }, { paranoid: true });
  FlightEstimate.associate = (models) => {
    FlightEstimate.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
      targetKey: 'userId'
    });
  };
  return FlightEstimate;
};
