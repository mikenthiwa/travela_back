module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    senderId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    recipientId: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    notificationType: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    message: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    notificationLink: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    notificationStatus: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    senderName: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    senderImage: {
      allowNull: false,
      type: DataTypes.STRING,
    }
  });
  return Notification;
};
