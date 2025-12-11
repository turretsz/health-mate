// src/App.js
import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import ToolCards from './components/HealthTools';
import ToolSection from './components/ToolSection';
import HealthTracker from './components/HealthTracker';
import BMRCalculator from './components/BMRCalculator';
import HeartRateCalculator from './components/HeartRateCalculator';
import WellnessDashboard from './components/WellnessDashboard';
import AuthModal from './components/AuthModal';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './components/styles/Header.css';
import './App.css';
import Profile from './components/Profile';

const HomePage = () => (
  <div className="app-shell">
    <section className="hero-shell">
      <div className="page-width hero-grid">
        <div className="hero-primary">
          <div className="eyebrow-chip">Trung tâm sức khỏe cá nhân</div>
          <h1 className="hero-title">
            HealthMate Studio
            <br />
            Đồng hành từng nhịp, chăm trọn sức khỏe.
          </h1>
          <p className="hero-subtitle">
            Một bảng điều khiển duy nhất cho BMI, BMR, nhịp tim, lịch uống nước và hành trình luyện tập. Tất cả được gom vào luồng thao tác nhanh, nhìn là hiểu, làm là xong.
          </p>
          <div className="hero-actions">
            <Link to="/dashboard" className="btn btn-primary">Mở bảng điều khiển</Link>
            <Link to="/health-tracker" className="btn btn-ghost">Kiểm tra BMI</Link>
            <div className="micro-badge">Lưu cục bộ • Không cần tạo tài khoản</div>
          </div>
          <div className="hero-pills">
            <span className="hero-pill accent">3 bước • Điền số liệu</span>
            <span className="hero-pill">Xem kết quả trực quan</span>
            <span className="hero-pill ghost">Lưu & nhắc nhở ngay</span>
          </div>

          <div className="hero-metrics-grid">
            <div className="metric-card large">
              <div className="metric-label">Luồng mỗi ngày</div>
              <div className="metric-value">Hydrate • Move • Rest</div>
              <p className="metric-note">Bản tóm tắt gọn gàng để bám sát tiến độ, không cần mở nhiều màn.</p>
            </div>
            <div className="metric-card">
              <div className="metric-label">Công thức</div>
              <div className="metric-value accent">Mifflin-St Jeor</div>
              <p className="metric-note">Đã kèm phân vùng nhịp tim 50-85% cho tập luyện.</p>
            </div>
            <div className="metric-card">
              <div className="metric-label">Kiểm tra nhanh</div>
              <div className="metric-value accent">BMI • BMR • HR</div>
              <p className="metric-note">Điền số liệu rồi xem ngay, không cần đăng nhập.</p>
            </div>
          </div>
        </div>

        <div className="hero-secondary">
          <div className="panel board">
            <div className="panel-head">
              <div>
                <p className="panel-subtitle">Ảnh chụp hiện tại</p>
                <div className="panel-title">Wellness radar</div>
              </div>
              <span className="live-pill">Realtime</span>
            </div>

            <div className="insight-grid">
              <div className="insight-card highlight">
                <div className="insight-label">BMI</div>
                <div className="insight-value">21.8</div>
                <p className="insight-note">Ổn định 6 ngày • cân bằng</p>
                <div className="bar">
                  <span style={{ width: '72%' }} />
                </div>
              </div>
              <div className="insight-card">
                <div className="insight-label">BMR</div>
                <div className="insight-value">1,480 kcal</div>
                <p className="insight-note">Khuyến nghị ăn duy trì: 1,980 kcal</p>
              </div>
              <div className="insight-card">
                <div className="insight-label">Nhịp tim</div>
                <div className="insight-value">134 bpm</div>
                <p className="insight-note">Zone 3 • 26 phút • cardio/HIIT</p>
              </div>
              <div className="insight-card secondary">
                <div className="insight-label">Trạng thái</div>
                <div className="insight-value">On track</div>
                <p className="insight-note">92% mục tiêu tuần</p>
              </div>
            </div>
          </div>

          <div className="panel sessions board">
            <div className="panel-head">
              <div>
                <p className="panel-subtitle">Nhật ký mới nhất</p>
                <div className="panel-title">Bảng lịch hành động</div>
              </div>
              <Link to="/dashboard" className="link-inline">Mở nhật ký</Link>
            </div>
            <div className="session-list">
              <div className="session-row">
                <div>
                  <div className="session-name">Chạy bộ buổi sáng</div>
                  <p className="session-note">45 phút • 6.2 km • Zone 2-3</p>
                </div>
                <span className="session-chip">−420 kcal</span>
              </div>
              <div className="session-row">
                <div>
                  <div className="session-name">Bữa trưa nhẹ</div>
                  <p className="session-note">Carb 55% • Protein 25% • Fat 20%</p>
                </div>
                <span className="session-chip neutral">+640 kcal</span>
              </div>
              <div className="session-row">
                <div>
                  <div className="session-name">Stretching & mobility</div>
                  <p className="session-note">20 phút • Giảm căng cơ sau cardio</p>
                </div>
                <span className="session-chip">−110 kcal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="page-width">
        <div className="lanes">
          <div className="lane-card">
            <p className="section-kicker">Lộ trình trong ngày</p>
            <h2 className="section-title">Bước đi rõ ràng, ít phải suy nghĩ</h2>
            <p className="section-sub">
              Bảng điều khiển được chia thành 3 đường: đo nhanh, xem báo cáo và ghi chú. Mỗi đường đều có nhắc nhở và mốc hành động.
            </p>
            <div className="lane-list">
              <div className="lane-item">
                <span className="dot green" />
                <div>
                  <div className="lane-title">Nhập số liệu tức thì</div>
                  <p className="lane-note">BMI, BMR, nhịp tim trong cùng một khu vực.</p>
                </div>
              </div>
              <div className="lane-item">
                <span className="dot amber" />
                <div>
                  <div className="lane-title">Đọc kết quả trực quan</div>
                  <p className="lane-note">Thang đo, vùng tim, khuyến nghị ăn uống.</p>
                </div>
              </div>
              <div className="lane-item">
                <span className="dot mint" />
                <div>
                  <div className="lane-title">Lưu và nhắc</div>
                  <p className="lane-note">Nhật ký nước, ngủ, vận động được gom chung.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lane-tiles">
            <div className="tile">
              <p className="tile-label">Nhịp làm việc</p>
              <div className="tile-value">Sáng • Trưa • Tối</div>
              <p className="tile-note">Mỗi khung giờ có checklist riêng.</p>
            </div>
            <div className="tile">
              <p className="tile-label">Thông tin cốt lõi</p>
              <div className="tile-value">BMI • BMR • HR</div>
              <p className="tile-note">Không cần tìm kiếm nhiều trang.</p>
            </div>
            <div className="tile wide">
              <p className="tile-label">Ghi chú nhanh</p>
              <div className="tile-value">Hydrate 300ml mỗi 60 phút</div>
              <p className="tile-note">Đặt nhắc di chuyển và chốt giờ ngủ.</p>
            </div>
          </div>
        </div>

        <div className="section-heading">
          <div>
            <p className="section-kicker">Trạm kiểm tra nhanh</p>
            <h2 className="section-title">Công cụ trọng tâm trong một khung nhìn</h2>
            <p className="section-sub">Ưu tiên thao tác trực tiếp, giảm độ rườm rà và đảm bảo kết quả hiển thị rõ ràng.</p>
          </div>
          <div className="pill-filter">Realtime • Không cần tài khoản</div>
        </div>
        <ToolCards />
      </div>
    </section>

    <section className="section">
      <div className="page-width">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Lộ trình chăm sóc</p>
            <h2 className="section-title">Xây dựng thói quen khoa học</h2>
            <p className="section-sub">Từ kiểm tra cơ bản tới tối ưu hiệu suất, mọi bước đều được gợi ý cách hành động.</p>
          </div>
          <div className="pill-filter soft">Nhắc nhở • Theo dõi tuần</div>
        </div>
        <ToolSection />
      </div>
    </section>

    <section className="section">
      <div className="page-width">
        <div className="cta-banner">
          <div>
            <p className="section-kicker">Sẵn sàng bắt đầu?</p>
            <h2 className="section-title">HealthMate đồng hành dài hạn</h2>
            <p className="section-sub">
              Lưu chỉ số, đặt nhắc nước/di chuyển, xem nhịp tim và calo ngay trong trình duyệt. Bố cục mới ưu tiên tốc độ, dễ đọc và dễ hành động.
            </p>
          </div>
          <div className="cta-actions">
            <Link to="/dashboard" className="btn btn-primary">Mở bảng điều khiển</Link>
            <Link to="/bmr" className="btn btn-ghost">Tính BMR ngay</Link>
          </div>
        </div>
      </div>
    </section>
  </div>
);

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('hm_theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('hm_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <AuthProvider>
      <ToastProvider>
        <div className={`font-sans theme-${theme}`}>
          <Header theme={theme} toggleTheme={toggleTheme} />
          <div className="page-transition">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<WellnessDashboard />} />
              <Route path="/health-tracker" element={<HealthTracker />} />
              <Route path="/bmr" element={<BMRCalculator />} />
              <Route path="/heart-rate" element={<HeartRateCalculator />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </div>
          <AuthModal />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
