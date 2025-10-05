// backend/src/models/index.js
const { Sequelize, DataTypes } = require("sequelize");

// Kết nối MySQL
const sequelize = new Sequelize("ThuVienSo", "root", "nghia2674", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_unicode_ci",
  },
});

// Models
const User = require("./user")(sequelize, DataTypes);
const Publisher = require("./publisher")(sequelize, DataTypes);
const Book = require("./book")(sequelize, DataTypes);
const Author = require("./author")(sequelize, DataTypes);
const Category = require("./category")(sequelize, DataTypes);
const AuthorBook = require("./author_book")(sequelize, DataTypes);
const CategoryBook = require("./category_book")(sequelize, DataTypes);
const Borrow = require("./borrow")(sequelize, DataTypes);
const BorrowDetail = require("./borrow_detail")(sequelize, DataTypes);

// Associations

// Publisher -> Book
Publisher.hasMany(Book, { foreignKey: "ID_NXB" });
Book.belongsTo(Publisher, { foreignKey: "ID_NXB" });

// Book <-> Author (Many-to-Many)
Book.belongsToMany(Author, { through: AuthorBook, foreignKey: "ID_Sach", otherKey: "ID_TacGia" });
Author.belongsToMany(Book, { through: AuthorBook, foreignKey: "ID_TacGia", otherKey: "ID_Sach" });

// Book <-> Category (Many-to-Many)
Book.belongsToMany(Category, { through: CategoryBook, foreignKey: "ID_Sach", otherKey: "ID_TheLoai" });
Category.belongsToMany(Book, { through: CategoryBook, foreignKey: "ID_TheLoai", otherKey: "ID_Sach" });

// User -> Borrow
User.hasMany(Borrow, { foreignKey: "ID_NguoiDung" });
Borrow.belongsTo(User, { foreignKey: "ID_NguoiDung" });

// Borrow -> BorrowDetail
Borrow.hasMany(BorrowDetail, { foreignKey: "ID_PhieuMuon" });
BorrowDetail.belongsTo(Borrow, { foreignKey: "ID_PhieuMuon" });

// Book -> BorrowDetail
Book.hasMany(BorrowDetail, { foreignKey: "ID_Sach" });
BorrowDetail.belongsTo(Book, { foreignKey: "ID_Sach" });

// Export
module.exports = {
  sequelize,
  User,
  Publisher,
  Book,
  Author,
  Category,
  AuthorBook,
  CategoryBook,
  Borrow,
  BorrowDetail,
};
