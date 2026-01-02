/**
 * 大运计算模块 - 基于倪师《天纪》体系
 * 
 * 核心概念：
 * 1. 大运顺逆：阳年男/阴年女顺排，阴年男/阳年女逆排
 * 2. 起运岁数：出生到最近"节"的天数 ÷ 3 = 起运岁数
 * 3. 交运时间：起运岁数 + 出生年 = 第一步大运开始年
 * 4. 每步大运10年
 * 
 * 规则来源标注：
 * - [NiShi-TJ-01]: 倪师《天纪》大运顺逆口径
 * - [NiShi-TJ-02]: 倪师《天纪》起运计算口径
 * - [NiShi-TJ-03]: 倪师《天纪》大运干支排列口径
 */

import ChineseCalendar, {
    HEAVENLY_STEMS,
    EARTHLY_BRANCHES,
    STEM_ELEMENTS,
    STEM_YIN_YANG,
    BRANCH_ELEMENTS
} from './calendar.js';

import {
    getSolarTermMoment,
    getCurrentSolarTerm,
    SOLAR_TERM_NAMES,
    SOLAR_TERM_INDEX,
    MONTH_START_SOLAR_TERM
} from './solar_terms.js';

// ===== 大运规则常量 =====

/**
 * 节气分类：节与中气
 * "节"用于起运计算，"中气"不参与
 * 
 * 节（12个）：立春、惊蛰、清明、立夏、芒种、小暑、立秋、白露、寒露、立冬、大雪、小寒
 * 中气（12个）：雨水、春分、谷雨、小满、夏至、大暑、处暑、秋分、霜降、小雪、冬至、大寒
 */
export const JIE_TERMS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]; // 小寒、立春、惊蛰...
export const ZHONG_QI_TERMS = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23]; // 大寒、雨水、春分...

// 十神名称
export const TEN_GODS = ['比肩', '劫财', '食神', '伤官', '偏财', '正财', '偏官', '正官', '偏印', '正印'];

/**
 * 大运计算核心类
 */
export class DaYunCalculator {
    
    /**
     * [NiShi-TJ-01] 判断大运顺逆
     * 规则：阳年男/阴年女顺排，阴年男/阳年女逆排
     * 
     * @param {string} yearStem - 年干
     * @param {string} gender - 性别 ('male' | 'female')
     * @returns {Object} { direction: 'forward' | 'backward', ruleRef: string, explanation: string }
     */
    static getDaYunDirection(yearStem, gender) {
        const isYangYear = STEM_YIN_YANG[yearStem] === '阳';
        const isMale = gender === 'male';
        
        // 阳年男/阴年女 → 顺排
        // 阴年男/阳年女 → 逆排
        const isForward = (isYangYear && isMale) || (!isYangYear && !isMale);
        
        return {
            direction: isForward ? 'forward' : 'backward',
            ruleRef: 'NiShi-TJ-01',
            explanation: `${isYangYear ? '阳' : '阴'}年${isMale ? '男' : '女'}命，${isForward ? '顺' : '逆'}排大运`,
            yearStem,
            yearYinYang: isYangYear ? '阳' : '阴',
            gender: isMale ? '男' : '女'
        };
    }
    
