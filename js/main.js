/**
 * 天机道 - 主控制器
 * 处理页面交互和模块调用
 *
 * 重构说明：使用工厂模式简化模块初始化
 */

// ============ Hash 路由配置 ============
const TAB_CONFIG = {
    defaultTab: 'yearly2026',
    titles: {
        'yearly2026': '🐴 2026流年运势 - KOAKUMA KITTY',
        'daily': '🌙 今日运势播报 - KOAKUMA KITTY',
        'bazi': '🔮 八字命盘详解 - KOAKUMA KITTY',
        'name': '💌 姓名解密 - KOAKUMA KITTY',
        'yijing': '🎱 易经摇一摇 - KOAKUMA KITTY',
        'fengshui': '🏠 阳宅风水布局 (天纪版) - KOAKUMA KITTY',
        'marriage': '💑 姓名八字合婚 - KOAKUMA KITTY',
        'facereading': '👀 AI面相分析 - KOAKUMA KITTY',
        'auspicious': '📅 良辰吉日择选 - KOAKUMA KITTY'
    }
};

// ============ 模块初始化工厂 ============

/**
 * 通用模块初始化工厂
 * @param {Object} config - 模块配置
 * @param {string} config.name - 模块名称（用于 Tracker）
 * @param {string} config.submitId - 提交按钮 ID
 * @param {string} config.resultId - 结果容器 ID
 * @param {Function} config.validate - 验证函数，返回 { valid, data } 或 { valid: false, message }
 * @param {Function} config.calculate - 计算函数，接收 validated data
 * @param {Function} config.render - 渲染函数，接收计算结果
 * @param {string} config.loadingText - 加载时按钮文本
 * @param {string} config.defaultText - 默认按钮文本
 * @param {number} config.delay - 延迟时间（毫秒）
 * @param {Function} [config.onSuccess] - 成功后回调
 */
function createModuleInitializer(config) {
    return function() {
        const submitBtn = document.getElementById(config.submitId);
        const resultDiv = document.getElementById(config.resultId);

        if (!submitBtn || !resultDiv) {
            console.error(`Module ${config.name}: elements not found`);
            return;
        }

        submitBtn.addEventListener('click', () => {
            // 验证
            const validation = config.validate();
            if (!validation.valid) {
                alert(validation.message);
                return;
            }

            // 显示加载状态
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>${config.loadingText}</span>`;

            setTimeout(() => {
                try {
                    // 计算
                    const result = config.calculate(validation.data);

                    // 渲染
                    resultDiv.innerHTML = config.render(result, validation.data);
                    resultDiv.classList.remove('hidden');

                    // 记录使用
                    if (typeof Tracker !== 'undefined') {
                        Tracker.logFeatureUsage(config.name, validation.data);
                    }

                    // 滚动到结果
                    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

                    // 成功回调
                    if (config.onSuccess) {
                        config.onSuccess(result, validation.data);
                    }
                } catch (error) {
                    console.error(`${config.name} 计算错误:`, error);
                    resultDiv.innerHTML = '<div class="analysis-card"><p>计算出错，请重试</p></div>';
                    resultDiv.classList.remove('hidden');
                }

                // 恢复按钮
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<span>${config.defaultText}</span><span class="btn-glow"></span>`;
            }, config.delay || 500);
        });
    };
}

document.addEventListener('DOMContentLoaded', function () {
    // 初始化语言切换浮动球
    initLangGlobe();

    // 初始化更多功能折叠
    initMoreToggle();

    // 初始化路由
    initTabs();

    // 使用工厂模式初始化模块
    initBaZiModule();
    initNameModule();
    initYiJingModule();
    initDailyModule();
    initYearly2026Module();
    initMarriageModule();
    initAuspiciousModule();

    // 复杂模块保持独立实现
    initFengShui();
    initFaceReading();

    // 更新每日日期显示
    updateDailyDate();
});

/**
 * 初始化语言切换浮动球
 */
