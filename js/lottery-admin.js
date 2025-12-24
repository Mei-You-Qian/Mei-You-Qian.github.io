(function () {
    const BASE_API = "https://lottery-api.19921461660.workers.dev";
    const ADMIN_API = `${BASE_API}/admin/status`;
    const STATS_API = `${BASE_API}/stats`;

    // 管理员Token - 实际使用时应该通过安全方式获取
    const ADMIN_TOKEN = prompt("请输入管理员密码：");

    if (!ADMIN_TOKEN) {
        document.body.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #ef4444;">
                <h2>❌ 访问被拒绝</h2>
                <p>需要管理员权限才能访问此页面</p>
            </div>
        `;
        return;
    }

    const statsSection = document.getElementById('statsSection');
    const participantListEl = document.getElementById('participantsList');
    const refreshBtn = document.getElementById('refreshBtn');
    const errorMessage = document.getElementById('errorMessage');

    // 带认证的API请求
    async function authenticatedFetch(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ADMIN_TOKEN}`,
            ...options.headers
        };

        return fetch(url, {
            ...options,
            headers
        });
    }

    // 获取管理员数据
    async function loadAdminData() {
        try {
            showLoading();

            const response = await authenticatedFetch(ADMIN_API);
            const data = await response.json();

            // 添加调试日志
            console.log('管理员API响应状态:', response.status);
            console.log('管理员API返回数据:', data);

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('管理员认证失败，请检查密码');
                }
                throw new Error(data.message || '获取管理员数据失败');
            }

            if (data.success) {
                displayAdminData(data);
            } else {
                throw new Error(data.message || '数据格式错误');
            }

        } catch (error) {
            console.error('加载管理员数据失败:', error);
            showError(error.message);
        } finally {
            hideLoading();
        }
    }

    // 获取统计数据
    async function loadStats() {
        try {
            const response = await fetch(STATS_API);
            const data = await response.json();

            if (response.ok && data.success) {
                updateStats(data);
            }
        } catch (error) {
            console.warn('获取统计数据失败:', error);
        }
    }

    // 显示管理员数据
    function displayAdminData(data) {
        console.log('开始显示管理员数据:', data);

        // 创建统计数据显示
        if (statsSection) {
            const count = data.count || 0;
            statsSection.innerHTML = `
                <div class="stat-item">
                    <div class="stat-number">${count}</div>
                    <div class="stat-label">总参与人数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${count}</div>
                    <div class="stat-label">独立IP数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${new Date().toLocaleString('zh-CN')}</div>
                    <div class="stat-label">最后更新</div>
                </div>
            `;
            console.log('设置统计数据:', count);
        }

        // 显示参与者列表 - 修复字段映射
        console.log('检查参与者列表:', {
            hasParticipantListEl: !!participantListEl,
            hasLatestData: !!data.latest,
            latestData: data.latest
        });

        if (participantListEl && data.latest) {
            console.log('调用displayParticipants，参与者数量:', data.latest.length);
            displayParticipants(data.latest);
        } else {
            console.log('未显示参与者列表，原因:', {
                noElement: !participantListEl,
                noData: !data.latest
            });
            // 如果没有数据，显示空状态
            if (participantListEl) {
                displayParticipants([]);
            }
        }
    }

    // 更新统计数据
    function updateStats(data) {
        if (statsSection) {
            const count = data.count || 0;
            statsSection.innerHTML = `
                <div class="stat-item">
                    <div class="stat-number">${count}</div>
                    <div class="stat-label">总参与人数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${count}</div>
                    <div class="stat-label">独立IP数</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${new Date().toLocaleString('zh-CN')}</div>
                    <div class="stat-label">最后更新</div>
                </div>
            `;
        }
    }

    // 显示参与者列表
    function displayParticipants(participants) {
        if (!participantListEl) return;

        if (!participants || participants.length === 0) {
            participantListEl.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #6b7280;">
                    <div style="font-size: 2rem; margin-bottom: 16px;">📝</div>
                    <div>暂无参与者数据</div>
                </div>
            `;
            return;
        }

        let html = '';
        participants.forEach((participant, index) => {
            const qq = participant.qq || '未知';
            // 移除IP显示，Worker出于安全考虑不返回IP信息
            const time = participant.timestamp ?
                new Date(participant.timestamp).toLocaleString('zh-CN') :
                (participant.time || '未知时间');
            const avatar = `https://q.qlogo.cn/g?b=qq&nk=${encodeURIComponent(qq)}&s=100`;

            html += `
                <div class="participant-item" style="animation-delay: ${index * 0.05}s">
                    <img class="participant-avatar" src="${avatar}" alt="QQ头像" onerror="this.src='/img/avatar.png'">
                    <div class="participant-info">
                        <div class="participant-qq">QQ: ${qq}</div>
                        <div class="participant-time">时间: ${time}</div>
                    </div>
                    <div class="participant-index">#${index + 1}</div>
                </div>
            `;
        });

        participantListEl.innerHTML = html;
    }

    // 显示加载状态
    function showLoading() {
        if (participantListEl) {
            participantListEl.innerHTML = `
                <div class="loading-state">
                    <div style="font-size: 2rem; margin-bottom: 16px;">⏳</div>
                    <div>正在加载数据...</div>
                </div>
            `;
        }
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.textContent = '加载中...';
        }
    }

    // 隐藏加载状态
    function hideLoading() {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.textContent = '刷新数据';
        }
    }

    // 显示错误信息
    function showError(message) {
        if (participantListEl) {
            participantListEl.innerHTML = `
                <div class="error-state">
                    <div style="font-size: 2rem; margin-bottom: 16px;">❌</div>
                    <div style="color: #ef4444; font-weight: 600; margin-bottom: 8px;">加载失败</div>
                    <div style="color: #6b7280;">${message}</div>
                </div>
            `;
        }
    }

    // 刷新数据
    async function refreshData() {
        await Promise.all([
            loadAdminData(),
            loadStats()
        ]);
    }

    // 绑定刷新按钮
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshData);
    }

    // 初始化
    async function init() {
        // 立即加载数据
        await refreshData();

        // 每60秒自动刷新一次
        setInterval(refreshData, 60000);
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
