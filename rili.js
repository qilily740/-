document.addEventListener('DOMContentLoaded', () => {
    const APP_KEY = "3";
    const WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'];
    const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const STORAGE_KEY = 'rili_data';
    const CACHE_KEY = 'rili_cache';
    const ROLES_META_KEY = 'rili_roles';
    const MOOD_OPTIONS = [
        { value: 'happy', label: '开心', color: '#ffcc00', face: 'happy' },
        { value: 'calm', label: '平静', color: '#34c759', face: 'calm' },
        { value: 'sad', label: '难过', color: '#007aff', face: 'sad' },
        { value: 'angry', label: '生气', color: '#ff3b30', face: 'angry' },
        { value: 'excited', label: '兴奋', color: '#ff9500', face: 'excited' },
        { value: 'tired', label: '疲惫', color: '#8e8e93', face: 'tired' }
    ];

    let calYear = new Date().getFullYear();
    let calMonth = new Date().getMonth();
    let selectedDate = null;
    let currentRoleId = null;
    let viewingRoleId = null;
    const USER_ID = '__user__';

    function getCache() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }

    function saveCache(cache) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }

    (function restoreState() {
        const cache = getCache();
        if (cache.year) calYear = cache.year;
        if (cache.month !== undefined) calMonth = cache.month;
        if (cache.selectedDate) selectedDate = cache.selectedDate;
        if (cache.currentRoleId) currentRoleId = cache.currentRoleId;
        if (cache.viewingRoleId) viewingRoleId = cache.viewingRoleId;
    })();

    function persistState() {
        saveCache({ year: calYear, month: calMonth, selectedDate, currentRoleId, viewingRoleId });
    }

    function getRoleMeta() {
        try {
            const raw = localStorage.getItem(ROLES_META_KEY);
            return raw ? JSON.parse(raw) : { roles: [], currentRoleId: null };
        } catch {
            return { roles: [], currentRoleId: null };
        }
    }

    function saveRoleMeta(meta) {
        localStorage.setItem(ROLES_META_KEY, JSON.stringify(meta));
    }

    function ensureDefaultRole() {
        const meta = getRoleMeta();
        if (meta.roles.length === 0) {
            const defaultRole = {
                id: USER_ID,
                name: window.appData?.charName || '我',
                avatar: window.appData?.charAvatarUrl || '',
                gender: 'female'
            };
            meta.roles = [defaultRole];
            if (!meta.currentRoleId) meta.currentRoleId = defaultRole.id;
            saveRoleMeta(meta);
        }
        if (!currentRoleId) {
            currentRoleId = meta.currentRoleId || meta.roles[0]?.id || USER_ID;
        }
        if (!viewingRoleId) {
            viewingRoleId = currentRoleId;
        }
        return meta;
    }

    function getCurrentRole() {
        const meta = ensureDefaultRole();
        return meta.roles.find(r => r.id === currentRoleId) || meta.roles[0];
    }

    function getViewingRole() {
        const meta = ensureDefaultRole();
        return meta.roles.find(r => r.id === viewingRoleId) || meta.roles[0];
    }

    function isRoleView() {
        return viewingRoleId && viewingRoleId !== USER_ID;
    }

    function switchRole(roleId) {
        const meta = getRoleMeta();
        if (!meta.roles.find(r => r.id === roleId)) return;
        currentRoleId = roleId;
        viewingRoleId = roleId;
        meta.currentRoleId = roleId;
        saveRoleMeta(meta);
        persistState();
        (async function syncRoleData() {
            const apiData = await loadRoleDataFromApi(roleId, calYear, calMonth);
            if (apiData && typeof apiData === 'object') {
                const all = getAllDayData();
                all[roleId] = apiData;
                saveAllDayData(all);
            }
        })();
    }

    function switchToUser() {
        viewingRoleId = USER_ID;
        const meta = getRoleMeta();
        meta.currentRoleId = currentRoleId;
        saveRoleMeta(meta);
        persistState();
        (async function syncUserData() {
            const apiData = await loadUserDataFromApi(calYear, calMonth);
            if (apiData && typeof apiData === 'object') {
                const all = getAllDayData();
                all[USER_ID] = apiData;
                saveAllDayData(all);
            }
        })();
    }

    function getAllDayData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }

    function saveAllDayData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function getDayData() {
        const all = getAllDayData();
        const rid = viewingRoleId || USER_ID;
        if (!all[rid]) all[rid] = {};
        return all[rid];
    }

    function saveDayData(data) {
        const all = getAllDayData();
        const rid = viewingRoleId || USER_ID;
        all[rid] = data;
        saveAllDayData(all);
        if (rid === USER_ID) {
            saveUserDataToApi(data);
        }
        // 角色视图为只读，不写回角色 API
    }

    function getApiConfig() {
        try {
            const raw = localStorage.getItem('shezhi_data');
            const cfg = raw ? JSON.parse(raw) : {};
            return cfg.api || {};
        } catch {
            return {};
        }
    }

    async function apiFetch(path, options = {}) {
        const api = getApiConfig();
        const baseUrl = (api.baseUrl || '').replace(/\/+$/, '');
        const apiKey = api.apiKey || '';
        const url = `${baseUrl}${path}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}),
            ...options.headers
        };
        const resp = await fetch(url, { ...options, headers });
        if (!resp.ok) throw new Error(`API error ${resp.status}`);
        return resp.json().catch(() => ({}));
    }

    async function loadRolesFromApi() {
        try {
            return await apiFetch('/calendar/roles');
        } catch {
            return null;
        }
    }

    async function loadRoleDataFromApi(roleId, year, month) {
        try {
            return await apiFetch(`/calendar/data?roleId=${encodeURIComponent(roleId)}&year=${year}&month=${month}`);
        } catch {
            return null;
        }
    }

    async function saveRoleDataToApi(roleId, data) {
        try {
            await apiFetch(`/calendar/data?roleId=${encodeURIComponent(roleId)}`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch {
            // ignore api save error
        }
    }

    async function loadUserDataFromApi(year, month) {
        try {
            return await apiFetch(`/calendar/data?roleId=${encodeURIComponent(USER_ID)}&year=${year}&month=${month}`);
        } catch {
            return null;
        }
    }

    async function saveUserDataToApi(data) {
        try {
            await apiFetch(`/calendar/data?roleId=${encodeURIComponent(USER_ID)}`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch {
            // ignore api save error
        }
    }

    function dateKey(y, m, d) {
        return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }

    function getToday() {
        const now = new Date();
        return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
    }

    function getDayEntry(y, m, d) {
        const data = getDayData();
        const key = dateKey(y, m, d);
        if (!data[key]) data[key] = { events: [], mood: '', period: false };
        return { data, key, entry: data[key] };
    }

    function renderHeader() {
        return `
            <div class="rili-header">
                <button class="rili-header-btn rili-prev">&lt;</button>
                <span class="rili-title">${calYear}年${MONTH_NAMES[calMonth]}</span>
                <button class="rili-today-btn">今天</button>
                <button class="rili-header-btn rili-next">&gt;</button>
            </div>
        `;
    }

    function renderWeekRow() {
        return `
            <div class="rili-week-row">
                ${WEEK_LABELS.map(d => `<div class="rili-week-cell">${d}</div>`).join('')}
            </div>
        `;
    }

    function renderMonthGrid() {
        const today = getToday();
        const firstDay = new Date(calYear, calMonth, 1).getDay();
        const totalDays = new Date(calYear, calMonth + 1, 0).getDate();
        const dayData = getDayData();

        let cells = [];
        for (let i = 0; i < firstDay; i++) {
            cells.push(`<div class="rili-day-cell empty"></div>`);
        }
        for (let d = 1; d <= totalDays; d++) {
            const isToday = calYear === today.year && calMonth === today.month && d === today.day;
            const isSelected = selectedDate && selectedDate.year === calYear && selectedDate.month === calMonth && selectedDate.day === d;
            const key = dateKey(calYear, calMonth, d);
            const entry = dayData[key];
            const hasEvent = entry && entry.events && entry.events.length > 0;
            const hasMood = entry && entry.mood;
            const hasPeriod = entry && entry.period;
            let cls = 'rili-day-cell';
            if (isToday) cls += ' today';
            if (isSelected) cls += ' selected';
            if (hasPeriod) cls += ' period';
            const indicator = (hasEvent || hasMood || hasPeriod) ? '<span class="rili-dot"></span>' : '';
            cells.push(`<div class="${cls}" data-day="${d}"><span class="rili-day-num">${d}</span>${indicator}</div>`);
        }
        const totalCells = firstDay + totalDays;
        const remaining = (totalCells % 7 === 0) ? 0 : 7 - (totalCells % 7);
        for (let i = 0; i < remaining; i++) {
            cells.push(`<div class="rili-day-cell empty"></div>`);
        }

        return `<div class="rili-month-grid">${cells.join('')}</div>`;
    }

    function renderDetailPanel() {
        if (!selectedDate) return `<div class="rili-detail-panel"><div class="rili-detail-empty">点击日期查看心情与日程</div></div>`;
        const { key, entry } = getDayEntry(selectedDate.year, selectedDate.month, selectedDate.day);
        const moodObj = MOOD_OPTIONS.find(m => m.value === entry.mood);
        const moodLabel = moodObj ? moodObj.label : '未设置心情';
        const moodColor = moodObj ? moodObj.color : '#e5e5ea';
        const viewingRole = getViewingRole();
        const isRole = isRoleView();
        const isMale = viewingRole && viewingRole.gender === 'male';

        return `
            <div class="rili-detail-panel">
                <div class="rili-detail-header ${isRole ? 'role-view' : ''}">
                    ${isRole ? `<button class="rili-back-btn" id="backToUserBtn">&lt; 返回我的</button>` : ''}
                    <span class="rili-detail-date">${selectedDate.month + 1}月${selectedDate.day}日</span>
                    <span class="rili-detail-weekday">星期${WEEK_LABELS[new Date(selectedDate.year, selectedDate.month, selectedDate.day).getDay()]}</span>
                </div>
                <div class="rili-mood-section">
                    <div class="rili-section-title">${isRole ? escapeHtml(viewingRole?.name || '角色') : '我的'}心情</div>
                    <div class="rili-mood-current" style="background:${moodColor}18;color:${moodColor};border:1px solid ${moodColor}35;">
                        <span class="rili-mood-face mood-face-${moodObj ? moodObj.face : 'none'}"></span>
                        <span class="rili-mood-label">${moodLabel}</span>
                    </div>
                    ${!isRole ? `
                    <div class="rili-mood-options">
                        ${MOOD_OPTIONS.map(m => `
                            <button class="rili-mood-btn ${entry.mood === m.value ? 'active' : ''}" data-mood="${m.value}" style="--mood-color:${m.color}" title="${m.label}">
                                <span class="rili-mood-face mood-face-${m.face}"></span>
                            </button>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
                ${!isMale && !isRole ? `
                <div class="rili-period-section">
                    <div class="rili-section-title">生理期</div>
                    <label class="rili-period-toggle-wrap">
                        <input type="checkbox" class="rili-period-checkbox" ${entry.period ? 'checked' : ''} />
                        <span class="rili-period-switch"></span>
                        <span class="rili-period-text">${entry.period ? '已记录' : '未记录'}</span>
                    </label>
                </div>
                ` : ''}
                <div class="rili-events-section">
                    <div class="rili-section-title">${isRole ? escapeHtml(viewingRole?.name || '角色') : '我的'}日程</div>
                    ${(!entry.events || entry.events.length === 0) ? '<div class="rili-events-empty">暂无日程</div>' : `
                        <div class="rili-events-list">
                            ${entry.events.map((ev, idx) => `
                                <div class="rili-event-item">
                                    <div class="rili-event-dot" style="background:${ev.color || '#007aff'}"></div>
                                    <div class="rili-event-text">${escapeHtml(ev.text)}</div>
                                    ${!isRole ? `<button class="rili-event-del" data-idx="${idx}">删除</button>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    `}
                    ${!isRole ? `
                    <div class="rili-add-row">
                        <input class="rili-event-input" placeholder="添加日程..." />
                        <button class="rili-event-add-btn">添加</button>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    function renderMainPage() {
        const meta = ensureDefaultRole();
        const roles = meta.roles || [];
        const avatarBar = `
            <div class="rili-avatar-bar">
                ${roles.map(r => {
                    const isActive = r.id === viewingRoleId;
                    const style = r.avatar ? `background-image:url('${r.avatar}');background-color:#e2e2ea;` : 'background-color:#e2e2ea;';
                    const name = escapeHtml(r.name || (r.id === USER_ID ? '我' : '角色'));
                    return `
                        <div class="rili-avatar-chip ${isActive ? 'active' : ''}" data-role-id="${r.id}">
                            <div class="rili-avatar-chip-img" style="${style}"></div>
                            <span class="rili-avatar-chip-name">${name}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        return `
            <div class="rili-main">
                <div class="rili-calendar-card">
                    ${renderHeader()}
                    ${renderWeekRow()}
                    ${renderMonthGrid()}
                </div>
                ${avatarBar}
                ${renderDetailPanel()}
            </div>
        `;
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function bindEvents(content) {
        content.querySelector('.rili-prev').onclick = () => {
            calMonth--;
            if (calMonth < 0) { calMonth = 11; calYear--; }
            persistState();
            refreshView(content);
        };
        content.querySelector('.rili-next').onclick = () => {
            calMonth++;
            if (calMonth > 11) { calMonth = 0; calYear++; }
            persistState();
            refreshView(content);
        };
        content.querySelector('.rili-today-btn').onclick = () => {
            const today = getToday();
            calYear = today.year;
            calMonth = today.month;
            selectedDate = { year: today.year, month: today.month, day: today.day };
            persistState();
            refreshView(content);
        };
        content.querySelectorAll('.rili-day-cell[data-day]').forEach(cell => {
            cell.onclick = () => {
                const d = parseInt(cell.dataset.day, 10);
                selectedDate = { year: calYear, month: calMonth, day: d };
                persistState();
                refreshView(content);
            };
        });
        content.querySelectorAll('.rili-avatar-chip').forEach(chip => {
            chip.onclick = () => {
                const roleId = chip.dataset.roleId;
                if (!roleId) return;
                if (roleId === USER_ID) {
                    switchToUser();
                } else {
                    switchRole(roleId);
                }
                refreshView(content);
            };
        });
        const backBtn = content.querySelector('#backToUserBtn');
        if (backBtn) {
            backBtn.onclick = () => {
                switchToUser();
                refreshView(content);
            };
        }
        if (!isRoleView()) {
            content.querySelectorAll('.rili-mood-btn').forEach(btn => {
                btn.onclick = () => {
                    if (!selectedDate) return;
                    const { entry, data } = getDayEntry(selectedDate.year, selectedDate.month, selectedDate.day);
                    entry.mood = btn.dataset.mood;
                    saveDayData(data);
                    refreshView(content);
                };
            });
            content.querySelectorAll('.rili-period-checkbox').forEach(cb => {
                cb.onchange = () => {
                    if (!selectedDate) return;
                    const { entry, data } = getDayEntry(selectedDate.year, selectedDate.month, selectedDate.day);
                    entry.period = cb.checked;
                    saveDayData(data);
                    refreshView(content);
                };
            });
            const input = content.querySelector('.rili-event-input');
            const addBtn = content.querySelector('.rili-event-add-btn');
            if (input && addBtn) {
                const addEvent = () => {
                    const text = input.value.trim();
                    if (!text || !selectedDate) return;
                    const { entry, data } = getDayEntry(selectedDate.year, selectedDate.month, selectedDate.day);
                    entry.events = entry.events || [];
                    entry.events.push({ text, color: '#007aff', time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) });
                    saveDayData(data);
                    input.value = '';
                    refreshView(content);
                };
                addBtn.onclick = addEvent;
                input.onkeydown = (e) => {
                    if (e.key === 'Enter') { e.preventDefault(); addEvent(); }
                };
            }
            content.querySelectorAll('.rili-event-del').forEach(btn => {
                btn.onclick = () => {
                    if (!selectedDate) return;
                    const { entry, data } = getDayEntry(selectedDate.year, selectedDate.month, selectedDate.day);
                    const idx = parseInt(btn.dataset.idx, 10);
                    if (entry.events) {
                        entry.events.splice(idx, 1);
                        if (entry.events.length === 0) delete entry.events;
                        saveDayData(data);
                        refreshView(content);
                    }
                };
            });
        }
    }

    function refreshView(content) {
        if (!content) return;
        content.innerHTML = renderMainPage();
        bindEvents(content);
    }

    window.APP_LIST[APP_KEY] = {
        title: "日历",
        html: renderMainPage(),
        onMount: function () {
            const modal = document.querySelector('.app-modal');
            const content = modal.querySelector('.app-modal-content');
            const title = modal.querySelector('.app-modal-title');
            const closeBtn = modal.querySelector('.app-close-btn');
            if (title) title.textContent = "日历";
            ensureDefaultRole();
            if (!viewingRoleId) viewingRoleId = currentRoleId || USER_ID;
            (async function initRoles() {
                const apiRoles = await loadRolesFromApi();
                if (apiRoles && Array.isArray(apiRoles) && apiRoles.length > 0) {
                    const meta = getRoleMeta();
                    meta.roles = apiRoles.map(r => ({
                        id: String(r.id || r._id || r.name || Math.random().toString(36).slice(2)),
                        name: r.name,
                        avatar: r.avatar || '',
                        gender: r.gender || 'female'
                    }));
                    if (!meta.currentRoleId) meta.currentRoleId = meta.roles[0].id;
                    saveRoleMeta(meta);
                    if (!currentRoleId) currentRoleId = meta.currentRoleId;
                    if (!viewingRoleId) viewingRoleId = meta.currentRoleId;
                }
                persistState();
                refreshView(content);
            })();
            if (closeBtn) {
                closeBtn.onclick = () => window.closeApp();
            }
        }
    };

});
