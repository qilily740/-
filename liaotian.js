document.addEventListener('DOMContentLoaded', function () {
    const chatModal = document.querySelector('#chatModal');
    const chatBackBtn = document.querySelector('#chatBackBtn');
    const chatMenuBtn = document.querySelector('#chatMenuBtn');
    const chatTitle = document.querySelector('#chatTitle');
    const chatReplyBtn = document.querySelector('#chatReplyBtn');
    const chatSettingsBtn = document.querySelector('#chatSettingsBtn');
    const chatMessages = document.querySelector('#chatMessages');
    const chatInput = document.querySelector('#chatInput');
    const chatSendBtn = document.querySelector('#chatSendBtn');
    const chatPlusBtn = document.querySelector('#chatPlusBtn');
    const chatPlusPanel = document.querySelector('#chatPlusPanel');
    const chatEmojiBtn = document.querySelector('#chatEmojiBtn');
    const chatStickerPanel = document.querySelector('#chatStickerPanel');
    const chatStickerBackdrop = document.querySelector('#chatStickerBackdrop');
    const chatSettingsPanel = document.querySelector('#chatSettingsPanel');
    const chatChatFooter = document.querySelector('#chatChatFooter');
    const stickerTabs = document.querySelector('#stickerTabs');
    const stickerGrid = document.querySelector('#stickerGrid');
    const stickerImportBtn = document.querySelector('#stickerImportBtn');
    const stickerImportModal = document.querySelector('#stickerImportModal');
    const stickerImportText = document.querySelector('#stickerImportText');
    const stickerGroupName = document.querySelector('#stickerGroupName');
    const stickerImportConfirm = document.querySelector('#stickerImportConfirm');
    const stickerImportCancel = document.querySelector('#stickerImportCancel');
    const stickerManageBtn = document.querySelector('#stickerManageBtn');
    const stickerManageCancelBtn = document.querySelector('#stickerManageCancelBtn');
    const stickerManageDeleteBtn = document.querySelector('#stickerManageDeleteBtn');
    const chatChatPage = document.querySelector('#chatChatPage');
    const chatFriendsPage = document.querySelector('#chatFriendsPage');
    const chatMomentsPage = document.querySelector('#chatMomentsPage');
    const chatMePage = document.querySelector('#chatMePage');
    const chatMeContent = document.querySelector('#chatMeContent');
    const chatContactEditPage = document.querySelector('#chatContactEditPage');
    const chatChatSettingsPage = document.querySelector('#chatChatSettingsPage');
    const chatChatSettingsContent = document.querySelector('#chatChatSettingsContent');
    const chatChatProfilePage = document.querySelector('#chatChatProfilePage');
    const chatChatProfileContent = document.querySelector('#chatChatProfileContent');
    const contactRealNameInput = document.querySelector('#contactRealNameInput');
    const contactNicknameInput = document.querySelector('#contactNicknameInput');
    const contactGenderSelect = document.querySelector('#contactGenderSelect');
    const contactBirthdayInput = document.querySelector('#contactBirthdayInput');
    const contactBioInput = document.querySelector('#contactBioInput');
    const contactAvatarEdit = document.querySelector('#contactAvatarEdit');
    const contactAvatarPreview = document.querySelector('#contactAvatarPreview');
    const contactAvatarFileInput = document.querySelector('#contactAvatarFileInput');
    const contactAvatarLocalBtn = document.querySelector('#contactAvatarLocalBtn');
    const contactAvatarUrlBtn = document.querySelector('#contactAvatarUrlBtn');
    const worldBookBindingSection = document.querySelector('#worldBookBindingSection');
    const worldBookBindingList = document.querySelector('#worldBookBindingList');
    const chatMessagesPage = document.querySelector('#chatMessagesPage');
    const chatMessagesList = document.querySelector('#chatMessagesList');
    const chatContactsList = document.querySelector('#chatContactsList');
    const chatMomentsContent = document.querySelector('#chatMomentsContent');
    const chatTabBar = document.querySelector('#chatModal .chat-tab-bar');
    const chatMemoryLibraryPage = document.querySelector('#chatMemoryLibraryPage');
    const chatMemoryLibraryContent = document.querySelector('#chatMemoryLibraryContent');

    let chatHistory = [];
    let isGenerating = false;
    let multiReplyEnabled = false;
    let multiReplyMin = 3;
    let multiReplyMax = 7;
    let memorySummaryEnabled = false;
    let memorySummaryInterval = 20;
    let memoryLibraryEditMode = false;
    let currentStickerGroup = '默认';
    let stickerGroups = { '默认': [] };
    let openPanel = null;
    let stickerManageMode = false;
    let editingContactId = null;
    let contactAvatarData = null;

    function getAvatarUrl(type) {
        if (type === 'user') return window.appData?.avatarUrl || '';
        if (type === 'char') return window.appData?.charAvatarUrl || '';
        return '';
    }

    function getActivePrompt() {
        const cfg = window.appData?.shezhiConfig?.prompts;
        if (!cfg || !cfg.sets || cfg.sets.length === 0) {
            return "你是一个可爱的AI助手，请用温柔、可爱的语气回复用户。";
        }
        const active = cfg.sets.find(s => s.id === cfg.activeId);
        return active ? active.content : cfg.sets[0].content;
    }

    function switchPage(page) {
        const pageMap = {
            messages: chatMessagesPage,
            chat: chatChatPage,
            contacts: chatContactsPage,
            moments: chatMomentsPage,
            me: chatMePage,
            contactEdit: chatContactEditPage,
            chatSettings: chatChatSettingsPage,
            chatProfile: chatChatProfilePage,
            memoryLibrary: chatMemoryLibraryPage
        };
        
        // 隐藏所有页面
        Object.values(pageMap).forEach(el => {
            if (el) el.classList.remove('active');
        });
        
        // 显示目标页面
        if (pageMap[page]) pageMap[page].classList.add('active');
        
        // 更新底部标签栏
        if (chatTabBar) {
            chatTabBar.querySelectorAll('.chat-tab-item').forEach(item => {
                item.classList.toggle('active', item.dataset.tab === page);
            });
        }
        
        // 显示/隐藏底部标签栏和聊天输入框
        const mainPages = ['messages', 'contacts', 'moments', 'me'];
        if (chatTabBar) {
            chatTabBar.style.display = mainPages.includes(page) ? 'flex' : 'none';
        }
        if (chatChatFooter) {
            chatChatFooter.style.display = page === 'chat' ? 'block' : 'none';
        }
        
        if (page === 'chat') {
            window.applyChatWallpaper?.();
            if (window.appData?.chatCurrentContact) {
                chatHistory = loadChatHistory(window.appData.chatCurrentContact.id);
                loadContactSettings(window.appData.chatCurrentContact);
                renderMessages();
                if (isGenerating && chatTitle) {
                    chatTitle.textContent = '正在回复中...';
                }
            }
        }
        
        // 显示/隐藏返回按钮和菜单按钮
        if (chatBackBtn) {
            chatBackBtn.style.visibility = (mainPages.includes(page) || page === 'contactEdit' || page === 'chat' || page === 'chatSettings' || page === 'chatProfile' || page === 'memoryLibrary') ? 'visible' : 'hidden';
            if (page !== 'chatProfile' && page !== 'memoryLibrary') {
                chatBackBtn.innerHTML = '‹';
                chatBackBtn.style.fontSize = '';
                chatBackBtn.style.padding = '';
                chatBackBtn.style.display = '';
                chatBackBtn.style.alignItems = '';
                chatBackBtn.style.justifyContent = '';
            }
        }
        if (chatMenuBtn) {
            chatMenuBtn.style.display = page === 'contactEdit' ? 'flex' : 'none';
        }
        if (chatSettingsBtn) {
            chatSettingsBtn.style.display = (page === 'chat' || page === 'chatProfile' || page === 'memoryLibrary') ? 'flex' : 'none';
            if (page === 'chat') {
                chatSettingsBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
                chatSettingsBtn.onclick = function(e) {
                    e.stopPropagation();
                    if (window.appData?.chatCurrentContact) {
                        switchPage('chatSettings');
                    } else {
                        showToast('请先选择一个角色');
                    }
                };
            }
        }
        
        // 更新标题
        const titles = {
            messages: '微信',
            chat: (window.appData?.chatCurrentContact?.nickname || window.appData?.chatCurrentContact?.realName || window.appData?.chatCurrentContact?.name) || '聊天',
            contacts: '联系人',
            moments: '朋友圈',
            me: '我',
            contactEdit: '添加联系人',
            chatSettings: '聊天设置',
            chatProfile: '角色查询',
            memoryLibrary: '记忆库'
        };
        if (chatTitle) chatTitle.textContent = titles[page] || '微信';
        
        // 渲染页面内容
        if (page === 'messages') renderMessageList();
        else if (page === 'contacts') renderContacts();
        else if (page === 'moments') renderMoments();
        else if (page === 'me') renderMePage();
        else if (page === 'chatSettings') renderChatSettingsPage();
        else if (page === 'chatProfile') renderChatProfilePage();
        else if (page === 'memoryLibrary') renderMemoryLibraryPage();
    }
    
    window.applyChatWallpaper = function() {
        const wallpaperEl = document.querySelector('#chatWallpaper');
        const messagesEl = document.querySelector('#chatMessages');
        
        if (!wallpaperEl || !messagesEl) {
            console.warn('applyChatWallpaper: wallpaper or messages element not found');
            return;
        }
        
        const wallpaper = (window.appData?.chatWallpaper || '').trim();
        
        console.log('applyChatWallpaper:', {
            wallpaperLength: wallpaper.length,
            wallpaperPreview: wallpaper ? wallpaper.substring(0, 80) + '...' : 'empty'
        });
        
        if (wallpaper) {
            wallpaperEl.style.backgroundImage = 'url(' + wallpaper + ')';
            wallpaperEl.classList.add('active');
            messagesEl.classList.add('has-wallpaper');
            console.log('Wallpaper applied to #chatWallpaper');
        } else {
            wallpaperEl.style.backgroundImage = '';
            wallpaperEl.classList.remove('active');
            messagesEl.classList.remove('has-wallpaper');
            console.log('Wallpaper cleared');
        }
    };
    
    setTimeout(function() {
        if (window.appData?.chatWallpaper) {
            window.applyChatWallpaper();
        }
    }, 300);
    
    function applyChatWallpaperToContact(contactId) {
        const contact = (window.appData?.chatContacts || []).find(c => c.id === contactId);
        if (contact?.chatWallpaper) {
            window.appData.chatWallpaper = contact.chatWallpaper;
        } else {
            window.appData.chatWallpaper = '';
        }
        window.applyChatWallpaper?.();
    }
    
    function renderMessageList() {
        if (!chatMessagesList) return;
        const contacts = window.appData?.chatContacts || [];
        if (contacts.length === 0) {
            chatMessagesList.innerHTML = '<div style="text-align:center;color:#8e8e93;padding:40px 0;">暂无消息</div>';
            return;
        }
        chatMessagesList.innerHTML = contacts.map(c => `
            <div class="chat-msg-row" data-id="${escapeHtml(c.id)}">
                <div class="chat-msg-row-avatar" style="background-image:url(${escapeHtml(c.avatar || '')})"></div>
                <div class="chat-msg-row-info">
                    <div class="chat-msg-row-name">${escapeHtml(c.nickname || c.realName || c.name || '未知')}</div>
                    <div class="chat-msg-row-preview">${escapeHtml(c.lastMsg || '')}</div>
                </div>
                <div class="chat-msg-row-meta">
                    <div class="chat-msg-row-time">${escapeHtml(c.lastTime || '')}</div>
                    ${c.unread > 0 ? `<span class="chat-msg-row-badge">${c.unread}</span>` : ''}
                </div>
            </div>
        `).join('');
        chatMessagesList.querySelectorAll('.chat-msg-row').forEach(row => {
            row.onclick = function() {
                const id = this.dataset.id;
                const contact = (window.appData?.chatContacts || []).find(c => c.id === id);
                if (!contact) return;
                window.appData.chatCurrentContact = contact;
                if (contact.unread) contact.unread = 0;
                window.saveData?.();
                chatHistory = loadChatHistory(contact.id);
                loadContactSettings(contact);
                applyChatWallpaperToContact(contact.id);
                switchPage('chat');
            };
        });
    }
    
    function renderContacts() {
        if (!chatContactsList) return;
        const contacts = window.appData?.chatContacts || [];
        let html = '<div class="chat-contact-add" id="chatAddContactBtn"><div class="chat-contact-add-icon">+</div><span>添加联系人</span></div>';
        html += contacts.map(c => `
            <div class="chat-contact-item" data-id="${escapeHtml(c.id)}">
                <div class="chat-contact-avatar" style="background-image:url(${escapeHtml(c.avatar || '')})"></div>
                <div class="chat-contact-name">${escapeHtml(c.nickname || c.realName || c.name || '未知')}</div>
            </div>
        `).join('');
        chatContactsList.innerHTML = html;
        
        const addBtn = document.querySelector('#chatAddContactBtn');
        if (addBtn) {
            addBtn.onclick = function() {
                editingContactId = null;
                contactAvatarData = null;
                if (contactRealNameInput) contactRealNameInput.value = '';
                if (contactNicknameInput) contactNicknameInput.value = '';
                if (contactGenderSelect) contactGenderSelect.value = '';
                if (contactBirthdayInput) contactBirthdayInput.value = '';
                if (contactBioInput) contactBioInput.value = '';
                if (contactAvatarPreview) contactAvatarPreview.style.backgroundImage = '';
                if (chatMenuBtn) chatMenuBtn.style.display = 'flex';
                renderWorldBookBindingList([]);
                switchPage('contactEdit');
            };
        }
        
        chatContactsList.querySelectorAll('.chat-contact-item').forEach(item => {
            item.onclick = function() {
                const id = this.dataset.id;
                const contact = (window.appData?.chatContacts || []).find(c => c.id === id);
                if (!contact) return;
                window.appData.chatCurrentContact = contact;
                if (contact.unread) contact.unread = 0;
                window.saveData?.();
                chatHistory = loadChatHistory(contact.id);
                loadContactSettings(contact);
                applyChatWallpaperToContact(contact.id);
                switchPage('chat');
            };
        });
    }
    
    function renderMoments() {
        if (!chatMomentsContent) return;
        const moments = window.appData?.chatMoments || [];
        if (moments.length === 0) {
            chatMomentsContent.innerHTML = '<div style="text-align:center;color:#8e8e93;padding:40px 0;">暂无朋友圈动态</div>';
            return;
        }
        chatMomentsContent.innerHTML = moments.map(m => `
            <div class="chat-moment-item">
                <div class="chat-moment-header">
                    <div class="chat-moment-avatar" style="background-image:url(${escapeHtml(m.avatar || '')})"></div>
                    <div class="chat-moment-name">${escapeHtml(m.name)}</div>
                </div>
                <div class="chat-moment-text">${escapeHtml(m.text)}</div>
                <div class="chat-moment-time">${escapeHtml(m.time)} · ${m.likes}赞</div>
            </div>
        `).join('');
    }
    
    function renderMePage() {
        if (!chatMeContent) return;
        const data = window.appData || {};
        chatMeContent.innerHTML = `
            <div style="background:#fff;padding:40px 16px;text-align:center;border-bottom:0.5px solid #e5e5ea;">
                <div id="meAvatar" style="width:80px;height:80px;border-radius:50%;background:#e8e8ed;margin:0 auto 16px;background-image:url(${escapeHtml(data.avatarUrl || '')});background-size:cover;background-position:center;cursor:pointer;"></div>
                <div id="meRealName" contenteditable="true" spellcheck="false" style="font-size:20px;font-weight:600;color:#1d1d1f;margin-bottom:6px;outline:none;min-width:1em;">${escapeHtml(data.chatUserName || '真实姓名')}</div>
                <div id="meNickname" contenteditable="true" spellcheck="false" style="font-size:14px;color:#8e8e93;margin-bottom:6px;outline:none;min-width:1em;">${escapeHtml(data.chatUserNickname || '网名')}</div>
                <div id="meSignature" contenteditable="true" spellcheck="false" style="font-size:14px;color:#8e8e93;outline:none;min-width:1em;">${escapeHtml(data.chatUserSignature || '个性签名')}</div>
            </div>
            <div style="margin-top:12px;background:#fff;border-radius:12px;overflow:hidden;">
                <div class="ios-cell">
                    <span class="ios-cell-label">服务</span>
                    <span class="ios-cell-arrow">›</span>
                </div>
            </div>
            <div style="margin-top:12px;background:#fff;border-radius:12px;overflow:hidden;">
                <div class="ios-cell">
                    <span class="ios-cell-label">收藏</span>
                    <span class="ios-cell-arrow">›</span>
                </div>
                <div class="ios-cell">
                    <span class="ios-cell-label">朋友圈</span>
                    <span class="ios-cell-arrow">›</span>
                </div>
                <div class="ios-cell">
                    <span class="ios-cell-label">卡包</span>
                    <span class="ios-cell-arrow">›</span>
                </div>
                <div class="ios-cell">
                    <span class="ios-cell-label">表情</span>
                    <span class="ios-cell-arrow">›</span>
                </div>
            </div>
            <div style="margin-top:12px;background:#fff;border-radius:12px;overflow:hidden;">
                <div class="ios-cell">
                    <span class="ios-cell-label">设置</span>
                    <span class="ios-cell-arrow">›</span>
                </div>
            </div>
        `;
        
        const avatarEl = document.querySelector('#meAvatar');
        if (avatarEl) {
            avatarEl.onclick = function() {
                if (typeof window.openImageSelectModal === 'function') {
                    window.openImageSelectModal({ type: 'avatar' });
                    const checkInterval = setInterval(() => {
                        const modal = document.querySelector('.image-select-modal');
                        if (modal && !modal.classList.contains('show')) {
                            clearInterval(checkInterval);
                            renderMePage();
                        }
                    }, 200);
                }
            };
        }
        
        const realNameEl = document.querySelector('#meRealName');
        if (realNameEl) {
            realNameEl.onblur = function() {
                const text = this.innerText.trim();
                window.appData.chatUserName = text;
                window.saveData?.();
            };
            realNameEl.onkeydown = function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.blur();
                }
            };
        }
        
        const nicknameEl = document.querySelector('#meNickname');
        if (nicknameEl) {
            nicknameEl.onblur = function() {
                const text = this.innerText.trim();
                window.appData.chatUserNickname = text;
                window.saveData?.();
            };
            nicknameEl.onkeydown = function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.blur();
                }
            };
        }
        
        const signatureEl = document.querySelector('#meSignature');
        if (signatureEl) {
            signatureEl.onblur = function() {
                const text = this.innerText.trim();
                window.appData.chatUserSignature = text;
                window.saveData?.();
            };
        }
    }

    function renderChatSettingsPage() {
        if (!chatChatSettingsContent) return;
        const contact = window.appData?.chatCurrentContact || {};
        
        const contactSettings = contact.multiReplySettings || {};
        multiReplyEnabled = contactSettings.enabled || false;
        multiReplyMin = contactSettings.min || 3;
        multiReplyMax = contactSettings.max || 7;
        memorySummaryEnabled = contact.memorySummaryEnabled || false;
        memorySummaryInterval = contact.memorySummaryInterval || 20;
        
        chatChatSettingsContent.innerHTML = `
            <div style="background:#fff;border-bottom:0.5px solid #e5e5ea;">
                <div class="ios-cell" id="chatSettingViewProfile">
                    <span class="ios-cell-label">角色查询</span>
                    <span class="ios-cell-arrow">›</span>
                </div>
            </div>
            <div style="margin-top:12px;background:#fff;border-radius:12px;overflow:hidden;">
                <div class="ios-cell" id="chatSettingAutoMessage">
                    <span class="ios-cell-label">角色主动发消息</span>
                    <span class="ios-cell-arrow">›</span>
                </div>
            </div>
            <div style="margin-top:12px;background:#fff;border-radius:12px;overflow:hidden;">
                <div class="ios-cell" id="chatSettingMultiReply">
                    <span class="ios-cell-label">角色连发消息</span>
                    <label class="chat-switch">
                        <input type="checkbox" id="chatSettingMultiReplyToggle" ${multiReplyEnabled ? 'checked' : ''}>
                        <span class="chat-switch-slider"></span>
                    </label>
                </div>
            </div>
            <div id="chatSettingMultiReplyRange" style="margin-top:8px;background:#fff;border-radius:12px;overflow:hidden;${multiReplyEnabled ? '' : 'display:none;'}">
                <div class="ios-cell">
                    <span class="ios-cell-label">最少条数</span>
                    <input type="number" id="chatSettingMultiReplyMin" value="${multiReplyMin}" min="1" max="20" style="width:60px;text-align:right;border:1px solid #e5e5ea;border-radius:8px;padding:4px 8px;font-size:14px;">
                </div>
                <div class="ios-cell">
                    <span class="ios-cell-label">最多条数</span>
                    <input type="number" id="chatSettingMultiReplyMax" value="${multiReplyMax}" min="1" max="20" style="width:60px;text-align:right;border:1px solid #e5e5ea;border-radius:8px;padding:4px 8px;font-size:14px;">
                </div>
            </div>
            <div style="margin-top:12px;background:#fff;border-radius:12px;overflow:hidden;">
                <div class="ios-cell" id="chatSettingMemorySummary">
                    <span class="ios-cell-label">记忆总结</span>
                    <label class="chat-switch">
                        <input type="checkbox" id="chatSettingMemorySummaryToggle" ${memorySummaryEnabled ? 'checked' : ''}>
                        <span class="chat-switch-slider"></span>
                    </label>
                </div>
            </div>
            <div id="chatSettingMemorySummaryRange" style="margin-top:8px;background:#fff;border-radius:12px;overflow:hidden;${memorySummaryEnabled ? '' : 'display:none;'}">
                <div class="ios-cell">
                    <span class="ios-cell-label">总结间隔（轮）</span>
                    <input type="number" id="chatSettingMemorySummaryInterval" value="${memorySummaryInterval}" min="5" max="100" style="width:60px;text-align:right;border:1px solid #e5e5ea;border-radius:8px;padding:4px 8px;font-size:14px;">
                </div>
            </div>
            <div style="margin-top:12px;background:#fff;border-radius:12px;overflow:hidden;">
                <div class="ios-cell" id="chatSettingMemoryLibrary">
                    <span class="ios-cell-label">记忆库</span>
                    <span class="ios-cell-arrow">›</span>
                </div>
            </div>
            <div style="margin-top:12px;background:#fff;border-radius:12px;overflow:hidden;">
                <div class="ios-cell" id="chatSettingWallpaper">
                    <span class="ios-cell-label">聊天壁纸设置</span>
                    <span class="ios-cell-arrow">›</span>
                </div>
            </div>
            <div style="margin-top:24px;background:#fff;border-radius:12px;overflow:hidden;">
                <div class="ios-cell" id="chatSettingBlock" style="color:#ff3b30;">
                    <span class="ios-cell-label">拉黑角色</span>
                </div>
                <div class="ios-cell" id="chatSettingDelete" style="color:#ff3b30;">
                    <span class="ios-cell-label">删除角色</span>
                </div>
            </div>
        `;
        
        const multiReplyToggle = document.querySelector('#chatSettingMultiReplyToggle');
        const multiReplyRange = document.querySelector('#chatSettingMultiReplyRange');
        if (multiReplyToggle && multiReplyRange) {
            multiReplyToggle.onchange = function() {
                multiReplyEnabled = this.checked;
                multiReplyRange.style.display = multiReplyEnabled ? 'block' : 'none';
                saveMultiReplySettings();
            };
        }
        
        const multiReplyMinInput = document.querySelector('#chatSettingMultiReplyMin');
        const multiReplyMaxInput = document.querySelector('#chatSettingMultiReplyMax');
        if (multiReplyMinInput) {
            multiReplyMinInput.onchange = function() {
                multiReplyMin = Math.max(1, parseInt(this.value) || 1);
                this.value = multiReplyMin;
                saveMultiReplySettings();
            };
        }
        if (multiReplyMaxInput) {
            multiReplyMaxInput.onchange = function() {
                multiReplyMax = Math.max(multiReplyMin, parseInt(this.value) || multiReplyMin);
                this.value = multiReplyMax;
                saveMultiReplySettings();
            };
        }
        
        const memorySummaryToggle = document.querySelector('#chatSettingMemorySummaryToggle');
        const memorySummaryRange = document.querySelector('#chatSettingMemorySummaryRange');
        if (memorySummaryToggle && memorySummaryRange) {
            memorySummaryToggle.onchange = function() {
                const contact = window.appData?.chatCurrentContact;
                if (contact) {
                    contact.memorySummaryEnabled = this.checked;
                    memorySummaryRange.style.display = this.checked ? 'block' : 'none';
                    window.saveData?.();
                }
            };
        }
        
        const memorySummaryIntervalInput = document.querySelector('#chatSettingMemorySummaryInterval');
        if (memorySummaryIntervalInput) {
            memorySummaryIntervalInput.onchange = function() {
                memorySummaryInterval = Math.max(5, parseInt(this.value) || 20);
                this.value = memorySummaryInterval;
                const contact = window.appData?.chatCurrentContact;
                if (contact) {
                    contact.memorySummaryInterval = memorySummaryInterval;
                    window.saveData?.();
                }
            };
        }
        
        document.querySelector('#chatSettingViewProfile')?.addEventListener('click', () => {
            if (window.appData?.chatCurrentContact) {
                chatProfileEditMode = false;
                switchPage('chatProfile');
            }
        });
        document.querySelector('#chatSettingAutoMessage')?.addEventListener('click', () => showToast('功能开发中'));
        document.querySelector('#chatSettingWallpaper')?.addEventListener('click', () => {
            if (typeof window.openImageSelectModal === 'function') {
                window.openImageSelectModal({ type: 'chatWallpaper' });
            }
        });
        document.querySelector('#chatSettingMemoryLibrary')?.addEventListener('click', () => {
            memoryLibraryEditMode = false;
            switchPage('memoryLibrary');
        });
        document.querySelector('#chatSettingBlock')?.addEventListener('click', () => showToast('功能开发中'));
        document.querySelector('#chatSettingDelete')?.addEventListener('click', () => {
            if (confirm('确定要删除这个角色吗？')) {
                if (window.appData?.chatContacts) {
                    window.appData.chatContacts = window.appData.chatContacts.filter(c => c.id !== contact.id);
                    window.saveData?.();
                    switchPage('contacts');
                    showToast('角色已删除');
                }
            }
        });
    }

    let chatProfileEditMode = false;
    let chatProfileOriginal = {};

    function renderChatProfilePage() {
        if (!chatChatProfileContent) return;
        const contact = window.appData?.chatCurrentContact || {};
        
        if (!chatProfileEditMode) {
            renderChatProfileView(contact);
        } else {
            renderChatProfileEdit(contact);
        }
    }

    function renderChatProfileView(contact) {
        if (!chatChatProfileContent) return;
        if (chatBackBtn) {
            chatBackBtn.innerHTML = '‹';
            chatBackBtn.style.fontSize = '';
            chatBackBtn.style.padding = '';
            chatBackBtn.style.display = '';
            chatBackBtn.style.alignItems = '';
            chatBackBtn.style.justifyContent = '';
        }
        chatChatProfileContent.innerHTML = `
            <div style="background:#fff;padding:40px 16px;text-align:center;border-bottom:0.5px solid #e5e5ea;">
                <div style="width:80px;height:80px;border-radius:50%;background:#e8e8ed;margin:0 auto 16px;background-image:url(${escapeHtml(contact.avatar || '')});background-size:cover;background-position:center;"></div>
                <div style="font-size:20px;font-weight:600;color:#1d1d1f;margin-bottom:6px;">${escapeHtml(contact.nickname || contact.realName || contact.name || '未知')}</div>
                <div style="font-size:14px;color:#8e8e93;">${escapeHtml(contact.gender || '性别未设置')} · ${escapeHtml(contact.birthday || '生日未设置')}</div>
            </div>
            <div style="margin-top:12px;background:#fff;border-radius:12px;overflow:hidden;">
                <div class="ios-cell">
                    <span class="ios-cell-label">真实姓名</span>
                    <span class="ios-cell-value">${escapeHtml(contact.realName || '未设置')}</span>
                </div>
                <div class="ios-cell">
                    <span class="ios-cell-label">网名</span>
                    <span class="ios-cell-value">${escapeHtml(contact.nickname || '未设置')}</span>
                </div>
                <div class="ios-cell">
                    <span class="ios-cell-label">性别</span>
                    <span class="ios-cell-value">${escapeHtml(contact.gender || '未设置')}</span>
                </div>
                <div class="ios-cell">
                    <span class="ios-cell-label">生日</span>
                    <span class="ios-cell-value">${escapeHtml(contact.birthday || '未设置')}</span>
                </div>
                <div class="ios-cell" style="align-items:flex-start;">
                    <span class="ios-cell-label" style="margin-top:4px;">世界书</span>
                    <span class="ios-cell-value" style="text-align:right;flex:1;margin-left:12px;white-space:pre-wrap;">${getContactWorldBookText(contact)}</span>
                </div>
            </div>
            <div style="margin-top:12px;background:#fff;border-radius:12px;overflow:hidden;">
                <div class="ios-cell" style="align-items:flex-start;">
                    <span class="contact-form-label" style="margin-top:4px;">人设概括</span>
                    <span class="ios-cell-value" style="text-align:right;flex:1;margin-left:12px;white-space:pre-wrap;">${escapeHtml(contact.bio || '未设置')}</span>
                </div>
            </div>
        `;
        
        if (chatSettingsBtn) {
            chatSettingsBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
            chatSettingsBtn.onclick = function(e) {
                e.stopPropagation();
                chatProfileEditMode = true;
                chatProfileOriginal = { ...contact };
                renderChatProfilePage();
            };
        }
    }

    function renderChatProfileEdit(contact) {
        if (!chatChatProfileContent) return;
        if (chatBackBtn) {
            chatBackBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            chatBackBtn.style.fontSize = '22px';
            chatBackBtn.style.padding = '4px';
            chatBackBtn.style.display = 'flex';
            chatBackBtn.style.alignItems = 'center';
            chatBackBtn.style.justifyContent = 'center';
        }
        chatChatProfileContent.innerHTML = `
            <div style="background:#fff;padding:40px 16px;text-align:center;border-bottom:0.5px solid #e5e5ea;">
                <div id="profileAvatarEdit" style="width:80px;height:80px;border-radius:50%;background:#e8e8ed;margin:0 auto 16px;background-image:url(${escapeHtml(contact.avatar || '')});background-size:cover;background-position:center;cursor:pointer;"></div>
                <input class="contact-form-input" id="profileRealNameInput" value="${escapeHtml(contact.realName || '')}" placeholder="真实姓名" style="text-align:center;font-size:20px;font-weight:600;color:#1d1d1f;margin-bottom:6px;">
                <input class="contact-form-input" id="profileNicknameInput" value="${escapeHtml(contact.nickname || '')}" placeholder="网名" style="text-align:center;font-size:14px;color:#8e8e93;margin-bottom:6px;">
            </div>
            <div style="margin-top:12px;background:#fff;border-radius:12px;overflow:hidden;">
                <div class="contact-form-item">
                    <label class="contact-form-label">性别</label>
                    <select class="contact-form-select" id="profileGenderSelect">
                        <option value="">请选择</option>
                        <option value="男" ${contact.gender === '男' ? 'selected' : ''}>男</option>
                        <option value="女" ${contact.gender === '女' ? 'selected' : ''}>女</option>
                        <option value="保密" ${contact.gender === '保密' ? 'selected' : ''}>保密</option>
                    </select>
                </div>
                <div class="contact-form-item">
                    <label class="contact-form-label">生日</label>
                    <input class="contact-form-input" id="profileBirthdayInput" value="${escapeHtml(contact.birthday || '')}" placeholder="例如 2000-01-01">
                </div>
                <div class="contact-form-item" style="align-items:flex-start;">
                    <label class="contact-form-label" style="margin-top:4px;">世界书</label>
                    <div style="flex:1;margin-left:12px;">
                        ${getBindableWorldBooks().map(book => {
                            const checked = (contact.worldBookBindings || []).includes(book.id) ? 'checked' : '';
                            return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:0.5px solid #e5e5ea;">
                                <input type="checkbox" class="world-book-binding-checkbox" data-wb-id="${book.id}" ${checked} style="accent-color:#007aff;width:18px;height:18px;">
                                <span style="font-size:15px;color:#1d1d1f;flex:1;">${escapeHtml(book.name)}</span>
                            </div>`;
                        }).join('') || '<div style="font-size:14px;color:#8e8e93;padding:8px 0;">暂无局部世界书</div>'}
                    </div>
                </div>
            </div>
            <div style="margin-top:12px;background:#fff;border-radius:12px;overflow:hidden;">
                <div class="contact-form-item">
                    <label class="contact-form-label">人设概括</label>
                    <textarea class="contact-form-textarea" id="profileBioInput" placeholder="请输入人设概括">${escapeHtml(contact.bio || '')}</textarea>
                </div>
            </div>
        `;
        
        if (chatSettingsBtn) {
            chatSettingsBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
            chatSettingsBtn.onclick = function(e) {
                e.stopPropagation();
                saveChatProfile();
            };
        }
        
        const avatarEdit = document.querySelector('#profileAvatarEdit');
        if (avatarEdit) {
            avatarEdit.onclick = function() {
                if (typeof window.openImageSelectModal === 'function') {
                    window.openImageSelectModal({ type: 'contactAvatar' });
                    const handler = function(e) {
                        contactAvatarData = e.detail;
                        const avatarEditEl = document.querySelector('#profileAvatarEdit');
                        if (avatarEditEl) avatarEditEl.style.backgroundImage = 'url(' + contactAvatarData + ')';
                        window.removeEventListener('contactavatarselected', handler);
                    };
                    window.addEventListener('contactavatarselected', handler);
                }
            };
        }
    }

    function getContactWorldBookText(contact) {
        if (!contact) return '未设置';
        const bindings = contact.worldBookBindings || [];
        if (bindings.length === 0) return '未设置';
        
        const allBooks = window.appData?.worldBooks || [];
        const boundBooks = bindings.map(id => allBooks.find(b => b.id === id)).filter(Boolean);
        
        if (boundBooks.length === 0) return '未设置';
        
        const globalBooks = boundBooks.filter(b => b.type === 'global');
        const localBooks = boundBooks.filter(b => b.type === 'local');
        const forumBooks = boundBooks.filter(b => b.type === 'forum');
        
        const parts = [];
        if (globalBooks.length > 0) parts.push('全局:' + globalBooks.map(b => b.name).join('、'));
        if (localBooks.length > 0) parts.push('局部:' + localBooks.map(b => b.name).join('、'));
        if (forumBooks.length > 0) parts.push('论坛:' + forumBooks.map(b => b.name).join('、'));
        
        return parts.join(' | ');
    }

    function saveChatProfile() {
        const contact = window.appData?.chatCurrentContact;
        if (!contact) return;
        
        const realName = document.querySelector('#profileRealNameInput')?.value.trim() || '';
        const nickname = document.querySelector('#profileNicknameInput')?.value.trim() || '';
        const gender = document.querySelector('#profileGenderSelect')?.value || '';
        const birthday = document.querySelector('#profileBirthdayInput')?.value.trim() || '';
        const bio = document.querySelector('#profileBioInput')?.value.trim() || '';
        
        const worldBookBindings = [];
        const checkboxes = chatChatProfileContent.querySelectorAll('.world-book-binding-checkbox:checked');
        checkboxes.forEach(cb => {
            worldBookBindings.push(cb.dataset.wbId);
        });
        
        contact.realName = realName;
        contact.nickname = nickname;
        contact.gender = gender;
        contact.birthday = birthday;
        contact.bio = bio;
        contact.worldBookBindings = worldBookBindings;
        if (contactAvatarData) contact.avatar = contactAvatarData;
        
        contact.name = nickname || realName || contact.name;
        
        window.saveData?.();
        contactAvatarData = null;
        chatProfileEditMode = false;
        chatProfileOriginal = {};
        renderChatProfilePage();
        showToast('角色信息已保存');
    }

    function renderMemoryLibraryPage() {
        if (!chatMemoryLibraryContent) return;
        const contact = window.appData?.chatCurrentContact || {};
        
        if (!memoryLibraryEditMode) {
            renderMemoryLibraryView(contact);
        } else {
            renderMemoryLibraryEdit(contact);
        }
    }

    function renderMemoryLibraryView(contact) {
        if (!chatMemoryLibraryContent) return;
        if (chatBackBtn) {
            chatBackBtn.innerHTML = '‹';
            chatBackBtn.style.fontSize = '';
            chatBackBtn.style.padding = '';
            chatBackBtn.style.display = '';
            chatBackBtn.style.alignItems = '';
            chatBackBtn.style.justifyContent = '';
        }
        if (chatSettingsBtn) {
            chatSettingsBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
            chatSettingsBtn.onclick = function(e) {
                e.stopPropagation();
                memoryLibraryEditMode = true;
                renderMemoryLibraryPage();
            };
        }
        
        const summaries = contact.memorySummaries || [];
        let html = '<div style="background:#fff;border-bottom:0.5px solid #e5e5ea;padding:16px;text-align:center;">';
        html += '<div style="font-size:20px;font-weight:600;color:#1d1d1f;">记忆库</div>';
        html += '<div style="font-size:14px;color:#8e8e93;margin-top:4px;">共 ' + summaries.length + ' 条记忆</div>';
        html += '</div>';
        
        if (summaries.length === 0) {
            html += '<div style="background:#fff;padding:40px 16px;text-align:center;color:#8e8e93;">暂无记忆总结</div>';
        } else {
            summaries.forEach((summary, index) => {
                html += '<div style="margin-top:12px;background:#fff;border-radius:12px;overflow:hidden;">';
                html += '<div class="ios-cell" style="align-items:flex-start;">';
                html += '<div style="flex:1;">';
                html += '<div style="font-size:14px;color:#8e8e93;margin-bottom:6px;">' + escapeHtml(summary.time) + ' · ' + summary.messageCount + ' 条消息</div>';
                html += '<div style="font-size:15px;color:#1d1d1f;line-height:1.5;white-space:pre-wrap;">' + escapeHtml(summary.content) + '</div>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
            });
        }
        
        chatMemoryLibraryContent.innerHTML = html;
    }

    function renderMemoryLibraryEdit(contact) {
        if (!chatMemoryLibraryContent) return;
        if (chatBackBtn) {
            chatBackBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
            chatBackBtn.style.fontSize = '22px';
            chatBackBtn.style.padding = '4px';
            chatBackBtn.style.display = 'flex';
            chatBackBtn.style.alignItems = 'center';
            chatBackBtn.style.justifyContent = 'center';
        }
        if (chatSettingsBtn) {
            chatSettingsBtn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
            chatSettingsBtn.onclick = function(e) {
                e.stopPropagation();
                saveMemoryLibraryEdit();
            };
        }
        
        const summaries = contact.memorySummaries || [];
        let html = '<div style="background:#fff;border-bottom:0.5px solid #e5e5ea;padding:16px;text-align:center;">';
        html += '<div style="font-size:20px;font-weight:600;color:#1d1d1f;">编辑记忆库</div>';
        html += '<div style="font-size:14px;color:#8e8e93;margin-top:4px;">点击记忆可编辑内容</div>';
        html += '</div>';
        
        if (summaries.length === 0) {
            html += '<div style="background:#fff;padding:40px 16px;text-align:center;color:#8e8e93;">暂无记忆总结</div>';
        } else {
            summaries.forEach((summary, index) => {
                html += '<div style="margin-top:12px;background:#fff;border-radius:12px;overflow:hidden;">';
                html += '<div class="ios-cell memory-summary-item" data-index="' + index + '" style="align-items:flex-start;cursor:pointer;">';
                html += '<div style="flex:1;">';
                html += '<div style="font-size:14px;color:#8e8e93;margin-bottom:6px;">' + escapeHtml(summary.time) + ' · ' + summary.messageCount + ' 条消息</div>';
                html += '<div class="memory-summary-content" data-index="' + index + '" style="font-size:15px;color:#1d1d1f;line-height:1.5;white-space:pre-wrap;">' + escapeHtml(summary.content) + '</div>';
                html += '</div>';
                html += '<button class="memory-delete-btn" data-index="' + index + '" style="background:#ff3b30;color:#fff;border:none;border-radius:8px;padding:6px 12px;font-size:13px;cursor:pointer;margin-left:8px;flex-shrink:0;">删除</button>';
                html += '</div>';
                html += '</div>';
            });
        }
        
        chatMemoryLibraryContent.innerHTML = html;
        
        chatMemoryLibraryContent.querySelectorAll('.memory-summary-item').forEach(item => {
            item.onclick = function(e) {
                if (e.target.classList.contains('memory-delete-btn')) return;
                const index = parseInt(this.dataset.index);
                const contentEl = this.querySelector('.memory-summary-content');
                if (contentEl && !contentEl.querySelector('textarea')) {
                    const currentText = contentEl.innerText;
                    const textarea = document.createElement('textarea');
                    textarea.className = 'memory-edit-textarea';
                    textarea.value = currentText;
                    textarea.rows = 6;
                    textarea.style.cssText = 'width:100%;padding:8px;border:1px solid #e5e5ea;border-radius:8px;font-size:15px;line-height:1.5;resize:vertical;font-family:inherit;';
                    contentEl.innerHTML = '';
                    contentEl.appendChild(textarea);
                    textarea.focus();
                }
            };
        });
        
        chatMemoryLibraryContent.querySelectorAll('.memory-delete-btn').forEach(btn => {
            btn.onclick = function(e) {
                e.stopPropagation();
                const index = parseInt(this.dataset.index);
                if (confirm('确定要删除这条记忆总结吗？')) {
                    contact.memorySummaries.splice(index, 1);
                    window.saveData?.();
                    renderMemoryLibraryEdit(contact);
                    showToast('已删除');
                }
            };
        });
    }

    function saveMemoryLibraryEdit() {
        const contact = window.appData?.chatCurrentContact;
        if (!contact) return;
        
        const textareas = chatMemoryLibraryContent.querySelectorAll('.memory-edit-textarea');
        textareas.forEach(textarea => {
            const contentEl = textarea.parentElement;
            const index = parseInt(contentEl.dataset.index);
            if (contact.memorySummaries[index]) {
                contact.memorySummaries[index].content = textarea.value;
            }
        });
        
        window.saveData?.();
        memoryLibraryEditMode = false;
        renderMemoryLibraryPage();
        showToast('记忆已保存');
    }

    function updateTitle() {
        if (chatTitle && window.appData) {
            chatTitle.textContent = window.appData.charName || "角色昵称";
        }
    }

    function addMessage(role, text, type) {
        const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
        chatHistory.push({ role, text, time, type: type || 'text' });
        saveChatHistory();
        renderMessages();
        
        const contact = window.appData?.chatCurrentContact;
        if (contact?.memorySummaryEnabled && role === 'char') {
            const userMessages = chatHistory.filter(m => m.role === 'user').length;
            if (userMessages > 0 && userMessages % memorySummaryInterval === 0) {
                triggerMemorySummary();
            }
        }
    }

    function saveChatHistory() {
        const contact = window.appData?.chatCurrentContact;
        if (!contact) return;
        if (!window.appData.chatMessages) window.appData.chatMessages = {};
        window.appData.chatMessages[contact.id] = [...chatHistory];
        window.saveData?.();
    }

    function loadChatHistory(contactId) {
        if (!window.appData?.chatMessages) return [];
        return window.appData.chatMessages[contactId] || [];
    }

    function saveMultiReplySettings() {
        const contact = window.appData?.chatCurrentContact;
        if (!contact) return;
        contact.multiReplySettings = {
            enabled: multiReplyEnabled,
            min: multiReplyMin,
            max: multiReplyMax
        };
        window.saveData?.();
    }

    function loadContactSettings(contact) {
        if (!contact) return;
        const settings = contact.multiReplySettings || {};
        multiReplyEnabled = settings.enabled || false;
        multiReplyMin = settings.min || 3;
        multiReplyMax = settings.max || 7;
    }

    function saveContactSettings() {
        const contact = window.appData?.chatCurrentContact;
        if (!contact) return;
        if (!contact.multiReplySettings) contact.multiReplySettings = {};
        window.saveData?.();
    }

    function getBindableWorldBooks() {
        const allBooks = window.appData?.worldBooks || [];
        return allBooks.filter(b => b.type === 'local' || b.type === 'forum');
    }

    function renderWorldBookBindingList(selectedIds) {
        if (!worldBookBindingList) return;
        const bindableBooks = getBindableWorldBooks();
        if (bindableBooks.length === 0) {
            worldBookBindingList.innerHTML = '<div style="font-size:14px;color:#8e8e93;text-align:center;padding:8px 0;">暂无局部/论坛世界书</div>';
            return;
        }
        worldBookBindingList.innerHTML = bindableBooks.map(book => {
            const checked = (selectedIds || []).includes(book.id) ? 'checked' : '';
            return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:0.5px solid #e5e5ea;">
                <input type="checkbox" class="world-book-binding-checkbox" data-wb-id="${book.id}" ${checked} style="accent-color:#007aff;width:18px;height:18px;">
                <span style="font-size:15px;color:#1d1d1f;flex:1;">${escapeHtml(book.name)}</span>
            </div>`;
        }).join('');
    }

    async function triggerMemorySummary() {
        const contact = window.appData?.chatCurrentContact;
        if (!contact) return;
        
        const allMessages = chatHistory.filter(m => m.text !== '...');
        const recentMessages = allMessages.slice(-20);
        
        if (recentMessages.length < 4) return;
        
        const chatText = recentMessages.map(m => {
            const role = m.role === 'user' ? '用户' : '角色';
            return `${role}: ${m.text}`;
        }).join('\n');
        
        const summaryPrompt = `请总结以下聊天记录的主要内容，提取关键信息：\n\n${chatText}\n\n总结：`;
        
        const cfg = window.appData?.shezhiConfig?.api;
        if (!cfg || !cfg.baseUrl || !cfg.apiKey) {
            console.warn('API未配置，跳过记忆总结');
            return;
        }
        
        try {
            const base = cfg.baseUrl.replace(/\/+$/, "");
            const url = base.endsWith('/v1') ? base + '/chat/completions' : base + '/v1/chat/completions';
            const model = (typeof window.getApiModel === 'function') ? window.getApiModel('summary') : (cfg.modelName || "gpt-3.5-turbo");
            const resp = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + cfg.apiKey
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: "你是一个记忆总结助手，请简洁总结聊天内容。" },
                        { role: "user", content: summaryPrompt }
                    ],
                    stream: false
                })
            });
            
            if (!resp.ok) throw new Error("HTTP " + resp.status);
            
            const data = await resp.json();
            const summary = data.choices?.[0]?.message?.content || '';
            
            if (!contact.memorySummaries) contact.memorySummaries = [];
            contact.memorySummaries.push({
                time: new Date().toLocaleString('zh-CN'),
                content: summary,
                messageCount: recentMessages.length
            });
            
            const keepCount = 10;
            if (contact.memorySummaries.length > keepCount) {
                contact.memorySummaries = contact.memorySummaries.slice(-keepCount);
            }
            
            window.saveData?.();
            console.log('记忆总结完成:', summary);
        } catch (e) {
            console.error('记忆总结失败:', e);
        }
    }

    function renderMessages() {
        if (!chatMessages) return;
        window.applyChatWallpaper?.();
        
        let html = '';
        let lastTime = null;
        let timeCount = 0;
        
        chatHistory.forEach((msg, idx) => {
            if (msg.text === '...') return;
            
            const msgTime = msg.time || '';
            let shouldShowTime = false;
            
            if (msgTime) {
                if (!lastTime) {
                    shouldShowTime = true;
                    console.log('Message 1 shows time:', msgTime);
                } else {
                    const current = parseTime(msgTime);
                    const last = parseTime(lastTime);
                    const diff = current && last ? current - last : 0;
                    console.log(`Time diff: ${diff}ms, should show: ${diff > 10 * 60 * 1000}`);
                    if (current && last && diff > 10 * 60 * 1000) {
                        shouldShowTime = true;
                    }
                }
                lastTime = msgTime;
            }
            
            if (shouldShowTime) {
                html += `<div class="chat-time-divider">${escapeHtml(msgTime)}</div>`;
                timeCount++;
            }
            
            const isUser = msg.role === 'user';
            const avatarStyle = `style="background-image:url(${getAvatarUrl(msg.role)})"`;
            const isSticker = msg.type === 'sticker';
            const bubbleContent = isSticker 
                ? `<img class="chat-sticker-img" src="${escapeHtml(msg.text)}" alt="sticker">`
                : escapeHtml(msg.text);
            html += `
                <div class="chat-msg ${isUser ? 'chat-msg-user' : 'chat-msg-char'}">
                    <div class="chat-msg-avatar" ${avatarStyle}></div>
                    <div class="chat-msg-body">
                        <div class="chat-msg-bubble">${bubbleContent}</div>
                    </div>
                </div>
            `;
        });
        
        console.log(`Total time dividers: ${timeCount}`);
        chatMessages.innerHTML = html;
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function parseTime(timeStr) {
        if (!timeStr) return null;
        let hours = 0, minutes = 0;
        
        const isPM = /下午|PM/i.test(timeStr);
        const isAM = /上午|AM/i.test(timeStr);
        
        const match = timeStr.match(/(\d{1,2}):(\d{2})/);
        if (!match) return null;
        
        hours = parseInt(match[1], 10);
        minutes = parseInt(match[2], 10);
        
        if (isNaN(hours) || isNaN(minutes)) return null;
        
        if (isPM && hours < 12) hours += 12;
        if (isAM && hours === 12) hours = 0;
        
        const now = new Date();
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        return date.getTime();
    }

    function splitTextIntoParts(text, minParts, maxParts) {
        const parts = text.split(/\n\n+/).filter(p => p.trim());
        if (parts.length < 2) {
            parts.length = 0;
            const sentences = text.split(/(?<=[。！？!?\.])\s*/).filter(s => s.trim());
            if (sentences.length >= 2) {
                parts.push(...sentences);
            } else {
                const lines = text.split('\n').filter(l => l.trim());
                parts.push(...lines);
            }
        }
        
        const targetCount = Math.floor(Math.random() * (maxParts - minParts + 1)) + minParts;
        const count = Math.min(targetCount, parts.length);
        
        if (count <= 1) return [text];
        
        const result = [];
        const chunkSize = Math.ceil(parts.length / count);
        for (let i = 0; i < parts.length; i += chunkSize) {
            result.push(parts.slice(i, i + chunkSize).join('\n'));
        }
        
        return result.length > 0 ? result : [text];
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function showToast(msg) {
        const old = document.querySelector('.ios-toast');
        if (old) old.remove();
        const t = document.createElement('div');
        t.className = 'ios-toast';
        t.innerText = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2000);
    }

    function closeAllPanels() {
        if (chatPlusPanel) chatPlusPanel.classList.remove('show');
        if (chatStickerPanel) chatStickerPanel.classList.remove('show');
        if (chatSettingsPanel) chatSettingsPanel.classList.remove('show');
        if (chatStickerBackdrop) chatStickerBackdrop.classList.remove('show');
        stickerManageMode = false;
        if (stickerManageBtn) stickerManageBtn.style.background = '';
        if (stickerManageCancelBtn) stickerManageCancelBtn.style.display = 'none';
        if (stickerManageDeleteBtn) stickerManageDeleteBtn.style.display = 'none';
        openPanel = null;
    }

    async function callAI(userText) {
        const cfg = window.appData?.shezhiConfig?.api;
        if (!cfg || !cfg.baseUrl || !cfg.apiKey) {
            console.warn('[callAI] API配置缺失:', {
                hasShezhiConfig: !!window.appData?.shezhiConfig,
                hasApi: !!window.appData?.shezhiConfig?.api,
                baseUrl: window.appData?.shezhiConfig?.api?.baseUrl,
                apiKey: window.appData?.shezhiConfig?.api?.apiKey ? '***' : undefined
            });
            showToast("请先在设置中配置API");
            return;
        }

        isGenerating = true;
        if (chatTitle) chatTitle.textContent = '正在回复中...';
        addMessage('char', '...');

        const messages = chatHistory.filter(m => m.text !== '...').map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.text
        }));

        const userRealName = window.appData?.chatUserName || '';
        const userNickname = window.appData?.chatUserNickname || '';
        const userInfo = (userRealName || userNickname) ? `\n\n用户信息：\n真实姓名：${userRealName}\n网名：${userNickname}` : '';

        const contact = window.appData?.chatCurrentContact;
        const boundLocalIds = contact?.worldBookBindings || [];
        const allBooks = window.appData?.worldBooks || [];
        const globalBooks = allBooks.filter(b => b.type === 'global' && b.content);
        const boundLocalBooks = allBooks.filter(b => b.type === 'local' && boundLocalIds.includes(b.id) && b.content);
        const boundForumBooks = allBooks.filter(b => b.type === 'forum' && boundLocalIds.includes(b.id) && b.content);

        let worldBookText = '';
        if (globalBooks.length > 0) {
            worldBookText += '\n\n【全局世界书】\n' + globalBooks.map(b => `【${b.name}】\n${b.content}`).join('\n\n');
        }
        if (boundLocalBooks.length > 0) {
            worldBookText += '\n\n【局部世界书】\n' + boundLocalBooks.map(b => `【${b.name}】\n${b.content}`).join('\n\n');
        }
        if (boundForumBooks.length > 0) {
            worldBookText += '\n\n【论坛世界书】\n' + boundForumBooks.map(b => `【${b.name}】\n${b.content}`).join('\n\n');
        }

        const systemPrompt = getActivePrompt() +
            userInfo +
            worldBookText;

        try {
            const base = cfg.baseUrl.replace(/\/+$/, "");
            const url = base.endsWith('/v1') ? base + '/chat/completions' : base + '/v1/chat/completions';
            const model = (typeof window.getApiModel === 'function') ? window.getApiModel('chat') : (cfg.modelName || "gpt-3.5-turbo");
            const resp = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + cfg.apiKey
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: systemPrompt || "你是一个可爱的AI助手。" },
                        ...messages
                    ],
                    stream: true
                })
            });

            if (!resp.ok) throw new Error("HTTP " + resp.status);

            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            chatHistory[chatHistory.length - 1].text = '';
            renderMessages();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));
                for (const line of lines) {
                    const data = line.replace('data:', '').trim();
                    if (data === '[DONE]') continue;
                    try {
                        const json = JSON.parse(data);
                        const delta = json.choices?.[0]?.delta?.content || '';
                        fullText += delta;
                        chatHistory[chatHistory.length - 1].text = fullText;
                        renderMessages();
                    } catch (e) {}
                }
            }

            if (!fullText) {
                chatHistory[chatHistory.length - 1].text = "（无回复内容）";
                renderMessages();
            } else if (multiReplyEnabled) {
                chatHistory.pop();
                renderMessages();
                const parts = splitTextIntoParts(fullText, multiReplyMin, multiReplyMax);
                if (parts.length <= 1) {
                    addMessage('char', fullText);
                } else {
                    addMessage('char', parts[0]);
                    for (let i = 1; i < parts.length; i++) {
                        setTimeout(() => {
                            addMessage('char', parts[i]);
                        }, i * 800);
                    }
                }
            }
        } catch (e) {
            chatHistory[chatHistory.length - 1].text = "请求失败：" + e.message;
            renderMessages();
            showToast("请求失败");
        } finally {
            isGenerating = false;
            if (chatTitle && window.appData?.chatCurrentContact) {
                chatTitle.textContent = window.appData.chatCurrentContact.nickname || window.appData.chatCurrentContact.realName || window.appData.chatCurrentContact.name || '聊天';
            }
            const notifyCfg = window.appData?.shezhiConfig?.notify;
            if (notifyCfg?.enable && fullText) {
                showToast("角色回复了你");
            }
            if (notifyCfg?.soundUrl && fullText) {
                const audio = new Audio(notifyCfg.soundUrl);
                audio.play().catch(() => {});
            }
        }
    }

    function renderStickerTabs() {
        if (!stickerTabs) return;
        const groups = Object.keys(stickerGroups);
        stickerTabs.innerHTML = groups.map(g => 
            `<button class="sticker-tab ${g === currentStickerGroup ? 'active' : ''}" data-group="${escapeHtml(g)}">${escapeHtml(g)}</button>`
        ).join('');
        stickerTabs.querySelectorAll('.sticker-tab').forEach(tab => {
            tab.onclick = function() {
                if (stickerManageMode) return;
                currentStickerGroup = this.dataset.group;
                renderStickerTabs();
                renderStickerGrid();
            };
        });
    }

    function renderStickerGrid() {
        if (!stickerGrid) return;
        const stickers = stickerGroups[currentStickerGroup] || [];
        stickerGrid.innerHTML = stickers.map((s, idx) => 
            `<div class="sticker-item${stickerManageMode ? ' sticker-manage-mode' : ''}" data-idx="${idx}">
                ${stickerManageMode ? '<input type="checkbox" class="sticker-checkbox" data-idx="' + idx + '">' : ''}
                <div class="sticker-img" style="background-image:url(${escapeHtml(s.url)})"></div>
                <div class="sticker-label">${escapeHtml(s.label)}</div>
            </div>`
        ).join('');
        stickerGrid.querySelectorAll('.sticker-item').forEach(item => {
            item.onclick = function(e) {
                if (stickerManageMode) {
                    const checkbox = this.querySelector('.sticker-checkbox');
                    if (checkbox) checkbox.checked = !checkbox.checked;
                    return;
                }
                const idx = Number(this.dataset.idx);
                const sticker = stickerGroups[currentStickerGroup][idx];
                if (sticker) {
                    addMessage('user', sticker.url, 'sticker');
                    if (chatStickerPanel) chatStickerPanel.classList.remove('show');
                }
            };
        });
    }

    window.openChatModal = function () {
        if (!chatModal) return;
        chatModal.classList.add('show');
        initChatData();
        switchPage('messages');
    };

    function initChatData() {
        if (!window.appData) window.appData = {};
        
        // 初始化联系人（角色）
        if (!window.appData.chatContacts) {
            window.appData.chatContacts = [];
        }
        
        // 初始化消息记录
        if (!window.appData.chatMessages) {
            window.appData.chatMessages = {};
        }
        
        // 初始化朋友圈
        if (!window.appData.chatMoments) {
            window.appData.chatMoments = [];
        }
        
        // 初始化表情包
        if (!window.appData.stickerGroups) {
            window.appData.stickerGroups = { '默认': [] };
        }
        stickerGroups = window.appData.stickerGroups;
        if (!currentStickerGroup || !stickerGroups[currentStickerGroup]) {
            currentStickerGroup = Object.keys(stickerGroups)[0] || '默认';
        }
    }



    if (chatSendBtn) {
        chatSendBtn.onclick = function () {
            if (!chatInput) return;
            const text = chatInput.value.trim();
            if (!text || isGenerating) return;
            addMessage('user', text);
            chatInput.value = '';
        };
    }

    if (chatInput) {
        let isComposing = false;
        
        chatInput.addEventListener('compositionstart', function() {
            isComposing = true;
        });
        
        chatInput.addEventListener('compositionend', function() {
            isComposing = false;
        });
        
        chatInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
                e.preventDefault();
                const text = chatInput.value.trim();
                if (text && !isGenerating) {
                    addMessage('user', text);
                    chatInput.value = '';
                }
            }
        });
    }

    if (chatReplyBtn) {
        chatReplyBtn.onclick = function () {
            if (isGenerating) {
                showToast('角色正在回复中...');
                return;
            }
            const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user');
            if (!lastUserMsg) {
                showToast("请先发送消息");
                return;
            }
            callAI(lastUserMsg.text);
        };
    }

    if (chatPlusBtn && chatPlusPanel) {
        chatPlusBtn.onclick = function (e) {
            e.stopPropagation();
            const isShow = chatPlusPanel.classList.contains('show');
            closeAllPanels();
            if (!isShow) {
                chatPlusPanel.classList.add('show');
                openPanel = 'plus';
            }
        };
    }

    if (chatEmojiBtn) {
        chatEmojiBtn.onclick = function (e) {
            e.stopPropagation();
            const isShow = chatStickerPanel.classList.contains('show');
            closeAllPanels();
            if (!isShow) {
                stickerManageMode = false;
                if (stickerManageBtn) stickerManageBtn.style.background = '';
                renderStickerTabs();
                renderStickerGrid();
                chatStickerPanel.classList.add('show');
                if (chatStickerBackdrop) chatStickerBackdrop.classList.add('show');
                openPanel = 'sticker';
            }
        };
    }

    if (chatStickerBackdrop) {
        chatStickerBackdrop.onclick = function() {
            closeAllPanels();
        };
    }

    if (stickerManageBtn) {
        stickerManageBtn.onclick = function(e) {
            e.stopPropagation();
            stickerManageMode = true;
            this.style.background = 'rgba(0,0,0,0.1)';
            if (stickerManageCancelBtn) stickerManageCancelBtn.style.display = 'flex';
            if (stickerManageDeleteBtn) stickerManageDeleteBtn.style.display = 'flex';
            renderStickerTabs();
            renderStickerGrid();
            showToast("点击表情包进行多选，然后点击删除");
        };
    }

    if (stickerManageCancelBtn) {
        stickerManageCancelBtn.onclick = function(e) {
            e.stopPropagation();
            stickerManageMode = false;
            this.style.display = 'none';
            if (stickerManageDeleteBtn) stickerManageDeleteBtn.style.display = 'none';
            if (stickerManageBtn) stickerManageBtn.style.background = '';
            renderStickerTabs();
            renderStickerGrid();
        };
    }

    if (stickerManageDeleteBtn) {
        stickerManageDeleteBtn.onclick = function(e) {
            e.stopPropagation();
            deleteSelectedStickers();
            stickerManageMode = false;
            this.style.display = 'none';
            if (stickerManageCancelBtn) stickerManageCancelBtn.style.display = 'none';
            if (stickerManageBtn) stickerManageBtn.style.background = '';
            renderStickerTabs();
            renderStickerGrid();
        };
    }

    function deleteSelectedStickers() {
        if (!stickerGrid) return;
        const checkboxes = stickerGrid.querySelectorAll('.sticker-checkbox:checked');
        if (checkboxes.length === 0) {
            showToast("请先选择要删除的表情包");
            return;
        }
        const idxs = Array.from(checkboxes).map(cb => Number(cb.dataset.idx)).sort((a, b) => b - a);
        const stickers = stickerGroups[currentStickerGroup] || [];
        idxs.forEach(idx => {
            if (idx >= 0 && idx < stickers.length) {
                stickers.splice(idx, 1);
            }
        });
        window.appData.stickerGroups = stickerGroups;
        window.saveData?.();
        showToast(`已删除 ${idxs.length} 个表情`);
    }

    document.querySelectorAll('.chat-plus-item').forEach(item => {
        item.addEventListener('click', function() {
            const action = this.dataset.action;
            closeAllPanels();
            showToast(action === 'transfer' ? '转账功能开发中' : 
                      action === 'redpacket' ? '红包功能开发中' : 
                      action === 'photo' ? '照片功能开发中' : '文件功能开发中');
        });
    });

    if (chatReplyBtn) {
        chatReplyBtn.onclick = function (e) {
            e.stopPropagation();
            if (isGenerating) return;
            const lastUserMsg = [...chatHistory].reverse().find(m => m.role === 'user');
            if (!lastUserMsg) {
                showToast("请先发送消息");
                return;
            }
            callAI(lastUserMsg.text);
        };
    }

    if (chatBackBtn) {
        chatBackBtn.onclick = function(e) {
            e.stopPropagation();
            const activePage = document.querySelector('.chat-page.active');
            if (activePage && activePage.id === 'chatContactEditPage') {
                switchPage('contacts');
            } else if (activePage && activePage.id === 'chatChatSettingsPage') {
                switchPage('chat');
            } else if (activePage && activePage.id === 'chatChatProfilePage') {
                if (chatProfileEditMode) {
                    chatProfileEditMode = false;
                    chatProfileOriginal = {};
                    contactAvatarData = null;
                }
                switchPage('chatSettings');
            } else if (activePage && activePage.id === 'chatMemoryLibraryPage') {
                if (memoryLibraryEditMode) {
                    memoryLibraryEditMode = false;
                }
                switchPage('chatSettings');
            } else if (activePage && (activePage.id === 'chatMessagesPage' || activePage.id === 'chatContactsPage' || activePage.id === 'chatMomentsPage' || activePage.id === 'chatMePage')) {
                if (chatModal) chatModal.classList.remove('show');
            } else if (activePage && activePage.id === 'chatChatPage') {
                switchPage('messages');
            }
        };
    }

    if (chatSettingsBtn) {
        chatSettingsBtn.onclick = function(e) {
            e.stopPropagation();
            if (window.appData?.chatCurrentContact) {
                switchPage('chatSettings');
            } else {
                showToast('请先选择一个角色');
            }
        };
    }

    if (stickerImportBtn) {
        stickerImportBtn.onclick = function() {
            closeAllPanels();
            if (stickerImportGroupSelect) {
                const groups = Object.keys(stickerGroups);
                stickerImportGroupSelect.innerHTML = groups.map(g => 
                    `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`
                ).join('');
            }
            if (stickerImportModal) stickerImportModal.classList.add('show');
        };
    }

    if (stickerImportConfirm) {
        stickerImportConfirm.onclick = function() {
            const text = stickerImportText ? stickerImportText.value.trim() : '';
            let groupName = stickerImportGroupSelect ? stickerImportGroupSelect.value : '默认';
            const newGroupName = stickerGroupName ? stickerGroupName.value.trim() : '';
            if (newGroupName) {
                groupName = newGroupName;
                if (!stickerGroups[groupName]) stickerGroups[groupName] = [];
            }
            if (!text) {
                showToast("请输入表情包内容");
                return;
            }
            const lines = text.split('\n').filter(l => l.trim());
            const newStickers = [];
            lines.forEach(line => {
                let label = '', url = '';
                if (line.includes('|')) {
                    const parts = line.split('|');
                    label = parts[0].trim();
                    url = parts.slice(1).join('|').trim();
                } else {
                    const tokens = line.trim().split(/\s+/);
                    const lastToken = tokens[tokens.length - 1];
                    if (lastToken.startsWith('http://') || lastToken.startsWith('https://')) {
                        url = lastToken;
                        label = tokens.slice(0, -1).join(' ').trim();
                    }
                }
                if (label && url) {
                    newStickers.push({ label, url });
                }
            });
            if (newStickers.length === 0) {
                showToast("未识别到有效表情包");
                return;
            }
            if (!stickerGroups[groupName]) stickerGroups[groupName] = [];
            stickerGroups[groupName].push(...newStickers);
            window.appData.stickerGroups = stickerGroups;
            window.saveData?.();
            currentStickerGroup = groupName;
            renderStickerTabs();
            renderStickerGrid();
            if (stickerGroupName) stickerGroupName.value = '';
            if (stickerImportModal) stickerImportModal.classList.remove('show');
            showToast(`成功导入 ${newStickers.length} 个表情`);
        };
    }

    if (stickerImportCancel) {
        stickerImportCancel.onclick = function() {
            if (stickerImportModal) stickerImportModal.classList.remove('show');
        };
    }

    if (stickerImportModal) {
        stickerImportModal.addEventListener('click', function(e) {
            if (e.target === stickerImportModal) {
                stickerImportModal.classList.remove('show');
            }
        });
    }

    if (chatTabBar) {
        chatTabBar.querySelectorAll('.chat-tab-item').forEach(item => {
            item.onclick = function() {
                const tab = this.dataset.tab;
                switchPage(tab);
            };
        });
    }

    if (contactAvatarEdit) {
        contactAvatarEdit.onclick = function(e) {
            if (typeof window.openImageSelectModal === 'function') {
                window.openImageSelectModal({ type: 'contactAvatar' });
                const handler = function(e) {
                    contactAvatarData = e.detail;
                    if (contactAvatarPreview) contactAvatarPreview.style.backgroundImage = 'url(' + contactAvatarData + ')';
                    window.removeEventListener('contactavatarselected', handler);
                };
                window.addEventListener('contactavatarselected', handler);
            }
        };
    }

    function saveContact() {
        const realName = contactRealNameInput ? contactRealNameInput.value.trim() : '';
        const nickname = contactNicknameInput ? contactNicknameInput.value.trim() : '';
        const gender = contactGenderSelect ? contactGenderSelect.value : '';
        const birthday = contactBirthdayInput ? contactBirthdayInput.value.trim() : '';
        const bio = contactBioInput ? contactBioInput.value.trim() : '';

        const worldBookBindings = [];
        if (worldBookBindingList) {
            worldBookBindingList.querySelectorAll('.world-book-binding-checkbox:checked').forEach(cb => {
                worldBookBindings.push(cb.dataset.wbId);
            });
        }

        if (!realName && !nickname) {
            showToast('请至少填写真实姓名或网名');
            return;
        }

        const contact = {
            id: editingContactId || Date.now().toString(),
            name: nickname || realName,
            realName: realName,
            nickname: nickname,
            gender: gender,
            birthday: birthday,
            bio: bio,
            avatar: contactAvatarData || '',
            lastMsg: '',
            lastTime: '',
            unread: 0,
            worldBookBindings: worldBookBindings
        };
        
        if (!window.appData.chatContacts) window.appData.chatContacts = [];
        
        if (editingContactId) {
            const idx = window.appData.chatContacts.findIndex(c => c.id === editingContactId);
            if (idx >= 0) {
                contact.id = editingContactId;
                contact.name = nickname || realName || window.appData.chatContacts[idx].name;
                contact.lastMsg = window.appData.chatContacts[idx].lastMsg || '';
                contact.lastTime = window.appData.chatContacts[idx].lastTime || '';
                contact.unread = window.appData.chatContacts[idx].unread || 0;
                window.appData.chatContacts[idx] = contact;
            } else {
                window.appData.chatContacts.push(contact);
            }
        } else {
            window.appData.chatContacts.push(contact);
        }
        
        window.saveData?.();
        editingContactId = null;
        contactAvatarData = null;
        renderContacts();
        switchPage('contacts');
        showToast('联系人已保存');
    }

    if (chatMenuBtn) {
        chatMenuBtn.onclick = function(e) {
            e.stopPropagation();
            const activePage = document.querySelector('.chat-page.active');
            if (activePage && activePage.id === 'chatContactEditPage') {
                saveContact();
            }
        };
    }

    if (chatModal) {
        chatModal.addEventListener("click", function (e) {
            if (e.target === chatModal) {
                closeAllPanels();
            }
        });
    }

    if (window.visualViewport && chatModal) {
        const appModalInner = chatModal.querySelector('.app-modal-inner');
        let previousHeight = window.visualViewport.height;
        
        window.visualViewport.addEventListener('resize', function() {
            const currentHeight = window.visualViewport.height;
            const heightDiff = previousHeight - currentHeight;
            
            if (heightDiff > 100 && appModalInner) {
                appModalInner.style.height = currentHeight + 'px';
                appModalInner.style.position = 'fixed';
                appModalInner.style.bottom = '0';
            } else if (heightDiff < 50 && appModalInner) {
                appModalInner.style.height = '';
                appModalInner.style.position = '';
                appModalInner.style.bottom = '';
            }
            
            previousHeight = currentHeight;
        });
        
        window.visualViewport.addEventListener('scroll', function() {
            if (appModalInner && chatModal.classList.contains('show')) {
                appModalInner.style.position = 'fixed';
                appModalInner.style.top = window.visualViewport.offsetTop + 'px';
                appModalInner.style.height = window.visualViewport.height + 'px';
            }
        });
    }
});
