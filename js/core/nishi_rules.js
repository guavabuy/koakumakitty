/**
 * 倪师统一逻辑引擎 (Ni Shi Unified Rules Engine)
 * 基于《天机道》、《地脉道》、《人间道》三部著作
 * 
 * 核心原则：
 * 1. 象 (Xiang) - 观察到的现象
 * 2. 数 (Shu) - 逻辑推演的数值
 * 3. 理 (Li) - 背后的道理
 * 4. 气 (Qi) - 能量的状态
 * 
 * 阶段2更新：所有方法真实调用统一历法核心模块
 */

// 导入统一历法核心
import ChineseCalendar, {
    HEAVENLY_STEMS,
    EARTHLY_BRANCHES,
    STEM_ELEMENTS,
    STEM_YIN_YANG,
    BRANCH_ELEMENTS
} from './calendar.js';

// 导入统一常量
import {
    MONTH_ELEMENT_STRENGTH,
    BRANCH_HIDDEN_STEMS,
    WUXING
} from './constants.js';

// 导入五行小贴士库
import {
    WuxingTips,
    generateWuxingTip,
    generateDailyTip,
    generate2026YearlyTips,
    kittySpeak
} from './wuxing_tips.js';

/**
 * 标准返回结果接口定义
 * @typedef {Object} NiShiResult
 * @property {'TianJi'|'DiMai'|'RenJian'} source - 来源（天机/地脉/人间）
 * @property {Object} pattern - 象（观察到的模式）
 * @property {string} pattern.name - 模式名称 (e.g. "甲木日主", "乾卦")
 * @property {string} pattern.symbol - 符号 (e.g. "🌳", "☰")
 * @property {Object} pattern.attributes - 详细属性
 * @property {Object} calculation - 数（计算结果）
 * @property {number} calculation.score - 标准化评分 (0-100)
 * @property {string} calculation.balance - 能量状态 (身强/身弱/中和)
 * @property {Object} calculation.energy - 五行/能量分布
 * @property {Object} verdict - 意（核心结论）
 * @property {string} verdict.level - 吉凶等级 (大吉/吉/平/凶/大凶)
 * @property {string} verdict.summary - 一句话总结
 * @property {Object} guidance - 道 (行动指南)
 * @property {string} guidance.action - 人间道建议 (如何做)
 * @property {string} guidance.adjustment - 地脉道建议 (如何调)
 * @property {string} guidance.timing - 天机道建议 (何时做)
 */

export const NiShiConstants = {
    // 五行基础（引用核心模块）
    FiveElements: {
        WOOD: '木', FIRE: '火', EARTH: '土', METAL: '金', WATER: '水'
    },

    // 阴阳
    YinYang: {
        YANG: '阳', YIN: '阴'
    },

    // 天干（引用核心模块）
    HeavenlyStems: HEAVENLY_STEMS,

    // 地支（引用核心模块）
    EarthlyBranches: EARTHLY_BRANCHES,
    
    // 天干五行（引用核心模块）
    StemElements: STEM_ELEMENTS,
    
    // 天干阴阳（引用核心模块）
    StemYinYang: STEM_YIN_YANG,

    // 八卦
    Bagua: {
        Qian: { name: '乾', nature: '天', element: '金', direction: '西北' },
        Kun: { name: '坤', nature: '地', element: '土', direction: '西南' },
        Zhen: { name: '震', nature: '雷', element: '木', direction: '东' },
        Xun: { name: '巽', nature: '风', element: '木', direction: '东南' },
        Kan: { name: '坎', nature: '水', element: '水', direction: '北' },
        Li: { name: '离', nature: '火', element: '火', direction: '南' },
        Gen: { name: '艮', nature: '山', element: '土', direction: '东北' },
        Dui: { name: '兑', nature: '泽', element: '金', direction: '西' }
    }
};

