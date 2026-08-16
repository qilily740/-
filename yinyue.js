document.addEventListener('DOMContentLoaded', () => {
    const APP_KEY = "4";
    const PLAYLIST_KEY = 'yinyue_playlist';
    const CURRENT_KEY = 'yinyue_current';
    const MODE_KEY = 'yinyue_mode';

    let currentSong = null;
    let isPlaying = false;
    let currentTime = 0;
    let duration = 0;
    let playMode = 'list';
    let playlist = [];
    let currentIndex = -1;
    let showLyrics = false;
    let audio = null;
    let currentTab = 'discover';
    let likedSongs = {};
    let desktopLyricsVisible = false;
    let desktopLyricsPos = { x: 50, y: 80 };

    const mockSongs = [
        { id: 1, title: '晴天', artist: '周杰伦', album: '叶惠美', duration: 269, cover: '', url: '' },
        { id: 2, title: '稻香', artist: '周杰伦', album: '魔杰座', duration: 223, cover: '', url: '' },
        { id: 3, title: '夜曲', artist: '周杰伦', album: '十一月的肖邦', duration: 265, cover: '', url: '' },
        { id: 4, title: '演员', artist: '薛之谦', album: '绅士', duration: 270, cover: '', url: '' },
        { id: 5, title: '消愁', artist: '毛不易', album: '平凡的一天', duration: 275, cover: '', url: '' },
        { id: 6, title: '起风了', artist: '买辣椒也用券', album: '起风了', duration: 325, cover: '', url: '' },
        { id: 7, title: '告白气球', artist: '周杰伦', album: '周杰伦的床边故事', duration: 215, cover: '', url: '' },
        { id: 8, title: '体面', artist: '于文文', album: '体面', duration: 268, cover: '', url: '' },
        { id: 9, title: '成都', artist: '赵雷', album: '无法长大', duration: 328, cover: '', url: '' },
        { id: 10, title: '演员', artist: '薛之谦', album: '绅士', duration: 270, cover: '', url: '' }
    ];

    const mockPlaylists = [
        { id: 1, name: '每日推荐', playCount: '120万', cover: '' },
        { id: 2, name: '热歌榜', playCount: '340万', cover: '' },
        { id: 3, name: '新歌速递', playCount: '89万', cover: '' },
        { id: 4, name: '私人FM', playCount: '56万', cover: '' },
        { id: 5, name: '古典音乐', playCount: '23万', cover: '' },
        { id: 6, name: '民谣精选', playCount: '45万', cover: '' }
    ];

    const SVG = {
        search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
        music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
        discover: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
        podcast: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,
        mine: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
        nowPlaying: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
        play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
        pause: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
        prev: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>`,
        next: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>`,
        back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
        lyrics: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h12"/></svg>`,
        listLoop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>`,
        singleLoop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/><text x="12" y="14" font-size="8" fill="currentColor" text-anchor="middle">1</text></svg>`,
        shuffle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l5 5"/><path d="M4 4l5 5"/></svg>`
    };

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function getStorage(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }

    function setStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function initAudio() {
        if (!audio) {
            audio = new Audio();
            audio.addEventListener('timeupdate', () => {
                currentTime = audio.currentTime;
                updatePlayerUI();
            });
            audio.addEventListener('loadedmetadata', () => {
                duration = audio.duration || currentSong?.duration || 0;
                updatePlayerUI();
            });
            audio.addEventListener('ended', () => {
                playNext();
            });
            audio.addEventListener('play', () => {
                isPlaying = true;
                updatePlayerUI();
            });
            audio.addEventListener('pause', () => {
                isPlaying = false;
                updatePlayerUI();
            });
        }
    }

    function loadSong(song) {
        initAudio();
        currentSong = song;
        currentTime = 0;
        duration = song.duration || 0;
        setStorage(CURRENT_KEY, song);
        updatePlayerUI();
    }

    function togglePlay() {
        if (!currentSong) {
            if (playlist.length > 0) playSong(0);
            return;
        }
        initAudio();
        if (isPlaying) audio.pause();
        else audio.play().catch(() => {});
    }

    function playSong(index) {
        if (index < 0 || index >= playlist.length) return;
        currentIndex = index;
        loadSong(playlist[index]);
        initAudio();
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }

    function playNext() {
        if (playlist.length === 0) return;
        let nextIndex;
        if (playMode === 'random') nextIndex = Math.floor(Math.random() * playlist.length);
        else if (playMode === 'single') nextIndex = currentIndex;
        else nextIndex = (currentIndex + 1) % playlist.length;
        playSong(nextIndex);
    }

    function playPrev() {
        if (playlist.length === 0) return;
        let prevIndex;
        if (playMode === 'random') prevIndex = Math.floor(Math.random() * playlist.length);
        else if (playMode === 'single') prevIndex = currentIndex;
        else prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        playSong(prevIndex);
    }

    function toggleMode() {
        const modes = ['list', 'single', 'random'];
        const idx = modes.indexOf(playMode);
        playMode = modes[(idx + 1) % modes.length];
        setStorage(MODE_KEY, playMode);
        updatePlayerUI();
    }

    function getModeSvg() {
        if (playMode === 'single') return SVG.singleLoop;
        if (playMode === 'random') return SVG.shuffle;
        return SVG.listLoop;
    }

    function getModeTitle() {
        if (playMode === 'single') return '单曲循环';
        if (playMode === 'random') return '随机播放';
        return '列表循环';
    }

    function renderDiscover() {
        return `
            <div class="yy-page-content">
                <div class="yy-search-bar">
                    <div class="yy-search-input">
                        ${SVG.search}
                        <span>搜索音乐...</span>
                    </div>
                </div>
                <div class="yy-banner">
                    <div class="yy-banner-item active"><div class="yy-banner-text">每日推荐</div></div>
                    <div class="yy-banner-item"><div class="yy-banner-text">私人FM</div></div>
                    <div class="yy-banner-item"><div class="yy-banner-text">热歌榜</div></div>
                </div>
                <div class="yy-section">
                    <div class="yy-section-title">推荐歌单</div>
                    <div class="yy-playlist-grid">
                        ${mockPlaylists.map(pl => `
                            <div class="yy-playlist-card" data-playlist-id="${pl.id}">
                                <div class="yy-playlist-cover">${SVG.music}</div>
                                <div class="yy-playlist-name">${pl.name}</div>
                                <div class="yy-playlist-count">${pl.playCount}次播放</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="yy-section">
                    <div class="yy-section-title">热门歌曲</div>
                    <div class="yy-song-list">
                        ${mockSongs.map((song, idx) => `
                            <div class="yy-song-item" data-song-id="${song.id}" data-index="${idx}">
                                <div class="yy-song-index">${idx + 1}</div>
                                <div class="yy-song-info">
                                    <div class="yy-song-title">${song.title}</div>
                                    <div class="yy-song-meta">${song.artist} - ${song.album}</div>
                                </div>
                                <div class="yy-song-duration">${formatTime(song.duration)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    function renderPodcast() {
        return `
            <div class="yy-page-content">
                <div class="yy-section">
                    <div class="yy-section-title">推荐播客</div>
                    <div class="yy-podcast-list">
                        <div class="yy-podcast-item">
                            <div class="yy-podcast-cover">${SVG.music}</div>
                            <div class="yy-podcast-info">
                                <div class="yy-podcast-title">音乐故事</div>
                                <div class="yy-podcast-meta">25集 · 12万播放</div>
                            </div>
                        </div>
                        <div class="yy-podcast-item">
                            <div class="yy-podcast-cover">${SVG.music}</div>
                            <div class="yy-podcast-info">
                                <div class="yy-podcast-title">深夜电台</div>
                                <div class="yy-podcast-meta">48集 · 8万播放</div>
                            </div>
                        </div>
                        <div class="yy-podcast-item">
                            <div class="yy-podcast-cover">${SVG.music}</div>
                            <div class="yy-podcast-info">
                                <div class="yy-podcast-title">独立音乐</div>
                                <div class="yy-podcast-meta">32集 · 5万播放</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderMine() {
        return `
            <div class="yy-page-content">
                <div class="yy-mine-header">
                    <div class="yy-mine-avatar">${SVG.mine}</div>
                    <div class="yy-mine-name">我的音乐</div>
                </div>
                <div class="yy-section">
                    <div class="yy-mine-stats">
                        <div class="yy-mine-stat"><div class="yy-mine-stat-num">128</div><div class="yy-mine-stat-label">收藏</div></div>
                        <div class="yy-mine-stat"><div class="yy-mine-stat-num">56</div><div class="yy-mine-stat-label">关注</div></div>
                        <div class="yy-mine-stat"><div class="yy-mine-stat-num">12</div><div class="yy-mine-stat-label">歌单</div></div>
                    </div>
                </div>
                <div class="yy-section">
                    <div class="yy-section-title">我的歌单</div>
                    <div class="yy-my-playlists">
                        <div class="yy-my-playlist-item">${SVG.music} 我喜欢的音乐</div>
                        <div class="yy-my-playlist-item">${SVG.music} 最近播放</div>
                        <div class="yy-my-playlist-item">${SVG.music} 本地下载</div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderNowPlaying() {
        if (!currentSong) {
            return `
                <div class="yy-page-content">
                    <div class="yy-empty-state">
                        <div class="yy-empty-icon">${SVG.music}</div>
                        <div class="yy-empty-text">暂无正在播放的音乐</div>
                    </div>
                </div>
            `;
        }
        const song = currentSong;
        const modeTitle = getModeTitle();
        const isLiked = likedSongs[song.id];
        return `
            <div class="yy-page-content yy-now-page">
                <div class="yy-now-header">
                    <button class="yy-now-down" id="nowDownBtn">${SVG.down || '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m18 15-6-6-6 6\"/></svg>'}</button>
                </div>
                <div class="yy-now-center">
                    <div class="yy-vinyl-wrapper ${isPlaying ? 'playing' : ''}">
                        <div class="yy-vinyl">
                            <div class="yy-vinyl-inner">
                                <div class="yy-vinyl-label">${SVG.music}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="yy-now-info">
                    <div class="yy-now-title">${song.title}</div>
                    <div class="yy-now-artist">${song.artist}</div>
                </div>
                <div class="yy-now-progress">
                    <div class="yy-progress-bar" id="progressBar">
                        <div class="yy-progress-fill" style="width: ${duration > 0 ? (currentTime / duration * 100) : 0}%"></div>
                        <div class="yy-progress-handle" style="left: ${duration > 0 ? (currentTime / duration * 100) : 0}%"></div>
                    </div>
                    <div class="yy-progress-time">
                        <span>${formatTime(currentTime)}</span>
                        <span>${formatTime(duration)}</span>
                    </div>
                </div>
                <div class="yy-now-controls">
                    <button class="yy-now-ctrl" id="likeBtn" title="${isLiked ? '取消喜欢' : '喜欢'}">${isLiked ? '<svg viewBox=\"0 0 24 24\" fill=\"currentColor\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/></svg>' : '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/></svg>'}</button>
                    <button class="yy-now-ctrl" id="nowModeBtn" title="${modeTitle}">${getModeSvg()}</button>
                    <button class="yy-now-ctrl" id="nowPrevBtn">${SVG.prev}</button>
                    <button class="yy-now-ctrl yy-now-play" id="nowPlayBtn">${isPlaying ? SVG.pause : SVG.play}</button>
                    <button class="yy-now-ctrl" id="nowNextBtn">${SVG.next}</button>
                    <button class="yy-now-ctrl" id="lyricsBtn" title="${desktopLyricsVisible ? '关闭桌面歌词' : '桌面歌词'}">${SVG.lyrics}</button>
                </div>
                <div class="yy-now-queue-btn">
                    <button class="yy-queue-action" id="playlistBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                        <span>播放列表</span>
                    </button>
                </div>
            </div>
        `;
    }

    function renderPlayer() {
        if (!currentSong) return renderHome();
        const song = currentSong;
        const modeTitle = getModeTitle();
        const isLiked = likedSongs[song.id];
        return `
            <div class="yy-page yy-player-page">
                <div class="yy-player">
                    <div class="yy-player-header">
                        <button class="yy-back-btn" id="backBtn">${SVG.back}</button>
                        <div class="yy-player-header-center">
                            <div class="yy-player-title">${song.title}</div>
                            <div class="yy-player-artist">${song.artist}</div>
                        </div>
                        <button class="yy-share-btn" id="shareBtn">${SVG.share || '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'}</button>
                    </div>
                    <div class="yy-player-body">
                        <div class="yy-vinyl-wrapper ${isPlaying ? 'playing' : ''}">
                            <div class="yy-vinyl">
                                <div class="yy-vinyl-inner">
                                    <div class="yy-vinyl-label">${SVG.music}</div>
                                </div>
                            </div>
                        </div>
                        <div class="yy-player-info">
                            <div class="yy-info-primary">
                                <div class="yy-song-name">${song.title}</div>
                                <div class="yy-artist-name">${song.artist}</div>
                            </div>
                        </div>
                        <div class="yy-player-main">
                            <div class="yy-progress-section">
                                <div class="yy-progress-bar" id="progressBar">
                                    <div class="yy-progress-fill" style="width: ${duration > 0 ? (currentTime / duration * 100) : 0}%"></div>
                                    <div class="yy-progress-handle" style="left: ${duration > 0 ? (currentTime / duration * 100) : 0}%"></div>
                                </div>
                                <div class="yy-progress-time">
                                    <span>${formatTime(currentTime)}</span>
                                    <span>${formatTime(duration)}</span>
                                </div>
                            </div>
                            <div class="yy-controls-row">
                                <button class="yy-ctrl-btn ${isLiked ? 'liked' : ''}" id="likeBtn" title="${isLiked ? '取消喜欢' : '喜欢'}">${isLiked ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'}</button>
                                <button class="yy-ctrl-btn" id="modeBtn" title="${modeTitle}">${getModeSvg()}</button>
                                <button class="yy-ctrl-btn" id="prevBtn">${SVG.prev}</button>
                                <button class="yy-play-btn" id="playBtn">${isPlaying ? SVG.pause : SVG.play}</button>
                                <button class="yy-ctrl-btn" id="nextBtn">${SVG.next}</button>
                                <button class="yy-ctrl-btn" id="lyricsBtn" title="${desktopLyricsVisible ? '关闭桌面歌词' : '桌面歌词'}">${desktopLyricsVisible ? '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 6h16\"/><path d=\"M4 12h16\"/><path d=\"M4 18h12\"/></svg>' : '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 6h16\"/><path d=\"M4 12h16\"/><path d=\"M4 18h12\"/></svg>'}</button>
                            </div>
                            <div class="yy-secondary-actions">
                                <button class="yy-action-btn" id="playlistBtn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                                    <span>播放列表</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                ${renderTabBar()}
            </div>
        `;
    }

    function renderHome() {
        return `
            <div class="yy-page yy-home-page">
                ${currentTab === 'discover' ? renderDiscover() : ''}
                ${currentTab === 'podcast' ? renderPodcast() : ''}
                ${currentTab === 'nowplaying' ? renderNowPlaying() : ''}
                ${currentTab === 'mine' ? renderMine() : ''}
                ${renderTabBar()}
            </div>
        `;
    }

    function renderTabBar() {
        const tabs = [
            { key: 'discover', label: '发现', svg: SVG.discover },
            { key: 'podcast', label: '播客', svg: SVG.podcast },
            { key: 'nowplaying', label: '正在播放', svg: SVG.nowPlaying },
            { key: 'mine', label: '我的', svg: SVG.mine }
        ];
        return `
            <div class="yy-tab-bar">
                ${tabs.map(tab => `
                    <div class="yy-tab-item ${currentTab === tab.key ? 'active' : ''}" data-tab="${tab.key}">
                        <div class="yy-tab-icon">${tab.svg}</div>
                        <div class="yy-tab-label">${tab.label}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function updatePlayerUI() {
        const modal = document.querySelector('.app-modal');
        if (!modal) return;
        const content = modal.querySelector('.app-modal-content');
        if (!content) return;
        const isPlayerView = content.querySelector('.yy-player');
        if (isPlayerView) {
            content.innerHTML = renderPlayer();
            bindPlayerEvents(content);
        }
        updateDesktopLyrics();
    }

    function bindTabEvents(content) {
        content.querySelectorAll('.yy-tab-item').forEach(tab => {
            tab.addEventListener('click', () => {
                currentTab = tab.dataset.tab;
                refreshView(content);
            });
        });
    }

    function refreshView(content) {
        if (!content) return;
        const isPlayerView = content.querySelector('.yy-player');
        if (isPlayerView) {
            content.innerHTML = renderPlayer();
            bindPlayerEvents(content);
        } else {
            content.innerHTML = renderHome();
            bindHomeEvents(content);
        }
        bindTabEvents(content);
    }

    function bindHomeEvents(content) {
        content.querySelectorAll('.yy-song-item').forEach(item => {
            item.addEventListener('click', () => {
                const idx = parseInt(item.dataset.index, 10);
                if (!isNaN(idx) && mockSongs[idx]) {
                    playlist = [...mockSongs];
                    currentIndex = idx;
                    loadSong(mockSongs[idx]);
                    initAudio();
                    audio.currentTime = 0;
                    audio.play().catch(() => {});
                    content.innerHTML = renderPlayer();
                    bindPlayerEvents(content);
                }
            });
        });
        content.querySelectorAll('.yy-playlist-card').forEach(card => {
            card.addEventListener('click', () => {
                playlist = [...mockSongs];
                currentIndex = 0;
                loadSong(mockSongs[0]);
                initAudio();
                audio.currentTime = 0;
                audio.play().catch(() => {});
                content.innerHTML = renderPlayer();
                bindPlayerEvents(content);
            });
        });
        const likeBtn = content.querySelector('#likeBtn');
        if (likeBtn) {
            likeBtn.addEventListener('click', () => {
                if (!currentSong) return;
                if (likedSongs[currentSong.id]) {
                    delete likedSongs[currentSong.id];
                } else {
                    likedSongs[currentSong.id] = true;
                }
                setStorage('yinyue_liked', likedSongs);
                refreshView(content);
            });
        }
        const playBtn = content.querySelector('#nowPlayBtn');
        if (playBtn) playBtn.addEventListener('click', togglePlay);
        const prevBtn = content.querySelector('#nowPrevBtn');
        if (prevBtn) prevBtn.addEventListener('click', playPrev);
        const nextBtn = content.querySelector('#nowNextBtn');
        if (nextBtn) nextBtn.addEventListener('click', playNext);
        const modeBtn = content.querySelector('#nowModeBtn');
        if (modeBtn) modeBtn.addEventListener('click', toggleMode);
        const nowDownBtn = content.querySelector('#nowDownBtn');
        if (nowDownBtn) {
            nowDownBtn.addEventListener('click', () => {
                currentTab = 'nowplaying';
                content.innerHTML = renderHome();
                bindHomeEvents(content);
            });
        }
        const playlistBtn = content.querySelector('#playlistBtn');
        if (playlistBtn) {
            playlistBtn.addEventListener('click', () => {
                currentTab = 'nowplaying';
                content.innerHTML = renderHome();
                bindHomeEvents(content);
            });
        }
        const lyricsBtn = content.querySelector('#lyricsBtn');
        if (lyricsBtn) {
            lyricsBtn.addEventListener('click', () => {
                desktopLyricsVisible = !desktopLyricsVisible;
                toggleDesktopLyrics();
                refreshView(content);
            });
        }
        content.querySelectorAll('.yy-queue-item').forEach(item => {
            item.addEventListener('click', () => {
                const idx = parseInt(item.dataset.index, 10);
                if (!isNaN(idx)) {
                    playSong(idx);
                    refreshView(content);
                }
            });
        });
        bindTabEvents(content);
    }

    function bindPlayerEvents(content) {
        const backBtn = content.querySelector('#backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                content.innerHTML = renderHome();
                bindHomeEvents(content);
            });
        }
        const likeBtn = content.querySelector('#likeBtn');
        if (likeBtn) {
            likeBtn.addEventListener('click', () => {
                if (!currentSong) return;
                if (likedSongs[currentSong.id]) {
                    delete likedSongs[currentSong.id];
                } else {
                    likedSongs[currentSong.id] = true;
                }
                setStorage('yinyue_liked', likedSongs);
                refreshView(content);
            });
        }
        const playBtn = content.querySelector('#playBtn');
        if (playBtn) playBtn.addEventListener('click', togglePlay);
        const prevBtn = content.querySelector('#prevBtn');
        if (prevBtn) prevBtn.addEventListener('click', playPrev);
        const nextBtn = content.querySelector('#nextBtn');
        if (nextBtn) nextBtn.addEventListener('click', playNext);
        const modeBtn = content.querySelector('#modeBtn');
        if (modeBtn) modeBtn.addEventListener('click', toggleMode);
        const lyricsBtn = content.querySelector('#lyricsBtn');
        if (lyricsBtn) {
            lyricsBtn.addEventListener('click', () => {
                desktopLyricsVisible = !desktopLyricsVisible;
                toggleDesktopLyrics();
                refreshView(content);
            });
        }
        const playlistBtn = content.querySelector('#playlistBtn');
        if (playlistBtn) {
            playlistBtn.addEventListener('click', () => {
                currentTab = 'nowplaying';
                content.innerHTML = renderHome();
                bindHomeEvents(content);
            });
        }
        bindTabEvents(content);
    }

    function toggleDesktopLyrics() {
        let el = document.getElementById('yy-desktop-lyrics');
        if (desktopLyricsVisible) {
            if (!el) {
                el = document.createElement('div');
                el.id = 'yy-desktop-lyrics';
                el.innerHTML = currentSong ? `<span class="yy-dl-title">${currentSong.title}</span><span class="yy-dl-artist">${currentSong.artist}</span>` : '';
                el.style.cssText = `position:fixed;left:${desktopLyricsPos.x}px;top:${desktopLyricsPos.y}px;z-index:999999;background:rgba(0,0,0,0.75);color:#fff;padding:10px 16px;border-radius:24px;font-size:14px;backdrop-filter:blur(12px);cursor:move;user-select:none;display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,0.35);`;
                document.body.appendChild(el);
                let isDragging = false, startX = 0, startY = 0, origX = 0, origY = 0;
                el.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    const rect = el.getBoundingClientRect();
                    origX = rect.left;
                    origY = rect.top;
                });
                window.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;
                    el.style.left = (origX + dx) + 'px';
                    el.style.top = (origY + dy) + 'px';
                    desktopLyricsPos.x = origX + dx;
                    desktopLyricsPos.y = origY + dy;
                });
                window.addEventListener('mouseup', () => {
                    isDragging = false;
                    setStorage('yinyue_desktop_lyrics_pos', desktopLyricsPos);
                });
            }
            el.style.display = 'flex';
            if (currentSong) el.innerHTML = `<span class="yy-dl-title">${currentSong.title}</span><span class="yy-dl-artist">${currentSong.artist}</span>`;
        } else {
            if (el) el.style.display = 'none';
        }
    }

    function updateDesktopLyrics() {
        const el = document.getElementById('yy-desktop-lyrics');
        if (!el || !desktopLyricsVisible) return;
        if (currentSong) el.innerHTML = `<span class="yy-dl-title">${currentSong.title}</span><span class="yy-dl-artist">${currentSong.artist}</span>`;
    }

    window.APP_LIST[APP_KEY] = {
        title: "音乐",
        html: renderHome(),
        onMount: function () {
            const modal = document.querySelector('.app-modal');
            const content = modal.querySelector('.app-modal-content');
            const title = modal.querySelector('.app-modal-title');
            const closeBtn = modal.querySelector('.app-close-btn');
            if (title) title.textContent = "音乐";

            const saved = getStorage(PLAYLIST_KEY, []);
            if (saved.length > 0) playlist = saved;
            else playlist = [...mockSongs];

            const savedSong = getStorage(CURRENT_KEY, null);
            if (savedSong) {
                currentSong = savedSong;
                const idx = playlist.findIndex(s => s.id === savedSong.id);
                if (idx >= 0) currentIndex = idx;
            }
            playMode = getStorage(MODE_KEY, 'list');
            likedSongs = getStorage('yinyue_liked', {});
            desktopLyricsPos = getStorage('yinyue_desktop_lyrics_pos', desktopLyricsPos);

            initAudio();
            content.innerHTML = renderHome();
            bindHomeEvents(content);

            if (closeBtn) closeBtn.onclick = () => window.closeApp();
            if (window.$.appModal) {
                window.$.appModal.addEventListener("click", function (e) {
                    if (e.target === window.$.appModal) window.closeApp();
                });
            }
        }
    };
});
