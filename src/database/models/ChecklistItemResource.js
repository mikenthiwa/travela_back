module.exports = (sequelize, DataTypes) => {
  const ChecklistItemResource = sequelize.define('ChecklistItemResource', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    label: {
      type: DataTypes.STRING,
    },
    link: {
      type: DataTypes.STRING,
    },
    checklistItemId: {
      type: DataTypes.STRING,
    },
  }, { paranoid: true });
  ChecklistItemResource.associate = (models) => {
    ChecklistItemResource.belongsTo(models.ChecklistItem, {
      foreignKey: 'checklistItemId',
      as: 'resources'
    });
  };
  return ChecklistItemResource;
};
