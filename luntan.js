document.addEventListener('DOMContentLoaded', () => {
    const appKey = "2";
    let closeBtn = null;
    let modalContent = null;
    let modalTitle = null;

    const STORAGE_KEY = 'luntan_posts';
    const STORAGE_USER = 'luntan_user';

    function getLuntanUser() {
        try {
            const raw = localStorage.getItem(STORAGE_USER);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function saveLuntanUser(user) {
        localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    }

    function getPosts() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function savePosts(posts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }

    function generateMockNPCPosts() {
        const npcNames = ['小明', '小红', '阿强', '小美', '老王', '小李', '张师傅', '刘同学'];
        const mockContents = [
            '今天天气真不错，出来散步啦！',
            '刚看完一部电影，强烈推荐给大家。',
            '这家店的东西真的很好吃，下次还来。',
            '分享一下今天的日常，充实又快乐。',
            '最近在学习新技能，感觉收获满满。',
            '周末计划去爬山，有没有一起的？',
            '工作之余也要记得放松呀。',
            '刚学会做一道新菜，卖相还不错。'
        ];
        const posts = [];
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const name = npcNames[Math.floor(Math.random() * npcNames.length)];
            posts.push({
                user: {
                    name: name,
                    nickname: name,
                    avatar: ""
                },
                content: mockContents[Math.floor(Math.random() * mockContents.length)],
                image: "",
                time: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
                replyCount: Math.floor(Math.random() * 20),
                retweetCount: Math.floor(Math.random() * 10),
                likeCount: Math.floor(Math.random() * 50),
                liked: false,
                retweeted: false
            });
        }
        return posts;
    }

    function refreshFeed() {
        const existing = getPosts();
        const npcPosts = generateMockNPCPosts();
        const merged = [...npcPosts, ...existing];
        savePosts(merged);
        renderPage();
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function formatTime(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = (now - date) / 1000;
        if (diff < 60) return "刚刚";
        if (diff < 3600) return Math.floor(diff / 60) + "分钟前";
        if (diff < 86400) return Math.floor(diff / 3600) + "小时前";
        if (diff < 604800) return Math.floor(diff / 86400) + "天前";
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        if (y === now.getFullYear()) return `${m}-${d}`;
        return `${y}-${m}-${d}`;
    }

    function getUserInfo() {
        const local = getLuntanUser();
        return {
            name: local?.userId || window.appData?.userName || "用户",
            nickname: local?.nickname || window.appData?.userNickname || window.appData?.userName || "用户",
            avatar: window.appData?.avatarUrl || "",
            followingCount: local?.followingCount || 0,
            followersCount: local?.followersCount || 0
        };
    }

    function renderPostItem(post, index) {
        const user = post.user || getUserInfo();
        const avatarStyle = user.avatar ? `background-image:url(${escapeHtml(user.avatar)});background-size:cover;background-position:center;` : `background:#e2e2ea;`;
        const likeActive = post.liked ? "color:#ff2d55;" : "color:#536471;";
        const likeIcon = post.liked ? "♥" : "♡";
        const retweetActive = post.retweeted ? "color:#00ba7c;" : "color:#536471;";
        return `
        <div class="x-post" data-index="${index}">
            <div class="x-post-avatar" style="${avatarStyle}"></div>
            <div class="x-post-body">
                <div class="x-post-header">
                    <span class="x-post-name">${escapeHtml(user.nickname || user.name)}</span>
                    <span class="x-post-username">@${escapeHtml(user.name)}</span>
                    <span class="x-post-dot">·</span>
                    <span class="x-post-time">${formatTime(post.time)}</span>
                </div>
                <div class="x-post-text">${escapeHtml(post.content)}</div>
                ${post.image ? `<div class="x-post-image" style="background-image:url(${escapeHtml(post.image)});background-size:cover;background-position:center;"></div>` : ""}
                <div class="x-post-actions">
                    <button class="x-post-action" data-action="reply" data-index="${index}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <span>${post.replyCount || 0}</span>
                    </button>
                    <button class="x-post-action" data-action="retweet" data-index="${index}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                        <span>${post.retweetCount || 0}</span>
                    </button>
                    <button class="x-post-action ${post.liked ? 'x-post-action-liked' : ''}" data-action="like" data-index="${index}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="${post.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06 1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <span>${post.likeCount || 0}</span>
                    </button>
                    <button class="x-post-action" data-action="share" data-index="${index}">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    </button>
                </div>
            </div>
        </div>
        `;
    }

    function renderFeed() {
        const posts = getPosts();
        if (posts.length === 0) {
            return `
            <div class="x-empty">
                <div class="x-empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div class="x-empty-text">还没有帖子，来说点什么吧</div>
            </div>
            `;
        }
        return posts.map((post, idx) => renderPostItem(post, idx)).join('');
    }

    function renderComposeBox() {
        const user = getUserInfo();
        const avatarStyle = user.avatar ? `background-image:url(${escapeHtml(user.avatar)});background-size:cover;background-position:center;` : `background:#e2e2ea;`;
        return `
        <div class="x-compose">
            <div class="x-compose-avatar" style="${avatarStyle}"></div>
            <div class="x-compose-area">
                <textarea class="x-compose-input" placeholder="有什么新鲜事？" rows="2"></textarea>
                <div class="x-compose-tools">
                    <button class="x-compose-tool" data-action="image">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d9bf0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    </button>
                    <button class="x-compose-btn">发布</button>
                </div>
            </div>
        </div>
        <div class="x-divider"></div>
        `;
    }

    function renderPage() {
        if (!modalContent) return;
        const user = getUserInfo();
        const avatarStyle = user.avatar ? `background-image:url(${escapeHtml(user.avatar)});background-size:cover;background-position:center;` : `background:#e2e2ea;`;
        modalContent.innerHTML = `
            <div class="x-app">
                <div class="x-content">
                    <div class="x-tab-page active" data-tab="home">
                        <div class="x-compose-section">
                            ${renderComposeBox()}
                        </div>
                        <div class="x-feed">
                            ${renderFeed()}
                        </div>
                    </div>
                    <div class="x-tab-page" data-tab="explore">
                        <div class="x-feed">
                            <div class="x-empty">
                                <div class="x-empty-text">探索功能开发中</div>
                            </div>
                        </div>
                    </div>
                    <div class="x-tab-page" data-tab="notifications">
                        <div class="x-feed">
                            <div class="x-empty">
                                <div class="x-empty-text">暂无新通知</div>
                            </div>
                        </div>
                    </div>
                    <div class="x-tab-page" data-tab="messages">
                        <div class="x-feed">
                            <div class="x-empty">
                                <div class="x-empty-text">暂无新消息</div>
                            </div>
                        </div>
                    </div>
                    <div class="x-tab-page" data-tab="me">
                        <div class="x-feed">
                            <div class="x-me-page">
                                <div class="x-me-header">
                                    <div class="x-me-avatar" style="${avatarStyle}"></div>
                                    <div class="x-me-name" data-edit="nickname">${escapeHtml(user.nickname || user.name)}</div>
                                    <div class="x-me-username" data-edit="userId">@${escapeHtml(user.name)}</div>
                                </div>
                                <div class="x-me-stats">
                                    <div class="x-me-stat"><span class="x-me-stat-num">${getPosts().filter(p => (p.user?.name || getUserInfo().name) === user.name).length}</span><span class="x-me-stat-label">帖子</span></div>
                                    <div class="x-me-stat"><span class="x-me-stat-num" data-edit="following">${user.followingCount || 0}</span><span class="x-me-stat-label">关注</span></div>
                                    <div class="x-me-stat"><span class="x-me-stat-num" data-edit="followers">${user.followersCount || 0}</span><span class="x-me-stat-label">粉丝</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="x-bottom-nav">
                <button class="x-bottom-nav-item active" data-tab="home">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </button>
                <button class="x-bottom-nav-item" data-tab="explore">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </button>
                <button class="x-bottom-nav-item" data-tab="notifications">
                    <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </button>
                <button class="x-bottom-nav-item" data-tab="messages">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </button>
                <button class="x-bottom-nav-item" data-tab="me">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </button>
            </div>
        `;
        bindEvents();
    }

    function bindEvents() {
        const composeInput = modalContent.querySelector('.x-compose-input');
        const composeBtn = modalContent.querySelector('.x-compose-btn');
        const composeToolImage = modalContent.querySelector('[data-action="image"]');

        if (composeBtn && composeInput) {
            composeBtn.onclick = () => {
                const text = composeInput.value.trim();
                if (!text) {
                    refreshFeed();
                    return;
                }
                const posts = getPosts();
                posts.unshift({
                    user: getUserInfo(),
                    content: text,
                    image: "",
                    time: new Date().toISOString(),
                    replyCount: 0,
                    retweetCount: 0,
                    likeCount: 0,
                    liked: false,
                    retweeted: false
                });
                savePosts(posts);
                composeInput.value = "";
                renderPage();
            };
        }

        if (composeToolImage) {
            composeToolImage.onclick = () => {
                // 装饰按钮，不打开图片选择
            };
        }

        const actionHandler = (e) => {
            if (!e.target || e.target.nodeType !== Node.ELEMENT_NODE) return;
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const index = Number(btn.dataset.index);
            if (isNaN(index)) return;

            const posts = getPosts();
            const post = posts[index];
            if (!post) return;

            if (action === "like") {
                post.liked = !post.liked;
                post.likeCount = (post.likeCount || 0) + (post.liked ? 1 : -1);
                if (post.likeCount < 0) post.likeCount = 0;
                savePosts(posts);
                renderPage();
            } else if (action === "retweet") {
                post.retweeted = !post.retweeted;
                post.retweetCount = (post.retweetCount || 0) + (post.retweeted ? 1 : -1);
                if (post.retweetCount < 0) post.retweetCount = 0;
                savePosts(posts);
                renderPage();
            } else if (action === "reply") {
                const replyText = prompt("回复：");
                if (replyText !== null && replyText.trim() !== "") {
                    post.replyCount = (post.replyCount || 0) + 1;
                    savePosts(posts);
                    renderPage();
                }
            } else if (action === "share") {
                const shareText = post.content;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(shareText).then(() => {
                        alert("已复制到剪贴板");
                    }).catch(() => {
                        alert("分享内容：" + shareText);
                    });
                } else {
                    alert("分享内容：" + shareText);
                }
            }
        };

        if (modalContent) {
            modalContent.addEventListener('click', actionHandler);
        }

        const meNickname = modalContent.querySelector('[data-edit="nickname"]');
        const meUserId = modalContent.querySelector('[data-edit="userId"]');
        const meFollowing = modalContent.querySelector('[data-edit="following"]');
        const meFollowers = modalContent.querySelector('[data-edit="followers"]');

        console.log('Forum bindEvents:', {
            meNickname: !!meNickname,
            meUserId: !!meUserId,
            meFollowing: !!meFollowing,
            meFollowers: !!meFollowers,
            modalContent: !!modalContent
        });

        function updateText(el, value) {
            if (!el) return;
            el.textContent = value;
        }

        if (meNickname) {
            meNickname.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Nickname clicked');
                const current = meNickname.textContent.trim();
                const newName = prompt("修改昵称", current);
                console.log('Nickname prompt result:', newName);
                if (newName !== null && newName.trim() !== "") {
                    updateText(meNickname, newName.trim());
                    const user = getLuntanUser() || {};
                    user.nickname = newName.trim();
                    saveLuntanUser(user);
                    console.log('Nickname saved to localStorage:', user);
                    alert('昵称已保存：' + newName.trim());
                }
            });
        }
        if (meUserId) {
            meUserId.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('UserId clicked');
                const current = meUserId.textContent.replace(/^@/, '');
                const newId = prompt("修改账号ID", current);
                console.log('UserId prompt result:', newId);
                if (newId !== null && newId.trim() !== "") {
                    updateText(meUserId, '@' + newId.trim());
                    const user = getLuntanUser() || {};
                    user.userId = newId.trim();
                    saveLuntanUser(user);
                    console.log('UserId saved to localStorage:', user);
                    alert('账号ID已保存：' + newId.trim());
                }
            });
        }
        if (meFollowing) {
            meFollowing.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Following clicked');
                const current = meFollowing.textContent.trim();
                const newCount = prompt("修改关注数", current);
                if (newCount !== null && newCount.trim() !== '') {
                    const count = parseInt(newCount.trim(), 10);
                    if (!isNaN(count) && count >= 0) {
                        updateText(meFollowing, String(count));
                        const user = getLuntanUser() || {};
                        user.followingCount = count;
                        saveLuntanUser(user);
                        console.log('Following saved:', count);
                        alert('关注数已保存：' + count);
                    }
                }
            });
        }
        if (meFollowers) {
            meFollowers.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Followers clicked');
                const current = meFollowers.textContent.trim();
                const newCount = prompt("修改粉丝数", current);
                if (newCount !== null && newCount.trim() !== '') {
                    const count = parseInt(newCount.trim(), 10);
                    if (!isNaN(count) && count >= 0) {
                        updateText(meFollowers, String(count));
                        const user = getLuntanUser() || {};
                        user.followersCount = count;
                        saveLuntanUser(user);
                        console.log('Followers saved:', count);
                        alert('粉丝数已保存：' + count);
                    }
                }
            });
        }

        modalContent.querySelectorAll('.x-bottom-nav-item').forEach(item => {
            item.addEventListener('click', function() {
                modalContent.querySelectorAll('.x-bottom-nav-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                const tab = this.dataset.tab;
                const titleMap = { home: '首页', explore: '探索', notifications: '通知', messages: '消息', me: '我' };
                if (modalTitle) modalTitle.textContent = titleMap[tab] || '首页';
                modalContent.querySelectorAll('.x-tab-page').forEach(page => {
                    page.classList.remove('active');
                    if (page.dataset.tab === tab) {
                        page.classList.add('active');
                    }
                });
            });
        });
    }

    window.APP_LIST[appKey] = {
        title: "论坛",
        html: "",
        onMount: function () {
            const els = getModalElements();
            if (!els) return;
            modalContent = els.content;
            closeBtn = els.closeBtn;
            modalTitle = els.title;

            if (modalTitle) {
                modalTitle.textContent = "首页";
            }
            modalContent.classList.add('x-fullscreen');
            renderPage();

            if (closeBtn) {
                closeBtn.onclick = function () {
                    if (modalContent) modalContent.classList.remove('x-fullscreen');
                    window.closeApp();
                };
            }
        }
    };

    function getModalElements() {
        const modal = document.querySelector('.app-modal');
        if (!modal) return null;
        return {
            modal: modal,
            content: modal.querySelector('.app-modal-content'),
            title: modal.querySelector('.app-modal-title'),
            closeBtn: modal.querySelector('.app-close-btn')
        };
    }

    if (window.$.appModal) {
        window.$.appModal.addEventListener("click", function (e) {
            if (e.target === window.$.appModal) {
                if (modalContent) modalContent.classList.remove('x-fullscreen');
                window.closeApp();
            }
        });
    }

    window.addEventListener('contactavatarselected', function (e) {
        const url = e.detail;
        if (window.$.imageSelectTarget && window.$.imageSelectTarget.type === "luntanPostImage") {
            const composeInput = document.querySelector('.x-compose-input');
            if (composeInput && composeInput.dataset.imageUrl !== undefined) {
                composeInput.dataset.imageUrl = url;
            }
            window.$.imageSelectTarget = null;
            window.closeImageSelectModal();
        }
    });
});
