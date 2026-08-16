document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'desktop_data';

    window.saveData = function () {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(window.appData));
    };

    const localRaw = localStorage.getItem(STORAGE_KEY);
    const DEFAULT_APP_LIST = [
        { name: '聊天', icon: 'icons/chat.svg' },
        { name: 'Ta', icon: 'icons/ta.svg' },
        { name: '论坛', icon: 'icons/forum.svg' },
        { name: '日历', icon: 'icons/calendar.svg' },
        { name: '音乐', icon: 'icons/music.svg' },
        { name: '游戏', icon: 'icons/game.svg' },
        { name: '购物', icon: 'icons/shop.svg' },
        { name: 'if时空', icon: 'icons/time.svg' },
        { name: '设置', icon: 'icons/settings.svg' },
        { name: '美化', icon: 'icons/beautify.svg' },
        { name: '世界书', icon: 'icons/worldbook.svg' },
        { name: '情侣空间', icon: 'icons/couple.svg' }
    ];
    const DEFAULT_ICON_PATHS = DEFAULT_APP_LIST.map(item => item.icon);
    const DAY_ICON_PATHS = DEFAULT_APP_LIST.map(item => item.icon.replace('.svg', '-day.svg'));
    window.appData = localRaw ? JSON.parse(localRaw) : {
        avatarUrl: '',
        charAvatarUrl: '',
        userName: '',
        userNickname: '',
        charName: 'char名字',
        charNickname: '角色昵称',
        signature: '',
        chatUserName: '',
        chatUserNickname: '',
        chatUserSignature: '',
        todoList: [],
        photoCards: ['', '', ''],
        desktopWallpaper: '',
        dockWallpaper: '',
        lockWallpaper: '',
        lockEnable: false,
        lockPassword: '',
        appList: DEFAULT_APP_LIST.map(item => ({ ...item })),
        worldBooks: [],
        iconMode: 'night',
        gouwuUser: {
            avatar: '',
            nickname: '淘宝用户',
            level: 'VIP会员',
            points: 1280,
            orders: 156,
            coupons: 12,
            balance: 2580.50
        }
    };
    if (localRaw && window.appData.nickname !== undefined && !window.appData.userName) {
        window.appData.userName = window.appData.nickname;
    }
    if (localRaw && window.appData.charNickname === undefined && window.appData.charName) {
        window.appData.charNickname = window.appData.charName;
    }
    if (!Array.isArray(window.appData.appList)) window.appData.appList = DEFAULT_APP_LIST.map(item => ({ ...item }));
    else window.appData.appList = DEFAULT_APP_LIST.map((defaultApp, idx) => ({
        ...defaultApp,
        ...(window.appData.appList[idx] || {})
    }));

    if (!window.appData.gouwuUser || typeof window.appData.gouwuUser !== 'object') {
        window.appData.gouwuUser = {
            avatar: '',
            nickname: '淘宝用户',
            level: 'VIP会员',
            points: 1280,
            orders: 156,
            coupons: 12,
            balance: 2580.50
        };
    }

    window.$ = {
        avatarEl: document.querySelector('.user-avatar'),
        charAvatarEl: document.querySelector('.char-avatar'),
        userNameEl: document.querySelector('.user-item .nickname-text'),
        charNameEl: document.querySelector('.char-item .nickname-text'),
        signatureEl: document.querySelector('.sign-text'),
        todoListEl: document.querySelector('.todo-list'),
        photoCardEls: Array.from(document.querySelectorAll('.photo-card')),
        fileInput: document.querySelector('#fileInput'),
        appModal: document.querySelector('.app-modal'),
        appModalContent: document.querySelector('.app-modal-content'),
        appModalClose: document.querySelector('.app-close-btn'),
        bgLayer: document.querySelector('.bg-layer'),
        statusBar: document.querySelector('.status-bar'),
        todoNewInput: document.querySelector('.todo-new-row'),
        imageSelectModal: document.querySelector('.image-select-modal'),
        imgUrlInput: document.querySelector('.img-url-input'),
        imgBtnUrl: document.querySelector('.img-btn-url'),
        imgBtnLocal: document.querySelector('.img-btn-local'),
        imgBtnCancel: document.querySelector('.img-btn-cancel'),
        imgFileInput: document.querySelector('#fileInput'),
        imageSelectTarget: null
    };

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, m => {
            const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
            return map[m];
        });
    }

    function buildBgUrl(src, t) {
        if (!src) return "";
        if (src.startsWith("data:")) return `url(${src})`;
        return `url(${src}?t=${t})`;
    }

    window.closeImageSelectModal = function () {
        if (!window.$.imageSelectModal) return;
        window.$.imageSelectModal.classList.remove("show");
        window.$.imageSelectTarget = null;
        window.$.imgUrlInput.value = "";
        window.$.imgFileInput.value = "";
    };

    window.openImageSelectModal = function (target) {
        window.closeImageSelectModal();
        if (target) window.$.imageSelectTarget = target;
        window.$.imageSelectModal.classList.add("show");
    };

        window.renderAll = function () {
        const t = Date.now();
        if (window.appData.avatarUrl && window.$.avatarEl) window.$.avatarEl.style.backgroundImage = buildBgUrl(window.appData.avatarUrl, t);
        else if (window.$.avatarEl) window.$.avatarEl.style.backgroundImage = "";
        if (window.appData.charAvatarUrl && window.$.charAvatarEl) window.$.charAvatarEl.style.backgroundImage = buildBgUrl(window.appData.charAvatarUrl, t);
        else if (window.$.charAvatarEl) window.$.charAvatarEl.style.backgroundImage = "";

        if (window.$.userNameEl) window.$.userNameEl.innerText = window.appData.userName || '用户昵称';
        if (window.$.charNameEl) window.$.charNameEl.innerText = window.appData.charNickname || '角色昵称';
        if (window.$.signatureEl) window.$.signatureEl.innerText = window.appData.signature || '共同个性签名';

        if (window.$.todoListEl) {
            window.$.todoListEl.innerHTML = "";
            window.appData.todoList.forEach((txt, idx) => {
                const div = document.createElement('div');
                div.className = "todo-item";
                div.dataset.todoIndex = idx;
                div.innerHTML = `<span>·</span> <span class="todo-item-text" data-idx="${idx}" contenteditable="true" spellcheck="false">${escapeHtml(txt)}</span>`;
                window.$.todoListEl.appendChild(div);
            });
        }

        window.$.photoCardEls.forEach((el, i) => {
            if (window.appData.photoCards[i]) el.style.backgroundImage = buildBgUrl(window.appData.photoCards[i]);
            else el.style.backgroundImage = "";
        });

        document.querySelectorAll('.bg-layer').forEach(layer => {
            if (window.appData.desktopWallpaper) layer.style.backgroundImage = buildBgUrl(window.appData.desktopWallpaper, t);
            else layer.style.backgroundImage = "";
        });

        const dockBar = document.querySelector('.dock-bar');
        if (dockBar) {
            if (window.appData.dockWallpaper) {
                dockBar.style.backgroundImage = buildBgUrl(window.appData.dockWallpaper, t);
                dockBar.style.backgroundSize = 'cover';
                dockBar.style.backgroundPosition = 'center';
                dockBar.style.backgroundRepeat = 'no-repeat';
                dockBar.style.backgroundColor = 'transparent';
            } else {
                dockBar.style.backgroundImage = 'none';
                dockBar.style.backgroundSize = '';
                dockBar.style.backgroundPosition = '';
                dockBar.style.backgroundRepeat = '';
                dockBar.style.backgroundColor = 'rgba(255,255,255,0.88)';
            }
        }

        const allAppItems = Array.from(document.querySelectorAll(".app-item,.dock-item"));
        if (!Array.isArray(window.appData.appList)) window.appData.appList = [];
        window.appData.appList.forEach((app, idx) => {
            const dom = allAppItems[idx];
            if (!dom) return;
            const nameDom = dom.querySelector(".app-name,.dock-name");
            const iconDom = dom.querySelector(".app-icon,.dock-icon");
            if (nameDom) nameDom.innerText = app.name;
            if (iconDom) {
                let icon = app.icon || "";
                if (window.appData.iconMode === 'day' && icon) {
                    const dayIcon = icon.replace('.svg', '-day.svg');
                    if (DAY_ICON_PATHS.includes(dayIcon)) {
                        icon = dayIcon;
                    }
                }
                if (icon) {
                    iconDom.style.backgroundImage = buildBgUrl(icon, t);
                    iconDom.style.backgroundSize = "cover";
                    iconDom.style.backgroundPosition = "center";
                    iconDom.style.backgroundColor = "transparent";
                } else {
                    iconDom.style.backgroundImage = "none";
                    iconDom.style.backgroundColor = "#e2e2ea";
                }
            }
        });

    bindTodoItemEvents();
    updatePwaIcon();
};

    function getIconMode() {
        return window.appData.iconMode || 'night';
    }

    window.toggleIconMode = function () {
        window.appData.iconMode = getIconMode() === 'night' ? 'day' : 'night';
        window.saveData();
        window.renderAll();
        updatePwaIcon();
    };

    function updatePwaIcon() {
        const mode = getIconMode();
        const href = mode === 'day' ? 'icon-day.svg' : 'icon.svg';
        document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach(link => {
            link.href = href;
        });
    }

    window.bindUserTextSave = function () {
        if (window.$.userNameEl) {
            window.$.userNameEl.addEventListener('blur', function () {
                const text = this.innerText.trim();
                if (text) window.appData.userName = text;
                window.saveData();
            })
        }
        if (window.$.charNameEl) {
            window.$.charNameEl.addEventListener('blur', function () {
                const text = this.innerText.trim();
                if (text) window.appData.charNickname = text;
                window.saveData();
            })
        }
        if (window.$.signatureEl) {
            window.$.signatureEl.addEventListener('blur', function () {
                const text = this.innerText.trim();
                if (text) window.appData.signature = text;
                window.saveData();
            })
        }
    }

    function bindTodoItemEvents() {
        document.querySelectorAll('.todo-item-text').forEach(el => {
            el.onkeydown = function (e) {
                const idx = Number(this.dataset.idx);
                if (e.key === "Enter") {
                    e.preventDefault();
                    const val = this.innerText.trim();
                    if (val === "") {
                        window.appData.todoList.splice(idx, 1);
                        window.saveData();
                        window.renderAll();
                        return;
                    }
                    window.appData.todoList[idx] = val;
                    window.saveData();
                    this.blur();
                }
            };
            el.onblur = function () {
                const idx = Number(this.dataset.idx);
                const val = this.innerText.trim();
                if (val === "") {
                    window.appData.todoList.splice(idx, 1);
                    window.saveData();
                    window.renderAll();
                    return;
                }
                window.appData.todoList[idx] = val;
            };
        });
    }

    if (window.$.todoNewInput) {
        window.$.todoNewInput.onkeydown = function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                const val = this.innerText.trim();
                if (val) {
                    window.appData.todoList.push(val);
                    window.saveData();
                    window.renderAll();
                }
                this.innerText = "";
            }
        };
    }

    window.APP_LIST = {};
    window.openApp = function (appKey) {
        const app = window.APP_LIST[appKey];
        if (!app || !window.$.appModalContent) return;
        window.$.appModalContent.innerHTML = app.html;
        window.$.appModal.classList.add("show");
        if (typeof app.onMount === "function") app.onMount();
    };
    window.closeApp = function () {
        window.$.appModal?.classList.remove("show");
    };
    if (window.$.appModalClose) window.$.appModalClose.onclick = window.closeApp;
    if (window.$.appModal) {
        window.$.appModal.addEventListener("click", function (e) {
            if (e.target === window.$.appModal) window.closeApp();
        });
    }

    function openImageSelectModal(target) {
        closeImageSelectModal();
        if (target) window.$.imageSelectTarget = target;
        window.$.imageSelectModal.classList.add("show");
    }

    if (window.$.imgBtnUrl) {
        window.$.imgBtnUrl.onclick = () => {
            const url = window.$.imgUrlInput.value.trim();
            if (!url || !window.$.imageSelectTarget) return;
            const target = window.$.imageSelectTarget;
            if (target.type === "avatar") window.appData.avatarUrl = url;
            else if (target.type === "charAvatar") window.appData.charAvatarUrl = url;
            else if (target.type === "photo") window.appData.photoCards[target.index] = url;
            else if (target.type === "contactAvatar") {
                window.contactAvatarTemp = url;
                window.dispatchEvent(new CustomEvent('contactavatarselected', { detail: url }));
            }
            else if (target.type === "chatWallpaper") {
                if (window.appData?.chatCurrentContact) {
                    window.appData.chatCurrentContact.chatWallpaper = url;
                }
                window.appData.chatWallpaper = url;
                window.saveData();
                if (typeof window.applyChatWallpaper === 'function') window.applyChatWallpaper();
            }
            if (target.type !== "contactAvatar" && target.type !== "chatWallpaper") {
                window.saveData();
                window.renderAll();
            }
            closeImageSelectModal();
        };
    }
    if (window.$.imgBtnLocal && window.$.imgFileInput) {
        window.$.imgBtnLocal.onclick = () => {
            window.$.imgFileInput.value = '';
            window.$.imgFileInput.onchange = e => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                    const b64 = ev.target.result;
                    const target = window.$.imageSelectTarget;
                    if (target.type === "avatar") window.appData.avatarUrl = b64;
                    else if (target.type === "charAvatar") window.appData.charAvatarUrl = b64;
                    else if (target.type === "photo") window.appData.photoCards[target.index] = b64;
                    else if (target.type === "contactAvatar") {
                        window.contactAvatarTemp = b64;
                        window.dispatchEvent(new CustomEvent('contactavatarselected', { detail: b64 }));
                    }
                    else if (target.type === "chatWallpaper") {
                        if (window.appData?.chatCurrentContact) {
                            window.appData.chatCurrentContact.chatWallpaper = b64;
                        }
                        window.appData.chatWallpaper = b64;
                        window.saveData();
                        if (typeof window.applyChatWallpaper === 'function') window.applyChatWallpaper();
                    }
                    if (target.type !== "contactAvatar" && target.type !== "chatWallpaper") {
                        window.saveData();
                        window.renderAll();
                    }
                    closeImageSelectModal();
                };
                reader.readAsDataURL(file);
                e.target.value = "";
            };
            window.$.imgFileInput.click();
        };
    }
    if (window.$.imgBtnCancel) window.$.imgBtnCancel.onclick = closeImageSelectModal;
    if (window.$.imageSelectModal) {
        window.$.imageSelectModal.addEventListener("click", e => {
            if (e.target === window.$.imageSelectModal) closeImageSelectModal();
        });
    }

    function bindImageClick(el, target) {
        if (!el) return;
        let handled = false;
        const handler = (e) => {
            if (handled) return;
            handled = true;
            e.preventDefault();
            openImageSelectModal(target);
            setTimeout(() => { handled = false; }, 300);
        };
        el.addEventListener('click', handler);
        el.addEventListener('touchend', handler);
    }

    bindImageClick(window.$.avatarEl, { type: "avatar" });
    bindImageClick(window.$.charAvatarEl, { type: "charAvatar" });
    window.$.photoCardEls.forEach((card, idx) => {
        bindImageClick(card, { type: "photo", index: idx });
    });

    document.querySelectorAll('.app-item,.dock-item').forEach((item, idx) => {
        let pressTimer = null;
        item.addEventListener('click', () => {
            if (item.id === 'dockShezhi') {
                if (typeof window.openShezhiModal === 'function') {
                    window.openShezhiModal();
                }
                return;
            }
            if (idx === 0 && typeof window.openChatModal === 'function') {
                window.openChatModal();
                return;
            }
            window.openApp(idx.toString());
        });
        item.addEventListener("mousedown", (e) => {
            pressTimer = setTimeout(() => {
                e.preventDefault();
                openImageSelectModal({ type: "appIcon", index: idx });
            }, 600);
        });
        item.addEventListener("mouseup", () => clearTimeout(pressTimer));
        item.addEventListener("mouseleave", () => clearTimeout(pressTimer));
        item.addEventListener("touchstart", (e) => {
            pressTimer = setTimeout(() => {
                e.preventDefault();
                openImageSelectModal({ type: "appIcon", index: idx });
            }, 600);
        });
        item.addEventListener("touchend", () => clearTimeout(pressTimer));
        item.addEventListener("touchcancel", () => clearTimeout(pressTimer));
    });

    window.bindUserTextSave();
    window.renderAll();
    updatePwaIcon();
});

