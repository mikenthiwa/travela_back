export default (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    roleName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  Role.associate = (models) => {
    Role.belongsToMany(models.User, {
      foreignKey: 'roleId',
      as: 'users',
      through: models.UserRole
    });
    Role.belongsToMany(models.Center, {
      foreignKey: 'roleId',
      as: 'centers',
      through: models.UserRole
    });
  };
  return Role;
};