    /**
     * [NiShi-TJ-02] 计算起运岁数与交运时间
     * 规则：
     * - 顺排：从出生到下一个"节"的天数
     * - 逆排：从出生到上一个"节"的天数
     * - 天数 ÷ 3 = 起运岁数（按约数计算，3天=1岁，1天≈4个月）
     * 
     * @param {Date} birthDateTime - 出生日期时间
     * @param {string} direction - 顺逆方向 ('forward' | 'backward')
     * @returns {Object} { startAge, startYear, startMonth, daysDiff, targetTermName, ... }
     */
    static calculateQiYun(birthDateTime, direction) {
        const birthYear = birthDateTime.getFullYear();
        const birthMonth = birthDateTime.getMonth() + 1;
        const birthDay = birthDateTime.getDate();
        const birthHour = birthDateTime.getHours();
        const birthMinute = birthDateTime.getMinutes();
        
        // 获取当前节气信息
        const currentTerm = getCurrentSolarTerm(birthDateTime);
        
        // 找到最近的"节"（不是中气）
        let targetTermIndex;
        let targetTermYear;
        let targetTermDate;
        
        if (direction === 'forward') {
            // 顺排：找下一个"节"
            targetTermIndex = this.findNextJie(currentTerm.termIndex, birthYear);
            targetTermYear = targetTermIndex < currentTerm.termIndex ? birthYear + 1 : birthYear;
            
            // 如果当前节气本身是"节"且出生时间正好在节气时刻，找下下个节
            if (JIE_TERMS.includes(currentTerm.termIndex)) {
                const termMoment = getSolarTermMoment(birthYear, currentTerm.termIndex);
                const termDate = new Date(termMoment.year, termMoment.month - 1, termMoment.day, termMoment.hour, termMoment.minute);
                if (birthDateTime >= termDate) {
                    targetTermIndex = this.findNextJie(currentTerm.termIndex + 1, birthYear);
                    targetTermYear = targetTermIndex <= currentTerm.termIndex ? birthYear + 1 : birthYear;
                }
            }
        } else {
            // 逆排：找上一个"节"
            targetTermIndex = this.findPrevJie(currentTerm.termIndex, birthYear);
            targetTermYear = targetTermIndex > currentTerm.termIndex ? birthYear - 1 : birthYear;
            
            // 如果当前节气本身是"节"且出生时间在节气时刻之后，就用当前节
            if (JIE_TERMS.includes(currentTerm.termIndex)) {
                const termMoment = getSolarTermMoment(birthYear, currentTerm.termIndex);
                const termDate = new Date(termMoment.year, termMoment.month - 1, termMoment.day, termMoment.hour, termMoment.minute);
                if (birthDateTime >= termDate) {
                    targetTermIndex = currentTerm.termIndex;
                    targetTermYear = birthYear;
                }
            }
        }
        
        // 获取目标节气的精确时刻
        const termMoment = getSolarTermMoment(targetTermYear, targetTermIndex);
        targetTermDate = new Date(termMoment.year, termMoment.month - 1, termMoment.day, termMoment.hour, termMoment.minute);
        
        // 计算天数差
        const timeDiff = Math.abs(targetTermDate.getTime() - birthDateTime.getTime());
        const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
        
        // 起运岁数计算：3天 = 1岁，1天 = 4个月
        // 取整数岁 + 余数月
        const fullYears = Math.floor(daysDiff / 3);
        const remainingDays = daysDiff % 3;
        const remainingMonths = Math.round(remainingDays * 4); // 1天约4个月
        
        // 起运年份 = 出生年 + 起运岁数
        const startYear = birthYear + fullYears;
        const startMonth = birthMonth + remainingMonths;
        
        // 调整月份溢出
        const adjustedYear = startYear + Math.floor((startMonth - 1) / 12);
        const adjustedMonth = ((startMonth - 1) % 12) + 1;
        
        return {
            startAge: fullYears,
            startAgeMonths: remainingMonths,
            startAgeDesc: remainingMonths > 0 ? `${fullYears}岁${remainingMonths}个月` : `${fullYears}岁`,
            startYear: adjustedYear,
            startMonth: adjustedMonth,
            startDate: new Date(adjustedYear, adjustedMonth - 1, birthDay),
            daysDiff: Math.round(daysDiff * 10) / 10,
            targetTermIndex,
            targetTermName: SOLAR_TERM_NAMES[targetTermIndex],
            targetTermDate,
            direction,
            ruleRef: 'NiShi-TJ-02',
            explanation: `${direction === 'forward' ? '顺排' : '逆排'}：出生距${SOLAR_TERM_NAMES[targetTermIndex]}${Math.round(daysDiff)}天，起运${fullYears}岁${remainingMonths > 0 ? remainingMonths + '个月' : ''}`
        };
    }
    