// ========== 日历逻辑（全部在DOM外，无重复函数）
const STORAGE_CAL_AVATAR = "calAvatarUrl";
let calYear = new Date().getFullYear();
let calMonth = new Date().getMonth();
const rightClickArea = document.querySelector('.date-calendar-right');
const dropPanel = document.querySelector('.calendar-detail-modal');
const calCard = document.querySelector('.date-calendar-card');
let titleEl = document.querySelector('.calendar-detail-title');
const dayWrap = document.querySelector('.detail-day-wrap');

function loadCalAvatar() {
    const saved = localStorage.getItem(STORAGE_CAL_AVATAR);
    const imgEl = document.querySelector('.cal-avatar-img');
    if (saved) imgEl.src = saved;
    else imgEl.src = "";
}

document.querySelector('.avatar-click').addEventListener('click', function () {
    const modal = document.querySelector('.image-select-modal');
    modal.classList.add('show');
    document.querySelector('.img-btn-url').onclick = function () {
        const inputVal = document.querySelector('.img-url-input').value.trim();
        if (!inputVal) return;
        document.querySelector('.cal-avatar-img').src = inputVal;
        localStorage.setItem(STORAGE_CAL_AVATAR, inputVal);
        document.querySelector('.img-url-input').value = '';
        modal.classList.remove('show');
    };
    document.querySelector('.img-btn-local').onclick = function () {
        document.getElementById('calAvatarFile').click();
    };
    document.querySelector('.img-btn-cancel').onclick = function () {
        document.querySelector('.img-url-input').value = '';
        modal.classList.remove('show');
    };
});
document.getElementById('calAvatarFile').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
        const dataUrl = ev.target.result;
        document.querySelector('.cal-avatar-img').src = dataUrl;
        localStorage.setItem(STORAGE_CAL_AVATAR, dataUrl);
        document.querySelector('.image-select-modal').classList.remove('show');
    };
    reader.readAsDataURL(file);
    this.value = '';
});

