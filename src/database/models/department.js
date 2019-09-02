export default (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    name: {
      allowNull: false,
      type: DataTypes.INTEGER,
      unique: true
    },
    parentDepartment: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
  },
  { paranoid: true });
  Department.associate = (models) => {
    Department.belongsTo(models.User, {
      foreignKey: 'createdBy',
      targetKey: 'userId',
      as: 'creator'
    });
    Department.belongsTo(models.Department, {
      foreignKey: 'parentDepartment',
      as: 'parentDepartments'
    });
    Department.belongsToMany(models.User, {
      foreignKey: 'departmentId',
      as: 'users',
      through: models.UsersDepartments
    });
  };
  return Department;
};
