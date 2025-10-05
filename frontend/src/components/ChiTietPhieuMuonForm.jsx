module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ChiTietPhieuMuon', {
    ID_PhieuMuon: { type: DataTypes.INTEGER, primaryKey: true },
    ID_Sach: { type: DataTypes.INTEGER, primaryKey: true },
    NgayTraThucTe: { type: DataTypes.DATEONLY },
    TinhTrangSach: { type: DataTypes.STRING(100) }
  }, { tableName: 'ChiTietPhieuMuon', timestamps: false });
};