rightClickArea.addEventListener('click', function (e) {
    e.stopPropagation();
    dropPanel.classList.toggle('show');
    calCard.classList.toggle('expand-open');
    if (dropPanel.classList.contains('show')) {
        renderFullMonthCalendar(calYear, calMonth);
    }
});
document.addEventListener('click', function (e) {
    const card = document.querySelector('.date-calendar-card');
    if (!card.contains(e.target)) {
        dropPanel.classList.remove('show');
        calCard.classList.remove('expand-open');
    }
    saveUserTextOnClickOutside(e);
});

document.addEventListener('touchend', function (e) {
    saveUserTextOnClickOutside(e);
});

function saveUserTextOnClickOutside(e) {
    const target = e.target;
    if (!target) return;
    const userNameEl = document.querySelector('.user-item .nickname-text');
    const charNameEl = document.querySelector('.char-item .nickname-text');
    const signatureEl = document.querySelector('.sign-text');
    if (userNameEl && !userNameEl.contains(target)) {
        const text = userNameEl.innerText.trim();
        if (text) window.appData.userName = text;
    }
    if (charNameEl && !charNameEl.contains(target)) {
        const text = charNameEl.innerText.trim();
        if (text) window.appData.charNickname = text;
    }
    if (signatureEl && !signatureEl.contains(target)) {
        const text = signatureEl.innerText.trim();
        if (text) window.appData.signature = text;
    }
    window.saveData();
}

