
module.exports = (sequelize, DataTypes) => {
  const TripModification = sequelize.define('TripModification', {
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Open', 'Approved', 'Rejected'),
      allowNull: false,
      defaultValue: 'Open'
    },
    type: {
      type: DataTypes.ENUM('Delete', 'Modify Dates'),
      allowNull: false,
    },
  }, { });
  TripModification.associate = ({ User, Request }) => {
    TripModification.belongsTo(User, {
      foreignKey: 'approverId',
      as: 'approvedBy'
    });
    TripModification.belongsTo(Request, {
      foreignKey: 'requestId',
      as: 'request'
    });
    TripModification.hasOne(Request, {
      foreignKey: 'tripModificationId',
      as: 'currentRequest'
    });
  };
  return TripModification;
};
