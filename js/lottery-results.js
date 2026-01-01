(function () {
    const API = "https://lottery-api.19921461660.workers.dev/winners";
    const DRAW_TIME = new Date("2025-12-31T23:59:59+08:00");

    const countdownEl = document.getElementById("countdown");
    const revealStatusEl = document.getElementById("revealStatus");
    const resultsSectionEl = document.getElementById("resultsSection");

    // ✅ 这里改成与你页面一致的容器 id
    const kfcWinnersEl = document.getElementById("kfcWinners");
    const redpacketWinnersEl = document.getElementById("redpacketWinners");

    async function checkDrawStatus() {
        try {
            const response = await fetch(API);
            const data = await response.json();
            const hasWinners = data.success && Array.isArray(data.winners) && data.winners.length > 0;
            return { isDrawn: hasWinners, winners: data.winners || [], success: data.success };
        } catch (e) {
            console.error("检查开奖状态失败:", e);
            return { isDrawn: false, winners: [], success: false };
        }
    }

    function updateCountdown() {
        const now = new Date();
        const timeDiff = DRAW_TIME - now;

        if (timeDiff <= 0) {
            if (countdownEl) countdownEl.innerHTML = '<div class="countdown-finished">🎊 开奖时间已到！</div>';
            return true;
        }

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        if (countdownEl) {
            countdownEl.innerHTML = `
        <div class="countdown-item"><span class="countdown-number">${days}</span><span class="countdown-label">天</span></div>
        <div class="countdown-item"><span class="countdown-number">${hours}</span><span class="countdown-label">时</span></div>
        <div class="countdown-item"><span class="countdown-number">${minutes}</span><span class="countdown-label">分</span></div>
        <div class="countdown-item"><span class="countdown-number">${seconds}</span><span class="countdown-label">秒</span></div>
      `;
        }
        return false;
    }

    function winnerItemHTML(winner, idx, badgeEmoji) {
        const displayQQ = winner.qqMasked || winner.qq || "***";
        const avatar =
            winner.avatar ||
            `https://q.qlogo.cn/g?b=qq&nk=${encodeURIComponent(winner.qq || "10000")}&s=100`;
        const time = winner.time ? new Date(winner.time).toLocaleString("zh-CN") : "未知时间";

        return `
      <div class="winner-item" style="animation-delay:${idx * 0.05}s">
        <div class="winner-avatar">
          <img src="${avatar}" alt="QQ头像" onerror="this.src='/img/avatar.png'">
        </div>
        <div class="winner-info">
          <div class="winner-qq">QQ: ${displayQQ}</div>
          <div class="winner-time">${time}</div>
        </div>
        <div class="winner-badge">${badgeEmoji}</div>
      </div>
    `;
    }

    function renderList(container, list, badgeEmoji) {
        if (!container) return;
        if (!list || list.length === 0) {
            container.innerHTML = `<div class="no-winners">暂无获奖记录</div>`;
            return;
        }
        container.innerHTML = list.map((w, i) => winnerItemHTML(w, i, badgeEmoji)).join("");
    }

    function displayWinners(winners) {
        if (!kfcWinnersEl || !redpacketWinnersEl) {
            console.error("找不到 kfcWinners/redpacketWinners 容器，请检查页面 id 是否一致");
            return;
        }

        const kfc = winners.filter((w) => (w.prize || "").includes("KFC"));
        const red = winners.filter((w) => (w.prize || "").includes("红包"));

        renderList(kfcWinnersEl, kfc, "🍗");
        renderList(redpacketWinnersEl, red, "🧧");
    }

    function showResults() {
        if (revealStatusEl) revealStatusEl.style.display = "none";
        if (resultsSectionEl) resultsSectionEl.style.display = "block";
    }
    function hideResults() {
        if (revealStatusEl) revealStatusEl.style.display = "block";
        if (resultsSectionEl) resultsSectionEl.style.display = "none";
    }

    async function checkAndUpdate() {
        updateCountdown();
        const drawStatus = await checkDrawStatus();

        if (drawStatus.success && drawStatus.isDrawn) {
            showResults();
            displayWinners(drawStatus.winners);
        } else {
            hideResults();
        }
    }

    async function init() {
        await checkAndUpdate();
        setInterval(checkAndUpdate, 30000);
        setInterval(updateCountdown, 1000);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
