/**
 * 分享工具模块
 * 处理点赞和分享功能
 */

const ShareUtils = {
    // 点赞计数存储（本地）
    likeStorage: {},

    // Doja Cat 图片 - 运气好的表情（4-5星）
    dojaCatGoodLuck: [
        'images/doja/9932a0bedf51bc69afdf9e9be7dd97dc.jpg',
        'images/doja/Elu9ygKX0AAicFH.jpg',
        'images/doja/favorite-doja-meme-v0-qmy43o9w6oid1.jpg',
        'images/doja/doja-cat-doja.gif',
        'images/doja/honeycardi-doja-cat.gif',
        'images/doja/wantitnow-doja.gif'
    ],

    // Doja Cat 图片 - 运气差的表情（3星及以下）
    dojaCatBadLuck: [
        'images/doja/doja-cat-doja-cat-shocked.gif',
        'images/doja/doja-doja-cat-nervous.gif'
    ],

    // 猫言猫语 - 运气好的酸贱语录
    catQuotesGood: [
        '哼，今天运气不错嘛，别得瑟~',
        '恭喜你今天能勉强配得上本喵~',
        '看来老天也怕你哭，给你点甜头~',
        '运气好又怎样，还不是要给本喵铲屎~',
        '今天可以横着走，但别忘了给本喵加餐~',
        '哇，你居然也有运气好的一天，奇迹~'
    ],

    // 猫言猫语 - 运气差的酸贱语录
    catQuotesBad: [
        '啧啧啧，今天还是老实宅家撸猫吧~',
        '这运势...本喵都替你心疼~',
        '没事，运气差就多给本喵上供~',
        '今天不适合做大事，适合给本喵按摩~',
        '看开点，本喵天天运气都不好还不是活得很滋润~',
        '建议躺平，顺便给本喵暖床~'
    ],

    /**
     * 获取随机Doja Cat图片（根据运势）
     * @param {boolean} isGoodLuck - 是否运气好（4星及以上）
     */
    getRandomDojaCatImage(isGoodLuck) {
        const images = isGoodLuck ? this.dojaCatGoodLuck : this.dojaCatBadLuck;
        const randomIndex = Math.floor(Math.random() * images.length);
        return images[randomIndex];
    },

    /**
     * 获取随机猫言猫语
     * @param {boolean} isGoodLuck - 是否运气好
     */
    getRandomCatQuote(isGoodLuck) {
        const quotes = isGoodLuck ? this.catQuotesGood : this.catQuotesBad;
        const randomIndex = Math.floor(Math.random() * quotes.length);
        return quotes[randomIndex];
    },

    /**
     * 创建操作按钮HTML
     * @param {string} sectionId - 模块ID (bazi, name, yijing, daily, fengshui, marriage)
     * @returns {string} - 按钮HTML
     */
    createActionButtons(sectionId) {
        return `
            <div class="action-buttons" data-section="${sectionId}">
                <button class="like-btn" onclick="ShareUtils.handleLike(this, '${sectionId}')">
                    <span class="like-icon">🤍</span>
                    <span class="like-text">点赞</span>
                </button>
                <button class="share-btn" onclick="ShareUtils.handleShare('${sectionId}')">
                    <span class="share-icon">📤</span>
                    <span class="share-text">分享结果</span>
                </button>
            </div>
        `;
    },

    /**
     * 处理点赞
     * @param {HTMLElement} button - 点赞按钮
     * @param {string} sectionId - 模块ID
     */
    handleLike(button, sectionId) {
        const isLiked = button.classList.contains('liked');

        if (isLiked) {
            button.classList.remove('liked');
            button.querySelector('.like-icon').textContent = '🤍';
            button.querySelector('.like-text').textContent = '点赞';
        } else {
            button.classList.add('liked');
            button.querySelector('.like-icon').textContent = '💖';
            button.querySelector('.like-text').textContent = '已赞';

            // 添加动画效果
            button.classList.add('like-animate');
            setTimeout(() => button.classList.remove('like-animate'), 300);

            // GA事件追踪 - 点赞
            if (typeof gtag === 'function') {
                gtag('event', 'like', {
                    'event_category': 'engagement',
                    'event_label': sectionId
                });
            }
        }
    },

    /**
     * 处理分享 - 生成分享图片
     * @param {string} sectionId - 模块ID
     */
    async handleShare(sectionId) {
        // 如果是每日运势，使用特殊的Instagram风格分享
        if (sectionId === 'daily') {
            return this.handleDailyFortuneShare();
        }

        // 如果是2026运势，使用9:16比例Instagram风格分享
        if (sectionId === 'yearly2026') {
            return this.handleYearly2026Share();
        }

        const resultDiv = document.getElementById(`${sectionId}-result`);
        if (!resultDiv) {
            alert('没有找到结果内容~');
            return;
        }

        // 显示加载提示
        const shareBtn = document.querySelector(`.action-buttons[data-section="${sectionId}"] .share-btn`);
        const originalText = shareBtn.innerHTML;
        shareBtn.innerHTML = '<span>🔄</span><span>生成中...</span>';
        shareBtn.disabled = true;

        try {
            // 创建分享内容容器
            const shareContainer = document.createElement('div');
            shareContainer.className = 'share-container';
            shareContainer.style.cssText = `
                position: fixed;
                left: -9999px;
                top: 0;
                width: 400px;
                padding: 20px;
                background: linear-gradient(135deg, #FFF5F8 0%, #F5E6FA 50%, #E8F4FD 100%);
                border-radius: 16px;
                font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
            `;

            // 添加品牌头部
            const header = document.createElement('div');
            header.style.cssText = `
                text-align: center;
                padding: 15px;
                margin-bottom: 15px;
                background: linear-gradient(180deg, #FFD6E8 0%, #FF8FC4 100%);
                border-radius: 12px;
                color: #fff;
            `;
            header.innerHTML = `
                <div style="font-size: 1.5rem; font-weight: bold; text-shadow: 1px 1px 2px rgba(200,50,100,0.3);">
                    🐱 Kitty坏坏算命屋
                </div>
                <div style="font-size: 0.9rem; margin-top: 5px;">
                    ✨ 师承倪师，逢运帮助有缘喵~ ✨
                </div>
            `;
            shareContainer.appendChild(header);

            // 复制结果内容（不包含操作按钮）
            const contentClone = resultDiv.cloneNode(true);
            // 移除操作按钮
            const actionButtons = contentClone.querySelector('.action-buttons');
            if (actionButtons) actionButtons.remove();

            // 设置内容样式
            contentClone.style.cssText = `
                background: rgba(255,255,255,0.9);
                padding: 15px;
                border-radius: 12px;
                margin-bottom: 15px;
            `;
            shareContainer.appendChild(contentClone);

            // 添加二维码容器
            const qrContainer = document.createElement('div');
            qrContainer.style.cssText = `
                text-align: center;
                padding: 15px;
                background: #fff;
                border-radius: 12px;
            `;
            qrContainer.innerHTML = `
                <div style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">
                    扫码体验更多算命功能~
                </div>
                <div id="share-qrcode" style="display: inline-block;"></div>
                <div style="font-size: 0.8rem; color: #999; margin-top: 8px;">
                    guavaguy.xyz
                </div>
            `;
            shareContainer.appendChild(qrContainer);

            // 添加到页面
            document.body.appendChild(shareContainer);

            // 生成二维码
            const qrDiv = shareContainer.querySelector('#share-qrcode');
            new QRCode(qrDiv, {
                text: 'https://guavaguy.xyz',
                width: 100,
                height: 100,
                colorDark: '#FF6B9D',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.L
            });

            // 等待二维码渲染
            await new Promise(resolve => setTimeout(resolve, 300));

            // 使用html2canvas生成图片
            const canvas = await html2canvas(shareContainer, {
                scale: 2,
                backgroundColor: null,
                logging: false,
                useCORS: true
            });

            // 移除临时容器
            document.body.removeChild(shareContainer);

            // 创建下载链接
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 10);
            link.download = `kitty算命结果_${sectionId}_${timestamp}.png`;
            link.href = canvas.toDataURL('image/png');

            // 尝试使用Web Share API（移动端）
            if (navigator.share && navigator.canShare) {
                canvas.toBlob(async (blob) => {
                    const file = new File([blob], link.download, { type: 'image/png' });
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Kitty坏坏算命屋',
                            text: '看看我的算命结果~'
                        });
                    } catch (err) {
                        // 用户取消分享或不支持，降级为下载
                        link.click();
                    }
                }, 'image/png');
            } else {
                // 桌面端直接下载
                link.click();
            }

            // GA事件追踪 - 分享成功
            if (typeof gtag === 'function') {
                gtag('event', 'share', {
                    'event_category': 'engagement',
                    'event_label': sectionId,
                    'method': 'image_download'
                });
            }

        } catch (error) {
            console.error('分享失败:', error);
            alert('生成分享图片失败，请重试~');
        } finally {
            // 恢复按钮状态
            shareBtn.innerHTML = originalText;
            shareBtn.disabled = false;
        }
    },

    /**
     * 每日运势专用分享 - Instagram风格
     * 使用Doja Cat图片背景，1080x1080尺寸，右下角二维码
     */
    async handleDailyFortuneShare() {
        const resultDiv = document.getElementById('daily-result');
        if (!resultDiv) {
            alert('没有找到运势结果~');
            return;
        }

        // 显示加载提示
        const shareBtn = document.querySelector('.action-buttons[data-section="daily"] .share-btn');
        const originalText = shareBtn.innerHTML;
        shareBtn.innerHTML = '<span>🔄</span><span>生成Instagram图片中...</span>';
        shareBtn.disabled = true;

        try {
            // Instagram正方形尺寸
            const canvasSize = 1080;

            // 创建canvas
            const canvas = document.createElement('canvas');
            canvas.width = canvasSize;
            canvas.height = canvasSize;
            const ctx = canvas.getContext('2d');

            // 提取运势数据（先提取，用于选择图片）
            const fortuneData = this.extractDailyFortuneData(resultDiv);

            // 判断运势好坏（3星及以下为运气差）
            const overallStars = (fortuneData.overall.match(/★/g) || []).length;
            const isGoodLuck = overallStars >= 4;

            // 获取猫言猫语
            const catQuote = this.getRandomCatQuote(isGoodLuck);

            // 加载对应运势的Doja Cat背景图片
            const bgImage = new Image();
            bgImage.crossOrigin = 'anonymous';
            const imagePath = this.getRandomDojaCatImage(isGoodLuck);

            await new Promise((resolve, reject) => {
                bgImage.onload = resolve;
                bgImage.onerror = reject;
                bgImage.src = imagePath;
            });

            // 绘制背景图片（覆盖整个canvas，居中裁剪）
            const imgRatio = bgImage.width / bgImage.height;
            let drawWidth, drawHeight, offsetX, offsetY;

            if (imgRatio > 1) {
                // 横向图片
                drawHeight = canvasSize;
                drawWidth = canvasSize * imgRatio;
                offsetX = -(drawWidth - canvasSize) / 2;
                offsetY = 0;
            } else {
                // 纵向或正方形图片
                drawWidth = canvasSize;
                drawHeight = canvasSize / imgRatio;
                offsetX = 0;
                offsetY = -(drawHeight - canvasSize) / 2;
            }

            ctx.drawImage(bgImage, offsetX, offsetY, drawWidth, drawHeight);

            // 添加半透明遮罩使文字更清晰
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.fillRect(0, 0, canvasSize, canvasSize);

            // 绘制标题
            ctx.fillStyle = '#FFD6E8';
            ctx.font = 'bold 60px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🐱 Kitty每日运势', canvasSize / 2, 100);

            // 绘制日期
            ctx.fillStyle = '#fff';
            ctx.font = '36px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
            ctx.fillText(fortuneData.date, canvasSize / 2, 160);

            // 绘制运势卡片背景
            const cardX = 60;
            const cardY = 200;
            const cardWidth = canvasSize - 120;
            const cardHeight = 720;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 30);
            ctx.fill();

            // 绘制运势项目
            const fortuneItems = [
                { icon: '📊', label: '综合运势', stars: fortuneData.overall },
                { icon: '💼', label: '事业运', stars: fortuneData.career },
                { icon: '💰', label: '财运', stars: fortuneData.wealth },
                { icon: '💕', label: '感情运', stars: fortuneData.love }
            ];

            let yPos = cardY + 80;
            ctx.textAlign = 'left';

            for (const item of fortuneItems) {
                // 图标和标签
                ctx.fillStyle = '#fff';
                ctx.font = '44px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
                ctx.fillText(`${item.icon} ${item.label}`, cardX + 40, yPos);

                // 星星
                ctx.fillStyle = '#FFD700';
                ctx.font = '40px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(item.stars, cardX + cardWidth - 40, yPos);
                ctx.textAlign = 'left';

                yPos += 100;
            }

            // 绘制幸运信息
            yPos += 40;
            ctx.fillStyle = '#FFD6E8';
            ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
            ctx.fillText(`🎨 幸运颜色: ${fortuneData.luckyColor}`, cardX + 40, yPos);
            yPos += 60;
            ctx.fillText(`🔢 幸运数字: ${fortuneData.luckyNumber}`, cardX + 40, yPos);
            yPos += 60;
            ctx.fillText(`🧭 吉利方位: ${fortuneData.luckyDirection}`, cardX + 40, yPos);

            // 猫言猫语总结 - 夸张高亮样式
            ctx.save();
            ctx.fillStyle = '#FFE500'; // 亮黄色高亮
            ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#FF6B9D';
            ctx.shadowBlur = 15;
            ctx.fillText(`✨「${catQuote}」✨`, canvasSize / 2, canvasSize - 200);
            ctx.restore();

            // 底部品牌标识 - 移到最底部
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '24px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
            ctx.fillText('🐱 豆荚猫也是猫，喵 🐱', canvasSize / 2, canvasSize - 30);

            // 生成二维码并绘制到右下角
            await this.drawQRCodeOnCanvas(ctx, canvasSize - 150, canvasSize - 150, 120);

            // 底部网址文字
            ctx.fillStyle = '#fff';
            ctx.font = '20px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('guavaguy.xyz', canvasSize - 90, canvasSize - 20);

            // 创建下载链接
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 10);
            link.download = `kitty每日运势_${timestamp}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);

            // 尝试使用Web Share API（移动端）
            if (navigator.share && navigator.canShare) {
                canvas.toBlob(async (blob) => {
                    const file = new File([blob], link.download, { type: 'image/png' });
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Kitty每日运势',
                            text: '今日运势已揭晓~ 🐱✨'
                        });
                    } catch (err) {
                        // 用户取消分享或不支持，降级为下载
                        link.click();
                    }
                }, 'image/png', 1.0);
            } else {
                // 桌面端直接下载
                link.click();
            }

            // GA事件追踪
            if (typeof gtag === 'function') {
                gtag('event', 'share', {
                    'event_category': 'engagement',
                    'event_label': 'daily_instagram',
                    'method': 'instagram_image'
                });
            }

        } catch (error) {
            console.error('生成Instagram图片失败:', error);
            alert('生成分享图片失败，请重试~');
        } finally {
            shareBtn.innerHTML = originalText;
            shareBtn.disabled = false;
        }
    },

    /**
     * 从结果div提取运势数据
     */
    extractDailyFortuneData(resultDiv) {
        const data = {
            date: '',
            overall: '★★★☆☆',
            career: '★★★☆☆',
            wealth: '★★★☆☆',
            love: '★★★☆☆',
            luckyColor: '红色',
            luckyNumber: '8',
            luckyDirection: '东'
        };

        try {
            // 提取日期
            const dateDiv = resultDiv.querySelector('.daily-date');
            if (dateDiv) {
                data.date = dateDiv.textContent.trim().replace(/\s+/g, ' ');
            }

            // 提取运势星星
            const fortuneItems = resultDiv.querySelectorAll('.fortune-item');
            fortuneItems.forEach((item, index) => {
                const stars = item.querySelector('.fortune-stars');
                if (stars) {
                    const starsText = stars.textContent.trim();
                    if (index === 0) data.overall = starsText;
                    else if (index === 1) data.career = starsText;
                    else if (index === 2) data.wealth = starsText;
                    else if (index === 3) data.love = starsText;
                }
            });

            // 提取幸运信息
            const luckyItems = resultDiv.querySelectorAll('.lucky-item');
            luckyItems.forEach(item => {
                const label = item.querySelector('.lucky-label');
                const value = item.querySelector('.lucky-value');
                if (label && value) {
                    const labelText = label.textContent.trim();
                    const valueText = value.textContent.trim();
                    if (labelText.includes('颜色')) data.luckyColor = valueText;
                    else if (labelText.includes('数字')) data.luckyNumber = valueText;
                    else if (labelText.includes('方位')) data.luckyDirection = valueText;
                }
            });
        } catch (e) {
            console.error('提取运势数据失败:', e);
        }

        return data;
    },

    /**
     * 在canvas上绘制二维码
     */
    async drawQRCodeOnCanvas(ctx, x, y, size) {
        return new Promise((resolve) => {
            // 创建临时二维码容器
            const qrContainer = document.createElement('div');
            qrContainer.style.cssText = 'position: fixed; left: -9999px; top: 0;';
            document.body.appendChild(qrContainer);

            // 生成二维码
            new QRCode(qrContainer, {
                text: 'https://guavaguy.xyz',
                width: size,
                height: size,
                colorDark: '#FF6B9D',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.L
            });

            // 等待二维码渲染
            setTimeout(() => {
                const qrCanvas = qrContainer.querySelector('canvas');
                if (qrCanvas) {
                    // 绘制白色背景圆角矩形
                    ctx.fillStyle = '#fff';
                    ctx.beginPath();
                    ctx.roundRect(x - 10, y - 10, size + 20, size + 20, 15);
                    ctx.fill();

                    // 绘制二维码
                    ctx.drawImage(qrCanvas, x, y, size, size);
                }
                document.body.removeChild(qrContainer);
                resolve();
            }, 300);
        });
    },

    /**
     * 2026运势专用分享 - 9:16 Instagram Story格式
     * 1080x1920尺寸，右下角二维码，文案召唤
     */
    async handleYearly2026Share() {
        const resultDiv = document.getElementById('yearly2026-result');
        if (!resultDiv) {
            alert('没有找到运势结果~');
            return;
        }

        // 显示加载提示
        const shareBtn = document.querySelector('.action-buttons[data-section="yearly2026"] .share-btn');
        const originalText = shareBtn.innerHTML;
        shareBtn.innerHTML = '<span>🔄</span><span>生成2026分享图片中...</span>';
        shareBtn.disabled = true;

        try {
            // Instagram Story尺寸 9:16
            const canvasWidth = 1080;
            const canvasHeight = 1920;

            // 创建canvas
            const canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            const ctx = canvas.getContext('2d');

            // 提取运势数据
            const fortuneData = this.extractYearly2026Data(resultDiv);
            const overallStars = (fortuneData.overall.match(/★/g) || []).length;
            const isGoodLuck = overallStars >= 4;

            // 获取猫言猫语
            const catQuote = this.getRandomCatQuote(isGoodLuck);

            // 加载背景图片
            const bgImage = new Image();
            bgImage.crossOrigin = 'anonymous';
            const imagePath = this.getRandomDojaCatImage(isGoodLuck);

            await new Promise((resolve, reject) => {
                bgImage.onload = resolve;
                bgImage.onerror = reject;
                bgImage.src = imagePath;
            });

            // 绘制背景图片（覆盖整个canvas，居中裁剪）
            const imgRatio = bgImage.width / bgImage.height;
            const canvasRatio = canvasWidth / canvasHeight;
            let drawWidth, drawHeight, offsetX, offsetY;

            if (imgRatio > canvasRatio) {
                drawHeight = canvasHeight;
                drawWidth = canvasHeight * imgRatio;
                offsetX = -(drawWidth - canvasWidth) / 2;
                offsetY = 0;
            } else {
                drawWidth = canvasWidth;
                drawHeight = canvasWidth / imgRatio;
                offsetX = 0;
                offsetY = -(drawHeight - canvasHeight) / 2;
            }

            ctx.drawImage(bgImage, offsetX, offsetY, drawWidth, drawHeight);

            // 添加半透明遮罩
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            // 绘制标题
            ctx.fillStyle = '#FFD6E8';
            ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🐴 2026丙午年运势', canvasWidth / 2, 150);

            // 绘制生肖信息
            ctx.fillStyle = '#fff';
            ctx.font = '48px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
            ctx.fillText(`属${fortuneData.zodiac} · ${fortuneData.taiSui}`, canvasWidth / 2, 230);

            // 绘制运势卡片背景
            const cardX = 60;
            const cardY = 300;
            const cardWidth = canvasWidth - 120;
            const cardHeight = 900;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 30);
            ctx.fill();

            // 绘制运势项目
            const fortuneItems = [
                { icon: '📊', label: '综合运势', stars: fortuneData.overall },
                { icon: '💼', label: '事业运', stars: fortuneData.career },
                { icon: '💰', label: '财运', stars: fortuneData.wealth },
                { icon: '💕', label: '感情运', stars: fortuneData.love },
                { icon: '🏥', label: '健康运', stars: fortuneData.health }
            ];

            let yPos = cardY + 100;
            ctx.textAlign = 'left';

            for (const item of fortuneItems) {
                ctx.fillStyle = '#fff';
                ctx.font = '52px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
                ctx.fillText(`${item.icon} ${item.label}`, cardX + 50, yPos);

                ctx.fillStyle = '#FFD700';
                ctx.font = '48px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(item.stars, cardX + cardWidth - 50, yPos);
                ctx.textAlign = 'left';

                yPos += 140;
            }

            // 十神信息
            if (fortuneData.tenGod) {
                yPos += 40;
                ctx.fillStyle = '#FFD6E8';
                ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`🔮 流年十神：「${fortuneData.tenGod}」`, canvasWidth / 2, yPos);
            }

            // 猫言猫语
            ctx.save();
            ctx.fillStyle = '#FFE500';
            ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#FF6B9D';
            ctx.shadowBlur = 15;
            ctx.fillText(`✨「${catQuote}」✨`, canvasWidth / 2, canvasHeight - 450);
            ctx.restore();

            // 召唤文案
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 40px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('快来Kitty算命屋看看你的2026！', canvasWidth / 2, canvasHeight - 350);

            // 品牌标识
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '32px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
            ctx.fillText('🐱 Kitty坏坏算命屋 · 师承倪师 🐱', canvasWidth / 2, canvasHeight - 80);

            // 右下角二维码
            await this.drawQRCodeOnCanvas(ctx, canvasWidth - 200, canvasHeight - 280, 150);

            // 二维码下方网址
            ctx.fillStyle = '#fff';
            ctx.font = '24px -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('guavaguy.xyz', canvasWidth - 125, canvasHeight - 100);

            // 创建下载链接
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 10);
            link.download = `kitty_2026运势_${timestamp}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);

            // 尝试使用Web Share API（移动端）
            if (navigator.share && navigator.canShare) {
                canvas.toBlob(async (blob) => {
                    const file = new File([blob], link.download, { type: 'image/png' });
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Kitty 2026运势',
                            text: '看看我的2026运势~ 🐴✨'
                        });
                    } catch (err) {
                        link.click();
                    }
                }, 'image/png', 1.0);
            } else {
                link.click();
            }

            // GA事件追踪
            if (typeof gtag === 'function') {
                gtag('event', 'share', {
                    'event_category': 'engagement',
                    'event_label': 'yearly2026_instagram',
                    'method': 'instagram_story'
                });
            }

        } catch (error) {
            console.error('生成2026分享图片失败:', error);
            alert('生成分享图片失败，请重试~');
        } finally {
            shareBtn.innerHTML = originalText;
            shareBtn.disabled = false;
        }
    },

    /**
     * 从2026结果div提取运势数据
     */
    extractYearly2026Data(resultDiv) {
        const data = {
            zodiac: '未知',
            taiSui: '平稳',
            tenGod: '',
            overall: '★★★☆☆',
            career: '★★★☆☆',
            wealth: '★★★☆☆',
            love: '★★★☆☆',
            health: '★★★☆☆'
        };

        try {
            // 提取生肖
            const zodiacEl = resultDiv.querySelector('.user-zodiac');
            if (zodiacEl) {
                data.zodiac = zodiacEl.textContent.replace('属', '').trim();
            }

            // 提取太岁关系
            const taiSuiEl = resultDiv.querySelector('.taisui-relation');
            if (taiSuiEl) {
                data.taiSui = taiSuiEl.textContent.trim();
            }

            // 提取十神
            const tenGodEl = resultDiv.querySelector('.tengod-name');
            if (tenGodEl) {
                const match = tenGodEl.textContent.match(/「(.+)」/);
                if (match) data.tenGod = match[1];
            }

            // 提取运势星星
            const fortuneItems = resultDiv.querySelectorAll('.fortune-overview .fortune-item');
            fortuneItems.forEach((item, index) => {
                const stars = item.querySelector('.fortune-stars');
                if (stars) {
                    const starsText = stars.textContent.trim();
                    if (index === 0) data.overall = starsText;
                    else if (index === 1) data.career = starsText;
                    else if (index === 2) data.wealth = starsText;
                    else if (index === 3) data.love = starsText;
                    else if (index === 4) data.health = starsText;
                }
            });
        } catch (e) {
            console.error('提取2026运势数据失败:', e);
        }

        return data;
    }
};
console.log('ShareUtils module loaded');
