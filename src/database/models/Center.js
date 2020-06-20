export default (sequelize, DataTypes) => {
  const Center = sequelize.define(
    'Center', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.INTEGER,
        autoIncrement: true
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    }
  );
  Center.associate = (models) => {
    Center.belongsToMany(models.User, {
      foreignKey: 'centerId',
      as: 'users',
      through: models.UserRole
    });
    Center.belongsToMany(models.Role, {
      foreignKey: 'centerId',
      as: 'roles',
      through: models.UserRole
    });
  };
  return Center;
};