function initLangGlobe() {
    const btn = document.querySelector('.lang-globe-btn');
    const dropdown = document.querySelector('.lang-dropdown');

    if (!btn || !dropdown) return;

    // 点击切换展开/收起
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !isExpanded);
        dropdown.classList.toggle('hidden', isExpanded);
    });

    // 点击其他区域收起
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.lang-globe-container')) {
            btn.setAttribute('aria-expanded', 'false');
            dropdown.classList.add('hidden');
        }
    });

    // ESC 键收起
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            btn.setAttribute('aria-expanded', 'false');
            dropdown.classList.add('hidden');
        }
    });
}

/**
 * 初始化更多功能折叠按钮
 */
function initMoreToggle() {
    const moreToggle = document.querySelector('.more-toggle');
    const moreGrid = document.querySelector('.more-grid');

    if (!moreToggle || !moreGrid) return;

    moreToggle.addEventListener('click', () => {
        const isExpanded = moreToggle.getAttribute('aria-expanded') === 'true';
        moreToggle.setAttribute('aria-expanded', !isExpanded);
        moreGrid.classList.toggle('hidden', isExpanded);
    });
}

/**
 * 从 URL hash 中解析 tabKey
 * @returns {string|null} 有效的 tabKey 或 null
 */
function getTabKeyFromHash() {
    const hash = window.location.hash;
    if (!hash || hash === '#') {
        return null;
    }
    // 去掉 # 号
    const tabKey = hash.substring(1);
    // 验证是否为有效的 tab
    if (TAB_CONFIG.titles[tabKey]) {
        return tabKey;
    }
    return null;
}

/**
 * 激活指定的 Tab
 * 统一处理 UI 切换 + title 更新 + 滚动控制
 * 支持 quick-card（快速入口）和 nav-tab（更多功能）两种选择器
 * @param {string} tabKey - 要激活的 tab key
 */
function activateTab(tabKey) {
    const quickCards = document.querySelectorAll('.quick-card');
    const moreTabs = document.querySelectorAll('.more-grid .nav-tab');
    const contents = document.querySelectorAll('.tab-content');

    // 验证 tabKey 有效性
    const targetContent = document.getElementById(tabKey);

    if (!targetContent) {
        // 无效的 tabKey，回退到默认
        tabKey = TAB_CONFIG.defaultTab;
        // 修正 URL（静默替换，不触发 hashchange）
        history.replaceState(null, '', window.location.pathname);
    }

    // 移除所有活动状态
    quickCards.forEach(t => t.classList.remove('active'));
    moreTabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    // 添加当前活动状态
    const activeQuickCard = document.querySelector(`.quick-card[data-tab="${tabKey}"]`);
    const activeMoreTab = document.querySelector(`.more-grid .nav-tab[data-tab="${tabKey}"]`);
    const activeContent = document.getElementById(tabKey);

    if (activeQuickCard) activeQuickCard.classList.add('active');
    if (activeMoreTab) activeMoreTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');

    // 如果激活的是"更多功能"中的tab，自动展开折叠区
    if (activeMoreTab) {
        const moreToggle = document.querySelector('.more-toggle');
        const moreGrid = document.querySelector('.more-grid');
        if (moreToggle && moreGrid) {
            moreToggle.setAttribute('aria-expanded', 'true');
            moreGrid.classList.remove('hidden');
        }
    }

    // 更新 document.title
    if (TAB_CONFIG.titles[tabKey]) {
        document.title = TAB_CONFIG.titles[tabKey];
    }

    // 控制滚动，防止 hash 导致的页面跳动
    window.scrollTo(0, 0);
}

/**
 * 标签页切换（Hash 路由版本）
 * 支持 quick-card（快速入口）和 nav-tab（更多功能）两种选择器
 * 点击 Tab 时只更新 hash，由 hashchange 统一触发 UI 更新
 */
