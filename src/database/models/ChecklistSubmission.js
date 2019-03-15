module.exports = (sequelize, DataTypes) => {
  const ChecklistSubmission = sequelize.define('ChecklistSubmission', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    value: {
      type: DataTypes.JSON,
    },
    tripId: {
      type: DataTypes.STRING,
    },
    checklistItemId: {
      type: DataTypes.STRING,
    },
    documentId: {
      type: DataTypes.STRING,
    },
  }, { paranoid: true });
  ChecklistSubmission.associate = (models) => {
    ChecklistSubmission.belongsTo(models.Trip, {
      foreignKey: 'tripId',
      as: 'submissions'
    });
    ChecklistSubmission.belongsTo(models.TravelReadinessDocuments, {
      foreignKey: 'documentId',
      as: 'documentSubmission',
    });
    ChecklistSubmission.belongsTo(models.ChecklistItem, {
      foreignKey: 'checklistItemId',
      as: 'checklistSubmissions'
    });
  };
  return ChecklistSubmission;
};
