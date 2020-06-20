module.exports = (sequelize, DataTypes) => {
  const DynamicChecklistSubmissions = sequelize.define('DynamicChecklistSubmissions', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING,
    },
    completionCount: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    isSubmitted: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    checklist: {
      allowNull: false,
      type: DataTypes.JSONB
    },
  }, {});

  DynamicChecklistSubmissions.associate = (models) => {
    DynamicChecklistSubmissions.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      targetKey: 'userId',
    });
    DynamicChecklistSubmissions.belongsTo(models.Request, {
      foreignKey: 'requestId',
      as: 'request',
    });
  };
  return DynamicChecklistSubmissions;
};
