export default (sequelize, DataTypes) => {
  const UserRole = sequelize.define(
    'UserRole',
    {
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      roleId: {
        allowNull: false,
        type: DataTypes.INTEGER
      },
      centerId: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
    },
  );
  UserRole.associate = (models) => {
    UserRole.belongsTo(models.Center, {
      foreignKey: 'centerId',
      as: 'center',
    });
    UserRole.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return UserRole;
};
