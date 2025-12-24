(function () {
    const API = "https://lottery-api.19921461660.workers.dev/winners";
    const DRAW_TIME = new Date('2025-12-31T23:59:59+08:00'); // 跨年开奖时间

    const countdownEl = document.getElementById('countdown');
    const winnersListEl = document.getElementById('winnersList');
    const loadingEl = document.getElementById('loading');
    const revealStatusEl = document.getElementById('revealStatus');
    const resultsSectionEl = document.getElementById('resultsSection');

    // 检查开奖状态 - 根据实际Worker API返回格式
    async function checkDrawStatus() {
        try {
            const response = await fetch(API);
            const data = await response.json();

            // Worker /winners 实际返回: { success: true, winners: [...] }
            // 如果有winners数组且长度>0，说明已经开奖
            const hasWinners = data.success && data.winners && data.winners.length > 0;

            return {
                isDrawn: hasWinners,
                winners: data.winners || [],
                success: data.success
            };
        } catch (error) {
            console.error('检查开奖状态失败:', error);
            return { isDrawn: false, winners: [], success: false };
        }
    }

    // 更新倒计时显示
    function updateCountdown() {
        const now = new Date();
        const timeDiff = DRAW_TIME - now;

        if (timeDiff <= 0) {
            if (countdownEl) {
                countdownEl.innerHTML = '<div class="countdown-finished">🎊 开奖时间已到！</div>';
            }
            return true;
        }

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        if (countdownEl) {
            countdownEl.innerHTML = `
                <div class="countdown-item">
                    <span class="countdown-number">${days}</span>
                    <span class="countdown-label">天</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${hours}</span>
                    <span class="countdown-label">时</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${minutes}</span>
                    <span class="countdown-label">分</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${seconds}</span>
                    <span class="countdown-label">秒</span>
                </div>
            `;
        }

        return false;
    }

    // 显示获奖名单
    function displayWinners(winners) {
        if (!winnersListEl) return;

        if (!winners || winners.length === 0) {
            winnersListEl.innerHTML = '<div class="no-winners">暂无获奖记录</div>';
            return;
        }

        const winnersByPrize = {};

        // 按奖品分组
        winners.forEach(winner => {
            const prize = winner.prize || '未知奖品';
            if (!winnersByPrize[prize]) {
                winnersByPrize[prize] = [];
            }
            winnersByPrize[prize].push(winner);
        });

        let html = '';
        Object.keys(winnersByPrize).forEach(prize => {
            html += `
                <div class="prize-group">
                    <h3 class="prize-title">${prize}</h3>
                    <div class="winners-grid">
            `;

            winnersByPrize[prize].forEach(winner => {
                // 使用后端返回的脱敏数据
                const displayQQ = winner.qqMasked || winner.qq || '***';
                const avatar = winner.avatar || `https://q.qlogo.cn/g?b=qq&nk=${encodeURIComponent(winner.qq || '10000')}&s=100`;
                const time = winner.time ? new Date(winner.time).toLocaleString('zh-CN') : '未知时间';

                html += `
                    <div class="winner-card">
                        <img class="winner-avatar" src="${avatar}" alt="QQ头像" onerror="this.src='/img/avatar.png'">
                        <div class="winner-info">
                            <div class="winner-qq">QQ: ${displayQQ}</div>
                            <div class="winner-time">${time}</div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        winnersListEl.innerHTML = html;
    }

    // 显示加载状态
    function showLoading() {
        if (loadingEl) loadingEl.style.display = 'block';
        if (winnersListEl) winnersListEl.innerHTML = '';
    }

    // 隐藏加载状态
    function hideLoading() {
        if (loadingEl) loadingEl.style.display = 'none';
    }

    // 显示结果区域
    function showResults() {
        if (revealStatusEl) revealStatusEl.style.display = 'none';
        if (resultsSectionEl) resultsSectionEl.style.display = 'block';
    }

    // 隐藏结果区域
    function hideResults() {
        if (revealStatusEl) revealStatusEl.style.display = 'block';
        if (resultsSectionEl) resultsSectionEl.style.display = 'none';
    }

    // 主要检查函数
    async function checkAndUpdate() {
        // 更新倒计时显示
        const isTimeUp = updateCountdown();

        // 检查后端开奖状态
        const drawStatus = await checkDrawStatus();

        if (drawStatus.success && drawStatus.isDrawn) {
            // 后端确认已开奖，显示结果
            showResults();
            showLoading();
            displayWinners(drawStatus.winners);
            hideLoading();
        } else {
            // 未开奖，隐藏结果区域
            hideResults();
            if (winnersListEl) {
                winnersListEl.innerHTML = '<div class="not-yet">开奖时间未到，请耐心等待...</div>';
            }
        }
    }

    // 初始化
    async function init() {
        // 立即检查一次
        await checkAndUpdate();

        // 每30秒检查一次开奖状态（减少API调用频率）
        setInterval(checkAndUpdate, 30000);

        // 每秒更新倒计时显示
        setInterval(updateCountdown, 1000);
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
