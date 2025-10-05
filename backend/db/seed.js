const { sequelize, User, Publisher, Author, Category, Book, AuthorBook, CategoryBook, Borrow, BorrowDetail } = require('../src/models');
const bcrypt = require('bcrypt');

async function run(){
  await sequelize.sync({ alter: true });

  // publishers
  const [p1] = await Publisher.findOrCreate({ where: { TenNXB: 'NXB Giáo Dục' }, defaults: { DiaChi: 'Hà Nội', Website: 'https://vi.wikipedia.org/wiki/Nh%C3%A0_xu%E1%BA%A5t_b%E1%BA%A3n_Gi%C3%A1o_d%E1%BB%A5c' } });
  const [p2] = await Publisher.findOrCreate({ where: { TenNXB: 'NXB Trẻ' }, defaults: { DiaChi: 'Hồ Chí Minh', Website: 'https://vi.wikipedia.org/wiki/Nh%C3%A0_xu%E1%BA%A5t_b%E1%BA%A3n_Tr%E1%BA%BB' } });

  // authors
  const [a1] = await Author.findOrCreate({ where: { TenTacGia: 'Nguyễn Văn A' }, defaults: { TieuSu: 'Tiểu sử Nguyễn Văn A. https://vi.wikipedia.org/Nguyen_Van_A' } });
  const [a2] = await Author.findOrCreate({ where: { TenTacGia: 'Trần Thị B' }, defaults: { TieuSu: 'Tiểu sử Trần Thị B. https://vi.wikipedia.org/Tran_Thi_B' } });

  // categories
  const [c1] = await Category.findOrCreate({ where: { TenTheLoai: 'Khoa học' } });
  const [c2] = await Category.findOrCreate({ where: { TenTheLoai: 'Văn học' } });
  const [c3] = await Category.findOrCreate({ where: { TenTheLoai: 'Công nghệ' } });
  const [c4] = await Category.findOrCreate({ where: { TenTheLoai: 'Thiếu nhi' } });
  const [c5] = await Category.findOrCreate({ where: { TenTheLoai: 'Lịch sử' } });

  // books
  const [b1] = await Book.findOrCreate({ where: { ISBN: '978-1' }, defaults: { ID_NXB: p1.ID_NXB, TieuDeSach: 'Học lập trình cơ bản', NamXuatBan: 2020, SoLuongCon: 5 } });
  const [b2] = await Book.findOrCreate({ where: { ISBN: '978-2' }, defaults: { ID_NXB: p2.ID_NXB, TieuDeSach: 'Lập trình nâng cao', NamXuatBan: 2021, SoLuongCon: 3 } });
  const [b3] = await Book.findOrCreate({ where: { ISBN: '978-3' }, defaults: { ID_NXB: p1.ID_NXB, TieuDeSach: 'Truyện thiếu nhi - Vui vẻ', NamXuatBan: 2018, SoLuongCon: 8 } });
  const [b4] = await Book.findOrCreate({ where: { ISBN: '978-4' }, defaults: { ID_NXB: p2.ID_NXB, TieuDeSach: 'Lịch sử Việt Nam', NamXuatBan: 2015, SoLuongCon: 4 } });
  const [b5] = await Book.findOrCreate({ where: { ISBN: '978-5' }, defaults: { ID_NXB: p1.ID_NXB, TieuDeSach: 'Công nghệ web', NamXuatBan: 2022, SoLuongCon: 6 } });

  // associations
  await AuthorBook.findOrCreate({ where: { ID_TacGia: a1.ID_TacGia, ID_Sach: b1.ID_Sach } });
  await AuthorBook.findOrCreate({ where: { ID_TacGia: a2.ID_TacGia, ID_Sach: b2.ID_Sach } });
  await CategoryBook.findOrCreate({ where: { ID_TheLoai: c3.ID_TheLoai, ID_Sach: b1.ID_Sach } });
  await CategoryBook.findOrCreate({ where: { ID_TheLoai: c3.ID_TheLoai, ID_Sach: b2.ID_Sach } });
  await CategoryBook.findOrCreate({ where: { ID_TheLoai: c2.ID_TheLoai, ID_Sach: b2.ID_Sach } });
  await CategoryBook.findOrCreate({ where: { ID_TheLoai: c4.ID_TheLoai, ID_Sach: b3.ID_Sach } });
  await CategoryBook.findOrCreate({ where: { ID_TheLoai: c5.ID_TheLoai, ID_Sach: b4.ID_Sach } });
  await CategoryBook.findOrCreate({ where: { ID_TheLoai: c3.ID_TheLoai, ID_Sach: b5.ID_Sach } });

  // users with hashed passwords
  const adminPw = await bcrypt.hash('admin123', 10);
  const userPw = await bcrypt.hash('user123', 10);
  const [admin] = await User.findOrCreate({ where: { Email: 'admin@ptit.edu.vn' }, defaults: { HoTen: 'Admin', SoDienThoai: '0123456789', DiaChi: 'Hanoi', Password: adminPw, Role: 'admin' } });
  const [user] = await User.findOrCreate({ where: { Email: 'user@ptit.edu.vn' }, defaults: { HoTen: 'Người Dùng', SoDienThoai: '0987654321', DiaChi: 'HCMC', Password: userPw, Role: 'user' } });

  // borrow sample: user borrows b1
  const borrow = await Borrow.findOrCreate({ where: { ID_NguoiDung: user.ID_NguoiDung, NgayMuon: new Date() }, defaults: { HanTra: new Date(Date.now() + 14*24*3600*1000), TrangThai: 'borrowed' } });
  // ensure borrowDetail exists and adjust quantity if necessary (idempotent)
  const bn = await Book.findByPk(b1.ID_Sach);
  if(bn && (bn.SoLuongCon || 0) > 0){
    const [borrowRow] = Array.isArray(borrow) ? borrow : [borrow];
    await BorrowDetail.findOrCreate({ where: { ID_PhieuMuon: borrowRow.ID_PhieuMuon, ID_Sach: b1.ID_Sach } });
    bn.SoLuongCon = Math.max(0, bn.SoLuongCon - 1);
    await bn.save();
  }

  console.log('Seed finished');
  process.exit(0);
}

run().catch(err=>{ console.error(err); process.exit(1); });
