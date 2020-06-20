module.exports = (sequelize, DataTypes) => {
  const Maintainance = sequelize.define('Maintainance', {
    reason: {
      type: DataTypes.TEXT,
    },
    start: {
      allowNull: false,
      type: DataTypes.DATEONLY,
    },
    end: {
      allowNull: false,
      type: DataTypes.DATEONLY,
    },
  }, { paranoid: true });
  Maintainance.associate = (models) => {
    Maintainance.belongsTo(models.Room, {
      foreignKey: 'roomId',
      as: 'rooms',
    });
  };
  return Maintainance;
};
