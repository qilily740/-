document.addEventListener('DOMContentLoaded', () => {
    const worldBookModal = document.querySelector('.app-modal');
    const worldBookCloseBtn = worldBookModal ? worldBookModal.querySelector('.app-close-btn') : null;
    const worldBookTitle = worldBookModal ? worldBookModal.querySelector('.app-modal-title') : null;

    let wbSubPage = null;
    let wbMainHtml = null;
    let currentEditWbId = null;
    let editingBookName = '';
    let editingBookType = 'global';
    let editingBookContent = '';
    let wbSectionState = { global: true, local: true, forum: true };

    function showToast(msg) {
        const old = document.querySelector('.ios-toast');
        if (old) old.remove();
        const t = document.createElement('div');
        t.className = 'ios-toast';
        t.innerText = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2200);
    }

    function generateId() {
        return 'wb_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    }

    function getWorldBooks() {
        if (!window.appData.worldBooks) window.appData.worldBooks = [];
        return window.appData.worldBooks;
    }

    function saveWorldBooks() {
        window.saveData();
    }

    function renderMainPage() {
        const modalContent = document.querySelector('.app-modal-content');
        if (!modalContent) return;
        wbSubPage = null;
        currentEditWbId = null;
        editingBookName = '';
        editingBookType = 'global';
        editingBookContent = '';
        if (worldBookTitle) worldBookTitle.textContent = '世界书';
        if (!wbMainHtml) {
            wbMainHtml = modalContent.innerHTML;
        }

        const books = getWorldBooks();
        const globalBooks = books.filter(b => b.type === 'global');
        const localBooks = books.filter(b => b.type === 'local');
        const forumBooks = books.filter(b => b.type === 'forum');

        let html = '';

        function renderSection(title, type, books) {
            const isExpanded = wbSectionState[type] !== false;
            const arrow = isExpanded ? '▼' : '▶';
            let booksHtml = '';
            if (books.length === 0) {
                booksHtml = `<div class="ios-cell" style="color:#8e8e93;justify-content:center;"><span>暂无${title}</span></div>`;
            } else {
                books.forEach(book => {
                    booksHtml += `<div class="ios-cell world-book-item" data-id="${book.id}">
                        <span class="ios-cell-label">${escapeHtml(book.name)}</span>
                        <span class="ios-cell-arrow">›</span>
                    </div>`;
                });
            }
            return `<div class="ios-group">
                <div class="wb-section-header" data-type="${type}">
                    <span class="wb-section-title">${title}</span>
                    <span class="wb-section-arrow">${arrow}</span>
                </div>
                <div class="wb-section-content" style="display:${isExpanded ? 'block' : 'none'};">
                    ${booksHtml}
                </div>
            </div>`;
        }

        html += renderSection('全局世界书', 'global', globalBooks);
        html += renderSection('局部世界书', 'local', localBooks);
        html += renderSection('论坛世界书', 'forum', forumBooks);

        html += `<div style="margin-top:8px;background:#fff;border-radius:12px;overflow:hidden;">
            <div class="ios-cell" id="wbAddGlobal" style="justify-content:center;">
                <span class="ios-cell-label" style="color:#007aff;">+ 新建全局世界书</span>
            </div>
            <div class="ios-cell" id="wbAddLocal" style="justify-content:center;">
                <span class="ios-cell-label" style="color:#007aff;">+ 新建局部世界书</span>
            </div>
            <div class="ios-cell" id="wbAddForum" style="justify-content:center;">
                <span class="ios-cell-label" style="color:#007aff;">+ 新建论坛世界书</span>
            </div>
        </div>`;

        modalContent.innerHTML = html;

        modalContent.querySelectorAll('.world-book-item').forEach(el => {
            el.onclick = function() {
                const id = this.dataset.id;
                openWorldBookEdit(id);
            };
        });

        const addGlobalBtn = document.querySelector('#wbAddGlobal');
        if (addGlobalBtn) {
            addGlobalBtn.onclick = function() {
                createNewWorldBook('global');
            };
        }

        const addLocalBtn = document.querySelector('#wbAddLocal');
        if (addLocalBtn) {
            addLocalBtn.onclick = function() {
                createNewWorldBook('local');
            };
        }

        const addForumBtn = document.querySelector('#wbAddForum');
        if (addForumBtn) {
            addForumBtn.onclick = function() {
                createNewWorldBook('forum');
            };
        }

        modalContent.querySelectorAll('.wb-section-header').forEach(toggle => {
            toggle.onclick = function() {
                const type = this.dataset.type;
                wbSectionState[type] = !wbSectionState[type];
                renderMainPage();
            };
        });
    }

    function createNewWorldBook(type) {
        editingBookName = '';
        editingBookType = type;
        editingBookContent = '';
        currentEditWbId = null;
        wbSubPage = 'edit';
        const typeNames = { global: '全局世界书', local: '局部世界书', forum: '论坛世界书' };
        if (worldBookTitle) worldBookTitle.textContent = '新建' + (typeNames[type] || '世界书');
        renderWorldBookEditPage();
    }

    function openWorldBookEdit(id) {
        const books = getWorldBooks();
        const book = books.find(b => b.id === id);
        if (!book) return;
        currentEditWbId = id;
        editingBookName = book.name;
        editingBookType = book.type;
        editingBookContent = book.content || '';
        wbSubPage = 'edit';
        if (worldBookTitle) worldBookTitle.textContent = book.name;
        renderWorldBookEditPage();
    }

    function renderWorldBookEditPage() {
        const modalContent = document.querySelector('.app-modal-content');
        if (!modalContent) return;

        const isNew = !currentEditWbId;

        let html = '';

        html += `<div class="ios-group">
            <div class="ios-group-title">${isNew ? '新建世界书' : '编辑世界书'}</div>
            <div class="contact-form-item" style="background:transparent;padding:0 16px;">
                <label class="contact-form-label">名称</label>
                <input class="contact-form-input" id="wbBookName" value="${escapeHtml(editingBookName)}" placeholder="请输入世界书名称">
            </div>
            <div class="contact-form-item" style="background:transparent;padding:0 16px;">
                <label class="contact-form-label">设定内容</label>
                <textarea class="contact-form-textarea" id="wbBookContent" placeholder="在此粘贴设定内容..." style="min-height:200px;">${escapeHtml(editingBookContent)}</textarea>
            </div>
        </div>`;

        html += `<div style="margin-top:8px;background:#fff;border-radius:12px;overflow:hidden;">
            <div class="ios-cell" id="wbSaveBook" style="justify-content:center;">
                <span class="ios-cell-label" style="color:#007aff;font-weight:600;">保存</span>
            </div>
            <div class="ios-cell" id="wbCancelBook" style="justify-content:center;">
                <span class="ios-cell-label" style="color:#8e8e93;font-weight:600;">取消</span>
            </div>
        </div>`;

        if (!isNew) {
            html += `<div style="margin-top:8px;background:#fff;border-radius:12px;overflow:hidden;">
                <div class="ios-cell" id="wbDeleteBook" style="color:#ff3b30;justify-content:center;">
                    <span class="ios-cell-label">删除此世界书</span>
                </div>
            </div>`;
        }

        modalContent.innerHTML = html;

        const saveBtn = document.querySelector('#wbSaveBook');
        if (saveBtn) {
            saveBtn.onclick = function() {
                const name = document.querySelector('#wbBookName')?.value.trim() || '';
                const content = document.querySelector('#wbBookContent')?.value || '';
                if (!name) {
                    showToast('请输入名称');
                    return;
                }
                if (isNew) {
                    const book = {
                        id: generateId(),
                        name: name,
                        type: editingBookType,
                        content: content
                    };
                    getWorldBooks().push(book);
                } else {
                    const books = getWorldBooks();
                    const book = books.find(b => b.id === currentEditWbId);
                    if (book) {
                        book.name = name;
                        book.content = content;
                    }
                }
                saveWorldBooks();
                showToast(isNew ? '世界书已创建' : '世界书已保存');
                wbSubPage = null;
                currentEditWbId = null;
                editingBookName = '';
                editingBookContent = '';
                if (worldBookTitle) worldBookTitle.textContent = '世界书';
                renderMainPage();
            };
        }

        const cancelBtn = document.querySelector('#wbCancelBook');
        if (cancelBtn) {
            cancelBtn.onclick = function() {
                wbSubPage = null;
                currentEditWbId = null;
                editingBookName = '';
                editingBookContent = '';
                if (worldBookTitle) worldBookTitle.textContent = '世界书';
                renderMainPage();
            };
        }

        const deleteBtn = document.querySelector('#wbDeleteBook');
        if (deleteBtn) {
            deleteBtn.onclick = function() {
                if (confirm('确定要删除这个世界书吗？')) {
                    const books = getWorldBooks();
                    const idx = books.findIndex(b => b.id === currentEditWbId);
                    if (idx >= 0) {
                        books.splice(idx, 1);
                        saveWorldBooks();
                        showToast('世界书已删除');
                    }
                    wbSubPage = null;
                    currentEditWbId = null;
                    editingBookName = '';
                    editingBookContent = '';
                    if (worldBookTitle) worldBookTitle.textContent = '世界书';
                    renderMainPage();
                }
            };
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    window.APP_LIST["10"] = {
        title: '世界书',
        html: `<div class="ios-group"><div class="ios-group-title">管理你的世界观与设定</div></div>`,
        onMount: function () {
            wbSubPage = null;
            currentEditWbId = null;
            editingBookName = '';
            editingBookType = 'global';
            editingBookContent = '';
            if (worldBookTitle) worldBookTitle.textContent = '世界书';
            const modalContent = document.querySelector('.app-modal-content');
            if (modalContent) {
                if (!wbMainHtml) {
                    wbMainHtml = modalContent.innerHTML;
                }
                renderMainPage();
            }
        }
    };

    if (worldBookCloseBtn) {
        worldBookCloseBtn.onclick = function() {
            if (wbSubPage === 'edit') {
                wbSubPage = null;
                currentEditWbId = null;
                editingBookName = '';
                editingBookContent = '';
                if (worldBookTitle) worldBookTitle.textContent = '世界书';
                const modalContent = document.querySelector('.app-modal-content');
                if (modalContent && wbMainHtml) {
                    renderMainPage();
                }
            } else {
                window.closeApp();
            }
        };
    }
});
