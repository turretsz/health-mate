# HealthMate – Trung tâm Quản lý Sức khỏe Cá nhân
- **Truy cập:** [Trạm Quản lý Sức khỏe HealthMate](https://turretsz.github.io/health-mate/)
**Mô tả:** Ứng dụng web giúp tính BMI/BMR, vùng nhịp tim, theo dõi nước/ngủ/vận động và lưu dữ liệu ngay trên trình duyệt. Không cần tài khoản hay backend.

## Công nghệ sử dụng
- React 19, React Router
- Bootstrap 5
- Lưu trữ cục bộ bằng `localStorage` (không server)

## Cấu trúc dự án
```
src
├─ components
│  ├─ HealthTracker.js        # BMI/BMR + lưu lịch sử
│  ├─ BMRCalculator.js        # Tính BMR (Mifflin-St Jeor)
│  ├─ HeartRateCalculator.js  # Vùng nhịp tim tập luyện
│  ├─ WellnessDashboard.js    # Nước, giấc ngủ, vận động
│  ├─ AuthModal.js / Profile.js (mock)
│  └─ styles/*.css
├─ context
│  ├─ AuthContext.js          # Lưu trạng thái đăng nhập giả lập
│  └─ ToastContext.js         # Thông báo ngắn
├─ App.js                     # Định tuyến và layout chính
└─ index.js                   # Bootstrap ứng dụng
```

## Các chức năng chính
1. **Kiểm tra & tính toán**
   - BMI, BMR, vùng nhịp tim (50–85%) theo Mifflin-St Jeor.
2. **Theo dõi sức khỏe**
   - Dashboard nước, ngủ, vận động; ghi chú nhanh; nhắc việc trong ngày.
3. **Lưu trữ cục bộ**
   - Lưu lịch sử trên trình duyệt, không gửi dữ liệu ra ngoài.
4. **Giao diện tiếng Việt**
   - Luồng thao tác nhanh, xem kết quả tức thì.

## Luồng hoạt động
1. Mở trang chủ → chọn công cụ (BMI/BMR/nhịp tim) hoặc Dashboard.  
2. Nhập số liệu → xem kết quả ngay trên card.  
3. Lưu hoặc chỉnh sửa ghi chú/nước/ngủ/vận động trong Dashboard.  
4. Dữ liệu tự lưu vào `localStorage`; làm mới trang vẫn giữ.  

## Chạy cục bộ
```bash
npm install
npm start
```
Ứng dụng mở tại `http://localhost:3000`.

## Build sản phẩm
```bash
npm run build
```
Đóng gói tại thư mục `build/`.

## Triển khai GitHub Pages
`package.json` đã có `homepage`.
```bash
npm run deploy
```
Sau đó vào GitHub → Settings → Pages → Source: chọn nhánh `gh-pages` (root).  
Link công khai: `https://turretsz.github.io/health-mate`.

## Ghi chú dữ liệu
- Chỉ lưu trên máy người dùng; xóa cache/trình duyệt sẽ mất dữ liệu.
- Không thu thập hay gửi ra ngoài.

## Quy trình cập nhật
1) Sửa mã → `git add -A` → `git commit -m "..."` → `git push`  
2) Deploy lại: `npm run deploy`  
3) Kiểm tra link GitHub Pages.
