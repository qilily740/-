document.addEventListener('DOMContentLoaded', () => {
    const appKey = "5";
    let currentGame = null;
    let gameMode = 'single';
    let invitedRole = null;
    let closeBtn = null;
    let modalContent = null;
    let modalTitle = null;

    let userGrid = [];
    let userScore = 0;
    let userGameOver = false;
    let charGrid = [];
    let charScore = 0;
    let charGameOver = false;
    let currentTurn = 1;
    let gameResult = null;
    let aiTimer = null;
    let keydownHandler = null;

    function escapeHtml(str) {
        if (!str) return "";
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function showToast(msg) {
        const old = document.querySelector('.youxi-toast');
        if (old) old.remove();
        const t = document.createElement('div');
        t.className = 'youxi-toast';
        t.innerText = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2000);
    }

    function getChatContacts() {
        return window.appData?.chatContacts || [];
    }

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

    function renderMainPage() {
        const multiBadge = gameMode === 'multi' && invitedRole ?
            `<div class="youxi-mode-badge">双人模式：${escapeHtml(invitedRole.nickname || invitedRole.realName || invitedRole.name || '')} <button class="youxi-exit-multi-btn" id="youxiExitMultiBtn">退出</button></div>` : '';
        return `
        <div class="youxi-main">
            <div class="youxi-game-list">
                <div class="youxi-game-card" data-game="2048">
                    <div class="youxi-game-icon" style="background:#edc22e;">2048</div>
                    <div class="youxi-game-name">2048</div>
                    <div class="youxi-game-desc">经典数字合并游戏</div>
                </div>
            </div>
            <div class="youxi-invite-section">
                <button class="youxi-invite-btn" id="youxiInviteBtn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    邀请角色一起玩
                </button>
            </div>
            ${multiBadge}
        </div>
        `;
    }

    function renderInvitePage() {
        const contacts = getChatContacts();
        if (contacts.length === 0) {
            return `
            <div class="youxi-invite-page">
                <div class="youxi-page-header">
                    <button class="youxi-back-btn" data-action="back">‹</button>
                    <span class="youxi-page-title">邀请角色</span>
                </div>
                <div class="youxi-invite-tip" style="margin-top:40px;">暂无联系人，请先在聊天App中添加联系人</div>
            </div>
            `;
        }
        return `
        <div class="youxi-invite-page">
            <div class="youxi-page-header">
                <button class="youxi-back-btn" data-action="back">‹</button>
                <span class="youxi-page-title">邀请角色</span>
            </div>
            <div class="youxi-role-list">
                ${contacts.map(c => `
                    <div class="youxi-role-item" data-role="${escapeHtml(c.id)}">
                        <div class="youxi-role-avatar" style="background-image:url(${escapeHtml(c.avatar || '')});background-color:#e2e2ea;"></div>
                        <div class="youxi-role-name">${escapeHtml(c.nickname || c.realName || c.name || '未知')}</div>
                        <button class="youxi-role-invite-btn" data-role="${escapeHtml(c.id)}">邀请</button>
                    </div>
                `).join('')}
            </div>
            <div class="youxi-invite-tip">选择一个联系人开始双人游戏</div>
        </div>
        `;
    }

    function render2048Page() {
        const isMulti = gameMode === 'multi';
        if (isMulti) {
            return `
            <div class="youxi-game-page">
                <div class="youxi-page-header">
                    <span class="youxi-page-title">2048 双人对战</span>
                    <button class="youxi-new-game-btn" data-action="new2048">新游戏</button>
                </div>
                <div class="youxi-multi-status">
                    <span class="youxi-turn-badge p${currentTurn}">当前回合：${currentTurn === 1 ? '你' : (invitedRole?.nickname || invitedRole?.realName || '角色')}</span>
                    <span class="youxi-result-text">${gameResult || '游戏进行中'}</span>
                </div>
                <div class="youxi-split-board">
                    <div class="youxi-split-panel">
                        <div class="youxi-split-header">
                            <span class="youxi-split-title">你</span>
                            <span class="youxi-split-score" id="scoreUser">${userScore}</span>
                        </div>
                        <div class="youxi-2048-grid" id="gridUser">
                            ${userGrid.map(row => row.map(val => `
                                <div class="youxi-2048-cell ${val > 0 ? 'filled' : ''}" data-value="${val}">
                                    <span class="youxi-2048-num">${val || ''}</span>
                                </div>
                            `).join('')).join('')}
                        </div>
                        ${userGameOver && !gameResult ? `<div class="youxi-game-over">你输了！</div>` : ''}
                    </div>
                    <div class="youxi-split-divider"></div>
                    <div class="youxi-split-panel">
                        <div class="youxi-split-header">
                            <span class="youxi-split-title">${escapeHtml(invitedRole?.nickname || invitedRole?.realName || '角色')}</span>
                            <span class="youxi-split-score" id="scoreChar">${charScore}</span>
                        </div>
                        <div class="youxi-2048-grid" id="gridChar">
                            ${charGrid.map(row => row.map(val => `
                                <div class="youxi-2048-cell ${val > 0 ? 'filled' : ''}" data-value="${val}">
                                    <span class="youxi-2048-num">${val || ''}</span>
                                </div>
                            `).join('')).join('')}
                        </div>
                        ${charGameOver && !gameResult ? `<div class="youxi-game-over">角色输了！</div>` : ''}
                    </div>
                </div>
            </div>
            `;
        }
        return `
        <div class="youxi-game-page">
            <div class="youxi-page-header">
                <span class="youxi-page-title">2048</span>
                <button class="youxi-new-game-btn" data-action="new2048">新游戏</button>
            </div>
            <div class="youxi-score-board">
                <div class="youxi-score-card">
                    <div class="youxi-score-label">分数</div>
                    <div class="youxi-score-value" id="score2048">${userScore}</div>
                </div>
            </div>
            <div class="youxi-2048-grid" id="grid2048">
                ${userGrid.map(row => row.map(val => `
                    <div class="youxi-2048-cell ${val > 0 ? 'filled' : ''}" data-value="${val}">
                        <span class="youxi-2048-num">${val || ''}</span>
                    </div>
                `).join('')).join('')}
            </div>
            ${userGameOver ? `<div class="youxi-game-over">游戏结束！<button class="youxi-retry-btn" data-action="new2048">再来一局</button></div>` : ''}
        </div>
        `;
    }

    function navigateTo(html) {
        const els = getModalElements();
        if (!els || !els.content) return;
        els.content.innerHTML = html;
        bindCurrentPageEvents();
    }

    function goBack() {
        const els = getModalElements();
        if (!els || !els.content) return;
        if (els.content.querySelector('.youxi-game-page') || els.content.querySelector('.youxi-invite-page')) {
            currentGame = null;
            if (aiTimer) { clearTimeout(aiTimer); aiTimer = null; }
            if (keydownHandler) { document.removeEventListener('keydown', keydownHandler); keydownHandler = null; }
            navigateTo(renderMainPage());
        } else {
            window.closeApp();
        }
    }

    function bindCurrentPageEvents() {
        const content = getModalElements()?.content;
        if (!content) return;

        content.querySelectorAll('.youxi-back-btn').forEach(btn => {
            btn.onclick = () => goBack();
        });

        content.querySelectorAll('.youxi-game-card').forEach(card => {
            card.onclick = () => {
                const game = card.dataset.game;
                if (game === '2048') {
                    currentGame = '2048';
                    gameMode = 'single';
                    invitedRole = null;
                    initUser2048();
                    navigateTo(render2048Page());
                }
            };
        });

        const inviteBtn = content.querySelector('#youxiInviteBtn');
        if (inviteBtn) {
            inviteBtn.onclick = () => {
                navigateTo(renderInvitePage());
            };
        }

        const exitMultiBtn = content.querySelector('#youxiExitMultiBtn');
        if (exitMultiBtn) {
            exitMultiBtn.onclick = () => {
                gameMode = 'single';
                invitedRole = null;
                currentTurn = 1;
                gameResult = null;
                if (aiTimer) { clearTimeout(aiTimer); aiTimer = null; }
                showToast('已退出双人模式');
                navigateTo(renderMainPage());
            };
        }

        content.querySelectorAll('.youxi-role-invite-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const contacts = getChatContacts();
                const contact = contacts.find(c => c.id === btn.dataset.role);
                if (!contact) return;
                invitedRole = contact;
                gameMode = 'multi';
                currentTurn = 1;
                gameResult = null;
                initMulti2048();
                showToast(`已邀请 ${contact.nickname || contact.realName || contact.name}，双人模式开始`);
                navigateTo(render2048Page());
            };
        });

        content.querySelectorAll('[data-action="back"]').forEach(btn => {
            btn.onclick = () => goBack();
        });

        const new2048Btn = content.querySelector('[data-action="new2048"]');
        if (new2048Btn) {
            new2048Btn.onclick = () => {
                if (aiTimer) { clearTimeout(aiTimer); aiTimer = null; }
                if (gameMode === 'multi') {
                    initMulti2048();
                } else {
                    initUser2048();
                }
                navigateTo(render2048Page());
            };
        }

        if (currentGame === '2048') {
            bind2048Events(content);
            if (gameMode === 'multi' && !userGameOver && !charGameOver && !gameResult) {
                scheduleAiTurn();
            }
        }
    }

    // ==================== 2048 Core ====================
    function initUser2048() {
        userGrid = Array.from({ length: 4 }, () => Array(4).fill(0));
        userScore = 0;
        userGameOver = false;
        addRandom2048(userGrid);
        addRandom2048(userGrid);
    }

    function initChar2048() {
        charGrid = Array.from({ length: 4 }, () => Array(4).fill(0));
        charScore = 0;
        charGameOver = false;
        addRandom2048(charGrid);
        addRandom2048(charGrid);
    }

    function initMulti2048() {
        initUser2048();
        initChar2048();
        currentTurn = 1;
        gameResult = null;
    }

    function addRandom2048(grid) {
        const empty = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (grid[r][c] === 0) empty.push({ r, c });
            }
        }
        if (empty.length === 0) return;
        const { r, c } = empty[Math.floor(Math.random() * empty.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    function canMove2048(grid) {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (grid[r][c] === 0) return true;
                if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
                if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
            }
        }
        return false;
    }

    function move2048(grid, direction) {
        let moved = false;
        let mergeScore = 0;
        const newGrid = grid.map(row => [...row]);

        const processLine = (line) => {
            let arr = line.filter(v => v !== 0);
            for (let i = 0; i < arr.length - 1; i++) {
                if (arr[i] === arr[i + 1]) {
                    arr[i] *= 2;
                    mergeScore += arr[i];
                    arr.splice(i + 1, 1);
                }
            }
            while (arr.length < 4) arr.push(0);
            return arr;
        };

        if (direction === 'left') {
            for (let r = 0; r < 4; r++) {
                const newRow = processLine(newGrid[r]);
                if (newRow.join(',') !== newGrid[r].join(',')) moved = true;
                newGrid[r] = newRow;
            }
        } else if (direction === 'right') {
            for (let r = 0; r < 4; r++) {
                const reversed = [...newGrid[r]].reverse();
                const newRow = processLine(reversed).reverse();
                if (newRow.join(',') !== newGrid[r].join(',')) moved = true;
                newGrid[r] = newRow;
            }
        } else if (direction === 'up') {
            for (let c = 0; c < 4; c++) {
                const col = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
                const newCol = processLine(col);
                if (newCol.join(',') !== col.join(',')) moved = true;
                for (let r = 0; r < 4; r++) newGrid[r][c] = newCol[r];
            }
        } else if (direction === 'down') {
            for (let c = 0; c < 4; c++) {
                const col = [newGrid[3][c], newGrid[2][c], newGrid[1][c], newGrid[0][c]];
                const newCol = processLine(col).reverse();
                const origCol = [newGrid[0][c], newGrid[1][c], newGrid[2][c], newGrid[3][c]];
                if (newCol.join(',') !== origCol.join(',')) moved = true;
                for (let r = 0; r < 4; r++) newGrid[r][c] = newCol[r];
            }
        }

        if (moved) {
            for (let r = 0; r < 4; r++) grid[r] = newGrid[r];
            return { moved: true, score: mergeScore };
        }
        return { moved: false, score: 0 };
    }

    function checkWin(grid) {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (grid[r][c] >= 2048) return true;
            }
        }
        return false;
    }

    // ==================== AI角色逻辑 ====================
    function getAiDirection(grid) {
        const directions = ['up', 'down', 'left', 'right'];
        let bestDir = null;
        let bestScore = -1;

        for (const dir of directions) {
            const testGrid = grid.map(row => [...row]);
            const result = move2048(testGrid, dir);
            if (!result.moved) continue;

            let score = result.score * 10;
            let emptyCount = 0;
            let maxTile = 0;
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    if (testGrid[r][c] === 0) emptyCount++;
                    if (testGrid[r][c] > maxTile) maxTile = testGrid[r][c];
                }
            }
            score += emptyCount * 2;
            score += maxTile * 0.1;

            if (score > bestScore) {
                bestScore = score;
                bestDir = dir;
            }
        }

        if (!bestDir) {
            const available = directions.filter(dir => {
                const testGrid = grid.map(row => [...row]);
                return move2048(testGrid, dir).moved;
            });
            bestDir = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : 'up';
        }

        return bestDir;
    }

    function scheduleAiTurn() {
        if (aiTimer) clearTimeout(aiTimer);
        if (gameMode !== 'multi' || !invitedRole || gameResult || userGameOver || charGameOver) return;
        aiTimer = setTimeout(() => {
            if (currentTurn === 2 && !gameResult && !charGameOver && !userGameOver) {
                performAiMove();
            }
        }, 1000);
    }

    function performAiMove() {
        const dir = getAiDirection(charGrid);
        const result = move2048(charGrid, dir);
        if (result.moved) {
            charScore += result.score;
            addRandom2048(charGrid);
            if (checkWin(charGrid)) {
                charGameOver = true;
                gameResult = `角色达成2048！${invitedRole?.nickname || invitedRole?.realName || '角色'}获胜！`;
            } else if (!canMove2048(charGrid)) {
                charGameOver = true;
                gameResult = '角色无法移动，你获胜！';
            }
        } else {
            charGameOver = true;
            gameResult = '角色无法移动，你获胜！';
        }
        currentTurn = 1;
        refresh2048View();
        if (!gameResult && !userGameOver && !charGameOver) {
            scheduleAiTurn();
        }
    }

    // ==================== 渲染与刷新 ====================
    function render2048Page() {
        const isMulti = gameMode === 'multi';
        if (isMulti) {
            return `
            <div class="youxi-game-page">
                <div class="youxi-page-header">
                    <span class="youxi-page-title">2048</span>
                    <button class="youxi-new-game-btn" data-action="new2048">新游戏</button>
                </div>
                <div class="youxi-multi-status">
                    <span class="youxi-turn-badge p${currentTurn}">当前回合：${currentTurn === 1 ? '你' : (invitedRole?.nickname || invitedRole?.realName || '角色')}</span>
                    <span class="youxi-result-text">${gameResult || '游戏进行中'}</span>
                </div>
                <div class="youxi-main-board">
                    <div class="youxi-score-board">
                        <div class="youxi-score-card">
                            <div class="youxi-score-label">你的分数</div>
                            <div class="youxi-score-value" id="scoreUser">${userScore}</div>
                        </div>
                        <div class="youxi-score-card">
                            <div class="youxi-score-label">${escapeHtml(invitedRole?.nickname || invitedRole?.realName || '角色')}分数</div>
                            <div class="youxi-score-value" id="scoreChar">${charScore}</div>
                        </div>
                    </div>
                    <div class="youxi-2048-grid" id="gridUser">
                        ${userGrid.map(row => row.map(val => `
                            <div class="youxi-2048-cell ${val > 0 ? 'filled' : ''}" data-value="${val}">
                                <span class="youxi-2048-num">${val || ''}</span>
                            </div>
                        `).join('')).join('')}
                    </div>
                    ${userGameOver && !gameResult ? `<div class="youxi-game-over">你输了！</div>` : ''}
                </div>
                <div class="youxi-char-pip">
                    <div class="youxi-pip-header">
                        <span class="youxi-pip-title">${escapeHtml(invitedRole?.nickname || invitedRole?.realName || '角色')}</span>
                        <span class="youxi-pip-score" id="pipScoreChar">${charScore}</span>
                    </div>
                    <div class="youxi-2048-grid youxi-pip-grid" id="gridChar">
                        ${charGrid.map(row => row.map(val => `
                            <div class="youxi-2048-cell ${val > 0 ? 'filled' : ''}" data-value="${val}">
                                <span class="youxi-2048-num">${val || ''}</span>
                            </div>
                        `).join('')).join('')}
                    </div>
                    ${charGameOver && !gameResult ? `<div class="youxi-pip-over">角色输了</div>` : ''}
                </div>
            </div>
            `;
        }
        return `
        <div class="youxi-game-page">
            <div class="youxi-page-header">
                <span class="youxi-page-title">2048</span>
                <button class="youxi-new-game-btn" data-action="new2048">新游戏</button>
            </div>
            <div class="youxi-score-board">
                <div class="youxi-score-card">
                    <div class="youxi-score-label">分数</div>
                    <div class="youxi-score-value" id="score2048">${userScore}</div>
                </div>
            </div>
            <div class="youxi-2048-grid" id="grid2048">
                ${userGrid.map(row => row.map(val => `
                    <div class="youxi-2048-cell ${val > 0 ? 'filled' : ''}" data-value="${val}">
                        <span class="youxi-2048-num">${val || ''}</span>
                    </div>
                `).join('')).join('')}
            </div>
            ${userGameOver ? `<div class="youxi-game-over">游戏结束！<button class="youxi-retry-btn" data-action="new2048">再来一局</button></div>` : ''}
        </div>
        `;
    }

    function refresh2048View() {
        const content = getModalElements()?.content;
        if (!content || currentGame !== '2048') return;

        if (gameMode === 'multi') {
            const gridUser = content.querySelector('#gridUser');
            if (gridUser) {
                gridUser.innerHTML = userGrid.map(row => row.map(val => `
                    <div class="youxi-2048-cell ${val > 0 ? 'filled' : ''}" data-value="${val}">
                        <span class="youxi-2048-num">${val || ''}</span>
                    </div>
                `).join('')).join('');
            }
            const gridChar = content.querySelector('#gridChar');
            if (gridChar) {
                gridChar.innerHTML = charGrid.map(row => row.map(val => `
                    <div class="youxi-2048-cell ${val > 0 ? 'filled' : ''}" data-value="${val}">
                        <span class="youxi-2048-num">${val || ''}</span>
                    </div>
                `).join('')).join('');
            }
            const scoreUser = content.querySelector('#scoreUser');
            const scoreChar = content.querySelector('#scoreChar');
            const pipScoreChar = content.querySelector('#pipScoreChar');
            if (scoreUser) scoreUser.textContent = userScore;
            if (scoreChar) scoreChar.textContent = charScore;
            if (pipScoreChar) pipScoreChar.textContent = charScore;

            const turnBadge = content.querySelector('.youxi-turn-badge');
            if (turnBadge && !gameResult && !userGameOver && !charGameOver) {
                turnBadge.className = `youxi-turn-badge p${currentTurn}`;
                turnBadge.textContent = `当前回合：${currentTurn === 1 ? '你' : (invitedRole?.nickname || invitedRole?.realName || '角色')}`;
            }

            const resultText = content.querySelector('.youxi-result-text');
            if (resultText && gameResult) {
                resultText.textContent = gameResult;
                resultText.className = 'youxi-result-text win';
            }

            if (gameResult && !content.querySelector('.youxi-game-over')) {
                const existing = content.querySelector('.youxi-game-over');
                if (existing) existing.remove();
                const board = content.querySelector('.youxi-main-board');
                if (board) {
                    const div = document.createElement('div');
                    div.className = 'youxi-game-over';
                    div.innerHTML = `${gameResult}<button class="youxi-retry-btn" data-action="new2048">再来一局</button>`;
                    board.parentNode.insertBefore(div, board.nextSibling);
                }
            }
        } else {
            const gridEl = content.querySelector('#grid2048');
            if (gridEl) {
                gridEl.innerHTML = userGrid.map(row => row.map(val => `
                    <div class="youxi-2048-cell ${val > 0 ? 'filled' : ''}" data-value="${val}">
                        <span class="youxi-2048-num">${val || ''}</span>
                    </div>
                `).join('')).join('');
            }
            const scoreEl = content.querySelector('#score2048');
            if (scoreEl) scoreEl.textContent = userScore;
            let gameOverEl = content.querySelector('.youxi-game-over');
            if (userGameOver) {
                if (!gameOverEl) {
                    gameOverEl = document.createElement('div');
                    gameOverEl.className = 'youxi-game-over';
                    gameOverEl.innerHTML = `游戏结束！<button class="youxi-retry-btn" data-action="new2048">再来一局</button>`;
                    const gridParent = content.querySelector('#grid2048')?.parentNode;
                    if (gridParent) gridParent.appendChild(gameOverEl);
                    gameOverEl.querySelector('.youxi-retry-btn').onclick = () => {
                        initUser2048();
                        navigateTo(render2048Page());
                    };
                }
            } else {
                if (gameOverEl) gameOverEl.remove();
            }
        }
    }

    function bind2048Events(content) {
        const gridId = gameMode === 'multi' ? '#gridUser' : '#grid2048';
        const gridEl = content.querySelector(gridId);
        if (!gridEl) return;

        let touchStartX = 0, touchStartY = 0, touchStarted = false;

        gridEl.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStarted = true;
        }, { passive: true });

        gridEl.addEventListener('touchmove', (e) => {
            if (!touchStarted) return;
            const dx = e.touches[0].clientX - touchStartX;
            const dy = e.touches[0].clientY - touchStartY;
            if (Math.max(Math.abs(dx), Math.abs(dy)) > 10) {
                e.preventDefault();
            }
        }, { passive: false });

        gridEl.addEventListener('touchend', (e) => {
            if (!touchStarted) return;
            touchStarted = false;
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            if (Math.max(absDx, absDy) < 30) return;
            if (absDx > absDy) {
                handleUserMove(dx > 0 ? 'right' : 'left');
            } else {
                handleUserMove(dy > 0 ? 'down' : 'up');
            }
        });

        if (keydownHandler) {
            document.removeEventListener('keydown', keydownHandler);
        }
        keydownHandler = (e) => {
            if (currentGame !== '2048') {
                document.removeEventListener('keydown', keydownHandler);
                keydownHandler = null;
                return;
            }
            const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
            if (map[e.key]) {
                e.preventDefault();
                handleUserMove(map[e.key]);
            }
        };
        document.addEventListener('keydown', keydownHandler);
    }

    function handleUserMove(direction) {
        if (gameMode === 'multi') {
            if (currentTurn !== 1 || userGameOver || charGameOver || gameResult) return;
            const result = move2048(userGrid, direction);
            if (result.moved) {
                userScore += result.score;
                addRandom2048(userGrid);
                if (checkWin(userGrid)) {
                    userGameOver = true;
                    gameResult = '你达成2048！你获胜！';
                } else if (!canMove2048(userGrid)) {
                    userGameOver = true;
                    if (!gameResult) gameResult = '你无法移动，角色获胜！';
                }
                currentTurn = 2;
                refresh2048View();
                if (!gameResult && !charGameOver && !userGameOver) {
                    scheduleAiTurn();
                }
            }
        } else {
            if (userGameOver) return;
            const result = move2048(userGrid, direction);
            if (result.moved) {
                userScore += result.score;
                addRandom2048(userGrid);
                if (checkWin(userGrid)) {
                    userGameOver = true;
                } else if (!canMove2048(userGrid)) {
                    userGameOver = true;
                }
                refresh2048View();
            }
        }
    }

    // ==================== App Registration ====================
    window.APP_LIST[appKey] = {
        title: "游戏",
        html: renderMainPage(),
        onMount: function () {
            const els = getModalElements();
            if (!els) return;
            modalContent = els.content;
            closeBtn = els.closeBtn;
            modalTitle = els.title;
            currentGame = null;
            gameMode = 'single';
            invitedRole = null;
            currentTurn = 1;
            gameResult = null;
            userGameOver = false;
            charGameOver = false;

            if (modalTitle) modalTitle.textContent = "游戏";
            if (modalContent) modalContent.innerHTML = renderMainPage();
            bindCurrentPageEvents();

            if (closeBtn) {
                closeBtn.onclick = function () {
                    if (aiTimer) { clearTimeout(aiTimer); aiTimer = null; }
                    if (keydownHandler) { document.removeEventListener('keydown', keydownHandler); keydownHandler = null; }
                    window.closeApp();
                };
            }
        }
    };

    if (window.$.appModal) {
        window.$.appModal.addEventListener("click", function (e) {
            if (e.target === window.$.appModal) {
                if (aiTimer) { clearTimeout(aiTimer); aiTimer = null; }
                if (keydownHandler) { document.removeEventListener('keydown', keydownHandler); keydownHandler = null; }
                window.closeApp();
            }
        });
    }
});
