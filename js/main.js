/**
 * 天机道 - 主控制器
 * 处理页面交互和模块调用
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

document.addEventListener('DOMContentLoaded', function () {
    // 初始化路由和模块
    initTabs();
    initBaZi();
    initName();
    initYiJing();
    initDaily();
    initFengShui();
    initMarriage();
    initFaceReading();
    initAuspicious();
    updateDailyDate();
});

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
 * @param {string} tabKey - 要激活的 tab key
 */
function activateTab(tabKey) {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');
    
    // 验证 tabKey 有效性
    const targetContent = document.getElementById(tabKey);
    const targetTab = document.querySelector(`.nav-tab[data-tab="${tabKey}"]`);
    
    if (!targetContent || !targetTab) {
        // 无效的 tabKey，回退到默认
        tabKey = TAB_CONFIG.defaultTab;
        // 修正 URL（静默替换，不触发 hashchange）
        history.replaceState(null, '', window.location.pathname);
    }
    
    // 移除所有活动状态
    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));
    
    // 添加当前活动状态
    const activeTab = document.querySelector(`.nav-tab[data-tab="${tabKey}"]`);
    const activeContent = document.getElementById(tabKey);
    
    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
    
    // 更新 document.title
    if (TAB_CONFIG.titles[tabKey]) {
        document.title = TAB_CONFIG.titles[tabKey];
    }
    
    // 控制滚动，防止 hash 导致的页面跳动
    window.scrollTo(0, 0);
}

/**
 * 标签页切换（Hash 路由版本）
 * 点击 Tab 时只更新 hash，由 hashchange 统一触发 UI 更新
 */
function initTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    
    // 绑定点击事件：只更新 hash，不直接切换 UI
    tabs.forEach(tab => {
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
 * 八字模块初始化
 */
function initBaZi() {
    const submitBtn = document.getElementById('bazi-submit');
    const dateInput = document.getElementById('bazi-date');
    const hourSelect = document.getElementById('bazi-hour');
    const resultDiv = document.getElementById('bazi-result');

    // 设置默认日期为30年前
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 30);
    dateInput.valueAsDate = defaultDate;

    submitBtn.addEventListener('click', () => {
        const birthDate = dateInput.value;
        const hourIndex = parseInt(hourSelect.value);
        const gender = document.querySelector('input[name="gender"]:checked').value;

        if (!birthDate) {
            alert('请选择出生日期');
            return;
        }

        // 显示加载动画
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>推算中...</span>';

        setTimeout(() => {
            try {
                const result = BaZi.calculate(birthDate, hourIndex, gender);
                resultDiv.innerHTML = BaZi.renderResult(result);
                resultDiv.classList.remove('hidden');

                // 记录功能使用
                Tracker.logFeatureUsage('bazi', { birthdate: birthDate, hour: hourIndex, gender });

                // 滚动到结果
                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (error) {
                console.error('八字计算错误:', error);
                resultDiv.innerHTML = '<div class="analysis-card"><p>计算出错，请重试</p></div>';
                resultDiv.classList.remove('hidden');
            }

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>推算八字</span><span class="btn-glow"></span>';
        }, 500);
    });
}

/**
 * 姓名模块初始化
 */
function initName() {
    const submitBtn = document.getElementById('name-submit');
    const nameInput = document.getElementById('name-input');
    const resultDiv = document.getElementById('name-result');

    submitBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();

        if (!name) {
            alert('请输入姓名');
            return;
        }

        // 检查是否为中文
        if (!/^[\u4e00-\u9fa5]+$/.test(name)) {
            alert('请输入中文姓名');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>分析中...</span>';

        setTimeout(() => {
            try {
                const result = NameAnalysis.analyze(name);
                resultDiv.innerHTML = NameAnalysis.renderResult(result);
                resultDiv.classList.remove('hidden');

                // 记录功能使用
                Tracker.logFeatureUsage('name', { name });

                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (error) {
                console.error('姓名分析错误:', error);
                resultDiv.innerHTML = '<div class="analysis-card"><p>分析出错，请重试</p></div>';
                resultDiv.classList.remove('hidden');
            }

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>分析姓名</span><span class="btn-glow"></span>';
        }, 500);
    });

    // 回车提交
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });
}

/**
 * 易经占卜模块初始化
 */
