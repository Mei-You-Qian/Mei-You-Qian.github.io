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

        drawBtn.disabled = true;
        const btnText = drawBtn.querySelector('.btn-text');
        const btnIcon = drawBtn.querySelector('.btn-icon');
        if (btnText) btnText.textContent = "抽奖中...";
        if (btnIcon) btnIcon.textContent = "⏳";

        try {
            const resp = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qq }),
            });
            const data = await resp.json();

            if (!data.success) {
                setResult(data.message || "抽奖失败", false);
                return;
            }

            // 成功
            try { localStorage.setItem(LS_KEY, "1"); } catch (_) { }
            const prize = data.prize || "未中奖";
            if (prize === "未中奖") {
                setResult("很遗憾，本次未中奖。", true);
            } else {
                setResult(`🎉 恭喜！你抽中了「${prize}」！`, true);
            }
            setHint(`记录时间：${data.time || "已记录"}`);
        } catch (e) {
            setResult("请求失败：请检查后端是否启动 / 反代是否配置", false);
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