    /**
     * 找下一个"节"
     */
    static findNextJie(currentTermIndex, year) {
        for (let i = 0; i < JIE_TERMS.length; i++) {
            if (JIE_TERMS[i] > currentTermIndex) {
                return JIE_TERMS[i];
            }
        }
        // 跨年，返回第一个节（小寒）
        return JIE_TERMS[0];
    }
    
    /**
     * 找上一个"节"
     */
    static findPrevJie(currentTermIndex, year) {
        for (let i = JIE_TERMS.length - 1; i >= 0; i--) {
            if (JIE_TERMS[i] < currentTermIndex) {
                return JIE_TERMS[i];
            }
        }
        // 跨年，返回最后一个节（大雪）
        return JIE_TERMS[JIE_TERMS.length - 1];
    }
    
    /**
     * [NiShi-TJ-03] 生成大运表
     * 规则：从月柱开始，顺/逆排10步大运，每步10年
     * 
     * @param {Object} monthPillar - 月柱 { stem, branch, stemIndex, branchIndex }
     * @param {Object} dayPillar - 日柱 { stem, branch }（用于计算十神）
     * @param {string} direction - 顺逆方向 ('forward' | 'backward')
     * @param {Object} qiYunInfo - 起运信息
     * @param {number} steps - 大运步数（默认10步，即100年）
     * @returns {Array} 大运列表
     */
    static generateDaYunTable(monthPillar, dayPillar, direction, qiYunInfo, steps = 10) {
        const daYunList = [];
        const dayMaster = dayPillar.stem;
        
        let currentStemIndex = monthPillar.stemIndex;
        let currentBranchIndex = monthPillar.branchIndex;
        
        for (let i = 0; i < steps; i++) {
            // 计算当前步大运的干支
            if (direction === 'forward') {
                currentStemIndex = (monthPillar.stemIndex + i + 1) % 10;
                currentBranchIndex = (monthPillar.branchIndex + i + 1) % 12;
            } else {
                currentStemIndex = (monthPillar.stemIndex - i - 1 + 10) % 10;
                currentBranchIndex = (monthPillar.branchIndex - i - 1 + 12) % 12;
            }
            
            const stem = HEAVENLY_STEMS[currentStemIndex];
            const branch = EARTHLY_BRANCHES[currentBranchIndex];
            
            // 计算十神
            const tenGod = this.calculateTenGod(dayMaster, stem);
            
            // 计算五行
            const stemElement = STEM_ELEMENTS[stem];
            const branchElement = BRANCH_ELEMENTS[branch];
            
            // 计算起止年龄和年份
            const startAge = qiYunInfo.startAge + (i * 10);
            const endAge = startAge + 9;
            const startYear = qiYunInfo.startYear + (i * 10);
            const endYear = startYear + 9;
            
            daYunList.push({
                step: i + 1,
                stem,
                branch,
                pillar: stem + branch,
                stemIndex: currentStemIndex,
                branchIndex: currentBranchIndex,
                tenGod,
                stemElement,
                branchElement,
                startAge,
                endAge,
                ageRange: `${startAge}-${endAge}岁`,
                startYear,
                endYear,
                yearRange: `${startYear}-${endYear}年`,
                ruleRef: 'NiShi-TJ-03'
            });
        }
        
        return daYunList;
    }
    
