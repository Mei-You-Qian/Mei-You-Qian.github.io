(function () {
    const qqInput = document.getElementById("qqInput");
    const qqAvatar = document.getElementById("qqAvatar");
    const drawBtn = document.getElementById("drawBtn");
    const resultDiv = document.getElementById("result");
    const hintDiv = document.getElementById("hint");

    const API = "/api/lottery/draw"; // 走同域名反代（推荐方式）
    const LS_KEY = "lottery_done_v1"; // 仅做“体验提示”，真正限制在后端

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

        // 检查是否已经参与过抽奖
        try {
            const done = localStorage.getItem(LS_KEY);
            if (done) {
                setResult("您已经参与过抽奖了，请等待开奖结果！", false);
                return;
            }
        } catch (_) { }

        drawBtn.disabled = true;
        const btnText = drawBtn.querySelector('.btn-text');
        const btnIcon = drawBtn.querySelector('.btn-icon');
        if (btnText) btnText.textContent = "抽奖中...";
        if (btnIcon) btnIcon.textContent = "⏳";

        // 模拟抽奖延迟
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            // 纯前端抽奖逻辑
            const prizes = [
                { name: "KFC套餐", probability: 0.05, emoji: "🍗" }, // 5% 概率
                { name: "10元小红包", probability: 0.15, emoji: "🧧" }, // 15% 概率
                { name: "未中奖", probability: 0.8, emoji: "😔" } // 80% 概率
            ];

            // 使用QQ号作为随机种子，确保同一QQ号结果一致
            const seed = parseInt(qq) % 10000;
            const random = (seed * 9301 + 49297) % 233280 / 233280;

            let cumulativeProbability = 0;
            let selectedPrize = prizes[prizes.length - 1]; // 默认未中奖

            for (const prize of prizes) {
                cumulativeProbability += prize.probability;
                if (random < cumulativeProbability) {
                    selectedPrize = prize;
                    break;
                }
            }

            // 记录参与状态
            try {
                localStorage.setItem(LS_KEY, "1");
                localStorage.setItem(`lottery_result_${qq}`, JSON.stringify({
                    prize: selectedPrize.name,
                    time: new Date().toLocaleString('zh-CN'),
                    qq: qq
                }));
            } catch (_) { }

            // 显示结果
            if (selectedPrize.name === "未中奖") {
                setResult("很遗憾，本次未中奖。感谢参与！", true);
            } else {
                setResult(`🎉 恭喜！你抽中了「${selectedPrize.emoji} ${selectedPrize.name}」！`, true);
            }
            setHint(`记录时间：${new Date().toLocaleString('zh-CN')} | 请等待跨年开奖揭晓最终结果`);

        } catch (e) {
            setResult("抽奖出现错误，请刷新页面重试", false);
            console.error(e);
        } finally {
            drawBtn.disabled = false;
            const btnText = drawBtn.querySelector('.btn-text');
            const btnIcon = drawBtn.querySelector('.btn-icon');
            if (btnText) btnText.textContent = "参与抽奖";
            if (btnIcon) btnIcon.textContent = "🎲";
        }
    });

    // 初始
    updateAvatar();
})();
