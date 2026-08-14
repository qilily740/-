document.addEventListener('DOMContentLoaded', () => {
    const $meihua = {
        wallModal: document.querySelector(".wallpaper-select-modal"),
        wallUrlInput: document.querySelector(".wall-url-input"),
        wallBtnUrl: document.querySelector(".wall-btn-url"),
        wallBtnLocal: document.querySelector(".wall-btn-local"),
        wallBtnCancel: document.querySelector(".wall-btn-cancel"),
        wallFileInput: document.querySelector("#wallFileInput"),
        imageSelectModal: document.querySelector(".image-select-modal"),
        imgUrlInput: document.querySelector(".img-url-input"),
        imgBtnUrl: document.querySelector(".img-btn-url"),
        imgBtnLocal: document.querySelector(".img-btn-local"),
        imgBtnCancel: document.querySelector(".img-btn-cancel"),
        imgFileInput: document.querySelector("#fileInput")
    }
    let editAppIndex = null;

    function showToast(msg) {
        const old = document.querySelector(".ios-toast");
        if (old) old.remove();
        const t = document.createElement("div");
        t.className = "ios-toast";
        t.innerText = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2200);
    }

    let currentWallpaperTarget = "";
    function openWallModal(target) {
        currentWallpaperTarget = target;
        if ($meihua.wallUrlInput) $meihua.wallUrlInput.value = "";
        if ($meihua.wallModal) $meihua.wallModal.classList.add("show");
    }
    function closeWallModal() {
        currentWallpaperTarget = "";
        if ($meihua.wallModal) $meihua.wallModal.classList.remove("show");
    }

    // 壁纸URL保存
    if ($meihua.wallBtnUrl) {
        $meihua.wallBtnUrl.onclick = () => {
            const url = $meihua.wallUrlInput.value.trim();
            if (!url) return;
            if (currentWallpaperTarget === "desktop") {
                window.appData.desktopWallpaper = url;
            }
            window.saveData();
            window.renderAll();
            closeWallModal();
            setTimeout(() => window.openApp("9"), 60);
        }
    }
    // 壁纸本地文件
    if ($meihua.wallBtnLocal && $meihua.wallFileInput) {
        $meihua.wallBtnLocal.onclick = () => {
            $meihua.wallFileInput.value = '';
            $meihua.wallFileInput.onchange = e => {
                const f = e.target.files[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = ev => {
                    const b64 = ev.target.result;
                    if (currentWallpaperTarget === "desktop") window.appData.desktopWallpaper = b64;
                    window.saveData();
                    window.renderAll();
                    closeWallModal();
                    setTimeout(() => window.openApp("9"), 60);
                }
                r.readAsDataURL(f);
            }
            $meihua.wallFileInput.click();
        }
    }
    if ($meihua.wallBtnCancel) $meihua.wallBtnCancel.onclick = closeWallModal;
    if ($meihua.wallModal) {
        $meihua.wallModal.addEventListener("click", e => {
            if (e.target === $meihua.wallModal) closeWallModal();
        })
    }

    // 打开APP图标修改弹窗
    function openImageSelectForApp(idx) {
        editAppIndex = idx;
        window.$.imageSelectTarget = { type: "appIcon", index: idx };
        if ($meihua.imgUrlInput) $meihua.imgUrlInput.value = "";
        if ($meihua.imageSelectModal) $meihua.imageSelectModal.classList.add("show");
    }

    // 完整关闭图片弹窗 清空标记解决停留
    function fullCloseImageModal() {
        editAppIndex = null;
        window.$.imageSelectTarget = null;
        if($meihua.imgUrlInput) $meihua.imgUrlInput.value = "";
        if($meihua.imgFileInput) $meihua.imgFileInput.value = "";
        if($meihua.imageSelectModal) $meihua.imageSelectModal.classList.remove("show");
    }

    // ==========长按桌面App图标触发换图标（新增判断编辑模式屏蔽）==========
    const desktopAppItems = document.querySelectorAll(".page1-apps-grid .app-item,.page2-apps-grid .app-item,.dock-bar .dock-item");
    desktopAppItems.forEach((el, idx) => {
        let pressTimer = null;
        //鼠标按下 / 触屏按下
        el.addEventListener("mousedown", (e)=>{
            // 拖拽编辑模式直接屏蔽长按
            if(window.isEditMode) return;
            pressTimer = setTimeout(()=>{
                e.preventDefault();
                e.stopPropagation();
                openImageSelectForApp(idx);
            },600); //长按600ms触发
        });
        el.addEventListener("mouseup", ()=> clearTimeout(pressTimer));
        el.addEventListener("mouseleave", ()=> clearTimeout(pressTimer));
        //兼容手机触屏
        el.addEventListener("touchstart",(e)=>{
            // 拖拽编辑模式直接屏蔽长按
            if(window.isEditMode) return;
            pressTimer = setTimeout(()=>{
                e.preventDefault();
                openImageSelectForApp(idx);
            },600);
        });
        el.addEventListener("touchend",()=> clearTimeout(pressTimer));
        el.addEventListener("touchcancel",()=> clearTimeout(pressTimer));
    });

    // APP图标URL保存
    if ($meihua.imgBtnUrl) {
        $meihua.imgBtnUrl.onclick = () => {
            const url = $meihua.imgUrlInput.value.trim();
            if (!url || !window.$.imageSelectTarget) return;
            const target = window.$.imageSelectTarget;
            if (target.type === "avatar") {
                window.appData.avatarUrl = url;
            } else if (target.type === "charAvatar") {
                window.appData.charAvatarUrl = url;
            } else if (target.type === "photo") {
                window.appData.photoCards[target.index] = url;
            } else if (target.type === "appIcon") {
                window.appData.appList[target.index].icon = url;
                showToast("图标已更新");
                //直接更新页面DOM
                const allIcons = document.querySelectorAll(".page1-apps-grid .app-icon,.page2-apps-grid .app-icon,.dock-bar .dock-icon");
                if(allIcons[target.index]){
                    allIcons[target.index].style.backgroundImage = `url(${window.appData.appList[target.index].icon})`;
                }
            }
            window.saveData();
            fullCloseImageModal();

            if(target.type === "appIcon"){
                window.renderAll();
                setTimeout(()=>{
                    window.closeApp();
                },100);
            }else{
                window.renderAll();
                if (editAppIndex !== null) renderAppEditPage();
            }
        }
    }

    // APP图标本地图片
    if ($meihua.imgBtnLocal && $meihua.imgFileInput) {
        $meihua.imgBtnLocal.onclick = () => {
            $meihua.imgFileInput.value = '';
            $meihua.imgFileInput.onchange = e => {
                const f = e.target.files[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = ev => {
                    const b64 = ev.target.result;
                    const target = window.$.imageSelectTarget;
                    if (target.type === "avatar") {
                        window.appData.avatarUrl = b64;
                    } else if (target.type === "charAvatar") {
                        window.appData.charAvatarUrl = b64;
                    } else if (target.type === "photo") {
                        window.appData.photoCards[target.index] = b64;
                    } else if (target.type === "appIcon") {
                        window.appData.appList[target.index].icon = b64;
                        showToast("图标已更新");
                        //直接更新页面DOM
                        const allIcons = document.querySelectorAll(".page1-apps-grid .app-icon,.page2-apps-grid .app-icon,.dock-bar .dock-icon");
                        if(allIcons[target.index]){
                            allIcons[target.index].style.backgroundImage = `url(${window.appData.appList[target.index].icon})`;
                        }
                    }
                    window.saveData();
                    fullCloseImageModal();

                    if(target.type === "appIcon"){
                        window.renderAll();
                        setTimeout(()=>{
                            window.closeApp();
                        },100);
                    }else{
                        window.renderAll();
                        if (editAppIndex !== null) renderAppEditPage();
                    }
                }
                r.readAsDataURL(f);
            }
            $meihua.imgFileInput.click();
        }
    }

    if ($meihua.imgBtnCancel) {
        $meihua.imgBtnCancel.onclick = fullCloseImageModal;
    }
    if ($meihua.imageSelectModal) {
        $meihua.imageSelectModal.addEventListener("click", e => {
            if (e.target === $meihua.imageSelectModal) fullCloseImageModal();
        })
    }

    // 应用编辑页面渲染
    function renderAppEditPage() {
        const content = document.querySelector('.app-modal-content');
        if(!content) return;
        let html = `<div class="ios-group"><div class="ios-group-title">点击图标更换图片；点击文字直接修改名称</div></div>`;
        html += `<div class="app-edit-grid">`;
        window.appData.appList.forEach((app, idx) => {
            html += `
            <div class="app-edit-item" data-app-idx="${idx}">
                <div class="app-edit-icon" style="background-image:url(${app.icon || ""})"></div>
                <div class="app-edit-name" contenteditable="true">${app.name}</div>
            </div>`;
        })
        html += `</div>`;
        content.innerHTML = html;
        content.querySelectorAll(".app-edit-icon").forEach(el => {
            el.onclick = function () {
                const i = Number(this.closest("[data-app-idx]").dataset.appIdx);
                openImageSelectForApp(i);
            }
        })
        content.querySelectorAll(".app-edit-name").forEach(el => {
            el.onblur = function () {
                const i = Number(this.closest("[data-app-idx]").dataset.appIdx);
                window.appData.appList[i].name = this.innerText.trim();
                window.saveData();
                window.renderAll();
                renderAppEditPage();
            }
        })
    }

    // 注册美化应用
    window.APP_LIST["9"] = {
        title: "美化设置",
        html: `
        <div class="ios-group">
            <div class="ios-group-title">壁纸管理</div>
            <div class="ios-cell" data-action="desktopWall">
                <span class="ios-cell-label">更换桌面壁纸</span>
                <span class="ios-cell-arrow">›</span>
            </div>
        </div>
        <div class="ios-group">
            <div class="ios-group-title">应用自定义</div>
            <div class="ios-cell" data-action="openAppIconList">
                <span class="ios-cell-label">修改应用名称与图标</span>
                <span class="ios-cell-arrow">›</span>
            </div>
        </div>
        `,
        onMount: function () {
            const modalContent = document.querySelector(".app-modal-content");
            modalContent.onclick = function (e) {
                const cell = e.target.closest(".ios-cell");
                if (!cell) return;
                const act = cell.dataset.action;
                switch (act) {
                    case "desktopWall":
                        openWallModal("desktop");
                        break;
                    case "toggleStatusBar":
                        window.appData.hideStatusBar = !window.appData.hideStatusBar;
                        window.saveData();
                        window.renderAll();
                        break;
                    case "openAppIconList":
                        renderAppEditPage();
                        break;
                }
            }
        }
    };
})