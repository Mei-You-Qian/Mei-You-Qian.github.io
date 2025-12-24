// 抽奖结果页面JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // 开奖时间设置（2025年12月31日 23:59:59）
    const drawTime = new Date('2025-12-31T23:59:59+08:00').getTime();

    // 获取服务器时间（防止修改系统时间）
    async function getServerTime() {
        try {
            // 使用世界时钟API获取真实时间
            const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Shanghai');
            const data = await response.json();
            return new Date(data.datetime).getTime();
        } catch (error) {
            // 如果API失败，使用本地时间作为备选
            console.warn('无法获取服务器时间，使用本地时间');
            return new Date().getTime();
        }
    }

    // 倒计时功能
    async function updateCountdown() {
        const now = await getServerTime();
        const distance = drawTime - now;

        if (distance > 0) {
            // 计算剩余时间
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const countdownElement = document.getElementById('countdown');
            if (countdownElement) {
                countdownElement.innerHTML = `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
            }
        } else {
            // 开奖时间到了，显示结果
            showResults();
        }
    }

    // 从localStorage获取真实的参与者数据
    function getRealParticipants() {
        const participants = [];

        // 遍历localStorage，找到所有抽奖记录
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('lottery_result_')) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && data.qq && data.prize && data.time) {
                        participants.push(data);
                    }
                } catch (e) {
                    console.warn('解析抽奖记录失败:', key);
                }
            }
        }

        return participants;
    }

    // 显示抽奖结果
    function showResults() {
        const revealStatus = document.getElementById('revealStatus');
        const resultsSection = document.getElementById('resultsSection');

        if (revealStatus) revealStatus.style.display = 'none';
        if (resultsSection) resultsSection.style.display = 'block';

        // 获取真实参与者数据
        const participants = getRealParticipants();

        // 按奖品类型分类
        const kfcWinners = participants.filter(p => p.prize === 'KFC套餐');
        const redpacketWinners = participants.filter(p => p.prize === '10元小红包');

        // 如果没有真实数据，显示提示信息
        if (participants.length === 0) {
            const noDataMessage = `
                <div style="text-align: center; padding: 40px; color: #6b7280;">
                    <div style="font-size: 3rem; margin-bottom: 16px;">🎭</div>
                    <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 8px;">暂无参与记录</div>
                    <div style="font-size: 1rem;">请先参与抽奖活动</div>
                </div>
            `;

            const kfcContainer = document.getElementById('kfcWinners');
            const redpacketContainer = document.getElementById('redpacketWinners');

            if (kfcContainer) kfcContainer.innerHTML = noDataMessage;
            if (redpacketContainer) redpacketContainer.innerHTML = noDataMessage;
            return;
        }

        // 渲染获奖者
        renderWinners('kfcWinners', kfcWinners, '🍗');
        renderWinners('redpacketWinners', redpacketWinners, '🧧');
    }

    // 渲染获奖者列表
    function renderWinners(containerId, winnersList, emoji) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (winnersList.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #6b7280;">
                    <div style="font-size: 2rem; margin-bottom: 8px;">😔</div>
                    <div>本轮暂无中奖者</div>
                </div>
            `;
            return;
        }

        let html = '';
        winnersList.forEach((winner, index) => {
            html += `
                <div class="winner-item" style="animation-delay: ${index * 0.1}s">
                    <div class="winner-avatar">
                        <img src="https://q.qlogo.cn/g?b=qq&nk=${winner.qq}&s=100" alt="QQ头像" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjUiIGZpbGw9IiNFNUU3RUIiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMyIgeT0iMTMiPgo8cGF0aCBkPSJNMTIgMTJDMTQuMjA5MSAxMiAxNiA5LjIwOTE0IDE2IDdDMTYgNC43OTA4NiAxNC4yMDkxIDMgMTIgM0M5Ljc5MDg2IDMgOCA0Ljc5MDg2IDggN0M4IDkuMjA5MTQgOS43OTA4NiAxMiAxMiAxMloiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDEzQzguMTM0MDEgMTMgNSAxNi4xMzQgNSAyMEg5SDE1SDE5QzE5IDE2LjEzNCAxNS44NjYgMTMgMTIgMTNaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo8L3N2Zz4K'">
                    </div>
                    <div class="winner-info">
                        <div class="winner-qq">QQ: ${winner.qq}</div>
                        <div class="winner-time">参与时间: ${winner.time}</div>
                    </div>
                    <div class="winner-badge">${emoji}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // 初始化检查
    async function initialize() {
        const now = await getServerTime();

        if (now >= drawTime) {
            // 已经到了开奖时间，直接显示结果
            showResults();
        } else {
            // 还没到开奖时间，显示倒计时
            await updateCountdown();
            // 每秒更新一次倒计时
            setInterval(updateCountdown, 1000);
        }
    }

    // 开始初始化
    initialize();
});
