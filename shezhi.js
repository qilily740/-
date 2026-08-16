    function showToast(msg) {
        const old = document.querySelector('.ios-toast');
        if (old) old.remove();
        const t = document.createElement('div');
        t.className = 'ios-toast';
        t.innerText = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2000);
    }

    function showConfirm(msg, onOk) {
        const old = document.querySelector('.ios-confirm-overlay');
        if (old) old.remove();
        const overlay = document.createElement('div');
        overlay.className = 'ios-confirm-overlay';
        overlay.innerHTML = `
            <div class="ios-confirm-box">
                <div class="ios-confirm-text">${msg.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
                <div class="ios-confirm-btns">
                    <button class="ios-confirm-cancel">取消</button>
                    <button class="ios-confirm-ok">确定</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('.ios-confirm-cancel').onclick = () => overlay.remove();
        overlay.querySelector('.ios-confirm-ok').onclick = () => { overlay.remove(); onOk(); };
    }

    document.addEventListener('DOMContentLoaded', function () {

    window.appData = window.appData || {};

    const defaultShezhiConfig = {
        api: {
            baseUrl: "",
            apiKey: "",
            modelName: "",
            models: [],
            sceneModels: {
                chat: "",
                summary: "",
                forum: "",
                shopping: ""
            }
        },
        apiProfiles: [],
        activeProfileId: "",
        voice: {
            baseUrl: "",
            apiKey: "",
            voiceId: "",
            speed: 1.0,
            pitch: 1.0
        },
        keepAlive: {
            enable: false,
            interval: 30
        },
        notify: {
            enable: false,
            sound: true,
            soundUrl: "",
            vibration: false
        },
        pushMsg: {
            enable: false,
            intervalMin: 60
        },
        prompts: {
            sets: [],
            activeId: ""
        },
        autoSummary: {
            enable: false,
            triggerCount: 20
        }
    };

    if (!window.appData.shezhiConfig) {
        window.appData.shezhiConfig = JSON.parse(JSON.stringify(defaultShezhiConfig));
    } else {
        window.appData.shezhiConfig = {
            ...defaultShezhiConfig,
            ...window.appData.shezhiConfig,
            api: {
                ...defaultShezhiConfig.api,
                ...(window.appData.shezhiConfig.api || {})
            }
        };
    }

    function getApiModel(scene) {
        const cfg = window.appData?.shezhiConfig?.api;
        if (!cfg) return "gpt-3.5-turbo";
        const sceneModels = cfg.sceneModels || {};
        const model = sceneModels[scene] || cfg.modelName || "gpt-3.5-turbo";
        return model;
    }

    window.getApiModel = getApiModel;

    ensureDefaultPrompt();

    const $shezhiModal = document.querySelector('#shezhiModal');
    const $shezhiBackBtn = document.querySelector('#shezhiBackBtn');
    const $shezhiMainPage = document.querySelector('.shezhi-main-page');
    const $shezhiSubPage = document.querySelector('.shezhi-sub-page');
    const $shezhiMainTitle = $shezhiModal.querySelector('.app-modal-title');
    const $shezhiSubTitle = $shezhiModal.querySelector('#shezhiSubTitle');
    const $shezhiCloseBtn = $shezhiModal.querySelector('.app-close-btn');

    window.openShezhiModal = function () {
        $shezhiModal.classList.add('show');
        shezhiResetNav();
    };

    function shezhiResetNav() {
        $shezhiBackBtn.classList.remove('show');
        $shezhiSubTitle.classList.remove('show');
        $shezhiMainTitle.classList.remove('mask-hide');
        $shezhiCloseBtn.style.display = 'block';

        $shezhiMainPage.style.display = 'block';
        $shezhiSubPage.style.display = 'none';
    }

    $shezhiBackBtn.onclick = function () {
        shezhiResetNav();
    };

    $shezhiCloseBtn.onclick = function () {
        if ($shezhiMainPage.style.display === 'none') {
            shezhiResetNav();
        } else {
            $shezhiModal.classList.remove('show');
            shezhiResetNav();
        }
    };

    document.querySelectorAll('.shezhi-main-page .set-row').forEach(cell => {
        cell.onclick = function () {
            const pageKey = this.dataset.page;
            shezhiOpenSubPage(pageKey);
        };
    });

    function shezhiOpenSubPage(pageKey) {
        $shezhiBackBtn.classList.remove('show');
        $shezhiSubTitle.classList.add('show');
        $shezhiMainTitle.classList.add('mask-hide');
        $shezhiCloseBtn.style.display = 'block';

        $shezhiMainPage.style.display = 'none';
        $shezhiSubPage.style.display = 'block';

        renderShezhiSubPage(pageKey);
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function getActivePrompt() {
        const cfg = window.appData.shezhiConfig;
        if (!cfg.prompts || !cfg.prompts.sets || cfg.prompts.sets.length === 0) {
            return "你是一个可爱的AI助手，请用温柔、可爱的语气回复用户。";
        }
        const active = cfg.prompts.sets.find(s => s.id === cfg.prompts.activeId);
        return active ? active.content : cfg.prompts.sets[0].content;
    }

    function ensureDefaultPrompt() {
        const cfg = window.appData.shezhiConfig;
        if (!cfg.prompts || !cfg.prompts.sets || cfg.prompts.sets.length === 0) {
            cfg.prompts = cfg.prompts || {};
            cfg.prompts.sets = [{
                id: Date.now().toString(),
                name: "默认",
                content: "你是一个可爱的AI助手，请用温柔、可爱的语气回复用户。"
            }];
            cfg.prompts.activeId = cfg.prompts.sets[0].id;
        }
    }

    function renderShezhiSubPage(page) {
        const cfg = window.appData.shezhiConfig;
        let html = "";

        switch (page) {
            case "api":
                $shezhiSubTitle.textContent = "API设置";
                const profiles = cfg.apiProfiles || [];
                const activeId = cfg.activeProfileId || "";
                const profileOptions = profiles.map(p => 
                    `<option value="${escapeHtml(p.id)}"${p.id === activeId ? ' selected' : ''}>${escapeHtml(p.name || '未命名')}</option>`
                ).join('');
                const currentProfile = profiles.find(p => p.id === activeId);
                const modelList = (currentProfile && currentProfile.models) || cfg.api.models || [];
                const modelOptions = modelList.map(m => 
                    `<option value="${escapeHtml(m)}"${m === cfg.api.modelName ? ' selected' : ''}>${escapeHtml(m)}</option>`
                ).join('');
                const sceneModels = cfg.api.sceneModels || {};
                const makeSceneOption = (sceneKey, label) => {
                    const current = sceneModels[sceneKey] || cfg.api.modelName || "";
                    return `<div style="display:flex;align-items:center;gap:8px;padding:8px 16px;">
                        <span style="width:80px;font-size:14px;color:#1d1d1f;flex-shrink:0;">${label}</span>
                        <select class="shezhi-select scene-model-select" data-scene="${sceneKey}" style="flex:1;">
                            <option value="">-- 默认 --</option>
                            ${modelList.map(m => `<option value="${escapeHtml(m)}"${m === current ? ' selected' : ''}>${escapeHtml(m)}</option>`).join('')}
                        </select>
                    </div>`;
                };
                html = `
                <div class="set-block">
                    <div class="set-block-title">配置选择</div>
                    <div style="padding:12px 16px;">
                        <select class="shezhi-select" id="apiProfileSelect" style="width:100%;">
                            <option value="">-- 选择配置 --</option>
                            ${profileOptions}
                        </select>
                    </div>
                    <div style="padding:0 16px 12px;display:flex;gap:8px;">
                        <input class="shezhi-input" id="profileNameInput" placeholder="新配置名称" style="flex:1;">
                        <button class="shezhi-btn-small" id="saveProfileBtn">保存为新配置</button>
                    </div>
                    <div style="padding:0 16px;display:flex;gap:8px;">
                        <button class="shezhi-btn-small" id="deleteProfileBtn" style="background:#ff3b30;">删除当前配置</button>
                    </div>
                </div>
                <div class="set-block" style="margin-top:12px;">
                    <div class="set-block-title">接口地址</div>
                    <div style="padding:12px 16px;">
                        <input class="shezhi-input" id="apiBaseUrl" placeholder="Base URL" value="${escapeHtml(cfg.api.baseUrl)}">
                    </div>
                    <div style="padding:12px 16px;">
                        <input class="shezhi-input" id="apiKey" placeholder="API Key" value="${escapeHtml(cfg.api.apiKey)}">
                    </div>
                    <div class="set-block-title">模型列表</div>
                    <div style="padding:12px 16px;display:flex;gap:8px;">
                        <select class="shezhi-select" id="apiModelSelect" style="flex:1;">
                            <option value="">-- 选择模型 --</option>
                            ${modelOptions}
                        </select>
                        <button class="shezhi-btn-small" id="fetchModelsBtn" style="background:#007aff;">拉取</button>
                    </div>
                    <div style="padding:0 16px 12px;display:flex;gap:8px;">
                        <input class="shezhi-input" id="newModelInput" placeholder="输入模型名称" style="flex:1;">
                        <button class="shezhi-btn-small" id="saveModelBtn">保存模型</button>
                    </div>
                    <div style="padding:0 16px;display:flex;gap:8px;">
                        <select class="shezhi-select" id="apiModelSelect2" style="flex:1;">
                            <option value="">-- 选择要删除的模型 --</option>
                            ${modelOptions}
                        </select>
                        <button class="shezhi-btn-small" id="deleteModelBtn" style="background:#ff3b30;">删除</button>
                    </div>
                </div>
                <div class="set-block" style="margin-top:12px;">
                    <div class="set-block-title">场景模型配置</div>
                    ${makeSceneOption('chat', '聊天')}
                    ${makeSceneOption('summary', '自动总结')}
                    ${makeSceneOption('forum', '论坛')}
                    ${makeSceneOption('shopping', '购物')}
                </div>
                <div style="margin-top:16px;text-align:center;">
                    <button class="shezhi-save-btn" id="saveApiBtn">保存当前配置</button>
                </div>
                `;
                break;

            case "voice":
                $shezhiSubTitle.textContent = "音色设置";
                html = `
                <div class="set-block">
                    <div class="set-block-title">接口地址</div>
                    <div style="padding:12px 16px;">
                        <input class="shezhi-input" id="voiceBaseUrl" placeholder="Base URL" value="${escapeHtml(cfg.voice.baseUrl || '')}">
                    </div>
                    <div style="padding:12px 16px;">
                        <input class="shezhi-input" id="voiceApiKey" placeholder="API Key" value="${escapeHtml(cfg.voice.apiKey || '')}">
                    </div>
                    <div class="set-block-title">音色ID</div>
                    <div style="padding:12px 16px;">
                        <input class="shezhi-input" id="voiceId" placeholder="音色ID" value="${escapeHtml(cfg.voice.voiceId)}">
                    </div>
                    <div style="padding:12px 16px;display:flex;gap:8px;">
                            <select class="shezhi-select" id="voiceModelSelect">
                            <option value="">-- 选择模型 --</option>
                        </select>
                        <button class="shezhi-btn-small" id="fetchVoiceModelsBtn">拉取</button>
                    </div>
                    <div class="set-block-title">语速 ${cfg.voice.speed}</div>
                    <div style="padding:0 16px;"><input type="range" id="voiceSpeed" min="0.5" max="2" step="0.1" value="${cfg.voice.speed}"></div>
                    <div class="set-block-title">音调 ${cfg.voice.pitch}</div>
                    <div style="padding:0 16px;"><input type="range" id="voicePitch" min="0.5" max="2" step="0.1" value="${cfg.voice.pitch}"></div>
                </div>
                <div style="margin-top:16px;text-align:center;">
                    <button class="shezhi-save-btn" id="saveVoiceBtn">保存音色</button>
                </div>
                `;
                break;

            case "keepAlive":
                $shezhiSubTitle.textContent = "后台保活";
                html = `
                <div class="set-block">
                    <div class="set-row">
                        <div class="set-row-label">开启后台保活</div>
                        <input type="checkbox" id="kaKeepAlive" ${cfg.keepAlive.enable ? "checked" : ""}>
                    </div>
                    <div class="set-block-title">轮询间隔(秒)</div>
                    <div style="padding:12px 16px;"><input class="shezhi-input" id="kaInterval" type="number" value="${cfg.keepAlive.interval}"></div>
                </div>
                <div style="margin-top:16px;text-align:center;">
                    <button class="shezhi-save-btn" id="saveKaBtn">保存设置</button>
                </div>
                `;
                break;

            case "notify":
                $shezhiSubTitle.textContent = "消息提示";
                html = `
                <div class="set-block">
                    <div class="set-row">
                        <div class="set-row-label">弹窗通知</div>
                        <input type="checkbox" id="notifyEnable" ${cfg.notify.enable ? "checked" : ""}>
                    </div>
                    <div class="set-row">
                        <div class="set-row-label">提示音</div>
                        <div style="display:flex;gap:8px;align-items:center;">
                            <button class="shezhi-btn-small" id="uploadSoundBtn">上传音频</button>
                            <button class="shezhi-btn-small" id="testSoundBtn" style="background:#5856d6;">测试</button>
                        </div>
                    </div>
                    <div id="soundName" style="padding:4px 16px;font-size:13px;color:#8e8e93;">
                        ${cfg.notify.soundUrl ? '已上传提示音' : '未上传提示音'}
                    </div>
                    <div class="set-row">
                        <div class="set-row-label">震动</div>
                        <input type="checkbox" id="notifyVib" ${cfg.notify.vibration ? "checked" : ""}>
                    </div>
                </div>
                <div style="margin-top:16px;text-align:center;">
                    <button class="shezhi-save-btn" id="saveNotifyBtn">保存设置</button>
                </div>
                `;
                break;

            case "pushMsg":
                $shezhiSubTitle.textContent = "主动发消息";
                html = `
                <div class="set-block">
                    <div class="set-row">
                        <div class="set-row-label">允许主动推送消息</div>
                        <input type="checkbox" id="pushEnable" ${cfg.pushMsg.enable ? "checked" : ""}>
                    </div>
                    <div class="set-block-title">间隔(分钟)</div>
                    <div style="padding:12px 16px;"><input class="shezhi-input" id="pushInterval" type="number" value="${cfg.pushMsg.intervalMin}"></div>
                </div>
                <div style="margin-top:16px;text-align:center;">
                    <button class="shezhi-save-btn" id="savePushBtn">保存设置</button>
                </div>
                `;
                break;

            case "prompts":
                $shezhiSubTitle.textContent = "提示词";
                const promptSets = cfg.prompts.sets || [];
                const promptActiveId = cfg.prompts.activeId || "";
                html = `
                <div class="set-block">
                    <div class="set-block-title">提示词列表</div>
                    <div id="promptList">
                        ${promptSets.map(s => `
                            <div class="set-row prompt-set-row" data-id="${escapeHtml(s.id)}">
                                <div class="set-row-label">${escapeHtml(s.name)}${s.id === promptActiveId ? ' (当前)' : ''}</div>
                                <div class="set-row-arrow">›</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div style="margin-top:16px;display:flex;gap:10px;">
                    <button class="shezhi-save-btn" id="createPromptBtn" style="flex:1;">新建提示词</button>
                </div>
                `;
                break;

            case "autoSummary":
                $shezhiSubTitle.textContent = "自动总结";
                html = `
                <div class="set-block">
                    <div class="set-row">
                        <div class="set-row-label">开启对话自动总结</div>
                        <input type="checkbox" id="summaryEnable" ${cfg.autoSummary.enable ? "checked" : ""}>
                    </div>
                    <div class="set-block-title">消息条数触发</div>
                    <div style="padding:12px 16px;"><input class="shezhi-input" id="summaryCount" type="number" value="${cfg.autoSummary.triggerCount}"></div>
                </div>
                <div style="margin-top:16px;text-align:center;">
                    <button class="shezhi-save-btn" id="saveSummaryBtn">保存设置</button>
                </div>
                `;
                break;

            case "importExport":
                $shezhiSubTitle.textContent = "导入导出数据";
                html = `
                <div class="set-block">
                    <div class="set-row" id="exportDataBtn">
                        <div class="set-row-label">导出全部数据(JSON)</div>
                        <div class="set-row-arrow">›</div>
                    </div>
                    <div class="set-row" id="importDataBtn">
                        <div class="set-row-label">导入JSON数据</div>
                        <div class="set-row-arrow">›</div>
                    </div>
                </div>
                <div style="margin-top:12px;color:#888;font-size:13px;padding:0 16px;">
                    警告：导入会覆盖当前本地全部数据，请先导出备份。
                </div>
                `;
                break;
        }
        $shezhiSubPage.innerHTML = html;
        bindShezhiSubEvents(page);
    }

    function bindShezhiSubEvents(page) {
        const cfg = window.appData.shezhiConfig;
        switch (page) {
            case "api":
                async function autoFetchModels() {
                    const baseUrl = document.querySelector('#apiBaseUrl')?.value.trim();
                    const apiKey = document.querySelector('#apiKey')?.value.trim();
                    if (!baseUrl || !apiKey) return;
                    const btn = document.querySelector('#fetchModelsBtn');
                    if (!btn) return;
                    const originalText = btn.textContent;
                    btn.textContent = "拉取中...";
                    btn.disabled = true;
                    try {
                        const url = baseUrl.replace(/\/$/, "") + "/models";
                        const resp = await fetch(url, {
                            headers: { "Authorization": "Bearer " + apiKey }
                        });
                        if (!resp.ok) throw new Error("HTTP " + resp.status);
                        const data = await resp.json();
                        const models = data.data || [];
                        const modelIds = models.map(m => m.id || m.name).filter(Boolean);
                        if (modelIds.length > 0) {
                            cfg.api.models = modelIds;
                            const profile = cfg.apiProfiles.find(p => p.id === cfg.activeProfileId);
                            if (profile) {
                                profile.models = modelIds;
                                if (!profile.modelName) profile.modelName = modelIds[0];
                                cfg.api.modelName = profile.modelName;
                            } else if (!cfg.api.modelName) {
                                cfg.api.modelName = modelIds[0];
                            }
                            window.saveData?.();
                            showToast(`自动拉取 ${modelIds.length} 个模型`);
                            shezhiOpenSubPage('api');
                        }
                    } catch (e) {
                        console.warn('自动拉取模型失败:', e.message);
                    } finally {
                        if (btn) {
                            btn.textContent = originalText;
                            btn.disabled = false;
                        }
                    }
                }

                document.querySelector('#saveApiBtn').onclick = () => {
                    try {
                        cfg.api.baseUrl = document.querySelector('#apiBaseUrl').value.trim();
                        cfg.api.apiKey = document.querySelector('#apiKey').value.trim();
                        const selectedModel = document.querySelector('#apiModelSelect').value;
                        if (selectedModel) cfg.api.modelName = selectedModel;
                        const nameInput = document.querySelector('#profileNameInput');
                        const name = nameInput.value.trim();
                        if (cfg.activeProfileId) {
                            const profile = cfg.apiProfiles.find(p => p.id === cfg.activeProfileId);
                            if (profile) {
                                if (name) profile.name = name;
                                profile.baseUrl = cfg.api.baseUrl;
                                profile.apiKey = cfg.api.apiKey;
                                profile.modelName = cfg.api.modelName;
                                profile.models = cfg.api.models || [];
                                profile.sceneModels = cfg.api.sceneModels || {};
                                window.saveData?.();
                                console.log('[API] 配置已更新:', { baseUrl: cfg.api.baseUrl, apiKey: cfg.api.apiKey ? '***' : '', modelName: cfg.api.modelName });
                                showToast("配置已更新");
                                nameInput.value = "";
                                shezhiOpenSubPage('api');
                                return;
                            }
                        }
                        if (!name) {
                            showToast("请输入配置名称");
                            return;
                        }
                        const profile = {
                            id: Date.now().toString(),
                            name: name,
                            baseUrl: cfg.api.baseUrl,
                            apiKey: cfg.api.apiKey,
                            modelName: cfg.api.modelName,
                            models: cfg.api.models || [],
                            sceneModels: cfg.api.sceneModels || {}
                        };
                        cfg.apiProfiles = cfg.apiProfiles || [];
                        cfg.apiProfiles.push(profile);
                        cfg.activeProfileId = profile.id;
                        window.saveData?.();
                        console.log('[API] 新配置已保存:', { name, baseUrl: cfg.api.baseUrl, apiKey: cfg.api.apiKey ? '***' : '', modelName: cfg.api.modelName });
                        showToast("配置已保存");
                        nameInput.value = "";
                        shezhiOpenSubPage('api');
                    } catch (e) {
                        console.error('[API] 保存失败:', e);
                        showToast("保存失败：" + e.message);
                    }
                };
                document.querySelector('#saveProfileBtn').onclick = () => {
                    try {
                        const nameInput = document.querySelector('#profileNameInput');
                        const name = nameInput.value.trim();
                        if (!name) {
                            showToast("请输入配置名称");
                            return;
                        }
                        const selectedModel = document.querySelector('#apiModelSelect').value;
                        const profile = {
                            id: Date.now().toString(),
                            name: name,
                            baseUrl: document.querySelector('#apiBaseUrl').value.trim(),
                            apiKey: document.querySelector('#apiKey').value.trim(),
                            modelName: selectedModel || "",
                            models: cfg.api.models || [],
                            sceneModels: cfg.api.sceneModels || {}
                        };
                        cfg.apiProfiles = cfg.apiProfiles || [];
                        cfg.apiProfiles.push(profile);
                        cfg.activeProfileId = profile.id;
                        cfg.api.baseUrl = profile.baseUrl;
                        cfg.api.apiKey = profile.apiKey;
                        cfg.api.modelName = profile.modelName;
                        cfg.api.models = profile.models;
                        cfg.api.sceneModels = profile.sceneModels;
                        window.saveData?.();
                        console.log('[API] profile已保存:', { name, baseUrl: profile.baseUrl, apiKey: profile.apiKey ? '***' : '', modelName: profile.modelName });
                        showToast("配置已保存");
                        shezhiOpenSubPage('api');
                    } catch (e) {
                        console.error('[API] 保存profile失败:', e);
                        showToast("保存失败：" + e.message);
                    }
                };
                document.querySelector('#apiProfileSelect').onchange = function() {
                    const id = this.value;
                    if (!id) return;
                    const profile = cfg.apiProfiles.find(p => p.id === id);
                    if (!profile) return;
                    cfg.activeProfileId = id;
                    cfg.api.baseUrl = profile.baseUrl;
                    cfg.api.apiKey = profile.apiKey;
                    cfg.api.modelName = profile.modelName;
                    cfg.api.models = profile.models || [];
                    cfg.api.sceneModels = profile.sceneModels || {};
                    document.querySelector('#apiBaseUrl').value = profile.baseUrl;
                    document.querySelector('#apiKey').value = profile.apiKey;
                    document.querySelector('#apiModelSelect').value = profile.modelName;
                    window.saveData?.();
                    shezhiOpenSubPage('api');
                    if (profile.baseUrl && profile.apiKey) {
                        autoFetchModels();
                    }
                };
                document.querySelector('#fetchModelsBtn').onclick = async () => {
                    const baseUrl = document.querySelector('#apiBaseUrl').value.trim();
                    const apiKey = document.querySelector('#apiKey').value.trim();
                    if (!baseUrl || !apiKey) {
                        showToast("请先填写Base URL和API Key");
                        return;
                    }
                    const btn = document.querySelector('#fetchModelsBtn');
                    const originalText = btn.textContent;
                    btn.textContent = "拉取中...";
                    btn.disabled = true;
                    try {
                        const url = baseUrl.replace(/\/$/, "") + "/models";
                        const resp = await fetch(url, {
                            headers: { "Authorization": "Bearer " + apiKey }
                        });
                        if (!resp.ok) throw new Error("HTTP " + resp.status);
                        const data = await resp.json();
                        const models = data.data || [];
                        const modelIds = models.map(m => m.id || m.name).filter(Boolean);
                        if (modelIds.length > 0) {
                            cfg.api.models = modelIds;
                            if (!cfg.api.modelName) cfg.api.modelName = modelIds[0];
                            const profile = cfg.apiProfiles.find(p => p.id === cfg.activeProfileId);
                            if (profile) {
                                profile.models = modelIds;
                                profile.modelName = cfg.api.modelName;
                            }
                            window.saveData?.();
                            showToast(`成功拉取 ${modelIds.length} 个模型`);
                            shezhiOpenSubPage('api');
                        } else {
                            showToast("未获取到模型列表");
                        }
                    } catch (e) {
                        showToast("拉取模型失败：" + e.message);
                    } finally {
                        btn.textContent = originalText;
                        btn.disabled = false;
                    }
                };
                document.querySelector('#apiModelSelect').onchange = function() {
                    if (this.value) {
                        cfg.api.modelName = this.value;
                        const profile = cfg.apiProfiles.find(p => p.id === cfg.activeProfileId);
                        if (profile) profile.modelName = this.value;
                        window.saveData?.();
                    }
                };
                document.querySelector('#saveModelBtn').onclick = () => {
                    const input = document.querySelector('#newModelInput');
                    const modelName = input.value.trim();
                    if (!modelName) {
                        showToast("请输入模型名称");
                        return;
                    }
                    cfg.api.models = cfg.api.models || [];
                    if (!cfg.api.models.includes(modelName)) {
                        cfg.api.models.push(modelName);
                    }
                    const profile = cfg.apiProfiles.find(p => p.id === cfg.activeProfileId);
                    if (profile) {
                        profile.models = cfg.api.models;
                        if (!profile.modelName) profile.modelName = modelName;
                    }
                    cfg.api.modelName = cfg.api.modelName || modelName;
                    window.saveData?.();
                    showToast("模型已添加");
                    input.value = "";
                    shezhiOpenSubPage('api');
                };
                document.querySelector('#deleteModelBtn').onclick = () => {
                    const select = document.querySelector('#apiModelSelect2');
                    const modelName = select.value;
                    if (!modelName) {
                        showToast("请选择要删除的模型");
                        return;
                    }
                    cfg.api.models = (cfg.api.models || []).filter(m => m !== modelName);
                    const profile = cfg.apiProfiles.find(p => p.id === cfg.activeProfileId);
                    if (profile) {
                        profile.models = cfg.api.models;
                        if (profile.modelName === modelName) {
                            profile.modelName = cfg.api.models[0] || "";
                            cfg.api.modelName = profile.modelName;
                        }
                    }
                    if (cfg.api.modelName === modelName) {
                        cfg.api.modelName = cfg.api.models[0] || "";
                    }
                    window.saveData?.();
                    showToast("模型已删除");
                    shezhiOpenSubPage('api');
                };
                document.querySelector('#deleteProfileBtn').onclick = () => {
                    if (!cfg.activeProfileId) {
                        showToast("请先选择一个配置");
                        return;
                    }
                    cfg.apiProfiles = cfg.apiProfiles.filter(p => p.id !== cfg.activeProfileId);
                    cfg.activeProfileId = "";
                    if (cfg.apiProfiles.length > 0) {
                        cfg.activeProfileId = cfg.apiProfiles[0].id;
                        const first = cfg.apiProfiles[0];
                        cfg.api.baseUrl = first.baseUrl;
                        cfg.api.apiKey = first.apiKey;
                        cfg.api.modelName = first.modelName;
                        cfg.api.models = first.models || [];
                        cfg.api.sceneModels = first.sceneModels || {};
                    } else {
                        cfg.api.baseUrl = "";
                        cfg.api.apiKey = "";
                        cfg.api.modelName = "";
                        cfg.api.models = [];
                        cfg.api.sceneModels = {};
                    }
                    window.saveData?.();
                    showToast("配置已删除");
                    shezhiOpenSubPage('api');
                };
                document.querySelectorAll('.scene-model-select').forEach(select => {
                    select.onchange = function() {
                        const scene = this.dataset.scene;
                        if (!scene) return;
                        cfg.api.sceneModels = cfg.api.sceneModels || {};
                        cfg.api.sceneModels[scene] = this.value;
                        const profile = cfg.apiProfiles.find(p => p.id === cfg.activeProfileId);
                        if (profile) {
                            profile.sceneModels = profile.sceneModels || {};
                            profile.sceneModels[scene] = this.value;
                        }
                        window.saveData?.();
                    };
                });
                setTimeout(() => autoFetchModels(), 0);
                break;
            case "voice":
                document.querySelector('#saveVoiceBtn').onclick = () => {
                    cfg.voice.baseUrl = document.querySelector('#voiceBaseUrl').value.trim();
                    cfg.voice.apiKey = document.querySelector('#voiceApiKey').value.trim();
                    cfg.voice.voiceId = document.querySelector('#voiceId').value.trim();
                    cfg.voice.speed = Number(document.querySelector('#voiceSpeed').value);
                    cfg.voice.pitch = Number(document.querySelector('#voicePitch').value);
                    window.saveData?.();
                    showToast("音色已保存");
                };
                document.querySelector('#fetchVoiceModelsBtn').onclick = async () => {
                    const baseUrl = document.querySelector('#voiceBaseUrl').value.trim();
                    const apiKey = document.querySelector('#voiceApiKey').value.trim();
                    if (!baseUrl || !apiKey) {
                        showToast("请先填写Base URL和API Key");
                        return;
                    }
                    const btn = document.querySelector('#fetchVoiceModelsBtn');
                    const originalText = btn.textContent;
                    btn.textContent = "拉取中...";
                    btn.disabled = true;
                    try {
                        const url = baseUrl.replace(/\/$/, "") + "/models";
                        const resp = await fetch(url, {
                            headers: { "Authorization": "Bearer " + apiKey }
                        });
                        if (!resp.ok) throw new Error("HTTP " + resp.status);
                        const data = await resp.json();
                        const models = data.data || [];
                        const select = document.querySelector('#voiceModelSelect');
                        select.innerHTML = '<option value="">-- 选择模型 --</option>' + 
                            models.map(m => `<option value="${escapeHtml(m.id || m.name)}">${escapeHtml(m.id || m.name)}</option>`).join("");
                        if (models.length > 0) {
                            document.querySelector('#voiceId').value = models[0].id || models[0].name;
                            showToast(`成功拉取 ${models.length} 个模型`);
                        } else {
                            showToast("未获取到模型列表");
                        }
                    } catch (e) {
                        showToast("拉取模型失败：" + e.message);
                    } finally {
                        btn.textContent = originalText;
                        btn.disabled = false;
                    }
                };
                document.querySelector('#voiceModelSelect').onchange = function() {
                    if (this.value) {
                        document.querySelector('#voiceId').value = this.value;
                    }
                };
                break;
            case "keepAlive":
                document.querySelector('#saveKaBtn').onclick = () => {
                    cfg.keepAlive.enable = document.querySelector('#kaKeepAlive').checked;
                    cfg.keepAlive.interval = Number(document.querySelector('#kaInterval').value);
                    window.saveData?.();
                    showToast("后台保活设置已保存");
                };
                break;
            case "notify":
                let soundFileInput = document.querySelector('#notifySoundFileInput');
                if (!soundFileInput) {
                    soundFileInput = document.createElement('input');
                    soundFileInput.type = 'file';
                    soundFileInput.id = 'notifySoundFileInput';
                    soundFileInput.accept = 'audio/*';
                    soundFileInput.style.display = 'none';
                    document.body.appendChild(soundFileInput);
                }
                document.querySelector('#saveNotifyBtn').onclick = () => {
                    cfg.notify.enable = document.querySelector('#notifyEnable').checked;
                    cfg.notify.vibration = document.querySelector('#notifyVib').checked;
                    window.saveData?.();
                    showToast("消息提示已保存");
                };
                document.querySelector('#uploadSoundBtn').onclick = () => {
                    soundFileInput.onchange = function(e) {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = function(ev) {
                            cfg.notify.soundUrl = ev.target.result;
                            const soundNameEl = document.querySelector('#soundName');
                            if (soundNameEl) soundNameEl.textContent = '已上传：' + file.name;
                            showToast("提示音已上传");
                        };
                        reader.readAsDataURL(file);
                        soundFileInput.value = '';
                    };
                    soundFileInput.click();
                };
                document.querySelector('#testSoundBtn').onclick = () => {
                    if (!cfg.notify.soundUrl) {
                        showToast("请先上传提示音");
                        return;
                    }
                    const audio = new Audio(cfg.notify.soundUrl);
                    audio.play().catch(() => showToast("播放失败"));
                };
                break;
            case "pushMsg":
                document.querySelector('#savePushBtn').onclick = () => {
                    cfg.pushMsg.enable = document.querySelector('#pushEnable').checked;
                    cfg.pushMsg.intervalMin = Number(document.querySelector('#pushInterval').value);
                    window.saveData?.();
                    showToast("主动发消息设置已保存");
                };
                break;

            case "prompts":
                let editingPromptId = null;
                function renderPromptEditor(promptId) {
                    editingPromptId = promptId;
                    const prompt = cfg.prompts.sets.find(s => s.id === promptId);
                    if (!prompt) return;
                    $shezhiSubTitle.textContent = prompt.name;
                    const promptTabs = cfg.prompts.sets.map(s => `
                        <button class="shezhi-tab-btn ${s.id === promptId ? 'active' : ''}" data-id="${escapeHtml(s.id)}">${escapeHtml(s.name)}</button>
                    `).join('');
                    $shezhiSubPage.innerHTML = `
                        <div class="set-block" style="padding:12px 16px;display:flex;gap:8px;overflow-x:auto;flex-wrap:nowrap;">
                            ${promptTabs}
                            <button class="shezhi-btn-small" id="addPromptTabBtn" style="flex-shrink:0;">+ 新增</button>
                        </div>
                        <div class="set-block">
                            <div class="set-block-title">名称</div>
                            <div style="padding:12px 16px;"><input class="shezhi-input" id="promptName" value="${escapeHtml(prompt.name)}"></div>
                            <div class="set-block-title">内容</div>
                            <div style="padding:12px 16px;"><textarea class="shezhi-textarea" id="promptContent">${escapeHtml(prompt.content)}</textarea></div>
                        </div>
                        <div style="margin-top:16px;display:flex;gap:10px;">
                            <button class="shezhi-save-btn" id="savePromptBtn" style="flex:1;">保存</button>
                            <button class="shezhi-save-btn" id="deletePromptBtn" style="flex:1;background:#ff3b30;">删除</button>
                        </div>
                        <div style="margin-top:10px;text-align:center;">
                            <button class="shezhi-btn-small" id="backPromptListBtn">返回列表</button>
                        </div>
                    `;
                    document.querySelectorAll('.shezhi-tab-btn').forEach(tab => {
                        tab.onclick = function() {
                            const id = this.dataset.id;
                            cfg.prompts.activeId = id;
                            window.saveData?.();
                            renderPromptEditor(id);
                        };
                    });
                    const addTabBtn = document.querySelector('#addPromptTabBtn');
                    if (addTabBtn) {
                        addTabBtn.onclick = () => {
                            const newId = Date.now().toString();
                            cfg.prompts.sets.push({
                                id: newId,
                                name: "未命名",
                                content: ""
                            });
                            cfg.prompts.activeId = newId;
                            window.saveData?.();
                            renderPromptEditor(newId);
                        };
                    }
                    document.querySelector('#savePromptBtn').onclick = () => {
                        prompt.name = document.querySelector('#promptName').value.trim() || "未命名";
                        prompt.content = document.querySelector('#promptContent').value.trim();
                        window.saveData?.();
                        showToast("提示词已保存");
                        shezhiOpenSubPage('prompts');
                    };
                    document.querySelector('#deletePromptBtn').onclick = () => {
                        if (cfg.prompts.sets.length <= 1) {
                            showToast("至少保留一个提示词");
                            return;
                        }
                        cfg.prompts.sets = cfg.prompts.sets.filter(s => s.id !== promptId);
                        if (cfg.prompts.activeId === promptId) {
                            cfg.prompts.activeId = cfg.prompts.sets[0].id;
                        }
                        window.saveData?.();
                        showToast("已删除");
                        shezhiOpenSubPage('prompts');
                    };
                    document.querySelector('#backPromptListBtn').onclick = () => {
                        shezhiOpenSubPage('prompts');
                    };
                }
                function renderPromptList() {
                    $shezhiSubTitle.textContent = "提示词";
                    const promptSets = cfg.prompts.sets || [];
                    const activeId = cfg.prompts.activeId || "";
                    $shezhiSubPage.innerHTML = `
                        <div class="set-block">
                            <div class="set-block-title">提示词列表</div>
                            <div id="promptList">
                                ${promptSets.map(s => `
                                    <div class="set-row prompt-set-row" data-id="${escapeHtml(s.id)}">
                                        <div class="set-row-label">${escapeHtml(s.name)}${s.id === activeId ? ' (当前)' : ''}</div>
                                        <div class="set-row-arrow">›</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div style="margin-top:16px;display:flex;gap:10px;">
                            <button class="shezhi-save-btn" id="createPromptBtn" style="flex:1;">新建提示词</button>
                        </div>
                    `;
                    document.querySelectorAll('.prompt-set-row').forEach(row => {
                        row.onclick = function() {
                            const id = this.dataset.id;
                            cfg.prompts.activeId = id;
                            window.saveData?.();
                            renderPromptEditor(id);
                        };
                    });
                    document.querySelector('#createPromptBtn').onclick = () => {
                        const newId = Date.now().toString();
                        cfg.prompts.sets.push({
                            id: newId,
                            name: "未命名",
                            content: ""
                        });
                        cfg.prompts.activeId = newId;
                        window.saveData?.();
                        renderPromptEditor(newId);
                    };
                }
                renderPromptList();
                break;
            case "autoSummary":
                document.querySelector('#saveSummaryBtn').onclick = () => {
                    cfg.autoSummary.enable = document.querySelector('#summaryEnable').checked;
                    cfg.autoSummary.triggerCount = Number(document.querySelector('#summaryCount').value);
                    window.saveData?.();
                    showToast("自动总结已保存");
                };
                break;
            case "importExport":
                document.querySelector('#exportDataBtn').onclick = function () {
                    const jsonStr = JSON.stringify(window.appData, null, 2);
                    const blob = new Blob([jsonStr], { type: "application/json" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "备份_" + new Date().toLocaleDateString() + ".json";
                    a.click();
                    URL.revokeObjectURL(a.href);
                };
                document.querySelector('#importDataBtn').onclick = function () {
                    document.querySelector('#importFileInput').click();
                };
                document.querySelector('#importFileInput').onchange = function (e) {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = function (ev) {
                        try {
                            const newData = JSON.parse(ev.target.result);
                            showConfirm("确认导入？会覆盖现有全部数据！", () => {
                                window.appData = newData;
                                window.saveData?.();
                                window.renderAll?.();
                                showToast("导入成功，页面刷新生效");
                            });
                        } catch (err) {
                            showToast("JSON解析失败，文件损坏");
                        }
                    };
                    reader.readAsText(file);
                    this.value = "";
                };
                break;
        }
    }

});