    /**
     * 计算十神
     * @param {string} dayMaster - 日主（日干）
     * @param {string} otherStem - 其他天干
     * @returns {string} 十神名称
     */
    static calculateTenGod(dayMaster, otherStem) {
        const dayElement = STEM_ELEMENTS[dayMaster];
        const dayYinYang = STEM_YIN_YANG[dayMaster];
        const otherElement = STEM_ELEMENTS[otherStem];
        const otherYinYang = STEM_YIN_YANG[otherStem];
        
        const isSameYinYang = dayYinYang === otherYinYang;
        
        // 五行生克关系
        const generates = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
        const controls = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
        
        if (dayElement === otherElement) {
            return isSameYinYang ? '比肩' : '劫财';
        }
        if (generates[dayElement] === otherElement) {
            return isSameYinYang ? '食神' : '伤官';
        }
        if (generates[otherElement] === dayElement) {
            return isSameYinYang ? '偏印' : '正印';
        }
        if (controls[otherElement] === dayElement) {
            return isSameYinYang ? '偏官' : '正官';
        }
        if (controls[dayElement] === otherElement) {
            return isSameYinYang ? '偏财' : '正财';
        }
        
        return '未知';
    }
    
    /**
     * 判断当前处于第几步大运
     * @param {Array} daYunList - 大运列表
     * @param {number} currentAge - 当前年龄（或指定年龄）
     * @returns {Object|null} 当前大运信息
     */
    static getCurrentDaYun(daYunList, currentAge) {
        for (const daYun of daYunList) {
            if (currentAge >= daYun.startAge && currentAge <= daYun.endAge) {
                return {
                    ...daYun,
                    yearsInDaYun: currentAge - daYun.startAge,
                    yearsRemaining: daYun.endAge - currentAge
                };
            }
        }
        return null;
    }
    
    /**
     * 完整大运计算（对外主接口）
     * @param {Date|string} birthDate - 出生日期
     * @param {number} hourIndex - 时辰索引 (0-11)
     * @param {string} gender - 性别 ('male' | 'female')
     * @param {Object} options - 可选参数
     * @returns {Object} 完整大运信息
     */
    static calculate(birthDate, hourIndex, gender, options = {}) {
        // 1. 构建出生日期时间
        const birthDateTime = ChineseCalendar.buildBirthDateTime(birthDate, hourIndex);
        
        // 2. 计算四柱
        const { pillars, zodiac, debug } = ChineseCalendar.calculateFourPillars(birthDateTime, hourIndex);
        
        // 3. 判断大运顺逆
        const directionInfo = this.getDaYunDirection(pillars.year.stem, gender);
        
        // 4. 计算起运
        const qiYunInfo = this.calculateQiYun(birthDateTime, directionInfo.direction);
        
        // 5. 生成大运表
        const daYunList = this.generateDaYunTable(
            pillars.month,
            pillars.day,
            directionInfo.direction,
            qiYunInfo,
            options.steps || 10
        );
        
        // 6. 当前大运（如果提供当前年龄）
        let currentDaYun = null;
        if (options.currentAge !== undefined) {
            currentDaYun = this.getCurrentDaYun(daYunList, options.currentAge);
        } else {
            // 根据出生日期计算当前年龄
            const now = new Date();
            const age = now.getFullYear() - birthDateTime.getFullYear();
            currentDaYun = this.getCurrentDaYun(daYunList, age);
        }
        
        return {
            // 基础信息
            birthDateTime,
            pillars,
            zodiac,
            gender: gender === 'male' ? '男' : '女',
            
            // 大运信息
            direction: directionInfo,
            qiYun: qiYunInfo,
            daYunList,
            currentDaYun,
            
            // 规则追溯
            ruleRefs: [
                { code: 'NiShi-TJ-01', desc: '大运顺逆：阳年男/阴年女顺排，阴年男/阳年女逆排' },
                { code: 'NiShi-TJ-02', desc: '起运计算：出生到最近节的天数÷3=起运岁数' },
                { code: 'NiShi-TJ-03', desc: '大运干支：从月柱顺/逆推，每步10年' }
            ],
            
            // 调试信息
            debug: {
                ...debug,
                directionCalc: directionInfo,
                qiYunCalc: qiYunInfo
            }
        };
    }
}

export default DaYunCalculator;

