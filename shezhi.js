document.addEventListener('DOMContentLoaded', function () {

    window.appData = window.appData || {};

    window.appData.shezhiConfig = window.appData.shezhiConfig || {
        api: {
            baseUrl: "",
            apiKey: "",
            modelName: ""
        },
        voice: {
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
            vibration: false
        },
        pushMsg: {
            enable: false,
            intervalMin: 60,
            promptText: ""
        },
        autoSummary: {
            enable: false,
            triggerCount: 20
        }
    };

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
        $shezhiModal.classList.remove('show');
        shezhiResetNav();
    };

    document.querySelectorAll('.shezhi-main-page .set-row').forEach(cell => {
        cell.onclick = function () {
            const pageKey = this.dataset.page;
            shezhiOpenSubPage(pageKey);
        };
    });

    function shezhiOpenSubPage(pageKey) {
        $shezhiBackBtn.classList.add('show');
        $shezhiSubTitle.classList.add('show');
        $shezhiMainTitle.classList.add('mask-hide');
        $shezhiCloseBtn.style.display = 'none';

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

    function renderShezhiSubPage(page) {
        const cfg = window.appData.shezhiConfig;
        let html = "";

        switch (page) {
            case "api":
                $shezhiSubTitle.textContent = "API设置";
                html = `
                <div class="set-block">
                    <div class="set-block-title">接口地址</div>
                    <div style="padding:12px 16px;">
                        <input class="shezhi-input" id="apiBaseUrl" placeholder="Base URL" value="${escapeHtml(cfg.api.baseUrl)}">
                    </div>
                    <div style="padding:12px 16px;">
                        <input class="shezhi-input" id="apiKey" placeholder="API Key" value="${escapeHtml(cfg.api.apiKey)}">
                    </div>
                    <div style="padding:12px 16px;">
                        <input class="shezhi-input" id="apiModel" placeholder="模型名称" value="${escapeHtml(cfg.api.modelName)}">
                    </div>
                </div>
                <div style="margin-top:16px;text-align:center;">
                    <button class="shezhi-save-btn" id="saveApiBtn">保存API配置</button>
                </div>
                `;
                break;

            case "voice":
                $shezhiSubTitle.textContent = "音色设置";
                html = `
                <div class="set-block">
                    <div class="set-block-title">音色ID</div>
                    <div style="padding:12px 16px;"><input class="shezhi-input" id="voiceId" value="${escapeHtml(cfg.voice.voiceId)}"></div>
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
                        <div class="set-row-label">开启消息通知</div>
                        <input type="checkbox" id="notifyEnable" ${cfg.notify.enable ? "checked" : ""}>
                    </div>
                    <div class="set-row">
                        <div class="set-row-label">提示音</div>
                        <input type="checkbox" id="notifySound" ${cfg.notify.sound ? "checked" : ""}>
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
                    <div class="set-block-title">触发提示词</div>
                    <div style="padding:12px 16px;"><textarea class="shezhi-textarea" id="pushPrompt">${escapeHtml(cfg.pushMsg.promptText)}</textarea></div>
                </div>
                <div style="margin-top:16px;text-align:center;">
                    <button class="shezhi-save-btn" id="savePushBtn">保存设置</button>
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
                document.querySelector('#saveApiBtn').onclick = () => {
                    cfg.api.baseUrl = document.querySelector('#apiBaseUrl').value.trim();
                    cfg.api.apiKey = document.querySelector('#apiKey').value.trim();
                    cfg.api.modelName = document.querySelector('#apiModel').value.trim();
                    window.saveData?.();
                    alert("API配置已保存");
                };
                break;
            case "voice":
                document.querySelector('#saveVoiceBtn').onclick = () => {
                    cfg.voice.voiceId = document.querySelector('#voiceId').value.trim();
                    cfg.voice.speed = Number(document.querySelector('#voiceSpeed').value);
                    cfg.voice.pitch = Number(document.querySelector('#voicePitch').value);
                    window.saveData?.();
                    alert("音色已保存");
                };
                break;
            case "keepAlive":
                document.querySelector('#saveKaBtn').onclick = () => {
                    cfg.keepAlive.enable = document.querySelector('#kaKeepAlive').checked;
                    cfg.keepAlive.interval = Number(document.querySelector('#kaInterval').value);
                    window.saveData?.();
                    alert("后台保活设置已保存");
                };
                break;
            case "notify":
                document.querySelector('#saveNotifyBtn').onclick = () => {
                    cfg.notify.enable = document.querySelector('#notifyEnable').checked;
                    cfg.notify.sound = document.querySelector('#notifySound').checked;
                    cfg.notify.vibration = document.querySelector('#notifyVib').checked;
                    window.saveData?.();
                    alert("消息提示已保存");
                };
                break;
            case "pushMsg":
                document.querySelector('#savePushBtn').onclick = () => {
                    cfg.pushMsg.enable = document.querySelector('#pushEnable').checked;
                    cfg.pushMsg.intervalMin = Number(document.querySelector('#pushInterval').value);
                    cfg.pushMsg.promptText = document.querySelector('#pushPrompt').value.trim();
                    window.saveData?.();
                    alert("主动发消息设置已保存");
                };
                break;
            case "autoSummary":
                document.querySelector('#saveSummaryBtn').onclick = () => {
                    cfg.autoSummary.enable = document.querySelector('#summaryEnable').checked;
                    cfg.autoSummary.triggerCount = Number(document.querySelector('#summaryCount').value);
                    window.saveData?.();
                    alert("自动总结已保存");
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
                            if (!confirm("确认导入？会覆盖现有全部数据！")) return;
                            window.appData = newData;
                            window.saveData?.();
                            window.renderAll?.();
                            alert("导入成功，页面刷新生效");
                        } catch (err) {
                            alert("JSON解析失败，文件损坏");
                        }
                    };
                    reader.readAsText(file);
                    this.value = "";
                };
                break;
        }
    }

});