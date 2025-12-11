// src/components/HealthTracker.js
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './styles/HealthTracker.css';

const MIN_HEIGHT = 80;
const MAX_HEIGHT = 250;
const MIN_WEIGHT = 20;
const MAX_WEIGHT = 250;

const infoItems = [
  {
    title: 'Chỉ số BMI là gì? - Định nghĩa chỉ số khối cơ thể BMI',
    content:
      'Chỉ số khối cơ thể (BMI) là phép đo trọng lượng của một người tương ứng với chiều cao. BMI giúp nhận biết mức cân nặng bình thường, thừa cân hay thiếu cân để điều chỉnh lối sống.',
  },
  {
    title: 'Giải thích chỉ số BMI',
    content:
      'BMI không đo trực tiếp mỡ cơ thể nhưng có tương quan với lượng mỡ. BMI cao thường gợi ý thừa cân; BMI thấp gợi ý thiếu cân. Đối với trẻ em và thanh thiếu niên, BMI được diễn giải theo tuổi và giới.',
  },
  {
    title: 'Công thức tính BMI là gì?',
    content:
      'BMI = Cân nặng (kg) / [Chiều cao (m)]². Ví dụ: 60 kg và 1,7 m => BMI = 60 / (1,7 × 1,7) ≈ 20,8.',
  },
  {
    title: 'Tại sao bạn nên biết về chỉ số BMI?',
    content:
      'Theo dõi BMI giúp quản lý cân nặng và phát hiện sớm nguy cơ sức khỏe liên quan đến thừa cân hoặc thiếu cân như đái tháo đường type 2, bệnh tim mạch hay thiếu dinh dưỡng.',
  },
  {
    title: 'Chỉ số BMI cao có gây nguy hiểm nghiêm trọng đến sức khỏe không?',
    content:
      'BMI cao có thể liên quan đến nguy cơ tăng huyết áp, đái tháo đường type 2, bệnh tim mạch, đột quỵ và một số ung thư. Cần tham khảo chuyên gia để được đánh giá toàn diện.',
  },
  {
    title: 'Những nguy cơ gây béo phì bạn cần nắm',
    content:
      'Béo phì có thể tăng nguy cơ tiểu đường type 2, bệnh tim mạch, ngưng thở khi ngủ, viêm khớp, gan nhiễm mỡ và rối loạn tâm lý. Kiểm soát chế độ ăn và vận động là chìa khóa.',
  },
  {
    title: 'Những nguy cơ gây thiếu cân bạn cần nắm',
    content:
      'Thiếu cân có thể dẫn đến suy dinh dưỡng, loãng xương, thiếu máu, giảm miễn dịch, vấn đề sinh sản và phục hồi sau bệnh kém. Cần bổ sung dinh dưỡng hợp lý và theo dõi sức khỏe.',
  },
  {
    title: 'Chỉ số BMI có phải là một chỉ số tốt để đánh giá lượng mỡ trong cơ thể?',
    content:
      'BMI hữu ích để sàng lọc nhưng không phân biệt khối lượng cơ và mỡ. Vận động viên có thể BMI cao nhưng mỡ thấp; người lớn tuổi có BMI bình thường nhưng mỡ cao. Cần kết hợp vòng eo, thành phần cơ thể.',
  },
  {
    title: 'Nguồn tham khảo',
    content:
      'CDC, WHO, NHS và các hướng dẫn dinh dưỡng quốc gia về đánh giá cân nặng và sức khỏe. Ngày truy cập: 18.11.2022.',
  },
];

const classifyBmi = (value) => {
  if (!value) return null;
  const bmiNum = parseFloat(value);
  if (bmiNum < 18.5) return { label: 'Thiếu cân', badge: 'Thiếu cân', color: '#22c55e' };
  if (bmiNum < 23) return { label: 'Khỏe mạnh', badge: 'Khỏe mạnh', color: '#16a34a' };
  if (bmiNum < 25) return { label: 'Thừa cân', badge: 'Thừa cân', color: '#f59e0b' };
  if (bmiNum < 30) return { label: 'Béo phì độ 1', badge: 'Béo phì độ 1', color: '#f97316' };
  if (bmiNum < 35) return { label: 'Béo phì độ 2', badge: 'Béo phì độ 2', color: '#ef4444' };
  return { label: 'Béo phì độ 3', badge: 'Béo phì độ 3', color: '#b91c1c' };
};

