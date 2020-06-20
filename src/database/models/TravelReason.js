export default (sequelize, DataTypes) => {
  const TravelReason = sequelize.define('TravelReason', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    title: {
      allowNull: false,
      type: DataTypes.STRING
    },
    description: {
      allowNull: true,
      type: DataTypes.STRING
    }
  }, {
    paranoid: true,
    defaultScope: {
      attributes: {
        exclude: []
      }
    }
  });

  TravelReason.associate = (models) => {
    TravelReason.belongsTo(models.User, {
      foreignKey: 'createdBy',
      targetKey: 'id',
      as: 'creator'
    });
    TravelReason.hasMany(models.Trip, {
      foreignKey: 'travelReasons',
      sourceKey: 'id',
    });
  };
  return TravelReason;
};
