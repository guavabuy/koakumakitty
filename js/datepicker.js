/**
 * Android 自定义日期选择器
 * 解决 Android Chrome 日期选择器不能直接选年份的问题
 * iOS 用户继续使用原生选择器
 */

(function () {
    'use strict';

    // 检测是否是 Android 设备
    function isAndroid() {
        return /android/i.test(navigator.userAgent);
    }

    // 如果不是 Android，直接返回
    if (!isAndroid()) {
        console.log('[DatePicker] iOS/Desktop detected, using native picker');
        return;
    }

    console.log('[DatePicker] Android detected, initializing custom date picker');

    // 中文月份名
    const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

    // 当前状态
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let selectedDate = null;
    let currentInput = null;
    let pickerOverlay = null;
    let pickerContainer = null;
    let viewMode = 'calendar'; // 'calendar', 'year', 'month'

    // 年份范围
    const MIN_YEAR = 1924;
    const MAX_YEAR = new Date().getFullYear() + 1;

    // 创建选择器 DOM
    function createPicker() {
        // 创建遮罩层
        pickerOverlay = document.createElement('div');
        pickerOverlay.className = 'android-datepicker-overlay';
        pickerOverlay.addEventListener('click', closePicker);

        // 创建选择器容器
        pickerContainer = document.createElement('div');
        pickerContainer.className = 'android-datepicker';

        document.body.appendChild(pickerOverlay);
        document.body.appendChild(pickerContainer);
    }

    // 渲染选择器
    function renderPicker() {
        if (viewMode === 'year') {
            renderYearView();
        } else if (viewMode === 'month') {
            renderMonthView();
        } else {
            renderCalendarView();
        }
    }

    // 渲染日历视图
    function renderCalendarView() {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();

        let html = `
            <div class="datepicker-header">
                <button class="datepicker-nav prev" data-action="prev-month">&lt;</button>
                <div class="datepicker-title">
                    <span class="datepicker-year-btn" data-action="show-year">${currentYear}年</span>
                    <span class="datepicker-month-btn" data-action="show-month">${currentMonth + 1}月</span>
                </div>
                <button class="datepicker-nav next" data-action="next-month">&gt;</button>
            </div>
            <div class="datepicker-hint">👆 点击年份/月份可快速跳转</div>
            <div class="datepicker-weekdays">
                ${WEEKDAYS.map(d => `<span>${d}</span>`).join('')}
            </div>
            <div class="datepicker-days">
        `;

        // 填充空白天
        for (let i = 0; i < firstDay; i++) {
            html += `<span class="datepicker-day empty"></span>`;
        }

        // 填充日期
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatDate(currentYear, currentMonth, day);
            const isSelected = selectedDate === dateStr;
            const isToday = isCurrentDay(currentYear, currentMonth, day);
            let className = 'datepicker-day';
            if (isSelected) className += ' selected';
            if (isToday) className += ' today';
            html += `<span class="${className}" data-date="${dateStr}">${day}</span>`;
        }

        html += `
            </div>
            <div class="datepicker-footer">
                <button class="datepicker-btn cancel" data-action="cancel">取消</button>
                <button class="datepicker-btn today-btn" data-action="today">今天</button>
                <button class="datepicker-btn confirm" data-action="confirm">确定</button>
            </div>
        `;

        pickerContainer.innerHTML = html;
        attachEvents();
    }

    // 渲染年份选择视图
    function renderYearView() {
        let html = `
            <div class="datepicker-header">
                <button class="datepicker-nav" data-action="back-to-calendar">✕</button>
                <div class="datepicker-title">选择年份</div>
                <span></span>
            </div>
            <div class="datepicker-years">
        `;

        // 生成年份列表（倒序，最新年份在前）
        for (let year = MAX_YEAR; year >= MIN_YEAR; year--) {
            const isSelected = year === currentYear;
            const isCurrent = year === new Date().getFullYear();
            let className = 'datepicker-year';
            if (isSelected) className += ' selected';
            if (isCurrent) className += ' current';
            html += `<span class="${className}" data-year="${year}">${year}年</span>`;
        }

        html += `</div>`;

        pickerContainer.innerHTML = html;
        attachEvents();

        // 滚动到当前选中的年份
        setTimeout(() => {
            const selectedYear = pickerContainer.querySelector('.datepicker-year.selected');
            if (selectedYear) {
                selectedYear.scrollIntoView({ block: 'center', behavior: 'instant' });
            }
        }, 50);
    }

    // 渲染月份选择视图
    function renderMonthView() {
        let html = `
            <div class="datepicker-header">
                <button class="datepicker-nav" data-action="back-to-calendar">✕</button>
                <div class="datepicker-title">${currentYear}年 - 选择月份</div>
                <span></span>
            </div>
            <div class="datepicker-months">
        `;

        for (let month = 0; month < 12; month++) {
            const isSelected = month === currentMonth;
            const isCurrent = month === new Date().getMonth() && currentYear === new Date().getFullYear();
            let className = 'datepicker-month';
            if (isSelected) className += ' selected';
            if (isCurrent) className += ' current';
            html += `<span class="${className}" data-month="${month}">${MONTHS[month]}</span>`;
        }

        html += `</div>`;

        pickerContainer.innerHTML = html;
        attachEvents();
    }

    // 绑定事件
    function attachEvents() {
        // 日期点击
        pickerContainer.querySelectorAll('.datepicker-day:not(.empty)').forEach(el => {
            el.addEventListener('click', function () {
                selectedDate = this.dataset.date;
                renderPicker();
            });
        });

        // 年份点击
        pickerContainer.querySelectorAll('.datepicker-year').forEach(el => {
            el.addEventListener('click', function () {
                currentYear = parseInt(this.dataset.year);
                viewMode = 'calendar';
                renderPicker();
            });
        });

        // 月份点击
        pickerContainer.querySelectorAll('.datepicker-month').forEach(el => {
            el.addEventListener('click', function () {
                currentMonth = parseInt(this.dataset.month);
                viewMode = 'calendar';
                renderPicker();
            });
        });

        // 导航按钮
        pickerContainer.querySelectorAll('[data-action]').forEach(el => {
            el.addEventListener('click', function (e) {
                e.stopPropagation();
                const action = this.dataset.action;
                handleAction(action);
            });
        });
    }

    // 处理动作
    function handleAction(action) {
        switch (action) {
            case 'prev-month':
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                renderPicker();
                break;
            case 'next-month':
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                renderPicker();
                break;
            case 'show-year':
                viewMode = 'year';
                renderPicker();
                break;
            case 'show-month':
                viewMode = 'month';
                renderPicker();
                break;
            case 'back-to-calendar':
                viewMode = 'calendar';
                renderPicker();
                break;
            case 'today':
                const today = new Date();
                currentYear = today.getFullYear();
                currentMonth = today.getMonth();
                selectedDate = formatDate(currentYear, currentMonth, today.getDate());
                renderPicker();
                break;
            case 'confirm':
                if (selectedDate && currentInput) {
                    currentInput.value = selectedDate;
                    // 触发 change 事件
                    currentInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
                closePicker();
                break;
            case 'cancel':
                closePicker();
                break;
        }
    }

    // 格式化日期
    function formatDate(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // 检查是否是今天
    function isCurrentDay(year, month, day) {
        const today = new Date();
        return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    }

    // 打开选择器
    function openPicker(input) {
        currentInput = input;

        // 解析当前值
        if (input.value) {
            const parts = input.value.split('-');
            if (parts.length === 3) {
                currentYear = parseInt(parts[0]);
                currentMonth = parseInt(parts[1]) - 1;
                selectedDate = input.value;
            }
        } else {
            const today = new Date();
            currentYear = today.getFullYear();
            currentMonth = today.getMonth();
            selectedDate = null;
        }

        viewMode = 'calendar';
        pickerOverlay.classList.add('active');
        pickerContainer.classList.add('active');
        document.body.style.overflow = 'hidden';
        renderPicker();
    }

    // 关闭选择器
    function closePicker() {
        pickerOverlay.classList.remove('active');
        pickerContainer.classList.remove('active');
        document.body.style.overflow = '';
        currentInput = null;
    }

    // 拦截所有日期输入框
    function interceptDateInputs() {
        document.querySelectorAll('input[type="date"]').forEach(input => {
            if (input.dataset.customPickerAttached) return;
            input.dataset.customPickerAttached = 'true';

            // 阻止原生选择器
            input.addEventListener('click', function (e) {
                e.preventDefault();
                openPicker(this);
            });

            input.addEventListener('focus', function (e) {
                e.preventDefault();
                this.blur();
                openPicker(this);
            });
        });
    }

    // 初始化
    function init() {
        createPicker();
        interceptDateInputs();

        // 监听 DOM 变化，处理动态添加的输入框
        const observer = new MutationObserver(() => {
            interceptDateInputs();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // 添加样式
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Android 日期选择器遮罩 */
            .android-datepicker-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 9998;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            .android-datepicker-overlay.active {
                opacity: 1;
                visibility: visible;
            }

            /* 选择器容器 */
            .android-datepicker {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #fff;
                border-radius: 20px 20px 0 0;
                z-index: 9999;
                transform: translateY(100%);
                transition: transform 0.3s ease;
                max-height: 80vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            .android-datepicker.active {
                transform: translateY(0);
            }

            /* 头部 */
            .datepicker-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                background: linear-gradient(180deg, #FF8FB8 0%, #FF6B9D 100%);
                color: #fff;
            }
            .datepicker-nav {
                width: 36px;
                height: 36px;
                border: none;
                background: rgba(255,255,255,0.2);
                color: #fff;
                font-size: 18px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .datepicker-nav:active {
                background: rgba(255,255,255,0.3);
            }
            .datepicker-title {
                font-size: 18px;
                font-weight: 700;
                display: flex;
                gap: 8px;
            }
            .datepicker-year-btn,
            .datepicker-month-btn {
                cursor: pointer;
                padding: 4px 12px;
                background: rgba(255,255,255,0.2);
                border-radius: 20px;
                transition: all 0.2s;
            }
            .datepicker-year-btn:active,
            .datepicker-month-btn:active {
                background: rgba(255,255,255,0.4);
            }

            /* 提示文字 */
            .datepicker-hint {
                text-align: center;
                padding: 8px;
                font-size: 12px;
                color: #FF6B9D;
                background: #FFF5F8;
            }

            /* 星期头 */
            .datepicker-weekdays {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                padding: 12px 16px;
                background: #FFF5F8;
            }
            .datepicker-weekdays span {
                text-align: center;
                font-size: 13px;
                color: #999;
                font-weight: 500;
            }

            /* 日期 */
            .datepicker-days {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                padding: 8px 16px;
                gap: 4px;
            }
            .datepicker-day {
                aspect-ratio: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 15px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.2s;
            }
            .datepicker-day:not(.empty):active {
                background: #FFF0F5;
            }
            .datepicker-day.selected {
                background: linear-gradient(180deg, #FF8FB8 0%, #FF6B9D 100%);
                color: #fff;
                font-weight: 700;
            }
            .datepicker-day.today:not(.selected) {
                border: 2px solid #FF6B9D;
                color: #FF6B9D;
                font-weight: 600;
            }
            .datepicker-day.empty {
                cursor: default;
            }

            /* 年份列表 */
            .datepicker-years {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                padding: 16px;
                gap: 8px;
                max-height: 50vh;
                overflow-y: auto;
                -webkit-overflow-scrolling: touch;
            }
            .datepicker-year {
                padding: 12px 8px;
                text-align: center;
                border-radius: 12px;
                cursor: pointer;
                font-size: 15px;
                transition: all 0.2s;
                background: #F9FAFB;
            }
            .datepicker-year:active {
                background: #FFF0F5;
            }
            .datepicker-year.selected {
                background: linear-gradient(180deg, #FF8FB8 0%, #FF6B9D 100%);
                color: #fff;
                font-weight: 700;
            }
            .datepicker-year.current:not(.selected) {
                border: 2px solid #FF6B9D;
                color: #FF6B9D;
            }

            /* 月份列表 */
            .datepicker-months {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                padding: 24px 16px;
                gap: 12px;
            }
            .datepicker-month {
                padding: 16px 8px;
                text-align: center;
                border-radius: 12px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.2s;
                background: #F9FAFB;
            }
            .datepicker-month:active {
                background: #FFF0F5;
            }
            .datepicker-month.selected {
                background: linear-gradient(180deg, #FF8FB8 0%, #FF6B9D 100%);
                color: #fff;
                font-weight: 700;
            }
            .datepicker-month.current:not(.selected) {
                border: 2px solid #FF6B9D;
                color: #FF6B9D;
            }

            /* 底部按钮 */
            .datepicker-footer {
                display: flex;
                justify-content: space-between;
                padding: 16px 20px;
                border-top: 1px solid #eee;
                gap: 12px;
            }
            .datepicker-btn {
                flex: 1;
                padding: 14px 16px;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            .datepicker-btn.cancel {
                background: #F3F4F6;
                color: #666;
            }
            .datepicker-btn.today-btn {
                background: #FFF5F8;
                color: #FF6B9D;
                border: 1px solid #FF6B9D;
            }
            .datepicker-btn.confirm {
                background: linear-gradient(180deg, #FF8FB8 0%, #FF6B9D 100%);
                color: #fff;
            }
            .datepicker-btn:active {
                transform: scale(0.98);
            }
        `;
        document.head.appendChild(style);
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addStyles();
            init();
        });
    } else {
        addStyles();
        init();
    }
})();
