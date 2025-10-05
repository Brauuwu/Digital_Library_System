USE ThuVienSo;

-- Publishers
INSERT INTO NhaXuatBan (TenNXB, DiaChi, Website) VALUES
('NXB Giáo Dục','Hà Nội','https://vi.wikipedia.org/wiki/Nh%C3%A0_xu%E1%BA%A5t_b%E1%BA%A3n_Gi%C3%A1o_d%E1%BB%A5c'),
('NXB Trẻ','Hồ Chí Minh','https://vi.wikipedia.org/wiki/Nh%C3%A0_xu%E1%BA%A5t_b%E1%BA%A3n_Tr%E1%BA%BB');

-- Authors
INSERT INTO TacGia (TenTacGia, TieuSu) VALUES
('Nguyễn Văn A','https://vi.wikipedia.org/Nguyen_Van_A'),
('Trần Thị B','https://vi.wikipedia.org/Tran_Thi_B');

-- Categories
INSERT INTO TheLoai (TenTheLoai) VALUES ('Khoa học'), ('Văn học'), ('Công nghệ');

-- Books
INSERT INTO Sach (ID_NXB, ISBN, TieuDeSach, NamXuatBan, SoLuongCon) VALUES
(1, '978-1', 'Học lập trình cơ bản', 2020, 5),
(2, '978-2', 'Lập trình nâng cao', 2021, 3);

-- Pivot: authors-books
INSERT INTO TacGia_Sach (ID_TacGia, ID_Sach) VALUES (1,1), (2,2);

-- Pivot: categories-books
INSERT INTO TheLoai_Sach (ID_TheLoai, ID_Sach) VALUES (3,1), (3,2), (2,2);

-- Users (passwords are plain here; use the API register or change after importing)
INSERT INTO NguoiDung (HoTen, Email, SoDienThoai, DiaChi, Password, Role) VALUES
('Admin','admin@ptit.edu.vn','0123456789','Hanoi','admin123','admin'),
('Người Dùng','user@ptit.edu.vn','0987654321','HCMC','user123','user');

-- Sample borrow
INSERT INTO PhieuMuon (ID_NguoiDung, NgayMuon, HanTra, TrangThai) VALUES (2, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'borrowed');
INSERT INTO ChiTietPhieuMuon (ID_PhieuMuon, ID_Sach) VALUES (1, 1);
