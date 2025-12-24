// 抽奖结果页面JavaScript
document.addEventListener('DOMContentLoaded', function () {
    // 开奖时间设置（2025年12月31日 23:59:59）
    const drawTime = new Date('2025-12-31T23:59:59+08:00').getTime();

    // 倒计时功能
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = drawTime - now;

        if (distance > 0) {
            // 计算剩余时间
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('countdown').innerHTML =
                `${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
        } else {
            // 开奖时间到了，显示结果
            showResults();
        }
    }

    // 显示抽奖结果
    function showResults() {
        document.getElementById('revealStatus').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        // 模拟获奖数据（实际使用时应该从服务器获取）
        const winners = {
            kfc: [
                { qq: '123456789', avatar: 'https://q1.qlogo.cn/g?b=qq&nk=123456789&s=100', time: '2025-12-31 23:59:01' },
                { qq: '987654321', avatar: 'https://q1.qlogo.cn/g?b=qq&nk=987654321&s=100', time: '2025-12-31 23:59:15' },
                { qq: '555666777', avatar: 'https://q1.qlogo.cn/g?b=qq&nk=555666777&s=100', time: '2025-12-31 23:59:30' }
            ],
            redpacket: [
                { qq: '111222333', avatar: 'https://q1.qlogo.cn/g?b=qq&nk=111222333&s=100', time: '2025-12-31 23:59:45' },
                { qq: '444555666', avatar: 'https://q1.qlogo.cn/g?b=qq&nk=444555666&s=100', time: '2026-01-01 00:00:01' },
                { qq: '777888999', avatar: 'https://q1.qlogo.cn/g?b=qq&nk=777888999&s=100', time: '2026-01-01 00:00:15' },
                { qq: '101112131', avatar: 'https://q1.qlogo.cn/g?b=qq&nk=101112131&s=100', time: '2026-01-01 00:00:30' },
                { qq: '141516171', avatar: 'https://q1.qlogo.cn/g?b=qq&nk=141516171&s=100', time: '2026-01-01 00:00:45' },
                { qq: '181920212', avatar: 'https://q1.qlogo.cn/g?b=qq&nk=181920212&s=100', time: '2026-01-01 00:01:00' },
                { qq: '232425262', avatar: 'https://q1.qlogo.cn/g?b=qq&nk=232425262&s=100', time: '2026-01-01 00:01:15' },
                { qq: '272829303', avatar: 'https://q1.qlogo.cn/g?b=qq&nk=272829303&s=100', time: '2026-01-01 00:01:30' },
                { qq: '313233343', avatar: 'https://q1.qlogo.cn/g?b=qq&nk=313233343&s=100', time: '2026-01-01 00:01:45' },
                { qq: '353637383', avatar: 'https://q1.qlogo.cn/g?b=qq&nk=353637383&s=100', time: '2026-01-01 00:02:00' }
            ]
        };

        // 渲染KFC获奖者
        renderWinners('kfcWinners', winners.kfc);

        // 渲染小红包获奖者
        renderWinners('redpacketWinners', winners.redpacket);
    }

    // 渲染获奖者列表
    function renderWinners(containerId, winnersList) {
        const container = document.getElementById(containerId);
        let html = '';

        winnersList.forEach((winner, index) => {
            html += `
                <div class="winner-item" style="animation-delay: ${index * 0.1}s">
                    <div class="winner-avatar">
                        <img src="${winner.avatar}" alt="QQ头像" onerror="this.src='/img/avatar.png'">
                    </div>
                    <div class="winner-info">
                        <div class="winner-qq">QQ: ${winner.qq}</div>
                        <div class="winner-time">中奖时间: ${winner.time}</div>
                    </div>
                    <div class="winner-badge">🎉</div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // 检查是否已经到了开奖时间
    const now = new Date().getTime();
    if (now >= drawTime) {
        showResults();
    } else {
        // 开始倒计时
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
});
