module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PhieuMuon', {
    ID_PhieuMuon: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ID_NguoiDung: { type: DataTypes.INTEGER },
    NgayMuon: { type: DataTypes.DATEONLY, allowNull: false },
    HanTra: { type: DataTypes.DATEONLY, allowNull: false },
    TrangThai: { type: DataTypes.STRING(50) }
  }, { tableName: 'PhieuMuon', timestamps: false });
};
