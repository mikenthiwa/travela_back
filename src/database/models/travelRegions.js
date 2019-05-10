export default (sequelize, DataTypes) => {
  const TravelRegions = sequelize.define('TravelRegions', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    region: {
      allowNull: false,
      type: DataTypes.STRING
    },
    description: {
      allowNull: false,
      type: DataTypes.STRING
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    }
  });
  TravelRegions.associate = (models) => {
    TravelRegions.hasMany(models.Country, {
      foreignKey: 'regionId',
      as: 'countries'
    });
  };
  return TravelRegions;
};
