/**
 * 节气数据与计算模块
 * 基于天文算法计算24节气精确时刻
 * 
 * 节气顺序（按公历年内排列）：
 * 0-小寒, 1-大寒, 2-立春, 3-雨水, 4-惊蛰, 5-春分,
 * 6-清明, 7-谷雨, 8-立夏, 9-小满, 10-芒种, 11-夏至,
 * 12-小暑, 13-大暑, 14-立秋, 15-处暑, 16-白露, 17-秋分,
 * 18-寒露, 19-霜降, 20-立冬, 21-小雪, 22-大雪, 23-冬至
 */

// ===== 节气名称常量 =====
export const SOLAR_TERM_NAMES = [
    '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
    '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
    '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
    '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
];

// 节气索引常量（方便引用）
export const SOLAR_TERM_INDEX = {
    XIAO_HAN: 0,    // 小寒
    DA_HAN: 1,      // 大寒
    LI_CHUN: 2,     // 立春 ← 命理年开始
    YU_SHUI: 3,     // 雨水
    JING_ZHE: 4,    // 惊蛰 ← 卯月开始
    CHUN_FEN: 5,    // 春分
    QING_MING: 6,   // 清明 ← 辰月开始
    GU_YU: 7,       // 谷雨
    LI_XIA: 8,      // 立夏 ← 巳月开始
    XIAO_MAN: 9,    // 小满
    MANG_ZHONG: 10, // 芒种 ← 午月开始
    XIA_ZHI: 11,    // 夏至
    XIAO_SHU: 12,   // 小暑 ← 未月开始
    DA_SHU: 13,     // 大暑
    LI_QIU: 14,     // 立秋 ← 申月开始
    CHU_SHU: 15,    // 处暑
    BAI_LU: 16,     // 白露 ← 酉月开始
    QIU_FEN: 17,    // 秋分
    HAN_LU: 18,     // 寒露 ← 戌月开始
    SHUANG_JIANG: 19, // 霜降
    LI_DONG: 20,    // 立冬 ← 亥月开始
    XIAO_XUE: 21,   // 小雪
    DA_XUE: 22,     // 大雪 ← 子月开始
    DONG_ZHI: 23    // 冬至
};

// 月建起始节气索引（寅月=0, 卯月=1, ... 丑月=11）
// 每个月建从哪个节气开始
export const MONTH_START_SOLAR_TERM = [
    2,  // 寅月(正月) - 立春
    4,  // 卯月(二月) - 惊蛰
    6,  // 辰月(三月) - 清明
    8,  // 巳月(四月) - 立夏
    10, // 午月(五月) - 芒种
    12, // 未月(六月) - 小暑
    14, // 申月(七月) - 立秋
    16, // 酉月(八月) - 白露
    18, // 戌月(九月) - 寒露
    20, // 亥月(十月) - 立冬
    22, // 子月(冬月) - 大雪
    0   // 丑月(腊月) - 小寒
];

// ===== 天文算法常量 =====
// 基于VSOP87理论的简化算法

// 儒略日基准 (J2000.0 = 2000年1月1日12:00 TT)
const J2000 = 2451545.0;

// 每度对应的儒略日数（太阳黄经）
const DEGREES_PER_DAY = 360.0 / 365.2422;

// 节气对应的太阳黄经度数
const SOLAR_TERM_DEGREES = [
    285, 300, 315, 330, 345, 0,    // 小寒到春分
    15, 30, 45, 60, 75, 90,        // 清明到夏至
    105, 120, 135, 150, 165, 180,  // 小暑到秋分
    195, 210, 225, 240, 255, 270   // 寒露到冬至
];

/**
 * 计算儒略日 (Julian Day)
 * @param {number} year - 年
 * @param {number} month - 月 (1-12)
 * @param {number} day - 日
 * @param {number} hour - 时 (0-23)
 * @param {number} minute - 分 (0-59)
 * @returns {number} 儒略日
 */
function toJulianDay(year, month, day, hour = 12, minute = 0) {
    if (month <= 2) {
        year -= 1;
        month += 12;
    }
    
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    
    const JD = Math.floor(365.25 * (year + 4716)) +
               Math.floor(30.6001 * (month + 1)) +
               day + B - 1524.5 +
               (hour + minute / 60) / 24;
    
    return JD;
}

/**
 * 儒略日转公历日期时间
 * @param {number} jd - 儒略日
 * @returns {Object} { year, month, day, hour, minute }
 */
