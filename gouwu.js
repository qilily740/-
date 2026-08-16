document.addEventListener('DOMContentLoaded', () => {
    const gouwuModal = document.querySelector('.app-modal');
    const gouwuCloseBtn = gouwuModal ? gouwuModal.querySelector('.app-close-btn') : null;
    const gouwuTitle = gouwuModal ? gouwuModal.querySelector('.app-modal-title') : null;

    const merchantModal = document.querySelector('#merchantModal');
    const merchantCloseBtn = merchantModal ? merchantModal.querySelector('#merchantCloseBtn') : null;
    const merchantModalTitle = merchantModal ? merchantModal.querySelector('#merchantModalTitle') : null;
    const merchantModalContent = merchantModal ? merchantModal.querySelector('#merchantModalContent') : null;

    let gwSubPage = null;
    let gwMainHtml = null;
    let currentTab = 'products';
    let currentCategory = 0;
    let cartItems = [];
    let cartManageMode = false;
    let takeoutCategory = 0;

    const CATEGORIES = ['美妆', '图书', '珠宝', '服饰', '家居', '数码', '食品', '运动'];

    const PRODUCT_NAMES = {
        '美妆': ['口红', '粉底液', '眼影盘', '面膜', '精华液', '卸妆油'],
        '图书': ['小说集', '科普读物', '历史传记', '绘本', '杂志', '工具书'],
        '珠宝': ['项链', '手链', '耳环', '戒指', '吊坠', '胸针'],
        '服饰': ['T恤', '牛仔裤', '连衣裙', '运动鞋', '外套', '围巾'],
        '家居': ['台灯', '抱枕', '花瓶', '收纳盒', '地毯', '香薰'],
        '数码': ['耳机', '充电宝', '键盘', '鼠标', '数据线', '手机壳'],
        '食品': ['坚果', '咖啡', '蜂蜜', '茶叶', '巧克力', '饼干'],
        '运动': ['瑜伽垫', '哑铃', '运动水壶', '跳绳', '护膝', '运动包']
    };

    const PRODUCT_DESCRIPTIONS = {
        '美妆': ['丝滑哑光口红，持久显色', '轻薄透气的底妆神器', '璀璨眼影盘，百变妆容', '深层滋养补水面膜', '浓缩精华修护肌肤', '温和卸妆不刺激'],
        '图书': ['畅销小说全集', '科学探索之旅', '伟人传记故事', '精美绘本故事集', '时尚生活杂志', '实用工具手册'],
        '珠宝': ['精致项链，闪耀动人', '时尚手链，个性搭配', '优雅耳环，衬托气质', '经典戒指，永恒爱意', '灵动吊坠，轻盈飘逸', '复古胸针，点缀衣襟'],
        '服饰': ['纯棉舒适T恤', '经典直筒牛仔裤', '优雅气质连衣裙', '轻便运动鞋', '时尚保暖外套', '柔软保暖围巾'],
        '家居': ['简约现代台灯', '舒适抱枕，放松身心', '精致花瓶，装点生活', '多功能收纳盒', '柔软地毯，脚感舒适', '香薰蜡烛，舒缓心情'],
        '数码': ['无线蓝牙耳机', '大容量移动电源', '机械键盘，手感极佳', '精准鼠标，办公必备', '高速数据线', '时尚手机壳'],
        '食品': ['香脆坚果零食', '现磨咖啡豆', '天然蜂蜜，甜而不腻', '清香茶叶，回味悠长', '丝滑巧克力', '酥脆饼干'],
        '运动': ['加厚瑜伽垫', '可调节哑铃', '大容量运动水壶', '计数跳绳', '专业护膝保护', '多功能运动包']
    };

    function showToast(msg) {
        const old = document.querySelector('.ios-toast');
        if (old) old.remove();
        const t = document.createElement('div');
        t.className = 'ios-toast';
        t.innerText = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2200);
    }

    function randomPrice(min, max) {
        return (Math.random() * (max - min) + min).toFixed(2);
    }

    const TAB_CONFIG = {
        products: {
            label: '商品',
            color: '#ff3b30',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
            content: renderProductsPage
        },
        takeout: {
            label: '外卖',
            color: '#34c759',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
            content: renderTakeoutPage
        },
        cart: {
            label: '购物车',
            color: '#007aff',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
            content: renderCartPage
        },
        me: {
            label: '我',
            color: '#ff9500',
            icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
            content: renderMePage
        }
    };

    function getCategoryProducts(category) {
        const names = PRODUCT_NAMES[category] || ['商品'];
        const descriptions = PRODUCT_DESCRIPTIONS[category] || ['优质商品'];
        return names.map((name, i) => ({
            id: category + '_' + i,
            name: category + '·' + name,
            description: descriptions[i] || '优质商品',
            price: randomPrice(20, 300)
        }));
    }

    function isInCart(productId) {
        return cartItems.some(item => item.id === productId);
    }

    function addToCart(product) {
        if (isInCart(product.id)) {
            showToast('该商品已在购物车中');
            return;
        }
        cartItems.push({ ...product });
        showToast('已加入购物车');
    }

    function renderProductsPage() {
        const tabs = ['推荐', ...CATEGORIES];
        const activeIndex = currentCategory;

        const tabBarHtml = tabs.map((tab, idx) => {
            const isActive = idx === activeIndex;
            return `<button class="gouwu-category-tab ${isActive ? 'active' : ''}" data-index="${idx}" style="color:${isActive ? '#007aff' : '#8e8e93'};border-color:${isActive ? '#007aff' : '#e5e5ea'};background:${isActive ? '#f2f2f7' : '#fff'};">${tab}</button>`;
        }).join('');

        let contentHtml = '';
        if (activeIndex === 0) {
            contentHtml = [1,2,3,4,5,6].map(i => {
                const productId = 'recommend_' + i;
                const inCart = isInCart(productId);
                return `
                <div style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                    <div style="width:100%;aspect-ratio:1/1;background:#f2f2f7;display:flex;align-items:center;justify-content:center;color:#8e8e93;font-size:13px;padding:12px;text-align:center;">精选商品 ${i} 高品质好物推荐</div>
                    <div style="padding:10px 12px;">
                        <div style="font-size:14px;color:#1d1d1f;margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">精选商品 ${i}</div>
                        <div style="font-size:16px;font-weight:700;color:#ff3b30;margin-bottom:8px;">¥${randomPrice(20, 300)}</div>
                        <button class="gouwu-add-cart-btn ${inCart ? 'in-cart' : ''}" data-product-id="${productId}" data-product-name="精选商品 ${i}" data-product-price="${randomPrice(20, 300)}" style="width:100%;padding:8px;border-radius:8px;border:none;font-size:13px;cursor:pointer;background:${inCart ? '#f2f2f7' : '#007aff'};color:${inCart ? '#8e8e93' : '#fff'};">
                            ${inCart ? '已在购物车' : '加入购物车'}
                        </button>
                    </div>
                </div>
            `;
            }).join('');
        } else {
            const category = CATEGORIES[activeIndex - 1];
            const products = getCategoryProducts(category);
            contentHtml = products.map(p => {
                const inCart = isInCart(p.id);
                return `
                <div style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                    <div style="width:100%;aspect-ratio:1/1;background:#f2f2f7;display:flex;align-items:center;justify-content:center;color:#8e8e93;font-size:13px;padding:12px;text-align:center;">${p.description}</div>
                    <div style="padding:10px 12px;">
                        <div style="font-size:14px;color:#1d1d1f;margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name}</div>
                        <div style="font-size:16px;font-weight:700;color:#ff3b30;margin-bottom:8px;">¥${p.price}</div>
                        <button class="gouwu-add-cart-btn ${inCart ? 'in-cart' : ''}" data-product-id="${p.id}" data-product-name="${p.name}" data-product-price="${p.price}" style="width:100%;padding:8px;border-radius:8px;border:none;font-size:13px;cursor:pointer;background:${inCart ? '#f2f2f7' : '#007aff'};color:${inCart ? '#8e8e93' : '#fff'};">
                            ${inCart ? '已在购物车' : '加入购物车'}
                        </button>
                    </div>
                </div>
            `;
            }).join('');
        }

        return `<div style="padding:16px 0;">
            <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px;margin-bottom:16px;-webkit-overflow-scrolling:touch;scrollbar-width:none;">
                ${tabBarHtml}
            </div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
                ${contentHtml}
            </div>
        </div>`;
    }

    function renderCartPage() {
        const isEmpty = cartItems.length === 0;

        if (isEmpty) {
            return `<div style="padding:16px 0;">
                <div style="background:#fff;border-radius:14px;padding:40px 16px;text-align:center;color:#8e8e93;">
                    <div style="font-size:48px;margin-bottom:12px;">🛒</div>
                    <div style="font-size:15px;">购物车还是空的</div>
                    <div style="font-size:13px;margin-top:4px;">快去挑选心仪的商品吧</div>
                </div>
            </div>`;
        }

        const cartList = cartItems.map((item, idx) => `
            <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:0.5px solid #e5e5ea;">
                ${cartManageMode ? `<input type="checkbox" class="cart-item-checkbox" data-index="${idx}" style="accent-color:#007aff;width:18px;height:18px;flex-shrink:0;">` : ''}
                <div style="width:60px;height:60px;border-radius:10px;background:#f2f2f7;flex-shrink:0;"></div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:15px;color:#1d1d1f;margin-bottom:4px;">${item.name}</div>
                    <div style="font-size:14px;color:#8e8e93;">精选好物</div>
                </div>
                <div style="font-size:16px;font-weight:700;color:#1d1d1f;">¥${item.price}</div>
            </div>
        `).join('');

        return `<div style="padding:16px 0;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <button id="cartManageBtn" style="color:#007aff;background:none;border:none;font-size:15px;cursor:pointer;">
                    ${cartManageMode ? '完成' : '管理'}
                </button>
            </div>
            <div style="background:#fff;border-radius:14px;overflow:hidden;">
                ${cartList}
            </div>
            ${cartManageMode ? `<div style="margin-top:16px;background:#fff;border-radius:14px;overflow:hidden;">
                <div class="ios-cell" id="cartDeleteSelected" style="color:#ff3b30;justify-content:center;">
                    <span class="ios-cell-label">删除选中</span>
                </div>
            </div>` : ''}
        </div>`;
    }

    function renderTakeoutPage() {
        const categories = ['美食', '奶茶', '超市', '果蔬', '药品', '跑腿'];
        const activeCategory = categories[takeoutCategory] || categories[0];

        const categoryHtml = categories.map((cat, idx) => {
            const isActive = idx === takeoutCategory;
            return `<button class="gouwu-takeout-cat-btn ${isActive ? 'active' : ''}" data-index="${idx}" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 0;border:none;background:none;cursor:pointer;">
                <div style="width:48px;height:48px;border-radius:50%;background:${isActive ? '#e3f2fd' : '#f2f2f7'};display:flex;align-items:center;justify-content:center;font-size:22px;transition:all 0.15s;">${['🍔','🧋','🏪','🍎','💊','🏃'][idx]}</div>
                <span style="font-size:12px;color:${isActive ? '#007aff' : '#1d1d1f'};font-weight:${isActive ? '600' : '400'};">${cat}</span>
            </button>`;
        }).join('');

        const merchants = [
            { id: 'm1', name: '必胜客', category: '美食', rating: 4.8, time: '30分钟', delivery: 5, minOrder: 20, tags: ['满减', '优惠'], desc: '美味披萨，快速送达', products: [{ name: '超级至尊披萨', price: 89 }, { name: '新奥尔良烤翅', price: 29 }, { name: '意大利面', price: 39 }] },
            { id: 'm2', name: '星巴克', category: '奶茶', rating: 4.9, time: '25分钟', delivery: 6, minOrder: 35, tags: ['品质', '咖啡'], desc: '香浓咖啡，品质生活', products: [{ name: '拿铁咖啡', price: 32 }, { name: '美式咖啡', price: 25 }, { name: '星冰乐', price: 36 }] },
            { id: 'm3', name: '麦当劳', category: '美食', rating: 4.7, time: '20分钟', delivery: 4, minOrder: 15, tags: ['快餐', '优惠'], desc: '经典汉堡，美味实惠', products: [{ name: '巨无霸套餐', price: 38 }, { name: '麦辣鸡腿堡', price: 22 }, { name: '薯条', price: 12 }] },
            { id: 'm4', name: '海底捞', category: '美食', rating: 4.9, time: '45分钟', delivery: 8, minOrder: 50, tags: ['火锅', '品质'], desc: '新鲜食材，贴心服务', products: [{ name: '番茄锅底', price: 48 }, { name: '肥牛卷', price: 58 }, { name: '蔬菜拼盘', price: 28 }] },
            { id: 'm5', name: '瑞幸咖啡', category: '奶茶', rating: 4.6, time: '15分钟', delivery: 3, minOrder: 10, tags: ['咖啡', '新客'], desc: '现磨咖啡，新鲜送达', products: [{ name: '生椰拿铁', price: 28 }, { name: '美式咖啡', price: 19 }, { name: '卡布奇诺', price: 26 }] },
            { id: 'm6', name: '肯德基', category: '美食', rating: 4.7, time: '25分钟', delivery: 5, minOrder: 20, tags: ['炸鸡', '优惠'], desc: '香脆炸鸡，回味无穷', products: [{ name: '香辣鸡腿堡', price: 24 }, { name: '吮指原味鸡', price: 18 }, { name: '土豆泥', price: 8 }] }
        ];

        const filteredMerchants = activeCategory === '美食' ? merchants : merchants.filter(m => m.category === activeCategory);
        if (activeCategory === '美食' && filteredMerchants.length === 0) {
            // show all merchants for 美食 category
        }

        const merchantList = filteredMerchants.map(m => {
            const tagHtml = m.tags.map(t => `<span style="display:inline-block;padding:2px 6px;border-radius:4px;background:#fff3e0;color:#ff6b00;font-size:11px;margin-right:4px;">${t}</span>`).join('');
            return `
            <div class="ios-cell merchant-item" data-merchant-id="${m.id}" style="align-items:flex-start;cursor:pointer;">
                <div style="width:64px;height:64px;border-radius:10px;background:#f2f2f7;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:28px;">🏪</div>
                <div style="flex:1;min-width:0;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                        <span style="font-size:16px;font-weight:600;color:#1d1d1f;">${m.name}</span>
                        <span style="font-size:12px;color:#ff6b00;font-weight:600;">⭐ ${m.rating}</span>
                    </div>
                    <div style="font-size:13px;color:#8e8e93;margin-bottom:6px;">${m.desc}</div>
                    <div style="display:flex;gap:8px;margin-bottom:6px;flex-wrap:wrap;">
                        <span style="font-size:12px;color:#8e8e93;">🕐 ${m.time}</span>
                        <span style="font-size:12px;color:#8e8e93;">配送费¥${m.delivery}</span>
                        <span style="font-size:12px;color:#8e8e93;">起送¥${m.minOrder}</span>
                    </div>
                    <div>${tagHtml}</div>
                </div>
                <span class="ios-cell-arrow" style="margin-left:8px;flex-shrink:0;">›</span>
            </div>
        `;
        }).join('');

        return `<div style="padding:0 0 16px 0;">
            <div class="ios-group" style="margin-bottom:16px;">
                <div class="ios-group-title">搜索</div>
                <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f2f2f7;border-radius:10px;margin:0 16px 12px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <span style="flex:1;font-size:14px;color:#8e8e93;">搜索商家或商品</span>
                </div>
                <div style="display:flex;padding:0 8px 8px;">
                    ${categoryHtml}
                </div>
            </div>
            <div class="ios-group">
                <div class="ios-group-title">附近商家</div>
                ${merchantList}
            </div>
        </div>`;
    }

    function renderMePage() {
        const gouwu = window.appData?.gouwuUser || {};
        const avatar = (window.appData?.avatarUrl || '').trim();
        const displayName = (window.appData?.chatUserNickname || window.appData?.chatUserName || '').trim() || '用户';
        const level = (gouwu.level || '').trim() || '会员';
        const points = Number(gouwu.points) || 0;
        const orders = Number(gouwu.orders) || 0;
        const coupons = Number(gouwu.coupons) || 0;
        const balance = Number(gouwu.balance) || 0;

        const avatarBoxStyle = avatar
            ? `background-image:url(${avatar});background-size:cover;background-position:center;`
            : `background:#e5e5ea;`;

        const avatarInner = avatar
            ? ''
            : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

        return `<div style="margin:0 -12px;background:#f2f2f7;min-height:100%;">
            <div class="ios-group" style="margin-bottom:16px;">
                <div class="ios-cell" style="align-items:center;cursor:default;padding:28px 16px;min-height:100px;">
                    <div style="width:72px;height:72px;border-radius:50%;flex-shrink:0;${avatarBoxStyle};display:flex;align-items:center;justify-content:center;overflow:hidden;">${avatarInner}</div>
                    <div style="flex:1;min-width:0;margin-left:18px;">
                        <div style="font-size:22px;font-weight:600;color:#1d1d1f;margin-bottom:6px;">${displayName}</div>
                        <div style="display:inline-block;padding:3px 10px;background:#f2f2f7;color:#8e8e93;border-radius:10px;font-size:13px;">${level}</div>
                    </div>
                </div>
            </div>
            <div class="ios-group" style="margin-bottom:16px;">
                <div class="ios-cell" style="cursor:pointer;">
                    <span class="ios-cell-label">我的订单</span>
                    <span class="ios-cell-arrow">›</span>
                </div>
                <div class="ios-cell" style="cursor:pointer;">
                    <span class="ios-cell-label">优惠券</span>
                    <span class="ios-cell-arrow">›</span>
                </div>
                <div class="ios-cell" style="cursor:pointer;">
                    <span class="ios-cell-label">收货地址</span>
                    <span class="ios-cell-arrow">›</span>
                </div>
                <div class="ios-cell" style="cursor:pointer;">
                    <span class="ios-cell-label">设置</span>
                    <span class="ios-cell-arrow">›</span>
                </div>
            </div>
        </div>`;
    }

    function openMerchantDetail(merchantId) {
        const merchants = [
            { id: 'm1', name: '必胜客', category: '美食', rating: 4.8, time: '30分钟', delivery: 5, minOrder: 20, tags: ['满减', '优惠'], desc: '美味披萨，快速送达', products: [{ name: '超级至尊披萨', price: 89 }, { name: '新奥尔良烤翅', price: 29 }, { name: '意大利面', price: 39 }] },
            { id: 'm2', name: '星巴克', category: '奶茶', rating: 4.9, time: '25分钟', delivery: 6, minOrder: 35, tags: ['品质', '咖啡'], desc: '香浓咖啡，品质生活', products: [{ name: '拿铁咖啡', price: 32 }, { name: '美式咖啡', price: 25 }, { name: '星冰乐', price: 36 }] },
            { id: 'm3', name: '麦当劳', category: '美食', rating: 4.7, time: '20分钟', delivery: 4, minOrder: 15, tags: ['快餐', '优惠'], desc: '经典汉堡，美味实惠', products: [{ name: '巨无霸套餐', price: 38 }, { name: '麦辣鸡腿堡', price: 22 }, { name: '薯条', price: 12 }] },
            { id: 'm4', name: '海底捞', category: '美食', rating: 4.9, time: '45分钟', delivery: 8, minOrder: 50, tags: ['火锅', '品质'], desc: '新鲜食材，贴心服务', products: [{ name: '番茄锅底', price: 48 }, { name: '肥牛卷', price: 58 }, { name: '蔬菜拼盘', price: 28 }] },
            { id: 'm5', name: '瑞幸咖啡', category: '奶茶', rating: 4.6, time: '15分钟', delivery: 3, minOrder: 10, tags: ['咖啡', '新客'], desc: '现磨咖啡，新鲜送达', products: [{ name: '生椰拿铁', price: 28 }, { name: '美式咖啡', price: 19 }, { name: '卡布奇诺', price: 26 }] },
            { id: 'm6', name: '肯德基', category: '美食', rating: 4.7, time: '25分钟', delivery: 5, minOrder: 20, tags: ['炸鸡', '优惠'], desc: '香脆炸鸡，回味无穷', products: [{ name: '香辣鸡腿堡', price: 24 }, { name: '吮指原味鸡', price: 18 }, { name: '土豆泥', price: 8 }] }
        ];

        const merchant = merchants.find(m => m.id === merchantId);
        if (!merchant || !merchantModalContent) return;

        if (merchantModalTitle) merchantModalTitle.textContent = merchant.name;

        const productList = merchant.products.map((p, idx) => `
            <div class="ios-cell" style="align-items:center;cursor:default;">
                <div style="flex:1;min-width:0;">
                    <div style="font-size:15px;color:#1d1d1f;margin-bottom:4px;">${p.name}</div>
                    <div style="font-size:16px;font-weight:700;color:#ff3b30;">¥${p.price}</div>
                </div>
                <button class="gouwu-add-cart-btn" data-product-name="${p.name}" data-product-price="${p.price}" data-merchant-name="${merchant.name}" style="padding:8px 16px;border-radius:8px;border:none;font-size:13px;cursor:pointer;background:#007aff;color:#fff;">
                    加入购物车
                </button>
            </div>
        `).join('');

        merchantModalContent.innerHTML = `
            <div style="background:#fff;border-radius:14px;padding:20px;margin-bottom:16px;">
                <div style="display:flex;gap:12px;margin-bottom:12px;">
                    <div style="width:80px;height:80px;border-radius:10px;background:#f2f2f7;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:36px;">🏪</div>
                    <div style="flex:1;">
                        <div style="font-size:18px;font-weight:600;color:#1d1d1f;margin-bottom:4px;">${merchant.name}</div>
                        <div style="font-size:13px;color:#8e8e93;margin-bottom:4px;">${merchant.desc}</div>
                        <div style="display:flex;gap:8px;flex-wrap:wrap;">
                            <span style="font-size:12px;color:#8e8e93;">⭐ ${merchant.rating}</span>
                            <span style="font-size:12px;color:#8e8e93;">🕐 ${merchant.time}</span>
                            <span style="font-size:12px;color:#8e8e93;">配送费¥${merchant.delivery}</span>
                            <span style="font-size:12px;color:#8e8e93;">起送¥${merchant.minOrder}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="ios-group">
                <div class="ios-group-title">商品列表</div>
                ${productList}
            </div>
            <div style="margin-top:16px;background:#fff;border-radius:14px;overflow:hidden;">
                <div class="ios-cell" id="payNowBtn" style="color:#34c759;justify-content:center;">
                    <span class="ios-cell-label" style="font-weight:600;">立即付款</span>
                </div>
            </div>
        `;

        merchantModal.classList.add('show');

        merchantModalContent.querySelectorAll('.gouwu-add-cart-btn').forEach(btn => {
            btn.onclick = function() {
                const productName = this.dataset.productName;
                const productPrice = parseFloat(this.dataset.productPrice);
                const merchantName = this.dataset.merchantName;
                addToCart({ id: merchantId + '_' + productName, name: merchantName + '·' + productName, price: productPrice });
                showToast('已加入购物车');
            };
        });

        const payBtn = merchantModalContent.querySelector('#payNowBtn');
        if (payBtn) {
            payBtn.onclick = function() {
                showToast('支付功能开发中');
            };
        }
    }

    function closeMerchantDetail() {
        if (merchantModal) merchantModal.classList.remove('show');
    }

    function renderTabContent() {
        const modalContent = document.querySelector('.app-modal-content');
        if (!modalContent) return;

        const tab = TAB_CONFIG[currentTab];
        if (!tab) return;

        if (gouwuTitle) {
            if (currentTab === 'products') {
                gouwuTitle.innerHTML = `
                    <span>商品</span>
                    <button id="refreshProductsBtn" style="margin-left:8px;background:none;border:none;cursor:pointer;padding:4px;display:inline-flex;align-items:center;vertical-align:middle;color:#007aff;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    </button>
                `;
            } else if (currentTab === 'takeout') {
                gouwuTitle.innerHTML = `
                    <span>外卖</span>
                    <button id="refreshTakeoutBtn" style="margin-left:8px;background:none;border:none;cursor:pointer;padding:4px;display:inline-flex;align-items:center;vertical-align:middle;color:#007aff;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    </button>
                `;
            } else {
                gouwuTitle.textContent = tab.label;
            }
        }

        modalContent.style.display = 'flex';
        modalContent.style.flexDirection = 'column';
        modalContent.style.padding = '0';
        modalContent.style.overflow = 'hidden';

        const tabBarHtml = Object.keys(TAB_CONFIG).map(key => {
            const t = TAB_CONFIG[key];
            const isActive = currentTab === key;
            return `<button class="gouwu-tab-item ${isActive ? 'active' : ''}" data-tab="${key}" style="color:${isActive ? t.color : '#8e8e93'};">
                <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
                    ${t.icon}
                    <span style="font-size:10px;">${t.label}</span>
                </div>
            </button>`;
        }).join('');

        modalContent.innerHTML = `
            <div class="gouwu-content-scroll" style="flex:1;overflow-y:auto;padding:16px 12px;">
                ${tab.content()}
            </div>
            <div class="gouwu-tab-bar" style="display:flex;justify-content:space-around;align-items:center;background:#fff;border-top:0.5px solid #e5e5ea;padding:8px 0;padding-bottom:max(8px,env(safe-area-inset-bottom));flex-shrink:0;width:100%;box-sizing:border-box;position:sticky;bottom:0;z-index:10;">
                ${tabBarHtml}
            </div>
        `;

        modalContent.querySelectorAll('.gouwu-tab-item').forEach(btn => {
            btn.onclick = function() {
                const tabKey = this.dataset.tab;
                if (tabKey && TAB_CONFIG[tabKey]) {
                    currentTab = tabKey;
                    if (tabKey === 'cart') cartManageMode = false;
                    if (tabKey === 'takeout') takeoutCategory = 0;
                    renderTabContent();
                }
            };
        });

        modalContent.querySelectorAll('.gouwu-category-tab').forEach(tabBtn => {
            tabBtn.onclick = function() {
                currentCategory = parseInt(this.dataset.index);
                renderTabContent();
            };
        });

        modalContent.querySelectorAll('.gouwu-takeout-cat-btn').forEach(btn => {
            btn.onclick = function() {
                takeoutCategory = parseInt(this.dataset.index);
                renderTabContent();
            };
        });

        modalContent.querySelectorAll('.gouwu-add-cart-btn').forEach(btn => {
            btn.onclick = function() {
                const productId = this.dataset.productId;
                const productName = this.dataset.productName;
                const productPrice = parseFloat(this.dataset.productPrice);
                addToCart({ id: productId, name: productName, price: productPrice });
                renderTabContent();
            };
        });

        const refreshBtn = modalContent.querySelector('#refreshProductsBtn');
        if (refreshBtn) {
            refreshBtn.onclick = function() {
                refreshProducts();
            };
        }

        const refreshTakeoutBtn = modalContent.querySelector('#refreshTakeoutBtn');
        if (refreshTakeoutBtn) {
            refreshTakeoutBtn.onclick = function() {
                showToast('正在刷新商家...');
                setTimeout(() => {
                    showToast('商家列表已刷新');
                }, 500);
            };
        }

        modalContent.querySelectorAll('.merchant-item').forEach(item => {
            item.onclick = function() {
                const merchantId = this.dataset.merchantId;
                openMerchantDetail(merchantId);
            };
        });

        const manageBtn = modalContent.querySelector('#cartManageBtn');
        if (manageBtn) {
            manageBtn.onclick = function() {
                cartManageMode = !cartManageMode;
                renderTabContent();
            };
        }

        const deleteSelectedBtn = modalContent.querySelector('#cartDeleteSelected');
        if (deleteSelectedBtn) {
            deleteSelectedBtn.onclick = function() {
                const checkboxes = modalContent.querySelectorAll('.cart-item-checkbox:checked');
                if (checkboxes.length === 0) {
                    showToast('请先选择要删除的商品');
                    return;
                }
                const idxs = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index)).sort((a, b) => b - a);
                idxs.forEach(idx => {
                    if (idx >= 0 && idx < cartItems.length) {
                        cartItems.splice(idx, 1);
                    }
                });
                showToast('已删除 ' + idxs.length + ' 个商品');
                renderTabContent();
            };
        }

        const myOrdersBtn = modalContent.querySelector('#gouwuMyOrders');
        if (myOrdersBtn) {
            myOrdersBtn.onclick = function() {
                showToast('我的订单');
            };
        }

        const myCouponsBtn = modalContent.querySelector('#gouwuMyCoupons');
        if (myCouponsBtn) {
            myCouponsBtn.onclick = function() {
                showToast('优惠券');
            };
        }

        const myAddressBtn = modalContent.querySelector('#gouwuMyAddress');
        if (myAddressBtn) {
            myAddressBtn.onclick = function() {
                showToast('收货地址');
            };
        }

        const mySettingsBtn = modalContent.querySelector('#gouwuMySettings');
        if (mySettingsBtn) {
            mySettingsBtn.onclick = function() {
                showToast('设置');
            };
        }
    }

    async function refreshProducts() {
        showToast('正在刷新商品...');
        try {
            const cfg = window.appData?.shezhiConfig?.api;
            if (cfg?.baseUrl && cfg?.apiKey) {
                const base = cfg.baseUrl.replace(/\/+$/, "");
                const url = base.endsWith('/v1') ? base + '/chat/completions' : base + '/v1/chat/completions';
                const prompt = '请为以下8个商品分类各推荐3个热门商品，格式为：分类|商品名|描述|价格。分类包括：美妆、图书、珠宝、服饰、家居、数码、食品、运动。';
                const model = (typeof window.getApiModel === 'function') ? window.getApiModel('shopping') : (cfg.modelName || "gpt-3.5-turbo");
                const resp = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + cfg.apiKey
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [
                            { role: "system", content: "你是一个商品推荐助手，请严格按照格式回复。" },
                            { role: "user", content: prompt }
                        ],
                        stream: false
                    })
                });
                if (!resp.ok) throw new Error("HTTP " + resp.status);
                const data = await resp.json();
                const text = data.choices?.[0]?.message?.content || '';
                parseProductsFromAI(text);
            } else {
                mockRefreshProducts();
            }
        } catch (e) {
            console.error('刷新失败:', e);
            mockRefreshProducts();
        }
    }

    function parseProductsFromAI(text) {
        const lines = text.split('\n').filter(l => l.trim());
        const newProducts = {};
        lines.forEach(line => {
            const parts = line.split('|');
            if (parts.length >= 4) {
                const category = parts[0].trim();
                const name = parts[1].trim();
                const description = parts[2].trim();
                const price = parseFloat(parts[3].trim()) || randomPrice(20, 300);
                if (CATEGORIES.includes(category) && name) {
                    if (!newProducts[category]) newProducts[category] = [];
                    if (newProducts[category].length < 6) {
                        newProducts[category].push({ name, description, price });
                    }
                }
            }
        });
        Object.keys(newProducts).forEach(cat => {
            PRODUCT_NAMES[cat] = newProducts[cat].map(p => p.name);
            PRODUCT_DESCRIPTIONS[cat] = newProducts[cat].map(p => p.description);
        });
        showToast('商品已刷新');
        renderTabContent();
    }

    function mockRefreshProducts() {
        const adjectives = ['精选', '热门', '新品', '爆款', '特供'];
        CATEGORIES.forEach(cat => {
            const names = PRODUCT_NAMES[cat] || [];
            const newNames = names.map(name => {
                const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
                return adj + name;
            });
            PRODUCT_NAMES[cat] = newNames;
            PRODUCT_DESCRIPTIONS[cat] = newNames.map(name => '高品质' + name + '，限时优惠');
        });
        showToast('商品已刷新');
        renderTabContent();
    }

    window.APP_LIST["6"] = {
        title: '购物',
        html: `<div style="flex:1;display:flex;flex-direction:column;"></div>`,
        onMount: function () {
            gwSubPage = null;
            currentTab = 'products';
            currentCategory = 0;
            cartManageMode = false;
            cartItems = [];
            if (gouwuTitle) gouwuTitle.textContent = '商品';
            const modalContent = document.querySelector('.app-modal-content');
            if (modalContent) {
                if (!gwMainHtml) {
                    gwMainHtml = modalContent.innerHTML;
                }
                renderTabContent();
            }
        }
    };

    if (gouwuCloseBtn) {
        gouwuCloseBtn.onclick = function() {
            window.closeApp();
        };
    }

    if (merchantCloseBtn) {
        merchantCloseBtn.onclick = function() {
            closeMerchantDetail();
        };
    }

    function refreshMeTabIfActive() {
        if (currentTab === 'me') renderTabContent();
    }

    window.addEventListener('visibilitychange', () => {
        if (!document.hidden) refreshMeTabIfActive();
    });

    window.addEventListener('focus', refreshMeTabIfActive);
});
