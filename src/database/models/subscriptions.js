export default (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    },
    userId: {
      allowNull: false,
      type: DataTypes.STRING
    },
    p256dh: {
      allowNull: false,
      type: DataTypes.STRING
    },
    auth: {
      allowNull: true,
      type: DataTypes.STRING
    },
    endpoint: {
      allowNull: true,
      type: DataTypes.STRING
    }
  });
  return Subscription;
};
