module.exports = (sequelize, DataTypes) => {
  const ChecklistItem = sequelize.define('ChecklistItem', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    requiresFiles: {
      type: DataTypes.BOOLEAN,
    },
    deleteReason: {
      type: DataTypes.TEXT
    },
    destinationName: {
      type: DataTypes.STRING
    }
  }, { paranoid: true });
  ChecklistItem.associate = (models) => {
    ChecklistItem.hasMany(models.ChecklistItemResource, {
      foreignKey: 'checklistItemId',
      as: 'resources',
    });
    ChecklistItem.hasMany(models.ChecklistSubmission, {
      foreignKey: 'checklistItemId',
      as: 'checklistSubmissions',
    });
  };
  return ChecklistItem;
};
