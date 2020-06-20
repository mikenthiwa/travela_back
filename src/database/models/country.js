export default (sequelize, DataTypes) => {
  const Country = sequelize.define('Country', {
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  });
  Country.associate = (models) => {
    Country.belongsTo(models.TravelRegions, {
      foreignKey: 'regionId',
      as: 'region'
    });
  };
  return Country;
};