function fromJulianDay(jd) {
    const Z = Math.floor(jd + 0.5);
    const F = jd + 0.5 - Z;
    
    let A;
    if (Z < 2299161) {
        A = Z;
    } else {
        const alpha = Math.floor((Z - 1867216.25) / 36524.25);
        A = Z + 1 + alpha - Math.floor(alpha / 4);
    }
    
    const B = A + 1524;
    const C = Math.floor((B - 122.1) / 365.25);
    const D = Math.floor(365.25 * C);
    const E = Math.floor((B - D) / 30.6001);
    
    const day = B - D - Math.floor(30.6001 * E);
    const month = E < 14 ? E - 1 : E - 13;
    const year = month > 2 ? C - 4716 : C - 4715;
    
    const totalHours = F * 24;
    const hour = Math.floor(totalHours);
    const minute = Math.floor((totalHours - hour) * 60);
    
    return { year, month, day, hour, minute };
}

/**
 * 计算太阳黄经 (简化算法，精度约1分钟)
 * @param {number} jd - 儒略日
 * @returns {number} 太阳黄经 (度)
 */
function getSunLongitude(jd) {
    // 以J2000.0为基准的儒略世纪数
    const T = (jd - J2000) / 36525;
    
    // 太阳平黄经
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    
    // 太阳平近点角
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const Mrad = M * Math.PI / 180;
    
    // 太阳中心差
    const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
              (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
              0.000289 * Math.sin(3 * Mrad);
    
    // 太阳真黄经
    let sunLon = L0 + C;
    
    // 归一化到 0-360
    sunLon = sunLon % 360;
    if (sunLon < 0) sunLon += 360;
    
    return sunLon;
}

/**
 * 计算指定年份某个节气的精确时刻
 * @param {number} year - 年份
 * @param {number} termIndex - 节气索引 (0-23)
 * @returns {Object} { year, month, day, hour, minute }
 */
export function getSolarTermMoment(year, termIndex) {
    const targetDegree = SOLAR_TERM_DEGREES[termIndex];
    
    // 估算初始日期
    // 节气大约每15.2天一个
    let month, day;
    
    // 根据节气索引估算月份和日期
    const termMonthDay = [
        [1, 6],   // 小寒
        [1, 20],  // 大寒
        [2, 4],   // 立春
        [2, 19],  // 雨水
        [3, 6],   // 惊蛰
        [3, 21],  // 春分
        [4, 5],   // 清明
        [4, 20],  // 谷雨
        [5, 6],   // 立夏
        [5, 21],  // 小满
        [6, 6],   // 芒种
        [6, 21],  // 夏至
        [7, 7],   // 小暑
        [7, 23],  // 大暑
        [8, 7],   // 立秋
        [8, 23],  // 处暑
        [9, 8],   // 白露
        [9, 23],  // 秋分
        [10, 8],  // 寒露
        [10, 23], // 霜降
        [11, 7],  // 立冬
        [11, 22], // 小雪
        [12, 7],  // 大雪
        [12, 22]  // 冬至
    ];
    
    [month, day] = termMonthDay[termIndex];
    
    // 初始儒略日
    let jd = toJulianDay(year, month, day, 12, 0);
    
    // 牛顿迭代法求解
    for (let i = 0; i < 10; i++) {
        const sunLon = getSunLongitude(jd);
        
        // 计算差值
        let diff = targetDegree - sunLon;
        
        // 处理跨越0度的情况
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;
        
        // 如果足够接近，退出
        if (Math.abs(diff) < 0.0001) break;
        
        // 调整儒略日
        jd += diff / DEGREES_PER_DAY;
    }
    
    // 转换为北京时间 (UTC+8)
    // 天文计算通常基于世界时，需要加8小时
    jd += 8 / 24;
    
    return fromJulianDay(jd);
}

/**
 * 获取指定年份所有24节气的时刻
 * @param {number} year - 年份
 * @returns {Array<Object>} 24个节气时刻数组
 */
export function getAllSolarTermsOfYear(year) {
    const terms = [];
    for (let i = 0; i < 24; i++) {
        const moment = getSolarTermMoment(year, i);
        terms.push({
            index: i,
            name: SOLAR_TERM_NAMES[i],
            ...moment
        });
    }
    return terms;
}

/**
 * 获取指定年份立春的精确时刻
 * @param {number} year - 公历年份
 * @returns {Date} 立春时刻 (北京时间)
 */
export function getLiChunMoment(year) {
    const moment = getSolarTermMoment(year, SOLAR_TERM_INDEX.LI_CHUN);
    return new Date(moment.year, moment.month - 1, moment.day, moment.hour, moment.minute);
}

/**
 * 判断给定日期时间处于哪个节气区间
 * @param {Date} date - 日期时间
 * @returns {Object} { termIndex, termName, nextTermIndex, nextTermName, nextTermDate }
 */
export function getCurrentSolarTerm(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    // 获取当年和上一年、下一年的节气
    const prevYearTerms = getAllSolarTermsOfYear(year - 1);
    const currentYearTerms = getAllSolarTermsOfYear(year);
    const nextYearTerms = getAllSolarTermsOfYear(year + 1);
    
    // 合并成一个连续序列，方便查找
    const allTerms = [
        ...prevYearTerms.slice(-2).map(t => ({ ...t, year: year - 1 })),  // 上一年的大雪、冬至
        ...currentYearTerms.map(t => ({ ...t, year })),
        ...nextYearTerms.slice(0, 2).map(t => ({ ...t, year: year + 1 })) // 下一年的小寒、大寒
    ];
    
    // 找到当前日期所处的节气区间
    for (let i = 0; i < allTerms.length - 1; i++) {
        const term = allTerms[i];
        const nextTerm = allTerms[i + 1];
        
        const termDate = new Date(term.year, term.month - 1, term.day, term.hour, term.minute);
        const nextTermDate = new Date(nextTerm.year, nextTerm.month - 1, nextTerm.day, nextTerm.hour, nextTerm.minute);
        
        if (date >= termDate && date < nextTermDate) {
            return {
                termIndex: term.index,
                termName: term.name,
                termDate: termDate,
                nextTermIndex: nextTerm.index,
                nextTermName: nextTerm.name,
                nextTermDate: nextTermDate
            };
        }
    }
    
    // 默认返回（不应该到达这里）
    return {
        termIndex: 0,
        termName: SOLAR_TERM_NAMES[0],
        termDate: new Date(),
        nextTermIndex: 1,
        nextTermName: SOLAR_TERM_NAMES[1],
        nextTermDate: new Date()
    };
}

/**
 * 根据节气确定月建地支索引
 * @param {Date} date - 日期时间
 * @returns {Object} { monthIndex: 0-11 (寅月=0), branchIndex: 2-1 (寅=2...丑=1), termName }
 */
export function getMonthBranch(date) {
    const { termIndex, termName } = getCurrentSolarTerm(date);
    
    // 根据节气索引确定月建
    // 立春(2)开始是寅月(0), 惊蛰(4)开始是卯月(1)...
    // 小寒(0)、大寒(1)是丑月(11)
    
    let monthIndex;
    if (termIndex === 0 || termIndex === 1) {
        // 小寒、大寒 -> 丑月
        monthIndex = 11;
    } else {
        // 其他节气：(termIndex - 2) / 2 向下取整
        monthIndex = Math.floor((termIndex - 2) / 2);
    }
    
    // 月建地支索引：寅=2, 卯=3, ... 子=0, 丑=1
    // monthIndex: 0=寅月, 1=卯月, ... 11=丑月
    // branchIndex: 寅=2, 卯=3, 辰=4, 巳=5, 午=6, 未=7, 申=8, 酉=9, 戌=10, 亥=11, 子=0, 丑=1
    const branchIndex = (monthIndex + 2) % 12;
    
    return {
        monthIndex,      // 0-11 (寅月=0, 卯月=1, ...)
        branchIndex,     // 地支索引 (子=0, 丑=1, 寅=2, ...)
        termName,        // 当前节气名称
        termIndex        // 当前节气索引
    };
}

// ===== 节气数据缓存 =====
// 为了提高性能，缓存常用年份的节气数据
const solarTermsCache = new Map();

/**
 * 获取指定年份的节气数据（带缓存）
 * @param {number} year - 年份
 * @returns {Array<Object>}
 */
export function getSolarTermsCached(year) {
    if (!solarTermsCache.has(year)) {
        solarTermsCache.set(year, getAllSolarTermsOfYear(year));
    }
    return solarTermsCache.get(year);
}

/**
 * 清除节气缓存
 */
export function clearSolarTermsCache() {
    solarTermsCache.clear();
}

// ===== 调试工具 =====
/**
 * 打印指定年份的24节气表（调试用）
 * @param {number} year - 年份
 */
export function printSolarTermsTable(year) {
    const terms = getAllSolarTermsOfYear(year);
    console.log(`===== ${year}年24节气表 =====`);
    terms.forEach(term => {
        const dateStr = `${term.month}月${term.day}日 ${String(term.hour).padStart(2, '0')}:${String(term.minute).padStart(2, '0')}`;
        console.log(`${term.name}: ${dateStr}`);
    });
}