function initTabs() {
    // 快速入口卡片
    const quickCards = document.querySelectorAll('.quick-card');
    // 更多功能中的 tab
    const moreTabs = document.querySelectorAll('.more-grid .nav-tab');
    // 合并所有可切换的元素
    const allTabs = [...quickCards, ...moreTabs];

    // 绑定点击事件：只更新 hash，不直接切换 UI
    allTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const targetTab = tab.getAttribute('data-tab');

            // 更新 URL hash（会触发 hashchange 事件）
            // 使用 pushState 而不是直接设置 hash，以便更好地控制历史记录
            const newUrl = `${window.location.pathname}#${targetTab}`;
            history.pushState(null, '', newUrl);

            // 手动触发 UI 更新（pushState 不会自动触发 hashchange）
            activateTab(targetTab);
        });
    });

    // 监听 popstate 事件（浏览器后退/前进按钮）
    window.addEventListener('popstate', () => {
        const tabKey = getTabKeyFromHash() || TAB_CONFIG.defaultTab;
        activateTab(tabKey);
    });

    // 监听 hashchange 事件（直接修改 hash 或点击带 # 的链接）
    window.addEventListener('hashchange', () => {
        const tabKey = getTabKeyFromHash() || TAB_CONFIG.defaultTab;
        activateTab(tabKey);
    });

    // 页面初始化：读取当前 hash 并激活对应 Tab
    const initialTabKey = getTabKeyFromHash() || TAB_CONFIG.defaultTab;
    activateTab(initialTabKey);
}

/**
 * 八字模块初始化（工厂模式）
 */
function initBaZiModule() {
    // 设置默认日期
    const dateInput = document.getElementById('bazi-date');
    if (dateInput) {
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() - 30);
        dateInput.valueAsDate = defaultDate;
    }

    const init = createModuleInitializer({
        name: 'bazi',
        submitId: 'bazi-submit',
        resultId: 'bazi-result',
        loadingText: '推算中...',
        defaultText: '🔮 让Kitty帮你算算~',
        delay: 500,
        validate: () => {
            const birthDate = document.getElementById('bazi-date').value;
            const hourIndex = parseInt(document.getElementById('bazi-hour').value);
            const gender = document.querySelector('input[name="gender"]:checked').value;
            if (!birthDate) {
                return { valid: false, message: '请选择出生日期' };
            }
            return { valid: true, data: { birthDate, hourIndex, gender } };
        },
        calculate: (data) => BaZi.calculate(data.birthDate, data.hourIndex, data.gender),
        render: (result) => BaZi.renderResult(result)
    });
    init();
}

/**
 * 姓名模块初始化（工厂模式）
 */
function initNameModule() {
    const nameInput = document.getElementById('name-input');
    const submitBtn = document.getElementById('name-submit');

    // 回车提交
    if (nameInput && submitBtn) {
        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitBtn.click();
        });
    }

    const init = createModuleInitializer({
        name: 'name',
        submitId: 'name-submit',
        resultId: 'name-result',
        loadingText: '分析中...',
        defaultText: '💖 解锁名字密码',
        delay: 500,
        validate: () => {
            const name = document.getElementById('name-input').value.trim();
            if (!name) return { valid: false, message: '请输入姓名' };
            if (!/^[\u4e00-\u9fa5]+$/.test(name)) return { valid: false, message: '请输入中文姓名' };
            return { valid: true, data: { name } };
        },
        calculate: (data) => NameAnalysis.analyze(data.name),
        render: (result) => NameAnalysis.renderResult(result)
    });
    init();
}

/**
 * 易经占卜模块初始化（工厂模式 + 动画）
 */
