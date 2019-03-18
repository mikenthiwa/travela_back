export default (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    name: {
      allowNull: false,
      type: DataTypes.INTEGER,
      unique: true
    },
  }, {});
  Department.associate = (models) => {
    Department.belongsToMany(models.User, {
      foreignKey: 'departmentId',
      as: 'users',
      through: models.UsersDepartments
    });
  };
  return Department;
};