// 渲染日历：标题 yyyy/mm/dd 自动真实日期，滚动定位今日
function renderFullMonthCalendar(y, m) {
    const now = new Date();
    const realYear = now.getFullYear();
    const realMonth = String(now.getMonth() + 1).padStart(2, '0');
    const realDay = String(now.getDate()).padStart(2, '0');
    titleEl.innerText = `${realYear}/${realMonth}/${realDay}`;

    const first = new Date(y, m, 1);
    const last = new Date(y, m, 0);
    const firstDay = first.getDay();
    const totalDays = last.getDate();
    dayWrap.innerHTML = '';

    const prevMonthLast = new Date(y, m, 0).getDate();
    for (let i = 0; i < firstDay; i++) {
        const d = document.createElement('div');
        d.className = "detail-day-item other-month";
        d.innerText = prevMonthLast - firstDay + i + 1;
        dayWrap.appendChild(d);
    }

    let todayDom = null;
    const currY = now.getFullYear();
    const currM = now.getMonth();
    const currD = now.getDate();
    for (let i = 1; i <= totalDays; i++) {
        const d = document.createElement('div');
        d.className = "detail-day-item";
        if (y === currY && m === currM && i === currD) {
            d.classList.add('today');
            todayDom = d;
        }
        d.innerText = i;
        dayWrap.appendChild(d);
    }

    const totalRendered = firstDay + totalDays;
    const needAdd = 42 - totalRendered;
    for (let i = 1; i <= needAdd; i++) {
        const d = document.createElement('div');
        d.className = "detail-day-item other-month";
        d.innerText = i;
        dayWrap.appendChild(d);
    }

    if (todayDom) {
        const scrollBox = document.querySelector('.calendar-detail-content');
        scrollBox.scrollTop = todayDom.offsetTop - scrollBox.clientHeight / 1.5;
    }
}

// 翻页按钮
(function setupPageBtn() {
    const header = document.querySelector('.calendar-detail-header');
    header.innerHTML = `
        <button class="page-btn prev">&lt;</button>
        <span class="calendar-detail-title"></span>
        <button class="page-btn next">&gt;</button>
    `;
    titleEl = header.querySelector('.calendar-detail-title');
    header.querySelector('.prev').addEventListener('click', function (e) {
        e.stopPropagation();
        calMonth--;
        if (calMonth < 0) { calMonth = 11; calYear--; }
        renderFullMonthCalendar(calYear, calMonth);
    });
    header.querySelector('.next').addEventListener('click', function (e) {
        e.stopPropagation();
        calMonth++;
        if (calMonth > 11) { calMonth = 0; calYear++; }
        renderFullMonthCalendar(calYear, calMonth);
    });
})();

loadCalAvatar();