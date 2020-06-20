export default (sequelize, DataTypes) => {
  const Checklist = sequelize.define(
    'Checklist',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      config: {
        type: DataTypes.JSONB,
        allowNull: false
      }
    },
    { paranoid: true }
  );
  Checklist.associate = (models) => {
    Checklist.hasMany(models.ChecklistOrigin, {
      foreignKey: 'checklistId',
      as: 'origin'
    });

    Checklist.hasMany(models.ChecklistDestinations, {
      foreignKey: 'checklistId',
      as: 'destinations'
    });

    Checklist.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'user',
      targetKey: 'userId'
    });
  };
  return Checklist;
};
