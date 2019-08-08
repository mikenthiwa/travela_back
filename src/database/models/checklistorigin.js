export default (sequelize, DataTypes) => {
  const ChecklistOrigin = sequelize.define('ChecklistOrigin', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true
    },
    checklistId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    countryId: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
    regionId: {
      allowNull: true,
      type: DataTypes.INTEGER
    },
  }, {});
  ChecklistOrigin.associate = (models) => {
    ChecklistOrigin.belongsTo(models.Checklist, {
      foreignKey: 'checklistId',
      as: 'checklist',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    ChecklistOrigin.belongsTo(models.Country, {
      foreignKey: 'countryId',
      as: 'country'
    });

    ChecklistOrigin.belongsTo(models.TravelRegions, {
      foreignKey: 'regionId',
      as: 'region'
    });
  };
  return ChecklistOrigin;
};
