(function () {
    const qqInput = document.getElementById("qqInput");
    const qqAvatar = document.getElementById("qqAvatar");
    const drawBtn = document.getElementById("drawBtn");
    const resultDiv = document.getElementById("result");
    const hintDiv = document.getElementById("hint");

    const API = "https://lottery-api.19921461660.workers.dev/draw";
    const STATS_API = "https://lottery-api.19921461660.workers.dev/stats";
    const LS_KEY = "lottery_done_v1"; // 仅做"体验提示"，真正限制在后端


    function setHint(msg) {
        hintDiv.textContent = msg || "";
    }
    function setResult(msg, ok) {
        resultDiv.textContent = msg || "";
        resultDiv.classList.toggle("ok", !!ok);
        resultDiv.classList.toggle("bad", !ok);
    }

    function validQQ(qq) {
        // QQ常见为 5~12 位数字
        return /^[0-9]{5,12}$/.test(qq);
    }

    function updateAvatar() {
        const qq = qqInput.value.trim();
        if (validQQ(qq)) {
            qqAvatar.src = `https://q.qlogo.cn/g?b=qq&nk=${encodeURIComponent(qq)}&s=100`;
            qqAvatar.style.display = "inline-block";
            // 添加头像加载动画
            qqAvatar.style.opacity = "0";
            qqAvatar.onload = function () {
                this.style.transition = "opacity 0.3s ease";
                this.style.opacity = "1";
            };
        } else {
            qqAvatar.style.display = "none";
            qqAvatar.src = "";
        }
    }

    qqInput.addEventListener("input", () => {
        setHint("");
        setResult("");
        updateAvatar();
    });

    // 仅做“提示”：如果你本机已经抽过，先告诉你（真正限制以后端为准）
    try {
        const done = localStorage.getItem(LS_KEY);
        if (done) setHint("提示：此浏览器曾参与过抽奖（最终以服务器记录为准）");
    } catch (_) { }

    drawBtn.addEventListener("click", async () => {
        const qq = qqInput.value.trim();
        if (!validQQ(qq)) {
            setResult("请输入正确的 QQ 号（5~12位数字）", false);
            return;
        }

        drawBtn.disabled = true;
        const btnText = drawBtn.querySelector('.btn-text');
        const btnIcon = drawBtn.querySelector('.btn-icon');
        if (btnText) btnText.textContent = "提交中...";
        if (btnIcon) btnIcon.textContent = "⏳";

        try {
            // 调用真实的抽奖池API
            const response = await fetch(API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ qq: qq })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.success) {
                    // 成功参与抽奖
                    setResult("🎊 参与成功！您已加入抽奖池", true);
                    setHint(`参与时间：${new Date().toLocaleString('zh-CN')} | 请于 2025.12.31-2026.1.1 跨年时查看开奖结果`);

                    // 记录本地参与状态（仅用于提示）
                    try {
                        localStorage.setItem(LS_KEY, "1");
                        localStorage.setItem(`lottery_participant_${qq}`, JSON.stringify({
                            qq: qq,
                            time: new Date().toLocaleString('zh-CN'),
                            status: 'participated'
                        }));
                    } catch (_) { }

                    // 刷新统计数据
                    setTimeout(loadStats, 1000);
                } else {
                    // 服务器返回错误信息
                    setResult(data.message || "参与失败", false);
                }
            } else {
                // HTTP错误
                setResult(data.message || "网络错误，请重试", false);
            }

        } catch (e) {
            setResult("网络连接失败，请检查网络后重试", false);
            console.error('抽奖API调用失败:', e);
        } finally {
            drawBtn.disabled = false;
            const btnText = drawBtn.querySelector('.btn-text');
            const btnIcon = drawBtn.querySelector('.btn-icon');
            if (btnText) btnText.textContent = "参与抽奖";
            if (btnIcon) btnIcon.textContent = "🎲";
        }
    });

    // 获取并显示统计数据
    async function loadStats() {
        try {
            const response = await fetch(STATS_API);
            const data = await response.json();

            if (response.ok && data.success) {
                const participantCountEl = document.getElementById('participantCount');
                const uniqueIPsEl = document.getElementById('uniqueIPs');

                if (participantCountEl) {
                    participantCountEl.textContent = data.totalParticipants || 0;
                }
                if (uniqueIPsEl) {
                    uniqueIPsEl.textContent = data.uniqueIPs || 0;
                }
            }
        } catch (error) {
            console.warn('获取统计数据失败:', error);
            // 静默失败，不影响主要功能
        }
    }

    // 初始
    updateAvatar();
    loadStats();

    // 每30秒更新一次统计数据
    setInterval(loadStats, 30000);
})();
