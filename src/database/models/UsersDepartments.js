export default (sequelize, DataTypes) => {
  const UsersDepartments = sequelize.define(
    'UsersDepartments',
    {
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
      },
      departmentId: {
        allowNull: false,
        type: DataTypes.INTEGER
      }
    }, {}
  );
  UsersDepartments.associate = (models) => {
    UsersDepartments.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };
  return UsersDepartments;
};