function initYiJingModule() {
    const animationDiv = document.getElementById('yijing-animation');
    const resultDiv = document.getElementById('yijing-result');
    const submitBtn = document.getElementById('yijing-submit');

    if (!submitBtn) return;

    submitBtn.addEventListener('click', () => {
        const question = document.getElementById('yijing-question').value.trim() || '求问吉凶';

        submitBtn.disabled = true;
        if (resultDiv) resultDiv.classList.add('hidden');
        if (animationDiv) animationDiv.classList.remove('hidden');

        setTimeout(() => {
            try {
                const result = YiJing.divine(question);
                if (animationDiv) animationDiv.classList.add('hidden');
                if (resultDiv) {
                    resultDiv.innerHTML = YiJing.renderResult(result);
                    resultDiv.classList.remove('hidden');
                    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                if (typeof Tracker !== 'undefined') {
                    Tracker.logFeatureUsage('yijing', { question });
                }
            } catch (error) {
                console.error('占卜错误:', error);
                if (animationDiv) animationDiv.classList.add('hidden');
                if (resultDiv) {
                    resultDiv.innerHTML = '<div class="analysis-card"><p>占卜出错，请重试</p></div>';
                    resultDiv.classList.remove('hidden');
                }
            }
            submitBtn.disabled = false;
        }, 2000);
    });
}

/**
 * 每日运势模块初始化（工厂模式）
 */
function initDailyModule() {
    // 设置默认日期
    const birthInput = document.getElementById('daily-birthdate');
    if (birthInput) {
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() - 25);
        birthInput.valueAsDate = defaultDate;
    }

    const init = createModuleInitializer({
        name: 'daily',
        submitId: 'daily-submit',
        resultId: 'daily-result',
        loadingText: 'Kitty掐指一算中... 🐱',
        defaultText: '🔮 看看今天的运气~',
        delay: 500,
        validate: () => {
            const birthDate = document.getElementById('daily-birthdate').value;
            const hourSelect = document.getElementById('daily-hour');
            const genderRadio = document.querySelector('input[name="daily-gender"]:checked');
            const nameInput = document.getElementById('daily-name');

            if (!birthDate) return { valid: false, message: '喵呜~ 至少要告诉Kitty你的生日嘛！😿' };

            return {
                valid: true,
                data: {
                    birthDate,
                    hour: hourSelect?.value ? parseInt(hourSelect.value) : null,
                    gender: genderRadio?.value || null,
                    name: nameInput?.value.trim() || null
                }
            };
        },
        calculate: (data) => {
            const todayGanZhi = DailyFortune.getTodayGanZhi();
            return DailyFortune.calculate(data.birthDate, todayGanZhi, data);
        },
        render: (result, data) => DailyFortune.renderResult(result, data),
        onSuccess: () => {
            // 绑定躲猫猫按钮事件
            const hideAndSeekBtn = document.getElementById('daily-hide-seek-btn');
            if (hideAndSeekBtn) {
                hideAndSeekBtn.addEventListener('click', () => {
                    window.location.hash = 'auspicious';
                });
            }
        }
    });
    init();
}

/**
 * 更新每日运势页面的日期显示
 */
function updateDailyDate() {
    const lunarSpan = document.getElementById('daily-lunar');
    const solarSpan = document.getElementById('daily-solar');

    if (lunarSpan && solarSpan) {
        const today = new Date();
        const todayGanZhi = DailyFortune.getTodayGanZhi();
        const lunarDate = DailyFortune.getLunarDate();

        lunarSpan.textContent = `${todayGanZhi.dayStem}${todayGanZhi.dayBranch}日 农历${lunarDate.month}月${lunarDate.day}`;
        solarSpan.textContent = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    }
}

/**
 * 风水分析模块初始化
 */
