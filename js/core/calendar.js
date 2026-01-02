/**
 * 历法核心模块 - 统一干支计算API
 * 基于倪师《天纪》理论，实现节气口径的年柱、月柱计算
 * 
 * 核心原则：
 * 1. 年柱：立春换年（不是公历1月1日）
 * 2. 月柱：节气定月（寅月从立春起，不是公历月份）
 * 3. 日柱：统一儒略日算法
 * 4. 时柱：时辰按起点计算
 * 5. 时区：统一使用北京时间 (Asia/Shanghai, UTC+8)
 */

import {
    getLiChunMoment,
    getMonthBranch,
    getCurrentSolarTerm,
    getSolarTermMoment,
    SOLAR_TERM_NAMES,
    SOLAR_TERM_INDEX
} from './solar_terms.js';

// ===== 基础常量 =====

// 十天干
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 十二地支
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干五行
export const STEM_ELEMENTS = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
};

// 地支五行
export const BRANCH_ELEMENTS = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 天干阴阳
export const STEM_YIN_YANG = {
    '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴',
    '戊': '阳', '己': '阴', '庚': '阳', '辛': '阴',
    '壬': '阳', '癸': '阴'
};

// 地支阴阳
export const BRANCH_YIN_YANG = {
    '子': '阳', '丑': '阴', '寅': '阳', '卯': '阴',
    '辰': '阳', '巳': '阴', '午': '阳', '未': '阴',
    '申': '阳', '酉': '阴', '戌': '阳', '亥': '阴'
};

// 十二生肖
export const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];

// 时辰范围（按起点计算）
// 用户选择：默认按时辰起点
export const HOUR_RANGES = [
    { index: 0, branch: '子', startHour: 23, endHour: 1, label: '子时 (23:00-01:00)' },
    { index: 1, branch: '丑', startHour: 1, endHour: 3, label: '丑时 (01:00-03:00)' },
    { index: 2, branch: '寅', startHour: 3, endHour: 5, label: '寅时 (03:00-05:00)' },
    { index: 3, branch: '卯', startHour: 5, endHour: 7, label: '卯时 (05:00-07:00)' },
    { index: 4, branch: '辰', startHour: 7, endHour: 9, label: '辰时 (07:00-09:00)' },
    { index: 5, branch: '巳', startHour: 9, endHour: 11, label: '巳时 (09:00-11:00)' },
    { index: 6, branch: '午', startHour: 11, endHour: 13, label: '午时 (11:00-13:00)' },
    { index: 7, branch: '未', startHour: 13, endHour: 15, label: '未时 (13:00-15:00)' },
    { index: 8, branch: '申', startHour: 15, endHour: 17, label: '申时 (15:00-17:00)' },
    { index: 9, branch: '酉', startHour: 17, endHour: 19, label: '酉时 (17:00-19:00)' },
    { index: 10, branch: '戌', startHour: 19, endHour: 21, label: '戌时 (19:00-21:00)' },
    { index: 11, branch: '亥', startHour: 21, endHour: 23, label: '亥时 (21:00-23:00)' }
];

// 时区偏移（北京时间 UTC+8）
export const TIMEZONE_OFFSET_HOURS = 8;

// ===== 核心计算 API =====