function initYiJing() {
    const submitBtn = document.getElementById('yijing-submit');
    const questionInput = document.getElementById('yijing-question');
    const animationDiv = document.getElementById('yijing-animation');
    const resultDiv = document.getElementById('yijing-result');

    submitBtn.addEventListener('click', () => {
        const question = questionInput.value.trim() || '求问吉凶';

        submitBtn.disabled = true;
        resultDiv.classList.add('hidden');
        animationDiv.classList.remove('hidden');

        // 占卜动画
        setTimeout(() => {
            try {
                const result = YiJing.divine(question);
                animationDiv.classList.add('hidden');
                resultDiv.innerHTML = YiJing.renderResult(result);
                resultDiv.classList.remove('hidden');

                // 记录功能使用
                Tracker.logFeatureUsage('yijing', { question });

                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (error) {
                console.error('占卜错误:', error);
                animationDiv.classList.add('hidden');
                resultDiv.innerHTML = '<div class="analysis-card"><p>占卜出错，请重试</p></div>';
                resultDiv.classList.remove('hidden');
            }

            submitBtn.disabled = false;
        }, 2000);
    });
}

/**
 * 每日运势模块初始化
 */
function initDaily() {
    const submitBtn = document.getElementById('daily-submit');
    const birthInput = document.getElementById('daily-birthdate');
    const hourSelect = document.getElementById('daily-hour');
    const nameInput = document.getElementById('daily-name');
    const resultDiv = document.getElementById('daily-result');

    // 设置默认日期
    const defaultDate = new Date();
    defaultDate.setFullYear(defaultDate.getFullYear() - 25);
    birthInput.valueAsDate = defaultDate;

    submitBtn.addEventListener('click', () => {
        const birthDate = birthInput.value;
        const hourValue = hourSelect ? hourSelect.value : '';
        const genderRadio = document.querySelector('input[name="daily-gender"]:checked');
        const gender = genderRadio ? genderRadio.value : '';
        const name = nameInput ? nameInput.value.trim() : '';

        if (!birthDate) {
            alert('喵呜~ 至少要告诉Kitty你的生日嘛！😿');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Kitty掐指一算中... 🐱</span>';

        setTimeout(() => {
            try {
                // 传入额外参数
                const options = {
                    hour: hourValue ? parseInt(hourValue) : null,
                    gender: gender || null,
                    name: name || null
                };
                const result = DailyFortune.calculate(birthDate, options);
                resultDiv.innerHTML = DailyFortune.renderResult(result, options);
                resultDiv.classList.remove('hidden');

                // 记录功能使用
                Tracker.logFeatureUsage('daily', { birthdate: birthDate, hour: hourValue, gender, name });

                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // 绑定躲猫猫按钮事件
                const hideAndSeekBtn = document.getElementById('daily-hide-seek-btn');
                if (hideAndSeekBtn) {
                    hideAndSeekBtn.addEventListener('click', () => {
                        // 切换到良辰吉日tab（通过 hash 路由）
                        window.location.hash = 'auspicious';
                    });
                }
            } catch (error) {
                console.error('运势计算错误:', error);
                resultDiv.innerHTML = '<div class="analysis-card"><p>计算出错，请重试</p></div>';
                resultDiv.classList.remove('hidden');
            }

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>🔮 看看今天的运气~</span><span class="btn-glow"></span>';
        }, 500);
    });
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
 * 婚恋匹配模块初始化
 */
function initMarriage() {
    const date1Input = document.getElementById('marriage-date1');
    const date2Input = document.getElementById('marriage-date2');
    const submitBtn = document.getElementById('marriage-submit');
    const resultDiv = document.getElementById('marriage-result');

    // 设置默认日期（30年前和28年前）
    const defaultDate1 = new Date();
    defaultDate1.setFullYear(defaultDate1.getFullYear() - 30);
    const defaultDate2 = new Date();
    defaultDate2.setFullYear(defaultDate2.getFullYear() - 28);

    date1Input.valueAsDate = defaultDate1;
    date2Input.valueAsDate = defaultDate2;

    submitBtn.addEventListener('click', () => {
        const name1 = document.getElementById('marriage-name1').value.trim();
        const name2 = document.getElementById('marriage-name2').value.trim();
        const dateValue1 = document.getElementById('marriage-date1').value;
        const dateValue2 = document.getElementById('marriage-date2').value;
        const hour1 = parseInt(document.getElementById('marriage-hour1').value);
        const hour2 = parseInt(document.getElementById('marriage-hour2').value);
        const gender1 = document.querySelector('input[name="marriage-gender1"]:checked').value;
        const gender2 = document.querySelector('input[name="marriage-gender2"]:checked').value;

        // 验证输入
        if (!name1 || !name2) {
            alert('请输入双方的姓名哦~');
            return;
        }

        if (!/^[\u4e00-\u9fa5]+$/.test(name1) || !/^[\u4e00-\u9fa5]+$/.test(name2)) {
            alert('请输入中文姓名~');
            return;
        }

        if (!dateValue1 || !dateValue2) {
            alert('请选择双方的出生日期~');
            return;
        }

        const person1 = {
            name: name1,
            date: new Date(dateValue1),
            hour: hour1,
            gender: gender1
        };
        const person2 = {
            name: name2,
            date: new Date(dateValue2),
            hour: hour2,
            gender: gender2
        };

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>💕 Kitty正在计算八字缘分...</span>';

        setTimeout(() => {
            try {
                const result = Marriage.analyze(person1, person2);
                resultDiv.innerHTML = Marriage.renderResult(result);
                resultDiv.classList.remove('hidden');

                // 记录功能使用
                Tracker.logFeatureUsage('marriage', { name1, name2, date1: dateValue1, date2: dateValue2, gender1, gender2 });

                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (error) {
                console.error('婚恋分析错误:', error);
                resultDiv.innerHTML = '<div class="analysis-card"><p>分析出错，请重试</p></div>';
                resultDiv.classList.remove('hidden');
            }

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>💕 八字+姓名深度配对~</span><span class="btn-glow"></span>';
        }, 1000);
    });
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
 * 良辰吉日模块初始化
 */
function initAuspicious() {
    const birthInput = document.getElementById('auspicious-birthdate');
    const hourSelect = document.getElementById('auspicious-hour');
    const activitySelect = document.getElementById('auspicious-activity');
    const targetDateInput = document.getElementById('auspicious-target-date');
    const submitBtn = document.getElementById('auspicious-submit');
    const resultDiv = document.getElementById('auspicious-result');

    if (!birthInput || !submitBtn) {
        console.error('Auspicious day elements not found');
        return;
    }

    // 设置默认生日（30年前）
    const defaultBirthDate = new Date();
    defaultBirthDate.setFullYear(defaultBirthDate.getFullYear() - 30);
    birthInput.valueAsDate = defaultBirthDate;

    // 设置默认目标日期（一周后）
    const defaultTargetDate = new Date();
    defaultTargetDate.setDate(defaultTargetDate.getDate() + 7);
    targetDateInput.valueAsDate = defaultTargetDate;

    submitBtn.addEventListener('click', () => {
        const birthDate = birthInput.value;
        const hourIndex = parseInt(hourSelect.value);
        const gender = document.querySelector('input[name="auspicious-gender"]:checked').value;
        const activity = activitySelect.value;
        const targetDateValue = targetDateInput.value;

        if (!birthDate) {
            alert('请选择你的出生日期哦~');
            return;
        }

        if (!targetDateValue) {
            alert('请选择你计划的日期哦~');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Kitty正在算日子...</span>';

        setTimeout(() => {
            try {
                // 计算用户八字
                const userBazi = BaZi.calculate(birthDate, hourIndex, gender);
                const targetDate = new Date(targetDateValue);

                // 生成择日报告
                const report = AuspiciousDay.generateReport(targetDate, activity, userBazi);

                // 渲染结果
                resultDiv.innerHTML = AuspiciousDay.renderResult(report);
                resultDiv.classList.remove('hidden');

                // 记录功能使用
                Tracker.logFeatureUsage('auspicious', { birthdate: birthDate, gender, activity, targetDate: targetDateValue });

                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (error) {
                console.error('择日分析错误:', error);
                resultDiv.innerHTML = '<div class="analysis-card"><p>分析出错，请重试</p></div>';
                resultDiv.classList.remove('hidden');
            }

            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>🔮 Kitty帮你选日子~</span><span class="btn-glow"></span>';
        }, 800);
    });
}