function initFengShui() {
    const yearSelect = document.getElementById('fengshui-year');
    const submitBtn = document.getElementById('fengshui-submit');
    const resultDiv = document.getElementById('fengshui-result');

    // 户型图相关元素
    const floorplanUploadArea = document.getElementById('floorplan-upload-area');
    const floorplanInput = document.getElementById('floorplan-input');
    const floorplanPreviewContainer = document.getElementById('floorplan-preview-container');
    const floorplanPreview = document.getElementById('floorplan-preview');
    const floorplanRemoveBtn = document.getElementById('floorplan-remove');

    let currentFloorplan = null; // 存储上传的户型图

    // 生成年份选项（1940-2010）
    const currentYear = new Date().getFullYear();
    for (let year = currentYear - 10; year >= 1940; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}年`;
        // 默认选择1990年
        if (year === 1990) {
            option.selected = true;
        }
        yearSelect.appendChild(option);
    }

    // 户型图上传区域点击
    if (floorplanUploadArea) {
        floorplanUploadArea.addEventListener('click', () => {
            floorplanInput.click();
        });

        // 拖拽上传
        floorplanUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            floorplanUploadArea.classList.add('dragover');
        });

        floorplanUploadArea.addEventListener('dragleave', () => {
            floorplanUploadArea.classList.remove('dragover');
        });

        floorplanUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            floorplanUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                handleFloorplanFile(files[0]);
            }
        });
    }

    // 文件选择处理
    if (floorplanInput) {
        floorplanInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFloorplanFile(e.target.files[0]);
            }
        });
    }

    // 处理户型图文件
    function handleFloorplanFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentFloorplan = e.target.result;
            floorplanPreview.src = currentFloorplan;
            floorplanUploadArea.classList.add('hidden');
            floorplanPreviewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    // 移除户型图
    if (floorplanRemoveBtn) {
        floorplanRemoveBtn.addEventListener('click', () => {
            currentFloorplan = null;
            floorplanPreview.src = '';
            floorplanInput.value = '';
            floorplanPreviewContainer.classList.add('hidden');
            floorplanUploadArea.classList.remove('hidden');
        });
    }

    submitBtn.addEventListener('click', () => {
        const year = parseInt(yearSelect.value);
        const gender = document.querySelector('input[name="fengshui-gender"]:checked').value;
        const orientation = document.getElementById('fengshui-orientation').value;

        if (!orientation) {
            alert('请选择房屋坐向哦~');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Kitty正在看风水...</span>';

        setTimeout(() => {
            try {
                const result = FengShui.analyze(year, gender, orientation);
                // 如果有户型图，添加户型图分析
                if (currentFloorplan) {
                    result.floorplanImage = currentFloorplan;
                    result.floorplanAnalysis = FengShui.analyzeFloorplan(result.directionsAnalysis, result.roomAdvice);
                }
                resultDiv.innerHTML = FengShui.renderResult(result);
                resultDiv.classList.remove('hidden');

                // 记录功能使用
                Tracker.logFeatureUsage('fengshui', { year, gender, orientation, hasFloorplan: !!currentFloorplan });

                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (error) {
                console.error('风水分析错误:', error);
                resultDiv.innerHTML = '<div class="analysis-card"><p>分析出错，请重试</p></div>';
                resultDiv.classList.remove('hidden');
            }

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>🧭 Kitty帮你看风水~</span><span class="btn-glow"></span>';
        }, 800);
    });
}

/**
 * 婚恋匹配模块初始化（工厂模式）
 */
function initMarriageModule() {
    // 设置默认日期
    const date1Input = document.getElementById('marriage-date1');
    const date2Input = document.getElementById('marriage-date2');
    if (date1Input && date2Input) {
        const defaultDate1 = new Date();
        defaultDate1.setFullYear(defaultDate1.getFullYear() - 30);
        const defaultDate2 = new Date();
        defaultDate2.setFullYear(defaultDate2.getFullYear() - 28);
        date1Input.valueAsDate = defaultDate1;
        date2Input.valueAsDate = defaultDate2;
    }

    const init = createModuleInitializer({
        name: 'marriage',
        submitId: 'marriage-submit',
        resultId: 'marriage-result',
        loadingText: '💕 Kitty正在计算八字缘分...',
        defaultText: '💕 八字+姓名深度配对~',
        delay: 1000,
        validate: () => {
            const name1 = document.getElementById('marriage-name1').value.trim();
            const name2 = document.getElementById('marriage-name2').value.trim();
            const dateValue1 = document.getElementById('marriage-date1').value;
            const dateValue2 = document.getElementById('marriage-date2').value;
            const hour1 = parseInt(document.getElementById('marriage-hour1').value);
            const hour2 = parseInt(document.getElementById('marriage-hour2').value);
            const gender1 = document.querySelector('input[name="marriage-gender1"]:checked').value;
            const gender2 = document.querySelector('input[name="marriage-gender2"]:checked').value;

            if (!name1 || !name2) {
                return { valid: false, message: '请输入双方的姓名哦~' };
            }
            if (!/^[\u4e00-\u9fa5]+$/.test(name1) || !/^[\u4e00-\u9fa5]+$/.test(name2)) {
                return { valid: false, message: '请输入中文姓名~' };
            }
            if (!dateValue1 || !dateValue2) {
                return { valid: false, message: '请选择双方的出生日期~' };
            }

            return {
                valid: true,
                data: {
                    person1: { name: name1, date: new Date(dateValue1), hour: hour1, gender: gender1 },
                    person2: { name: name2, date: new Date(dateValue2), hour: hour2, gender: gender2 },
                    name1, name2, dateValue1, dateValue2, gender1, gender2
                }
            };
        },
        calculate: (data) => Marriage.analyze(data.person1, data.person2),
        render: (result) => Marriage.renderResult(result)
    });
    init();
}

/**
 * 面相分析模块初始化
 */
function initFaceReading() {
    const uploadArea = document.getElementById('face-upload-area');
    // Use separate inputs for camera vs gallery (iOS Chrome fix)
    const cameraInput = document.getElementById('face-camera-input');
    const galleryInput = document.getElementById('face-gallery-input');
    const previewContainer = document.getElementById('face-preview-container');
    const previewImg = document.getElementById('face-preview');
    const canvas = document.getElementById('face-canvas');
    const retakeBtn = document.getElementById('face-retake');
    const cameraBtn = document.getElementById('face-camera-btn');
    const uploadBtn = document.getElementById('face-upload-btn');
    const submitBtn = document.getElementById('face-submit');
    const loadingDiv = document.getElementById('face-loading');
    const resultDiv = document.getElementById('facereading-result');
    const cameraButtons = document.querySelector('.camera-buttons');

    if (!uploadArea) {
        console.error('Face reading elements not found');
        return;
    }
    console.log('Face reading module initialized');

    let currentImage = null;

    // Max dimension for image resizing (prevents layout issues on mobile Safari)
    const MAX_IMAGE_SIZE = 1200;

    // 点击上传区域触发文件选择 (gallery)
    uploadArea.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        galleryInput.click();
    });

    // 上传按钮 - use gallery input
    uploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        galleryInput.click();
    });

    // 拍照按钮 - use camera input with capture attribute
    cameraBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        cameraInput.click();
    });

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleImageFile(files[0]);
        }
    });

    // Camera input change handler
    cameraInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageFile(e.target.files[0]);
        }
    });

    // Gallery input change handler
    galleryInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageFile(e.target.files[0]);
        }
    });

    // 处理图片文件 - with resizing for mobile Safari
    function handleImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Resize image if too large (fixes Safari layout issues)
                let { width, height } = img;
                if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
                    if (width > height) {
                        height = Math.round(height * MAX_IMAGE_SIZE / width);
                        width = MAX_IMAGE_SIZE;
                    } else {
                        width = Math.round(width * MAX_IMAGE_SIZE / height);
                        height = MAX_IMAGE_SIZE;
                    }
                }

                // Create resized canvas
                const resizeCanvas = document.createElement('canvas');
                resizeCanvas.width = width;
                resizeCanvas.height = height;
                const ctx = resizeCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Set resized image to preview
                previewImg.src = resizeCanvas.toDataURL('image/jpeg', 0.9);
                previewImg.onload = () => {
                    currentImage = previewImg;
                    showPreview();
                };
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 显示预览
    function showPreview() {
        uploadArea.classList.add('hidden');
        cameraButtons.classList.add('hidden');
        previewContainer.classList.remove('hidden');
        submitBtn.classList.remove('hidden');
        resultDiv.classList.add('hidden');

        // 设置 canvas 尺寸为图片原始尺寸，通过 CSS 控制显示尺寸
        canvas.width = previewImg.naturalWidth;
        canvas.height = previewImg.naturalHeight;
    }

    // 重新选择
    retakeBtn.addEventListener('click', () => {
        currentImage = null;
        previewImg.src = '';
        cameraInput.value = '';
        galleryInput.value = '';
        previewContainer.classList.add('hidden');
        submitBtn.classList.add('hidden');
        uploadArea.classList.remove('hidden');
        cameraButtons.classList.remove('hidden');
        resultDiv.classList.add('hidden');

        // 清除 canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // 提交分析
    submitBtn.addEventListener('click', async () => {
        if (!currentImage) {
            alert('请先上传一张照片哦~');
            return;
        }

        submitBtn.classList.add('hidden');
        loadingDiv.classList.remove('hidden');
        resultDiv.classList.add('hidden');

        try {
            // 初始化 face-api（如果尚未初始化）
            const initialized = await FaceReading.init();
            if (!initialized) {
                throw new Error('面部识别模型加载失败');
            }

            // 检测面部
            const detection = await FaceReading.detectFace(previewImg);

            // 在 canvas 上绘制面部标记
            if (detection) {
                // 确保 canvas 尺寸匹配原始图片
                canvas.width = previewImg.naturalWidth;
                canvas.height = previewImg.naturalHeight;

                // 调整检测结果以匹配图片原始尺寸
                const displaySize = { width: previewImg.naturalWidth, height: previewImg.naturalHeight };
                const resizedDetections = faceapi.resizeResults(detection, displaySize);

                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // 绘制边界框
                const box = resizedDetections.detection.box;
                ctx.strokeStyle = '#ff69b4';
                ctx.lineWidth = Math.max(3, previewImg.naturalWidth / 300); // 动态线宽
                ctx.strokeRect(box.x, box.y, box.width, box.height);

                // 绘制面部标记点
                const landmarks = resizedDetections.landmarks.positions;
                ctx.fillStyle = '#00ffff';
                const pointSize = Math.max(2, previewImg.naturalWidth / 400); // 动态点大小
                landmarks.forEach(point => {
                    ctx.beginPath();
                    ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI);
                    ctx.fill();
                });
            }

            // 分析面相
            const analysis = FaceReading.analyze(detection);
            resultDiv.innerHTML = FaceReading.renderResult(analysis);
            resultDiv.classList.remove('hidden');

            // 记录功能使用
            Tracker.logFeatureUsage('facereading', { hasDetection: !!detection });

            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.error('面相分析错误:', error);
            resultDiv.innerHTML = `
                <div class="analysis-card face-reading-error">
                    <h3>😿 哎呀，出错了呢~</h3>
                    <p>错误信息: ${error.message}</p>
                    <p>请刷新页面重试，或换一张照片试试~</p>
                </div>
            `;
            resultDiv.classList.remove('hidden');
        }

        loadingDiv.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    });
}

/**
 * 2026流年运势模块初始化
 * 注意：事件绑定在 yearly2026.js 中处理，这里只设置默认值
 */
function initYearly2026Module() {
    // 设置默认生日（25年前）
    const birthInput = document.getElementById('yearly2026-birthdate');
    if (birthInput && !birthInput.value) {
        const defaultDate = new Date();
        defaultDate.setFullYear(defaultDate.getFullYear() - 25);
        birthInput.valueAsDate = defaultDate;
    }
}

/**
 * 良辰吉日模块初始化（工厂模式）
 */
function initAuspiciousModule() {
    // 设置默认日期
    const birthInput = document.getElementById('auspicious-birthdate');
    const targetDateInput = document.getElementById('auspicious-target-date');
    if (birthInput) {
        const defaultBirthDate = new Date();
        defaultBirthDate.setFullYear(defaultBirthDate.getFullYear() - 30);
        birthInput.valueAsDate = defaultBirthDate;
    }
    if (targetDateInput) {
        const defaultTargetDate = new Date();
        defaultTargetDate.setDate(defaultTargetDate.getDate() + 7);
        targetDateInput.valueAsDate = defaultTargetDate;
    }

    const init = createModuleInitializer({
        name: 'auspicious',
        submitId: 'auspicious-submit',
        resultId: 'auspicious-result',
        loadingText: 'Kitty正在算日子...',
        defaultText: '🔮 Kitty帮你选日子~',
        delay: 800,
        validate: () => {
            const birthDate = document.getElementById('auspicious-birthdate').value;
            const hourIndex = parseInt(document.getElementById('auspicious-hour').value);
            const gender = document.querySelector('input[name="auspicious-gender"]:checked').value;
            const activity = document.getElementById('auspicious-activity').value;
            const targetDateValue = document.getElementById('auspicious-target-date').value;

            if (!birthDate) {
                return { valid: false, message: '请选择你的出生日期哦~' };
            }
            if (!targetDateValue) {
                return { valid: false, message: '请选择你计划的日期哦~' };
            }

            return {
                valid: true,
                data: { birthDate, hourIndex, gender, activity, targetDateValue }
            };
        },
        calculate: (data) => {
            const userBazi = BaZi.calculate(data.birthDate, data.hourIndex, data.gender);
            const targetDate = new Date(data.targetDateValue);
            return AuspiciousDay.generateReport(targetDate, data.activity, userBazi);
        },
        render: (result) => AuspiciousDay.renderResult(result)
    });
    init();
}