export const ChineseCalendar = {
    // 导出常量供外部使用
    STEMS: HEAVENLY_STEMS,
    BRANCHES: EARTHLY_BRANCHES,
    STEM_ELEMENTS,
    BRANCH_ELEMENTS,
    STEM_YIN_YANG,
    BRANCH_YIN_YANG,
    ZODIAC_ANIMALS,
    HOUR_RANGES,
    TIMEZONE_OFFSET_HOURS,

    /**
     * FR-1: 获取命理年（立春换年）
     * 立春前属于上一年，立春后属于当年
     * 
     * @param {Date} dateTime - 出生日期时间
     * @returns {number} 命理年份
     */
    getMingLiYear(dateTime) {
        const year = dateTime.getFullYear();
        const liChun = getLiChunMoment(year);
        
        // 如果在立春之前，命理年为上一年
        if (dateTime < liChun) {
            return year - 1;
        }
        return year;
    },

    /**
     * FR-2: 获取节气月建
     * 寅月从立春起，依序到丑月
     * 
     * @param {Date} dateTime - 日期时间
     * @returns {Object} { monthIndex, branchIndex, branchName, termName, termIndex }
     */
    getSolarTermMonth(dateTime) {
        const result = getMonthBranch(dateTime);
        return {
            monthIndex: result.monthIndex,      // 0-11 (寅月=0)
            branchIndex: result.branchIndex,    // 地支索引 (子=0, 丑=1, 寅=2, ...)
            branchName: EARTHLY_BRANCHES[result.branchIndex],
            termName: result.termName,
            termIndex: result.termIndex
        };
    },

    /**
     * FR-3: 计算年柱（基于命理年）
     * 
     * @param {number} mingLiYear - 命理年份
     * @returns {Object} { stem, branch, stemIndex, branchIndex }
     */
    getYearPillar(mingLiYear) {
        // 天干：(年份 - 4) % 10
        // 地支：(年份 - 4) % 12
        const stemIndex = ((mingLiYear - 4) % 10 + 10) % 10;
        const branchIndex = ((mingLiYear - 4) % 12 + 12) % 12;
        
        return {
            stem: HEAVENLY_STEMS[stemIndex],
            branch: EARTHLY_BRANCHES[branchIndex],
            stemIndex,
            branchIndex,
            pillar: HEAVENLY_STEMS[stemIndex] + EARTHLY_BRANCHES[branchIndex]
        };
    },

    /**
     * FR-3: 计算月柱（基于命理年和节气月建）
     * 使用五虎遁月歌诀
     * 
     * @param {number} mingLiYear - 命理年份
     * @param {number} monthBranchIndex - 月建地支索引 (寅=2, 卯=3, ...)
     * @returns {Object} { stem, branch, stemIndex, branchIndex }
     */
    getMonthPillar(mingLiYear, monthBranchIndex) {
        // 获取年干
        const yearPillar = this.getYearPillar(mingLiYear);
        const yearStemIndex = yearPillar.stemIndex;
        
        // 五虎遁月歌诀：
        // 甲己之年丙作首 (yearStemIndex % 5 === 0) -> 寅月从丙开始
        // 乙庚之年戊为头 (yearStemIndex % 5 === 1) -> 寅月从戊开始
        // 丙辛之岁从庚起 (yearStemIndex % 5 === 2) -> 寅月从庚开始
        // 丁壬壬位顺行流 (yearStemIndex % 5 === 3) -> 寅月从壬开始
        // 戊癸之年甲起头 (yearStemIndex % 5 === 4) -> 寅月从甲开始
        
        const monthStartStemMap = [2, 4, 6, 8, 0]; // 丙、戊、庚、壬、甲的索引
        const startStemIndex = monthStartStemMap[yearStemIndex % 5];
        
        // 计算月干索引
        // monthBranchIndex: 寅=2, 卯=3, ... 子=0, 丑=1
        // 需要计算从寅月开始的偏移量
        const monthOffset = (monthBranchIndex - 2 + 12) % 12;
        const monthStemIndex = (startStemIndex + monthOffset) % 10;
        
        return {
            stem: HEAVENLY_STEMS[monthStemIndex],
            branch: EARTHLY_BRANCHES[monthBranchIndex],
            stemIndex: monthStemIndex,
            branchIndex: monthBranchIndex,
            pillar: HEAVENLY_STEMS[monthStemIndex] + EARTHLY_BRANCHES[monthBranchIndex]
        };
    },

    /**
     * FR-3: 计算日柱（统一儒略日算法）
     * 基准：1949年10月1日为甲子日（已验证的准确基准）
     * 
     * @param {Date} date - 日期
     * @returns {Object} { stem, branch, stemIndex, branchIndex }
     */
    getDayPillar(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // 计算儒略日
        let a = Math.floor((14 - month) / 12);
        let y = year + 4800 - a;
        let m = month + 12 * a - 3;
        
        let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y +
                 Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
        
        // 基准：1949年10月1日的儒略日，该日为甲子日
        const baseJD = 2433191;
        const baseStemIndex = 0;   // 甲
        const baseBranchIndex = 0; // 子
        
        const diff = jd - baseJD;
        const stemIndex = ((diff % 10) + baseStemIndex + 10) % 10;
        const branchIndex = ((diff % 12) + baseBranchIndex + 12) % 12;
        
        return {
            stem: HEAVENLY_STEMS[stemIndex],
            branch: EARTHLY_BRANCHES[branchIndex],
            stemIndex,
            branchIndex,
            pillar: HEAVENLY_STEMS[stemIndex] + EARTHLY_BRANCHES[branchIndex]
        };
    },

    /**
     * FR-3: 计算时柱
     * 使用五鼠遁日歌诀
     * 
     * @param {string|number} dayStem - 日干或日干索引
     * @param {number} hourIndex - 时辰索引 (0-11, 子时=0)
     * @returns {Object} { stem, branch, stemIndex, branchIndex }
     */
    getHourPillar(dayStem, hourIndex) {
        // 获取日干索引
        let dayStemIndex;
        if (typeof dayStem === 'string') {
            dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
        } else {
            dayStemIndex = dayStem;
        }
        
        // 五鼠遁日歌诀：
        // 甲己还加甲 (dayStemIndex % 5 === 0) -> 子时从甲开始
        // 乙庚丙作初 (dayStemIndex % 5 === 1) -> 子时从丙开始
        // 丙辛从戊起 (dayStemIndex % 5 === 2) -> 子时从戊开始
        // 丁壬庚子居 (dayStemIndex % 5 === 3) -> 子时从庚开始
        // 戊癸何方发，壬子是真途 (dayStemIndex % 5 === 4) -> 子时从壬开始
        
        const hourStartStemMap = [0, 2, 4, 6, 8]; // 甲、丙、戊、庚、壬的索引
        const startStemIndex = hourStartStemMap[dayStemIndex % 5];
        
        const hourStemIndex = (startStemIndex + hourIndex) % 10;
        
        return {
            stem: HEAVENLY_STEMS[hourStemIndex],
            branch: EARTHLY_BRANCHES[hourIndex],
            stemIndex: hourStemIndex,
            branchIndex: hourIndex,
            pillar: HEAVENLY_STEMS[hourStemIndex] + EARTHLY_BRANCHES[hourIndex]
        };
    },

    /**
     * 将时辰索引转换为具体时间
     * 按时辰起点计算
     * 
     * @param {number} hourIndex - 时辰索引 (0-11)
     * @returns {Object} { startHour, endHour, branch }
     */
    hourIndexToTime(hourIndex) {
        return HOUR_RANGES[hourIndex];
    },

    /**
     * 根据小时判断时辰索引
     * 
     * @param {number} hour - 小时 (0-23)
     * @returns {number} 时辰索引 (0-11)
     */
    hourToHourIndex(hour) {
        if (hour >= 23 || hour < 1) return 0;  // 子时
        if (hour >= 1 && hour < 3) return 1;   // 丑时
        if (hour >= 3 && hour < 5) return 2;   // 寅时
        if (hour >= 5 && hour < 7) return 3;   // 卯时
        if (hour >= 7 && hour < 9) return 4;   // 辰时
        if (hour >= 9 && hour < 11) return 5;  // 巳时
        if (hour >= 11 && hour < 13) return 6; // 午时
        if (hour >= 13 && hour < 15) return 7; // 未时
        if (hour >= 15 && hour < 17) return 8; // 申时
        if (hour >= 17 && hour < 19) return 9; // 酉时
        if (hour >= 19 && hour < 21) return 10; // 戌时
        return 11; // 亥时
    },

    /**
     * 构建出生日期时间（使用时辰起点）
     * 
     * @param {string|Date} birthDate - 出生日期
     * @param {number} hourIndex - 时辰索引 (0-11)
     * @returns {Date} 完整的出生日期时间
     */
    buildBirthDateTime(birthDate, hourIndex) {
        const date = new Date(birthDate);
        const hourInfo = this.hourIndexToTime(hourIndex);
        
        // 子时特殊处理：23:00属于当日
        if (hourIndex === 0) {
            date.setHours(23, 0, 0, 0);
        } else {
            date.setHours(hourInfo.startHour, 0, 0, 0);
        }
        
        return date;
    },

    /**
     * FR-3: 完整四柱计算（带调试信息）
     * 
     * @param {Date} birthDateTime - 出生日期时间
     * @param {number} hourIndex - 时辰索引 (0-11)
     * @returns {Object} { pillars, debug }
     */
    calculateFourPillars(birthDateTime, hourIndex) {
        // 1. 计算命理年
        const mingLiYear = this.getMingLiYear(birthDateTime);
        
        // 2. 获取节气月建
        const monthInfo = this.getSolarTermMonth(birthDateTime);
        
        // 3. 计算四柱
        const yearPillar = this.getYearPillar(mingLiYear);
        const monthPillar = this.getMonthPillar(mingLiYear, monthInfo.branchIndex);
        const dayPillar = this.getDayPillar(birthDateTime);
        const hourPillar = this.getHourPillar(dayPillar.stemIndex, hourIndex);
        
        // 4. 获取立春时刻（用于调试）
        const publicYear = birthDateTime.getFullYear();
        const liChunMoment = getLiChunMoment(publicYear);
        
        // 5. 生肖
        const zodiac = ZODIAC_ANIMALS[yearPillar.branchIndex];
        
        return {
            pillars: {
                year: yearPillar,
                month: monthPillar,
                day: dayPillar,
                hour: hourPillar
            },
            zodiac,
            debug: {
                inputDateTime: birthDateTime.toISOString(),
                publicYear,
                mingLiYear,
                liChunMoment: liChunMoment.toISOString(),
                isBeforeLiChun: birthDateTime < liChunMoment,
                solarTermMonth: {
                    monthIndex: monthInfo.monthIndex,
                    branchIndex: monthInfo.branchIndex,
                    branchName: monthInfo.branchName,
                    termName: monthInfo.termName
                },
                hourIndex,
                hourBranch: EARTHLY_BRANCHES[hourIndex],
                timezone: `UTC+${TIMEZONE_OFFSET_HOURS}`
            }
        };
    },

    /**
     * 简化版四柱计算（用于替代旧接口）
     * 
     * @param {string|Date} birthDate - 出生日期
     * @param {number} hourIndex - 时辰索引 (0-11)
     * @returns {Object} { year, month, day, hour } 每个都是 { stem, branch }
     */
    calculate(birthDate, hourIndex) {
        const birthDateTime = this.buildBirthDateTime(birthDate, hourIndex);
        const { pillars } = this.calculateFourPillars(birthDateTime, hourIndex);
        
        return {
            year: { stem: pillars.year.stem, branch: pillars.year.branch },
            month: { stem: pillars.month.stem, branch: pillars.month.branch },
            day: { stem: pillars.day.stem, branch: pillars.day.branch },
            hour: { stem: pillars.hour.stem, branch: pillars.hour.branch }
        };
    },

    /**
     * 获取当日干支（用于每日运势等）
     * 
     * @param {Date} date - 日期（默认今天）
     * @returns {Object} { yearStem, yearBranch, dayStem, dayBranch, zodiac, ... }
     */
    getTodayGanZhi(date = new Date()) {
        const mingLiYear = this.getMingLiYear(date);
        const yearPillar = this.getYearPillar(mingLiYear);
        const dayPillar = this.getDayPillar(date);
        const monthInfo = this.getSolarTermMonth(date);
        const monthPillar = this.getMonthPillar(mingLiYear, monthInfo.branchIndex);
        
        return {
            yearStem: yearPillar.stem,
            yearBranch: yearPillar.branch,
            monthStem: monthPillar.stem,
            monthBranch: monthPillar.branch,
            dayStem: dayPillar.stem,
            dayBranch: dayPillar.branch,
            zodiac: ZODIAC_ANIMALS[yearPillar.branchIndex],
            solarTerm: monthInfo.termName
        };
    },

    /**
     * 五行相生相克判断
     */
    WuXing: {
        // 相生：木生火，火生土，土生金，金生水，水生木
        generates: { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' },
        
        // 相克：木克土，土克水，水克火，火克金，金克木
        controls: { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' },
        
        /**
         * 获取两个五行的关系
         * @param {string} element1 - 五行1
         * @param {string} element2 - 五行2
         * @returns {string} 关系类型
         */
        getRelation(element1, element2) {
            if (element1 === element2) return '同类';
            if (this.generates[element1] === element2) return '我生';
            if (this.generates[element2] === element1) return '生我';
            if (this.controls[element1] === element2) return '我克';
            if (this.controls[element2] === element1) return '克我';
            return '无关';
        }
    }
};

// 导出默认对象
export default ChineseCalendar;

