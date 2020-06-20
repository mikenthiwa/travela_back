export default (sequelize, DataTypes) => {
  const Document = sequelize.define(
    'Document', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      cloudinary_public_id: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      cloudinary_url: {
        allowNull: false,
        type: DataTypes.STRING
      }
    }, { paranoid: true }
  );
  Document.associate = (models) => {
    Document.belongsTo(models.User, {
      foreignKey: 'userId'
    });
  };
  return Document;
};
