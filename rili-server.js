import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const ROLES_FILE = path.join(process.cwd(), 'rili_roles.json');
const DATA_FILE = path.join(process.cwd(), 'rili_data.json');

async function readJson(file, fallback) {
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

function generateSampleData(year, month, gender) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const data = {};
  const moods = ['happy', 'calm', 'sad', 'angry', 'excited', 'tired'];
  const sampleEvents = [
    { text: '晨跑', color: '#34c759' },
    { text: '开会', color: '#007aff' },
    { text: '阅读', color: '#ff9500' },
    { text: '看电影', color: '#af52de' },
    { text: '写日记', color: '#ff3b30' },
    { text: '散步', color: '#34c759' }
  ];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isWeekend = new Date(year, month, d).getDay() % 6 === 0;
    const entry = { events: [], mood: '', period: false };

    // Random mood
    if (Math.random() > 0.3) {
      entry.mood = moods[Math.floor(Math.random() * moods.length)];
    }

    // Period for female roles (simulated cycle)
    if (gender !== 'male' && d >= 10 && d <= 14) {
      entry.period = true;
    }

    // Random events
    if (Math.random() > 0.4) {
      const numEvents = Math.floor(Math.random() * 3) + 1;
      const shuffled = [...sampleEvents].sort(() => Math.random() - 0.5);
      entry.events = shuffled.slice(0, numEvents).map(ev => ({
        text: ev.text,
        color: ev.color,
        time: `${String(8 + Math.floor(Math.random() * 12)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
      }));
    }

    data[dateKey] = entry;
  }

  return data;
}

app.get('/calendar/roles', async (req, res) => {
  try {
    const roles = await readJson(ROLES_FILE, []);
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read roles' });
  }
});

app.get('/calendar/data', async (req, res) => {
  const roleId = req.query.roleId;
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10);

  if (!roleId || isNaN(year) || isNaN(month)) {
    return res.status(400).json({ error: 'Missing roleId/year/month' });
  }

  try {
    const allData = await readJson(DATA_FILE, {});
    let monthData = allData[roleId];

    if (!monthData) {
      const roles = await readJson(ROLES_FILE, []);
      const role = roles.find(r => String(r.id) === String(roleId));
      const gender = role?.gender || 'female';
      monthData = generateSampleData(year, month, gender);
      allData[roleId] = monthData;
      await writeJson(DATA_FILE, allData);
    } else {
      // Ensure all days exist
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const roles = await readJson(ROLES_FILE, []);
      const role = roles.find(r => String(r.id) === String(roleId));
      const gender = role?.gender || 'female';
      let updated = false;

      for (let d = 1; d <= daysInMonth; d++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (!monthData[dateKey]) {
          monthData[dateKey] = { events: [], mood: '', period: false };
          updated = true;
        }
      }

      if (updated) {
        allData[roleId] = monthData;
        await writeJson(DATA_FILE, allData);
      }
    }

    res.json(monthData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

app.post('/calendar/data', async (req, res) => {
  const roleId = req.query.roleId;
  if (!roleId) {
    return res.status(400).json({ error: 'Missing roleId' });
  }

  try {
    const allData = await readJson(DATA_FILE, {});
    allData[roleId] = req.body;
    await writeJson(DATA_FILE, allData);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

app.listen(3000, () => {
  console.log('日历 API 服务已启动: http://localhost:3000');
  console.log('接口列表:');
  console.log('  GET /calendar/roles');
  console.log('  GET /calendar/data?roleId=xxx&year=yyyy&month=mm');
  console.log('  POST /calendar/data?roleId=xxx');
});
