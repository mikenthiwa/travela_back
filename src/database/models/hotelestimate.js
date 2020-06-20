module.exports = (sequelize, DataTypes) => {
  const HotelEstimate = sequelize.define('HotelEstimate',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        type: DataTypes.INTEGER
      },
      amount: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      countryId: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      regionId: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      createdBy: {
        type: DataTypes.INTEGER
      },
      deletedAt: {
        type: DataTypes.DATE
      }
    }, { paranoid: true });
  HotelEstimate.associate = (models) => {
    HotelEstimate.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
      targetKey: 'id'
    });
    HotelEstimate.belongsTo(models.Country, {
      foreignKey: 'countryId',
      as: 'country',
      targetKey: 'id'
    });
    HotelEstimate.belongsTo(models.TravelRegions, {
      foreignKey: 'regionId',
      as: 'travelRegions',
      targetKey: 'id'
    });
  };
  return HotelEstimate;
};
