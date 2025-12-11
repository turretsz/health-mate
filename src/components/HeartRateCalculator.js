// src/components/HeartRateCalculator.js
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './styles/HeartRateCalculator.css';

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

const calculateAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const HeartRateCalculator = () => {
  const { user, users } = useAuth();
  const { notify } = useToast();
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('male');
  const [resting, setResting] = useState(60);
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

  const maxHeartRate = useMemo(() => {
    if (!age || age <= 0) return null;
    return 220 - age; // common max HR estimate
  }, [age]);

  const zones = useMemo(() => {
    if (!maxHeartRate) return null;
    const moderateMin = Math.round(maxHeartRate * 0.5);
    const moderateMax = Math.round(maxHeartRate * 0.7);
    const vigorousMin = Math.round(maxHeartRate * 0.7);
    const vigorousMax = Math.round(maxHeartRate * 0.85);
    return { moderateMin, moderateMax, vigorousMin, vigorousMax };
  }, [maxHeartRate]);

  const handleSubmit = () => {
    if (!birthDate || !resting || resting <= 0) {
      notify('Vui lòng nhập ngày sinh và nhịp tim nghỉ ngơi.', { type: 'warning' });
      return;
    }
    if (resting < 30 || resting > 120) {
      notify('Vui lòng nhập nhịp tim nghỉ ngơi trong khoảng 30-120 bpm.', { type: 'warning' });
      return;
    }
    setShowResult(true);
  };

  return (
    <div className="hr-page">
      <div className="hr-layout">
        <div className="hr-breadcrumb">
          <Link className="crumb-link home" to="/">🏠</Link>
          <Link className="crumb-link" to="/">Công cụ kiểm tra sức khỏe</Link>
          <span className="crumb">Công cụ tính nhịp tim lý tưởng</span>
        </div>

        <div className="hr-hero">
          <div>
            <h1>Công cụ tính nhịp tim lý tưởng</h1>
            <p>Tìm hiểu nhịp tim nghỉ ngơi bình thường và nhịp tim tối đa trong độ tuổi của bạn cũng như cường độ tập thể dục và các yếu tố khác ảnh hưởng đến nhịp tim như thế nào.</p>
            <div className="hr-meta">Tham vấn y khoa: Thạc sĩ - Bác sĩ CKI Ngô Võ Ngọc Hương • 27/09/2021</div>
          </div>
          <div className="hr-hero-icon" aria-hidden>❤️</div>
        </div>

        <div className="hr-card">
          <div className="hr-row">
            <div className="field">
              <label>Ngày sinh của bạn</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                readOnly={isSelf && !!userBirthDate}
              />
            </div>
            <div className="field inline">
              <span>Bạn đang tính chỉ số cho chính mình?</span>
              <button
                type="button"
                className={`pill-toggle ${isSelf ? 'active' : 'inactive'}`}
                onClick={() => setIsSelf((prev) => !prev)}
              >
                {isSelf ? 'Có' : 'Không'}
              </button>
            </div>
          </div>

          <div className="hr-row">
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
          </div>

          <div className="field">
            <label>Nhịp tim nghỉ ngơi của bạn là bao nhiêu? (bpm)</label>
            <div className="slider-row">
              <button
                type="button"
                className="slider-btn"
                onClick={() => setResting((prev) => clamp(prev - 1, 30, 120))}
              >
                -
              </button>
              <input
                type="range"
                min="30"
                max="120"
                value={resting}
                onChange={(e) => setResting(parseInt(e.target.value || '0', 10))}
              />
              <button
                type="button"
                className="slider-btn"
                onClick={() => setResting((prev) => clamp(prev + 1, 30, 120))}
              >
                +
              </button>
            </div>
            <div className="slider-value">{resting} bpm</div>
            <div className="slider-helper">Làm sao để đo nhịp tim nghỉ ngơi?</div>
          </div>

          <button className="hr-submit" type="button" onClick={handleSubmit}>Tính ngay</button>
        </div>

        {showResult && (
          <div className="hr-results">
            <div className="hr-metrics">
              <div className="metric">
                <div className="metric-title">Nhịp tim tối đa ước tính</div>
                <div className="metric-value">{maxHeartRate || '--'} bpm</div>
                <div className="metric-note">Công thức: 220 - tuổi</div>
              </div>
              <div className="metric">
                <div className="metric-title">Vùng nhịp tim lý tưởng</div>
                <div className="metric-value">
                  {zones ? `${zones.moderateMin}-${zones.vigorousMax} bpm` : '--'}
                </div>
                <div className="metric-note">50-85% nhịp tim tối đa</div>
              </div>
            </div>
            {zones && (
              <div className="zones-card">
                <div className="zone-row">
                  <span className="zone-dot mod" />
                  <span className="zone-text">Vùng vận động vừa (50-70%): {zones.moderateMin}-{zones.moderateMax} bpm</span>
                </div>
                <div className="zone-row">
                  <span className="zone-dot vig" />
                  <span className="zone-text">Vùng vận động mạnh (70-85%): {zones.vigorousMin}-{zones.vigorousMax} bpm</span>
                </div>
                <div className="zone-row">
                  <span className="zone-dot rest" />
                  <span className="zone-text">Nhịp tim nghỉ của bạn: {resting} bpm</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeartRateCalculator;
