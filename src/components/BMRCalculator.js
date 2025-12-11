// src/components/BMRCalculator.js
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './styles/BMRCalculator.css';

const activityLevels = [
  { label: 'Lối sống ít vận động (ít/không tập thể dục)', value: 1.2 },
  { label: 'Tập thể dục nhẹ (1-2 ngày/tuần)', value: 1.375 },
  { label: 'Tập thể dục vừa phải (3-5 ngày/tuần)', value: 1.55 },
  { label: 'Rất năng động (6-7 ngày/tuần)', value: 1.725 },
  { label: 'Rất tích cực (rất năng động & công việc đòi hỏi thể lực)', value: 1.9 },
];

const calculateAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const BMRCalculator = () => {
  const { user, users } = useAuth();
  const { notify } = useToast();
  const [gender, setGender] = useState('male');
  const [birthDate, setBirthDate] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState(activityLevels[0].value);
  const [showResult, setShowResult] = useState(false);
  const [isSelf, setIsSelf] = useState(false);

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
    if (isSelf && userBirthDate) setBirthDate(userBirthDate);
    if (isSelf && userGender) setGender(userGender);
  }, [isSelf, userBirthDate, userGender]);

  const age = useMemo(() => calculateAge(birthDate), [birthDate]);

  const bmr = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w || !age || age <= 0) return null;
    // Mifflin-St Jeor (độ chính xác cao)
    if (gender === 'male') {
      return 10 * w + 6.25 * h - 5 * age + 5;
    }
    return 10 * w + 6.25 * h - 5 * age - 161;
  }, [gender, height, weight, age]);

  const tdee = useMemo(() => (bmr ? bmr * activity : null), [bmr, activity]);

  const MIN_HEIGHT = 80;
  const MAX_HEIGHT = 250;
  const MIN_WEIGHT = 20;
  const MAX_WEIGHT = 250;

  const handleSubmit = () => {
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
    setShowResult(true);
  };

  const handleReset = () => {
    setShowResult(false);
  };

  const activityLabel = activityLevels.find((lvl) => lvl.value === activity)?.label || '';

  return (
    <div className="bmr-page">
      <div className="bmr-layout">
        <div className="bmr-breadcrumb">
          <Link className="crumb-link home" to="/">🏠</Link>
          <Link className="crumb-link" to="/">Công cụ kiểm tra sức khỏe</Link>
          <span className="crumb">Tính chỉ số BMR</span>
        </div>

        <div className="bmr-hero-card">
          <div>
            <div className="bmr-title">Trình tính BMR trung tâm</div>
            <div className="bmr-subtitle">
              BMR là tỉ lệ trao đổi chất cơ bản của cơ thể. Kết quả giúp bạn biết mức năng lượng tối thiểu cần duy trì, là nền tảng để điều chỉnh ăn uống và luyện tập.
            </div>
            <div className="bmr-meta">Tham vấn y khoa: BS.CKI Lê Hồng Thiện • 15/08/2024</div>
          </div>
          <div className="bmr-hero-icon" aria-hidden>
            🔥
          </div>
        </div>

        {!showResult && (
          <div className="bmr-card">
            <div className="form-row top-row">
              <div className="field label-inline">
                <span>Bạn đang tính chỉ số cho chính mình?</span>
                <button
                  type="button"
                  className={`pill-toggle ${isSelf ? 'active' : 'inactive'}`}
                  onClick={() => setIsSelf((prev) => !prev)}
                >
                  {isSelf ? 'Có' : 'Không'}
                </button>
              </div>
              <div className="field label-inline">
                <span>Ngày sinh của bạn</span>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  placeholder="DD/MM/YYYY"
                  readOnly={isSelf && !!userBirthDate}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label>Giới tính của bạn</label>
                <div className="button-row">
                  <button
                    type="button"
                    className={`pill ${gender === 'male' ? 'pill-active' : ''}`}
                    onClick={() => setGender('male')}
                  >
                    👨 Nam
                  </button>
                  <button
                    type="button"
                    className={`pill ${gender === 'female' ? 'pill-active' : ''}`}
                    onClick={() => setGender('female')}
                  >
                    👩 Nữ
                  </button>
                </div>
              </div>
              <div className="field">
                <label>Bạn cao bao nhiêu?</label>
                <div className="input-shell">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Ví dụ: 170"
                  />
                  <span className="unit">cm</span>
                </div>
              </div>
              <div className="field">
                <label>Cân nặng của bạn</label>
                <div className="input-shell">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ví dụ: 60"
                  />
                  <span className="unit">kg</span>
                </div>
              </div>
            </div>

            <div className="field">
              <label>Chọn cường độ hoạt động thể chất của bạn</label>
              <div className="select-shell">
                <select value={activity} onChange={(e) => setActivity(parseFloat(e.target.value))}>
                  {activityLevels.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="button" className="bmr-submit" onClick={handleSubmit}>Tính ngay</button>
          </div>
        )}

        {showResult && (
          <div className="bmr-results-view">
            <div className="bmr-recheck">
              <span>Kết quả này được đề xuất theo giới tính của bạn.</span>
              <button type="button" onClick={handleReset} className="link-btn blue">Kiểm tra lại</button>
            </div>

            <div className="bmr-result-summary">
              <div className="metric-col">
                <div className="metric-title">🔥 Chỉ số BMR của bạn</div>
                <div className="metric-sub">Khi nghỉ ngơi</div>
                <div className="metric-value">{bmr ? bmr.toFixed(0) : '--'}</div>
                <div className="metric-unit">kcal/ngày</div>
                <div className="metric-spark">
                  {[...Array(6)].map((_, i) => (
                    <span key={i} className="spark" />
                  ))}
                </div>
              </div>
              <div className="metric-col">
                <div className="metric-title">🪴 Chỉ số TDEE</div>
                <div className="metric-sub">{activityLabel || 'Lối sống'}</div>
                <div className="metric-value">{tdee ? tdee.toFixed(0) : '--'}</div>
                <div className="metric-unit">kcal/ngày</div>
              </div>
            </div>

            <div className="result-desc">
              Chỉ số BMR cho biết lượng calo cơ thể bạn cần để duy trì các chức năng sinh lý cơ bản khi nghỉ ngơi trong ngày, được sử dụng làm cơ sở để xác định nhu cầu calo hằng ngày, đặc biệt trong quản lý cân nặng và lập kế hoạch thể dục.
            </div>

            <div className="recommend-card">
              <div className="rec-icon">💡</div>
              <div className="rec-text">
                <div className="rec-title">Bạn được khuyến nghị tìm một kế hoạch ăn kiêng cụ thể</div>
                <div className="rec-body">
                  Rất khuyến khích bạn tham khảo ý kiến chuyên gia y tế để được tư vấn y tế cá nhân hóa liên quan đến tình trạng sức khỏe của bạn.
                </div>
              </div>
              <button className="rec-btn">Tính toán cân nặng lý tưởng</button>
            </div>

            <div className="disclaimer-card">
              ⚠️ Vui lòng tham khảo ý kiến bác sĩ khi giảm 1 kg hoặc hơn mỗi tuần vì điều đó yêu cầu bạn tiêu thụ ít hơn mức khuyến nghị tối thiểu là 1,500 calo mỗi ngày.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BMRCalculator;
