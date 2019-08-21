export default (sequelize, DataTypes) => {
  const documentTypes = sequelize.define('DocumentTypes', {
    name: {
      type: DataTypes.STRING,
      unique: true,
    }
  }, {});
  documentTypes.associate = (models) => {
    documentTypes.hasMany(models.TravelReadinessDocuments, {
      foreignKey: 'type'
    });
  };
  return documentTypes;
};
