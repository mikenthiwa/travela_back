export default (sequelize, DataTypes) => {
  const ChangedRoom = sequelize.define(
    'ChangedRoom', {
      reason: {
        type: DataTypes.STRING,
        allowNull: false
      },
    },
  );
  ChangedRoom.associate = (models) => {
    ChangedRoom.belongsTo(models.Request, {
      foreignKey: 'requestId',
      as: 'request'
    });
    ChangedRoom.belongsTo(models.Trip, {
      foreignKey: 'tripId',
      as: 'trip'
    });
    ChangedRoom.belongsTo(models.Bed, {
      foreignKey: 'bedId',
      as: 'bed'
    });
    ChangedRoom.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };
  return ChangedRoom;
};
