module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "TacGia",
    {
      ID_TacGia: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      TenTacGia: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      TieuSu: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: "TacGia",
      timestamps: false,
    }
  );
};
