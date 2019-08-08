export default (sequelize, DataTypes) => {
  const ChecklistDestinations = sequelize.define('ChecklistDestinations', {
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
  ChecklistDestinations.associate = (models) => {
    ChecklistDestinations.belongsTo(models.Checklist, {
      foreignKey: 'checklistId',
      as: 'checklist',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
    
    ChecklistDestinations.belongsTo(models.Country, {
      foreignKey: 'countryId',
      as: 'country'
    });

    ChecklistDestinations.belongsTo(models.TravelRegions, {
      foreignKey: 'regionId',
      as: 'region'
    });
  };
  return ChecklistDestinations;
};
