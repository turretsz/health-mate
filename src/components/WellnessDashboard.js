import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './styles/WellnessDashboard.css';

const today = new Date().toISOString().slice(0, 10);
const STORAGE_KEYS = {
  water: 'hm_water_logs',
  sleep: 'hm_sleep_logs',
  activity: 'hm_activity_logs',
  reminders: 'hm_reminders',
  notifications: 'hm_notifications',
  tips: 'hm_tips',
  inbox: 'hm_inbox',
  metrics: 'hm_body_metrics',
};
const storageKeyFor = (type, userId) => `${STORAGE_KEYS[type]}_${userId || 'guest'}`;
const reminderSchedule = {
  water: ['10:00', '14:00', '18:00'],
  move: ['11:30', '16:30'],
  sleep: ['22:30'],
};

const readLocal = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') return data;
    return fallback;
  } catch (e) {
    return fallback;
  }
};

const WellnessDashboard = () => {
  const { user, users, setUserPlan, deleteUser } = useAuth();
  const { notify } = useToast();
  const userKey = user?.id || 'guest';
  const [weight, setWeight] = useState(62);
  const [height, setHeight] = useState(168);
  const [goal, setGoal] = useState('18.5 - 23');
  const [waterLogs, setWaterLogs] = useState(() =>
    readLocal(storageKeyFor('water', userKey), [{ time: '08:00', amount: 250, date: today }]),
  );
  const [waterInput, setWaterInput] = useState(300);
  const [sleepLogs, setSleepLogs] = useState(() =>
    readLocal(storageKeyFor('sleep', userKey), [{ start: '23:30', end: '07:00', quality: 'Tốt', date: today, duration: 7.5 }]),
  );
  const [sleepStart, setSleepStart] = useState('');
  const [sleepEnd, setSleepEnd] = useState('');
  const [activities, setActivities] = useState(() =>
    readLocal(storageKeyFor('activity', userKey), [{ type: 'Đi bộ', minutes: 25, intensity: 'Vừa', date: today }]),
  );
  const [activityType, setActivityType] = useState('Đi bộ');
  const [activityMinutes, setActivityMinutes] = useState(20);
  const [reminders, setReminders] = useState({
    water: true,
    move: true,
    sleep: false,
  });
  const [reminderInbox, setReminderInbox] = useState([]);
  const [reminderStamped, setReminderStamped] = useState({});
  const defaultTips = [{ title: 'Uống nước đúng giờ', content: 'Nhấp nháp 200-300ml mỗi 60 phút trong giờ làm.' }];
  const [tips, setTips] = useState(defaultTips);
  const [tipForm, setTipForm] = useState({ title: '', content: '' });
  const defaultNotifications = [
    { id: 1, type: 'Nhắc nhở', message: 'Uống nước lúc 10:00', status: 'Đang bật' },
    { id: 2, type: 'Gợi ý', message: 'Thử chạy 15 phút sau bữa trưa', status: 'Tạm dừng' },
  ];
  const [notifications, setNotifications] = useState(defaultNotifications);
  const isAdmin = user?.role === 'admin';
  const defaultUserList = [
    { id: 1, name: 'Lan', plan: 'Free', lastActive: 'Hôm nay' },
    { id: 2, name: 'Minh', plan: 'Pro', lastActive: 'Hôm qua' },
    { id: 3, name: 'An', plan: 'Free', lastActive: '3 ngày' },
  ];
  const userList = (users && users.length ? users : defaultUserList).map((u, idx) => ({
    ...u,
    lastActive: u.lastActive || defaultUserList[idx % defaultUserList.length].lastActive,
    plan: u.plan || 'Free',
  }));

  useEffect(() => {
    localStorage.setItem(storageKeyFor('water', userKey), JSON.stringify(waterLogs));
  }, [waterLogs, userKey]);

  useEffect(() => {
    localStorage.setItem(storageKeyFor('sleep', userKey), JSON.stringify(sleepLogs));
  }, [sleepLogs, userKey]);

  useEffect(() => {
    localStorage.setItem(storageKeyFor('activity', userKey), JSON.stringify(activities));
  }, [activities, userKey]);

  useEffect(() => {
    localStorage.setItem(storageKeyFor('reminders', userKey), JSON.stringify(reminders));
    window.dispatchEvent(new Event('hm-data-updated'));
  }, [reminders, userKey]);

  useEffect(() => {
    localStorage.setItem(storageKeyFor('notifications', userKey), JSON.stringify(notifications));
  }, [notifications, userKey]);

  useEffect(() => {
    localStorage.setItem(storageKeyFor('tips', userKey), JSON.stringify(tips));
  }, [tips, userKey]);

  useEffect(() => {
    localStorage.setItem(storageKeyFor('inbox', userKey), JSON.stringify(reminderInbox));
    window.dispatchEvent(new Event('hm-data-updated'));
  }, [reminderInbox, userKey]);

  useEffect(() => {
    localStorage.setItem(
      storageKeyFor('metrics', userKey),
      JSON.stringify({ weight, height, goal }),
    );
  }, [weight, height, goal, userKey]);

  // Reload logs when user changes
  useEffect(() => {
    setWaterLogs(readLocal(storageKeyFor('water', userKey), []));
    setSleepLogs(readLocal(storageKeyFor('sleep', userKey), []));
    setActivities(readLocal(storageKeyFor('activity', userKey), []));
    setReminders(
      readLocal(storageKeyFor('reminders', userKey), { water: true, move: true, sleep: false }),
    );
    setNotifications(readLocal(storageKeyFor('notifications', userKey), defaultNotifications));
    setTips(readLocal(storageKeyFor('tips', userKey), defaultTips));
    setReminderInbox(readLocal(storageKeyFor('inbox', userKey), []));
    const metrics = readLocal(storageKeyFor('metrics', userKey), null);
    if (metrics) {
      setWeight(metrics.weight ?? 62);
      setHeight(metrics.height ?? 168);
      setGoal(metrics.goal ?? '18.5 - 23');
    } else {
      setWeight(62);
      setHeight(168);
      setGoal('18.5 - 23');
    }
  }, [userKey]);

  const bmi = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w) return null;
    return (w / Math.pow(h / 100, 2)).toFixed(1);
  }, [height, weight]);

  const filterByRange = (logs, days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (days - 1));
    return logs.filter((item) => {
      const d = new Date(item.date || today);
      return d >= cutoff;
    });
  };

  const stats = useMemo(() => {
    const dayWater = filterByRange(waterLogs, 1).reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const weekWater = filterByRange(waterLogs, 7).reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const monthWater = filterByRange(waterLogs, 30).reduce((s, i) => s + (Number(i.amount) || 0), 0);

    const daySleep = filterByRange(sleepLogs, 1).reduce((s, i) => s + (Number(i.duration) || 0), 0);
    const weekSleep = filterByRange(sleepLogs, 7).reduce((s, i) => s + (Number(i.duration) || 0), 0);
    const monthSleep = filterByRange(sleepLogs, 30).reduce((s, i) => s + (Number(i.duration) || 0), 0);

    const dayAct = filterByRange(activities, 1).reduce((s, i) => s + (Number(i.minutes) || 0), 0);
    const weekAct = filterByRange(activities, 7).reduce((s, i) => s + (Number(i.minutes) || 0), 0);
    const monthAct = filterByRange(activities, 30).reduce((s, i) => s + (Number(i.minutes) || 0), 0);

    return {
      water: { day: dayWater, week: weekWater, month: monthWater },
      sleep: { day: daySleep, week: weekSleep, month: monthSleep },
      activity: { day: dayAct, week: weekAct, month: monthAct },
    };
  }, [waterLogs, sleepLogs, activities]);

  const advisor = useMemo(() => {
    const advice = [];
    if (stats.water.day < 1500) advice.push('Uống thêm ~500-800ml nước hôm nay để đạt 2L.');
    if (stats.sleep.day < 7) advice.push('Ngủ dưới 7h, hãy thử lên lịch ngủ sớm hơn 30 phút.');
    if (stats.activity.day < 20) advice.push('Hoạt động dưới 20 phút, nên đi bộ nhẹ 15-20 phút.');
    if (!advice.length) advice.push('Duy trì nhịp hiện tại, bạn đang on-track hôm nay.');
    return advice;
  }, [stats]);

  const totalWater = useMemo(
    () => waterLogs.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [waterLogs],
  );

  const addWater = () => {
    if (!waterInput) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().slice(0, 10);
    setWaterLogs((prev) => [...prev, { time, amount: Number(waterInput), date: dateStr }]);
    setWaterInput(300);
  };

  const addSleep = () => {
    if (!sleepStart || !sleepEnd) {
      notify('Nhập đầy đủ giờ ngủ và giờ dậy.', { type: 'warning' });
      return;
    }
    const toMinutes = (val) => {
      const [h, m] = val.split(':').map((n) => parseInt(n, 10));
      if (Number.isNaN(h) || Number.isNaN(m)) return null;
      return h * 60 + m;
    };
    const startMin = toMinutes(sleepStart);
    const endMin = toMinutes(sleepEnd);
    if (startMin === null || endMin === null) {
      notify('Giờ không hợp lệ, vui lòng nhập theo định dạng HH:MM.', { type: 'warning' });
      return;
    }
    // Hỗ trợ ca đêm: nếu giờ dậy sớm hơn giờ ngủ, tự cộng 24h cho giờ dậy.
    const duration = endMin <= startMin ? endMin + 1440 - startMin : endMin - startMin;
    const hours = duration / 60;
    const quality = hours >= 7 ? 'Tốt' : hours >= 5 ? 'Ổn' : 'Thiếu ngủ';

    const dateStr = new Date().toISOString().slice(0, 10);
    setSleepLogs((prev) => [...prev, { start: sleepStart, end: sleepEnd, quality, date: dateStr, duration: parseFloat(hours.toFixed(2)) }]);
    setSleepStart('');
    setSleepEnd('');
  };

  const addActivity = () => {
    if (!activityMinutes) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    setActivities((prev) => [...prev, { type: activityType, minutes: Number(activityMinutes), intensity: 'Tùy chỉnh', date: dateStr }]);
    setActivityMinutes(20);
  };

  const toggleReminder = (key) => {
    setReminders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveTip = () => {
    if (!tipForm.title || !tipForm.content) return;
    setTips((prev) => [...prev, tipForm]);
    setTipForm({ title: '', content: '' });
  };

  const toggleNotification = (id) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: item.status === 'Đang bật' ? 'Tạm dừng' : 'Đang bật' } : item,
      ),
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      const current = `${hh}:${mm}`;
      const todayKey = new Date().toDateString();

      setReminderStamped((prev) => {
        const stamped = { ...prev };
        if (!stamped[todayKey]) stamped[todayKey] = {};
        const todays = stamped[todayKey];
        const newMessages = [];

        Object.entries(reminderSchedule).forEach(([key, times]) => {
          if (!reminders[key]) return;
          times.forEach((t) => {
            const stampKey = `${key}-${t}`;
            if (current === t && !todays[stampKey]) {
              todays[stampKey] = true;
              if (key === 'water') newMessages.push('Đã đến giờ uống nước (~250ml).');
              if (key === 'move') newMessages.push('Đã đến giờ vận động nhẹ 5-10 phút.');
              if (key === 'sleep') newMessages.push('Chuẩn bị đi ngủ đúng giờ để đủ giấc.');
            }
          });
        });

        if (newMessages.length) {
          setReminderInbox((prevMsgs) => [...prevMsgs, ...newMessages]);
        }
        return stamped;
      });
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [reminders]);

  return (
    <div className="page-width dash">
      <div className="dash-header">
        <div>
          <p className="dash-kicker">HealthMate Dashboard</p>
          <h1>Nhật ký sức khỏe & bảng quản trị</h1>
          <p className="dash-sub">
            Theo dõi chỉ số cơ thể, nước, giấc ngủ, hoạt động và nhắc nhở. Quản trị có thể cập nhật gợi ý, thông báo và dữ liệu người dùng.
          </p>
        </div>
        <div className="dash-badge">
          <span>Hôm nay</span>
          <strong>{today}</strong>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-head">
            <div>
              <p className="label">Chỉ số cơ thể</p>
              <h3>BMI & số đo</h3>
            </div>
            <span className="pill green">Người dùng</span>
          </div>
          <div className="inputs">
            <label>
              Cân nặng (kg)
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </label>
            <label>
              Chiều cao (cm)
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
            </label>
          </div>
          <div className="metric-large">
            <div>
              <p className="label">BMI hiện tại</p>
              <div className="value">{bmi || '--'}</div>
            </div>
            <div>
              <p className="label">Mục tiêu</p>
              <input
                className="goal-input"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <p className="label">Nước uống</p>
              <h3>Ghi nhận mỗi lần</h3>
            </div>
            <span className="pill blue">{totalWater} ml hôm nay</span>
          </div>
          <div className="inputs inline">
            <input
              type="number"
              value={waterInput}
              onChange={(e) => setWaterInput(e.target.value)}
              min={50}
              step={50}
            />
            <button onClick={addWater}>Thêm</button>
          </div>
          <div className="log-list">
            {waterLogs.map((log, idx) => (
              <div key={`${log.time}-${idx}`} className="log-row">
                <span>{log.time}</span>
                <strong>{log.amount} ml</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <p className="label">Giấc ngủ</p>
              <h3>Theo dõi chất lượng</h3>
            </div>
            <span className="pill purple">8h đề xuất</span>
          </div>
          <div className="inputs">
            <label>
              Ngủ lúc
              <input type="time" value={sleepStart} onChange={(e) => setSleepStart(e.target.value)} />
            </label>
            <label>
              Dậy lúc
              <input type="time" value={sleepEnd} onChange={(e) => setSleepEnd(e.target.value)} />
            </label>
            <button onClick={addSleep}>Lưu giấc ngủ</button>
          </div>
          <div className="log-list">
            {sleepLogs.map((log, idx) => (
              <div key={`${log.start}-${idx}`} className="log-row">
                <span>{log.start} → {log.end}</span>
                <strong>{log.quality}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <p className="label">Hoạt động</p>
              <h3>Thể chất hằng ngày</h3>
            </div>
            <span className="pill orange">15-30 phút</span>
          </div>
          <div className="inputs inline">
            <input value={activityType} onChange={(e) => setActivityType(e.target.value)} placeholder="Chạy bộ" />
            <input
              type="number"
              value={activityMinutes}
              onChange={(e) => setActivityMinutes(e.target.value)}
              min={5}
              placeholder="Phút"
            />
            <button onClick={addActivity}>Ghi lại</button>
          </div>
          <div className="log-list">
            {activities.map((item, idx) => (
              <div key={`${item.type}-${idx}`} className="log-row">
                <span>{item.type}</span>
                <strong>{item.minutes} phút • {item.intensity}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="card wide">
          <div className="card-head">
            <div>
              <p className="label">Nhắc nhở thông minh</p>
              <h3>Uống nước • Vận động • Ngủ</h3>
            </div>
            <span className="pill blue">Quản trị</span>
          </div>
          <div className="reminders">
            {Object.entries(reminders).map(([key, value]) => (
              <button
                key={key}
                className={`toggle ${value ? 'active' : ''}`}
                onClick={() => toggleReminder(key)}
              >
                {key === 'water' && 'Uống nước'}
                {key === 'move' && 'Vận động'}
                {key === 'sleep' && 'Đi ngủ đúng giờ'}
              </button>
            ))}
          </div>
          <div className="notification-list">
            {notifications.map((item) => (
              <div key={item.id} className="notif-row">
                <div>
                  <p className="label">{item.type}</p>
                  <strong>{item.message}</strong>
                </div>
                <button className="pill" onClick={() => toggleNotification(item.id)}>{item.status}</button>
              </div>
            ))}
          </div>
        </div>

        <div className="card wide">
          <div className="card-head">
            <div>
              <p className="label">Thống kê báo cáo</p>
              <h3>Ngày • Tuần • Tháng</h3>
            </div>
            <span className="pill blue">Tổng hợp cục bộ</span>
          </div>
          <div className="stats-grid">
            <div className="stat">
              <p className="label">Nước uống</p>
              <div className="stat-row">
                <span>Hôm nay</span>
                <strong>{stats.water.day} ml</strong>
              </div>
              <div className="stat-row">
                <span>7 ngày</span>
                <strong>{stats.water.week} ml</strong>
              </div>
              <div className="stat-row">
                <span>30 ngày</span>
                <strong>{stats.water.month} ml</strong>
              </div>
            </div>
            <div className="stat">
              <p className="label">Giấc ngủ</p>
              <div className="stat-row">
                <span>Hôm nay</span>
                <strong>{stats.sleep.day ? `${stats.sleep.day.toFixed(1)} h` : '--'}</strong>
              </div>
              <div className="stat-row">
                <span>7 ngày</span>
                <strong>{stats.sleep.week ? `${stats.sleep.week.toFixed(1)} h` : '--'}</strong>
              </div>
              <div className="stat-row">
                <span>30 ngày</span>
                <strong>{stats.sleep.month ? `${stats.sleep.month.toFixed(1)} h` : '--'}</strong>
              </div>
            </div>
            <div className="stat">
              <p className="label">Hoạt động</p>
              <div className="stat-row">
                <span>Hôm nay</span>
                <strong>{stats.activity.day} phút</strong>
              </div>
              <div className="stat-row">
                <span>7 ngày</span>
                <strong>{stats.activity.week} phút</strong>
              </div>
              <div className="stat-row">
                <span>30 ngày</span>
                <strong>{stats.activity.month} phút</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="card wide">
          <div className="card-head">
            <div>
              <p className="label">Tư vấn chăm sóc</p>
              <h3>Gợi ý cá nhân</h3>
            </div>
            <span className="pill orange">Tự động</span>
          </div>
          <ul className="advice-list">
            {advisor.map((line, idx) => (
              <li key={line + idx}>{line}</li>
            ))}
          </ul>
          {reminderInbox.length > 0 && (
            <div className="reminder-inbox">
              <div className="inbox-head">
                <p className="label">Nhắc nhở đến hạn</p>
                <button className="pill" onClick={() => setReminderInbox([])}>Đánh dấu đã đọc</button>
              </div>
              <ul>
                {reminderInbox.map((msg, idx) => (
                  <li key={`${msg}-${idx}`}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
          {reminderInbox.length === 0 && <p className="label">Chưa có nhắc nhở mới.</p>}
        </div>

        {isAdmin && (
          <>
            <div className="card admin">
              <div className="card-head">
                <div>
                  <p className="label">Gợi ý chăm sóc</p>
                  <h3>Cập nhật nội dung</h3>
                </div>
                <span className="pill purple">Admin</span>
              </div>
              <input
                className="full"
                placeholder="Tiêu đề"
                value={tipForm.title}
                onChange={(e) => setTipForm({ ...tipForm, title: e.target.value })}
              />
              <textarea
                className="full"
                rows={3}
                placeholder="Nội dung ngắn"
                value={tipForm.content}
                onChange={(e) => setTipForm({ ...tipForm, content: e.target.value })}
              />
              <button onClick={saveTip}>Thêm gợi ý</button>
              <ul className="tip-list">
                {tips.map((tip, idx) => (
                  <li key={`${tip.title}-${idx}`}>
                    <strong>{tip.title}</strong>
                    <p>{tip.content}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card admin">
              <div className="card-head">
                <div>
                  <p className="label">Người dùng</p>
                  <h3>Quản lý dữ liệu</h3>
                </div>
                <span className="pill green">{userList.length} tài khoản</span>
              </div>
              <div className="user-table">
                {userList.map((u) => {
                  const isCurrent = user && u.id === user.id;
                  const canToggle = user?.role === 'admin';
                  return (
                    <div key={u.id} className="user-row">
                      <div>
                        <strong>{u.name}</strong>
                        <p className="label">
                          Gói {u.plan || 'Free'}
                          {u.role === 'admin' ? ' • Admin' : ''}
                          {isCurrent ? ' • Bạn' : ''}
                        </p>
                      </div>
                      {canToggle && u.role !== 'admin' ? (
                        <div className="user-actions">
                          <button
                            className="pill"
                            onClick={() => setUserPlan(u.id, u.plan === 'Pro' ? 'Free' : 'Pro')}
                          >
                            {u.plan === 'Pro' ? 'Hạ cấp' : 'Mở khóa'}
                          </button>
                          <button
                            className="pill danger"
                            onClick={() => {
                              if (window.confirm(`Bạn chắc chắn muốn xóa tài khoản ${u.name}?`)) {
                                deleteUser(u.id);
                                notify('Đã xóa tài khoản.', { type: 'success' });
                              }
                            }}
                          >
                            Xóa
                          </button>
                        </div>
                      ) : (
                        <span className="pill">{u.lastActive}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WellnessDashboard;
