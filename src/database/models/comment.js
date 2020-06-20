module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    comment: {
      type: DataTypes.TEXT,
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
    },
  }, { paranoid: true });

  Comment.associate = (models) => {
    Comment.belongsTo(models.Request, {
      foreignKey: 'requestId',
      as: 'requests',
    });
    Comment.belongsTo(models.TravelReadinessDocuments, {
      foreignKey: 'documentId',
      as: 'documents',
    });
    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };
  return Comment;
};