const HealthTracker = () => {
  const { user, users } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [openIndex, setOpenIndex] = useState(null);
  const [bmi, setBmi] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [isSelf, setIsSelf] = useState(false);
  const chartRef = useRef(null);

  const userBirthDate = useMemo(() => {
    if (!user) return '';
    const found = users?.find((u) => u.id === user.id);
    return found?.birthDate || user?.birthDate || '';
  }, [user, users]);

  const userGender = useMemo(() => {
    if (!user) return '';
    const found = users?.find((u) => u.id === user.id);
    return found?.gender || user?.gender || '';
  }, [user, users]);

  useEffect(() => {
    if (isSelf && userBirthDate) {
      setBirthDate(userBirthDate);
    }
    if (isSelf && userGender) {
      setGender(userGender);
    }
  }, [isSelf, userBirthDate, userGender]);

  const calculateBMI = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!birthDate || !h || !w) {
      notify('Vui lòng nhập đầy đủ ngày sinh, chiều cao và cân nặng.', { type: 'warning' });
      return;
    }
    if (h < MIN_HEIGHT || h > MAX_HEIGHT || w < MIN_WEIGHT || w > MAX_WEIGHT) {
      notify(`Vui lòng nhập chiều cao (${MIN_HEIGHT}-${MAX_HEIGHT} cm) và cân nặng (${MIN_WEIGHT}-${MAX_WEIGHT} kg) trong giới hạn hợp lý.`, { type: 'warning' });
      return;
    }
    const bmiValue = w / Math.pow(h / 100, 2);
    setBmi(bmiValue.toFixed(1));
    setShowResult(true);
    setShowForm(false);
    setTimeout(() => {
      if (chartRef.current) chartRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="bmi-page">
      <div className="bmi-layout">
        <div className="bmi-breadcrumb">
          <Link className="crumb-link home" to="/">🏠</Link>
          <Link className="crumb-link" to="/">Công cụ kiểm tra sức khỏe</Link>
          <span className="crumb">Tính chỉ số BMI - Chỉ số khối cơ thể</span>
        </div>

        {!showResult && (
          <div className="bmi-columns">
            <div className="bmi-card form-card">
              <div className="bmi-header">
                <h1>Đo chỉ số BMI</h1>
                <div className="bmi-expert">
                  <img src="https://cdn-icons-png.flaticon.com/512/2922/2922656.png" alt="Chuyên gia" />
                  <div>
                    <div className="expert-line">Tham vấn y khoa: Chuyên gia dinh dưỡng Phạm Thị Diệp</div>
                    <div className="expert-date">30/09/2023</div>
                  </div>
                </div>
              </div>

              <form className="bmi-form" onSubmit={(e) => e.preventDefault()}>
                <label className="field-label" htmlFor="birthdate">Ngày sinh của bạn</label>
                <div className="input-shell">
                  <input
                    id="birthdate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    readOnly={isSelf && !!userBirthDate}
                  />
                </div>

                <div className="question inline">
                  <div className="field-label">Bạn đang tính chỉ số cho chính mình?</div>
                  <button
                    type="button"
                    className={`toggle-chip ${isSelf ? 'active' : 'inactive'}`}
                    onClick={() => setIsSelf((prev) => !prev)}
                  >
                    {isSelf ? 'Có' : 'Không'}
                  </button>
                </div>

                <label className="field-label">Giới tính của bạn</label>
                <div className="button-row">
                  <button
                    type="button"
                    className={`pill ${gender === 'male' ? 'pill-active' : ''}`}
                    onClick={() => setGender('male')}
                  >
                    <span role="img" aria-label="Nam">👨‍🦱</span> Nam
                  </button>
                  <button
                    type="button"
                    className={`pill ${gender === 'female' ? 'pill-active' : ''}`}
                    onClick={() => setGender('female')}
                  >
                    <span role="img" aria-label="Nữ">👩</span> Nữ
                  </button>
                </div>

                <div className="double-row">
                  <div className="input-col">
                    <label className="field-label" htmlFor="height">Bạn cao bao nhiêu?</label>
                    <div className="input-shell">
                      <input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="Ví dụ: 170"
                      />
                      <span className="unit">cm</span>
                    </div>
                  </div>
                  <div className="input-col">
                    <label className="field-label" htmlFor="weight">Cân nặng của bạn</label>
                    <div className="input-shell">
                      <input
                        id="weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="Ví dụ: 60"
                      />
                      <span className="unit">kg</span>
                    </div>
                  </div>
                </div>

                <button type="button" className="submit-btn" onClick={calculateBMI}>Tính ngay</button>
              </form>
            </div>

            <div className="bmi-card info-panel">
              <div className="info-hero">
                <div className="hero-icon">🧮</div>
                <div>
                  <div className="hero-title">Đo chỉ số BMI</div>
                  <div className="hero-text">Kết quả đo chỉ số BMI giúp bạn biết mình đang thừa cân, béo phì hay suy dinh dưỡng để kịp thời điều chỉnh lối sống.</div>
                </div>
              </div>

              <div className="info-section">
                <div className="info-row info-title">
                  <span role="img" aria-label="alert">⚠️</span>
                  <span>Miễn trừ trách nhiệm</span>
                </div>
                <div className="info-copy">Kết quả đo chỉ số BMI giúp bạn biết mình đang thừa cân, béo phì hay suy dinh dưỡng để kịp thời điều chỉnh lối sống.</div>
              </div>

              <div className="info-section">
                <div className="info-row info-title">
                  <span role="img" aria-label="info">ℹ️</span>
                  <span>Thông tin</span>
                </div>
                <ul className="info-list">
                  {infoItems.map((item, idx) => {
                    const isOpen = openIndex === idx;
                    return (
                      <li key={item.title} className="info-item">
                        <button
                          type="button"
                          className="info-toggle"
                          onClick={() => setOpenIndex(isOpen ? null : idx)}
                          aria-expanded={isOpen}
                        >
                          <span className={`info-title-text ${isOpen ? 'open' : ''}`}>{item.title}</span>
                          <span className="plus">{isOpen ? '−' : '+'}</span>
                        </button>
                        <div className={`info-content ${isOpen ? 'open' : ''}`}>{item.content}</div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}

        {showResult && (
          <div className="result-layout">
            <div className="result-nav-column">
              <div className="bmi-header slim">
                <h1>Đo chỉ số BMI</h1>
                <div className="bmi-expert">
                  <img src="https://cdn-icons-png.flaticon.com/512/2922/2922656.png" alt="Chuyên gia" />
                  <div>
                    <div className="expert-line">Tham vấn y khoa: Chuyên gia dinh dưỡng Phạm Thị Diệp</div>
                    <div className="expert-date">30/09/2023</div>
                  </div>
                </div>
              </div>

              <div className="result-nav-list">
                <div className="result-link active">Kết quả BMI của bạn!</div>
                <div className="result-link muted">Thống kê</div>
              </div>
            </div>

            <div className="result-right">
              <button type="button" className="reset-btn" onClick={() => setShowForm(true)} aria-label="Kiểm tra lại">
                ↺
              </button>

              <div className="result-card hero full">
                <div className="hero-header">
                  <div>
                    <div className="hero-subtitle">Chỉ số BMI của bạn là</div>
                    <div className="hero-bmi">
                      {bmi}
                      <span className="hero-badge" style={{ background: '#ef4444' }}>
                        {classifyBmi(bmi)?.label}
                      </span>
                    </div>
                    <div className="hero-text">
                      Chỉ số BMI của bạn được coi là {classifyBmi(bmi)?.label}. Kiểm tra cân nặng thường xuyên để điều chỉnh chế độ ăn và hoạt động.
                    </div>
                  </div>
                  <div className="hero-figure" aria-hidden>🧍</div>
                </div>
                <div className="hero-scale">
                  <div className="scale-bar">
                    <div className="scale-section under" />
                    <div className="scale-section normal" />
                    <div className="scale-section over" />
                    <div className="scale-section obese1" />
                    <div className="scale-section obese2" />
                  </div>
                  <div className="scale-dot" style={{ left: `${Math.min(100, Math.max(0, (parseFloat(bmi) - 15) * 4))}%` }} />
                </div>
              </div>

              <div className="share-row">
                <span className="share-label">Chia sẻ</span>
                <div className="share-icons">
                  <span className="share-pill">f</span>
                  <span className="share-pill">X</span>
                  <span className="share-pill">in</span>
                  <span className="share-pill">Zalo</span>
                </div>
              </div>

              <div className="result-card recommendation wide">
                <div className="rec-icon">💡</div>
                <div>
                  <div className="rec-title">Bạn được khuyến nghị tìm một kế hoạch ăn kiêng cụ thể</div>
                  <div className="rec-text">
                    Rất khuyến khích bạn tham khảo ý kiến chuyên gia y tế để được tư vấn y tế cá nhân hóa liên quan đến tình trạng sức khỏe của bạn.
                  </div>
                </div>
                <button className="rec-btn" onClick={() => navigate('/bmr')}>Kiểm tra kế hoạch quản lý cân nặng</button>
              </div>

              <div ref={chartRef} className="chart-cards">
                <div className="info-card">
                  <div className="info-card-title">
                    <span className="info-icon">ℹ️</span>
                    <span>Tình trạng</span>
                  </div>
                  <div className="info-card-text">
                    Bạn được coi là béo phì cấp độ 2 nếu có chỉ số BMI trên 30.
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-title warn">
                    <span className="info-icon warn">⚠️</span>
                    <span>Nguy cơ</span>
                  </div>
                  <div className="info-card-text">
                    Béo phì có thể làm tăng nguy cơ tiến triển bệnh tiểu đường tuýp 2, tăng huyết áp, bệnh tim mạch, đột quỵ, viêm xương khớp, bệnh gan nhiễm mỡ, bệnh thận và một số bệnh ung thư.
                  </div>
                </div>
              </div>

              <div className="disclaimer bottom">
                ⚠️ Công cụ này mang tính tham khảo thông tin, không thay thế cho tư vấn chuyên môn. Liên hệ bác sĩ nếu có thắc mắc.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthTracker;
