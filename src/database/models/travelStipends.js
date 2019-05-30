module.exports = (sequelize, DataTypes) => {
  const TravelStipends = sequelize.define('TravelStipends',
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
      createdBy: {
        type: DataTypes.STRING,
        allowNull: true
      },
      deletedAt: {
        type: DataTypes.DATE
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, { paranoid: true });
  TravelStipends.associate = (models) => {
    TravelStipends.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator',
      targetKey: 'userId'
    });
  };
  return TravelStipends;
};
