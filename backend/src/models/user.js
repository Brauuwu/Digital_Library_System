// backend/src/models/user.js
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('NguoiDung', {
    ID_NguoiDung: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    HoTen: { type: DataTypes.STRING(100), allowNull: false },
    Email: { type: DataTypes.STRING(100), allowNull: false }, // remove unique here
    SoDienThoai: { type: DataTypes.STRING(20) },
    DiaChi: { type: DataTypes.STRING(200) },
    Password: { type: DataTypes.STRING(200), allowNull: false },
    Role: { type: DataTypes.ENUM('user','admin'), defaultValue: 'user' }
  }, {
    tableName: 'NguoiDung',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['Email'] } // tạo unique index duy nhất
    ]
  });
};