export class NiShiRules {
    /**
     * 内置工具：五行生克推演
     */
    static Interaction = {
        // 生：木生火，火生土...
        Generates: { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' },
        // 克：木克土，土克水...
        Controls: { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' },

        /**
         * getRelation: 获取A对B的关系
         * @returns {'Generates'|'Controls'|'Same'|'WeakenedBy'|'ControlledBy'}
         */
        getRelation(elementA, elementB) {
            if (elementA === elementB) return 'Same';
            if (this.Generates[elementA] === elementB) return 'Generates'; // 我生之
            if (this.Controls[elementA] === elementB) return 'Controls';   // 我克之
            if (this.Generates[elementB] === elementA) return 'WeakenedBy'; // 生我者
            if (this.Controls[elementB] === elementA) return 'ControlledBy'; // 克我者
            return 'Neutral';
        }
    };

    /**
     * 1. 天机道 (Tian Ji) - 掌管时间、命运
     * 阶段2更新：真实调用统一核心模块
     */
    static TianJi = {
        /**
         * 计算天干地支（调用统一核心模块）
         * @param {Date} date - 日期
         * @param {number} hourIndex - 时辰索引 (0-11)
         * @returns {Object} 四柱干支
         */
        calculateGanZhi(date, hourIndex = 6) {
            const birthDateTime = ChineseCalendar.buildBirthDateTime(date, hourIndex);
            const { pillars } = ChineseCalendar.calculateFourPillars(birthDateTime, hourIndex);
            
            return {
                year: { stem: pillars.year.stem, branch: pillars.year.branch },
                month: { stem: pillars.month.stem, branch: pillars.month.branch },
                day: { stem: pillars.day.stem, branch: pillars.day.branch },
                hour: { stem: pillars.hour.stem, branch: pillars.hour.branch }
            };
        },

        /**
         * 十神定格（真实实现）
         * @param {string} dayMaster 日主天干
         * @param {string} otherStem 他柱天干
         * @returns {string} 十神名称
         */
        getTenGods(dayMaster, otherStem) {
            const dayElement = STEM_ELEMENTS[dayMaster];
            const dayYinYang = STEM_YIN_YANG[dayMaster];
            const otherElement = STEM_ELEMENTS[otherStem];
            const otherYinYang = STEM_YIN_YANG[otherStem];
            
            const generates = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
            const controls = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
            
            if (dayElement === otherElement) {
                return dayYinYang === otherYinYang ? '比肩' : '劫财';
            } else if (generates[dayElement] === otherElement) {
                return dayYinYang === otherYinYang ? '食神' : '伤官';
            } else if (generates[otherElement] === dayElement) {
                return dayYinYang === otherYinYang ? '偏印' : '正印';
            } else if (controls[otherElement] === dayElement) {
                return dayYinYang === otherYinYang ? '偏官' : '正官';
            } else if (controls[dayElement] === otherElement) {
                return dayYinYang === otherYinYang ? '偏财' : '正财';
            }
            return '无';
        },

        /**
         * 评分归一化
         * @param {number} score - 原始分数
         * @returns {Object} { level, stars }
         */
        evaluateScore(score) {
            if (score >= 90) return { level: '大吉', stars: 5 };
            if (score >= 75) return { level: '吉', stars: 4 };
            if (score >= 60) return { level: '平', stars: 3 };
            if (score >= 40) return { level: '凶', stars: 2 };
            return { level: '大凶', stars: 1 };
        },
        
        /**
         * 获取命理年（立春换年）
         * @param {Date} date - 日期
         * @returns {number} 命理年份
         */
        getMingLiYear(date) {
            return ChineseCalendar.getMingLiYear(date);
        },
        
        /**
         * 获取日柱
         * @param {Date} date - 日期
         * @returns {Object} { stem, branch }
         */
        getDayPillar(date) {
            return ChineseCalendar.getDayPillar(date);
        },

        /**
         * [NiShi-TJ-08] 身强身弱判断
         * 基于倪师《天纪》：日主在月令的旺衰 + 四柱生扶/克泄统计
         *
         * @param {Object} pillars - 四柱 { year, month, day, hour }
         * @returns {Object} { strength: 'strong'|'weak'|'balanced', score, details }
         */
        assessDayMasterStrength(pillars) {
            const dayMaster = pillars.day.stem;
            const dayElement = STEM_ELEMENTS[dayMaster];
            const monthBranch = pillars.month.branch;

            let score = 0; // 正数=身强，负数=身弱
            const details = [];

            // === 1. 月令旺衰（权重最大，占40%）===
            const monthStrength = MONTH_ELEMENT_STRENGTH[monthBranch];
            if (monthStrength) {
                const status = monthStrength[dayElement];
                const monthScores = {
                    '旺': 40,   // 当令
                    '相': 25,   // 次旺
                    '休': 0,    // 休息
                    '囚': -20,  // 被困
                    '死': -35   // 最弱
                };
                const monthScore = monthScores[status] || 0;
                score += monthScore;
                details.push({
                    source: '月令',
                    desc: `日主${dayElement}在${monthBranch}月为「${status}」`,
                    effect: monthScore > 0 ? `+${monthScore}` : `${monthScore}`,
                    ruleRef: 'NiShi-TJ-08'
                });
            }

            // === 2. 四柱天干生扶/克泄（权重30%）===
            const stems = [
                { pos: '年干', stem: pillars.year.stem },
                { pos: '月干', stem: pillars.month.stem },
                { pos: '时干', stem: pillars.hour.stem }
            ];

            for (const { pos, stem } of stems) {
                const stemElement = STEM_ELEMENTS[stem];
                let effect = 0;
                let desc = '';

                if (stemElement === dayElement) {
                    // 同类（比劫）
                    effect = 8;
                    desc = `${pos}${stem}(${stemElement})与日主同类`;
                } else if (WUXING.generatedBy[dayElement] === stemElement) {
                    // 生我（印）
                    effect = 10;
                    desc = `${pos}${stem}(${stemElement})生日主`;
                } else if (WUXING.generate[dayElement] === stemElement) {
                    // 我生（食伤）- 泄气
                    effect = -6;
                    desc = `${pos}${stem}(${stemElement})泄日主`;
                } else if (WUXING.controlledBy[dayElement] === stemElement) {
                    // 克我（官杀）
                    effect = -8;
                    desc = `${pos}${stem}(${stemElement})克日主`;
                } else if (WUXING.control[dayElement] === stemElement) {
                    // 我克（财）- 耗气
                    effect = -4;
                    desc = `${pos}${stem}(${stemElement})耗日主`;
                }

                if (effect !== 0) {
                    score += effect;
                    details.push({
                        source: pos,
                        desc,
                        effect: effect > 0 ? `+${effect}` : `${effect}`,
                        ruleRef: 'NiShi-TJ-08'
                    });
                }
            }

            // === 3. 四柱地支藏干（权重30%）===
            const branches = [
                { pos: '年支', branch: pillars.year.branch },
                { pos: '月支', branch: pillars.month.branch },
                { pos: '日支', branch: pillars.day.branch },
                { pos: '时支', branch: pillars.hour.branch }
            ];

            for (const { pos, branch } of branches) {
                const hiddenStems = BRANCH_HIDDEN_STEMS[branch] || [];
                // 本气（第一个藏干）权重高
                hiddenStems.forEach((stem, idx) => {
                    const stemElement = STEM_ELEMENTS[stem];
                    const weight = idx === 0 ? 1.0 : 0.5; // 本气1倍，余气0.5倍
                    let baseEffect = 0;

                    if (stemElement === dayElement) {
                        baseEffect = 5;
                    } else if (WUXING.generatedBy[dayElement] === stemElement) {
                        baseEffect = 6;
                    } else if (WUXING.generate[dayElement] === stemElement) {
                        baseEffect = -4;
                    } else if (WUXING.controlledBy[dayElement] === stemElement) {
                        baseEffect = -5;
                    } else if (WUXING.control[dayElement] === stemElement) {
                        baseEffect = -3;
                    }

                    if (baseEffect !== 0) {
                        const effect = Math.round(baseEffect * weight);
                        score += effect;
                    }
                });
            }

            // === 判定结果 ===
            let strength, strengthDesc;
            if (score >= 20) {
                strength = 'strong';
                strengthDesc = '身强';
            } else if (score <= -20) {
                strength = 'weak';
                strengthDesc = '身弱';
            } else {
                strength = 'balanced';
                strengthDesc = '中和';
            }

            return {
                strength,
                strengthDesc,
                score,
                dayMaster,
                dayElement,
                monthBranch,
                details,
                // 喜用神提示
                favorableElements: this.getFavorableElements(dayElement, strength),
                ruleRef: 'NiShi-TJ-08'
            };
        },

        /**
         * 根据身强身弱获取喜用神
         * @param {string} dayElement - 日主五行
         * @param {string} strength - 身强/身弱/中和
         * @returns {Object} { favorable, unfavorable }
         */
        getFavorableElements(dayElement, strength) {
            // 身强喜克泄耗（官杀、食伤、财）
            // 身弱喜生扶（印、比劫）
            if (strength === 'strong') {
                return {
                    favorable: [
                        WUXING.control[dayElement],      // 我克（财）
                        WUXING.generate[dayElement],     // 我生（食伤）
                        WUXING.controlledBy[dayElement]  // 克我（官杀）
                    ],
                    unfavorable: [
                        dayElement,                       // 同类
                        WUXING.generatedBy[dayElement]   // 生我（印）
                    ],
                    advice: '身强宜泄不宜补，财官食伤为喜用'
                };
            } else if (strength === 'weak') {
                return {
                    favorable: [
                        dayElement,                       // 同类（比劫）
                        WUXING.generatedBy[dayElement]   // 生我（印）
                    ],
                    unfavorable: [
                        WUXING.control[dayElement],      // 我克（财）
                        WUXING.generate[dayElement],     // 我生（食伤）
                        WUXING.controlledBy[dayElement]  // 克我（官杀）
                    ],
                    advice: '身弱宜扶不宜泄，印比为喜用'
                };
            } else {
                return {
                    favorable: [dayElement],
                    unfavorable: [],
                    advice: '身旺身弱中和，取用神需看格局'
                };
            }
        }
    };

    /**
     * 2. 地脉道 (Di Mai) - 掌管空间、环境
     * 阶段2更新：真实实现命卦计算
     */
    static DiMai = {
        // 八卦名称
        guaNames: { 1: '坎', 2: '坤', 3: '震', 4: '巽', 6: '乾', 7: '兑', 8: '艮', 9: '离' },
        
        // 东四命卦
        eastLifeGuas: ['坎', '离', '震', '巽'],
        
        // 西四命卦
        westLifeGuas: ['乾', '坤', '艮', '兑'],
        
        /**
         * 获取本命卦（使用命理年）
         * @param {number|Date} yearOrDate - 命理年份或出生日期
         * @param {string} gender - 'male' 或 'female'
         * @returns {Object} { name, group, number }
         */
        getLifeGua(yearOrDate, gender) {
            let mingLiYear;
            if (yearOrDate instanceof Date) {
                mingLiYear = ChineseCalendar.getMingLiYear(yearOrDate);
            } else {
                mingLiYear = yearOrDate;
            }
            
            const lastTwoDigits = mingLiYear % 100;
            let guaNumber;

            if (gender === 'male') {
                guaNumber = (100 - lastTwoDigits) % 9;
                if (guaNumber === 0) guaNumber = 9;
                if (guaNumber === 5) guaNumber = 2; // 5变坤
            } else {
                guaNumber = (lastTwoDigits - 4) % 9;
                if (guaNumber <= 0) guaNumber += 9;
                if (guaNumber === 5) guaNumber = 8; // 5变艮
            }

            const guaName = this.guaNames[guaNumber];
            const isEastLife = this.eastLifeGuas.includes(guaName);
            
            return { 
                name: guaName, 
                group: isEastLife ? 'East' : 'West',
                number: guaNumber,
                lifeType: isEastLife ? '东四命' : '西四命'
            };
        },

        /**
         * 获取方位吉凶（八宅法）
         * @param {string} guaName - 命卦名称
         * @param {string} sectorDirection - 方位
         * @returns {Object} { type, luck, level }
         */
        getSectorLuck(guaName, sectorDirection) {
            // 八宅吉凶位表
            const baZhaiTable = {
                '坎': { '北': '伏位', '南': '延年', '东': '生气', '西': '绝命', '东南': '天医', '东北': '五鬼', '西南': '祸害', '西北': '六煞' },
                '离': { '北': '延年', '南': '伏位', '东': '天医', '西': '祸害', '东南': '生气', '东北': '六煞', '西南': '五鬼', '西北': '绝命' },
                '震': { '北': '天医', '南': '生气', '东': '伏位', '西': '五鬼', '东南': '延年', '东北': '绝命', '西南': '六煞', '西北': '祸害' },
                '巽': { '北': '生气', '南': '天医', '东': '延年', '西': '六煞', '东南': '伏位', '东北': '祸害', '西南': '绝命', '西北': '五鬼' },
                '乾': { '北': '六煞', '南': '绝命', '东': '祸害', '西': '延年', '东南': '五鬼', '东北': '生气', '西南': '天医', '西北': '伏位' },
                '坤': { '北': '绝命', '南': '五鬼', '东': '六煞', '西': '天医', '东南': '祸害', '东北': '延年', '西南': '伏位', '西北': '生气' },
                '艮': { '北': '五鬼', '南': '六煞', '东': '绝命', '西': '生气', '东南': '绝命', '东北': '伏位', '西南': '延年', '西北': '天医' },
                '兑': { '北': '祸害', '南': '祸害', '东': '五鬼', '西': '伏位', '东南': '六煞', '东北': '天医', '西南': '生气', '西北': '延年' }
            };
            
            const positionLuck = {
                '生气': { luck: 'good', level: 1, desc: '生气位，大吉' },
                '天医': { luck: 'good', level: 2, desc: '天医位，吉' },
                '延年': { luck: 'good', level: 3, desc: '延年位，吉' },
                '伏位': { luck: 'good', level: 4, desc: '伏位，小吉' },
                '绝命': { luck: 'bad', level: 1, desc: '绝命位，大凶' },
                '五鬼': { luck: 'bad', level: 2, desc: '五鬼位，凶' },
                '六煞': { luck: 'bad', level: 3, desc: '六煞位，凶' },
                '祸害': { luck: 'bad', level: 4, desc: '祸害位，小凶' }
            };
            
            const table = baZhaiTable[guaName];
            if (!table) return { type: '未知', luck: 'neutral', level: 0 };
            
            const posType = table[sectorDirection];
            if (!posType) return { type: '未知', luck: 'neutral', level: 0 };
            
            const info = positionLuck[posType];
            return { 
                type: posType, 
                luck: info.luck, 
                level: info.level,
                description: info.desc
            };
        }
    };

    /**
     * 3. 人间道 (Ren Jian) - 掌管人事、决断
     */
    static RenJian = {
        /**
         * 获取建议
         * @param {string} type 咨询类型
         * @param {string} verdict 吉凶判断
         */
        getAdvice(type, verdict) {
            const adviceMap = {
                '大吉': '乘势而上，全力以赴。',
                '吉': '按部就班，稳步前行。',
                '平': '守成待机，不可冒进。',
                '凶': '谨言慎行，避开锋芒。',
                '大凶': '静止不动，修身养性。'
            };
            return adviceMap[verdict] || '顺其自然。';
        }
    };

    /**
     * 创建标准结果对象
     * @param {Object} params 参数
     * @returns {NiShiResult}
     */
    static createResult({ source, pattern, calculation, verdict, guidance }) {
        return {
            source,
            pattern: {
                name: pattern.name || '未知格局',
                symbol: pattern.symbol || '',
                attributes: pattern.attributes || {}
            },
            calculation: {
                score: calculation.score || 60,
                balance: calculation.balance || '中和',
                energy: calculation.energy || {}
            },
            verdict: {
                level: verdict.level || '平',
                summary: verdict.summary || '',
                stars: verdict.stars || 3
            },
            guidance: {
                action: guidance.action || '',
                adjustment: guidance.adjustment || '',
                timing: guidance.timing || ''
            }
        };
    }

    /**
     * 4. 五行小贴士 (Wuxing Tips) - Kitty人设风格建议
     * 生活化、有趣、可执行的五行补充建议
     */
    static WuxingTipsAPI = {
        /**
         * 获取五行小贴士库
         */
        getTipsLibrary() {
            return WuxingTips;
        },

        /**
         * 生成单个五行小贴士
         * @param {string} element - 需要补充的五行
         * @param {string} lang - 语言
         */
        generateTip(element, lang = 'zh') {
            return generateWuxingTip(element, lang);
        },

        /**
         * 生成每日五行建议
         * @param {string} todayElement - 今日主旺五行
         * @param {string} userElement - 用户日主五行
         * @param {string} lang - 语言
         */
        generateDailyAdvice(todayElement, userElement, lang = 'zh') {
            return generateDailyTip(todayElement, userElement, lang);
        },

        /**
         * 生成2026年度五行补给清单
         * @param {string} userElement - 用户日主五行
         * @param {string} lang - 语言
         */
        generate2026Checklist(userElement, lang = 'zh') {
            return generate2026YearlyTips(userElement, lang);
        },

        /**
         * Kitty人设语气生成器
         * @param {string} type - 消息类型
         * @param {Object} data - 数据
         * @param {string} lang - 语言
         */
        kittySpeak(type, data, lang = 'zh') {
            return kittySpeak(type, data, lang);
        }
    };
}
