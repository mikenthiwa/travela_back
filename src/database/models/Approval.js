export default (sequelize, DataTypes) => {
  const Approval = sequelize.define('Approval', {
    id: {
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      type: DataTypes.INTEGER
    },
    approverId: {
      // FIX: In future, this should be the manager's email address or unique ID
      allowNull: false,
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: 'approverId cannot be empty'
        }
      },
    },
    status: {
      allowNull: false,
      type: DataTypes.ENUM('Open', 'Approved', 'Rejected'),
      defaultValue: 'Open',
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    budgetStatus: {
      allowNull: false,
      type: DataTypes.ENUM('Open', 'Approved', 'Rejected'),
      defaultValue: 'Open',
      validate: {
        notEmpty: {
          args: true,
          msg: 'Budget Status cannot be empty',
        },
      },
    },
    budgetApprover: {
      allowNull: true,
      type: DataTypes.STRING
    },
    budgetApprovedAt: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  }, { paranoid: true });
  Approval.associate = (models) => {
    Approval.belongsTo(models.Request, {
      foreignKey: 'requestId',
      targetKey: 'id',
      as: 'Request',
      onDelete: 'CASCADE',
    });
  };
  return Approval;
};
