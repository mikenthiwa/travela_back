export default (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    name: {
      allowNull: false,
      type: DataTypes.INTEGER,
      unique: true
    },
  }, {});
  Department.associate = () => {
    // associations can be defined here
  };
  return Department;
};
