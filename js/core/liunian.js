/**
 * 流年计算与叠加分析模块 - 基于倪师《天纪》体系
 * 
 * 核心功能：
 * 1. 流年干支计算
 * 2. 流年与大运叠加评分
 * 3. 流年与原局（命局）的合冲刑害分析
 * 4. 综合运势评估与解释链
 * 
 * 规则来源标注：
 * - [NiShi-TJ-04]: 流年干支计算
 * - [NiShi-TJ-05]: 天干合化规则
 * - [NiShi-TJ-06]: 地支六合/六冲/三合/三刑规则
 * - [NiShi-TJ-07]: 运势叠加权重
 */

import ChineseCalendar, {
    HEAVENLY_STEMS,
    EARTHLY_BRANCHES,
    STEM_ELEMENTS,
    STEM_YIN_YANG,
    BRANCH_ELEMENTS
} from './calendar.js';

import { DaYunCalculator } from './dayun.js';

// 导入统一常量
import { MONTH_ELEMENT_STRENGTH, WUXING } from './constants.js';

// ===== 天干地支关系常量 =====

/**
 * [NiShi-TJ-05] 天干五合及合化条件
 * 甲己合化土，乙庚合化金，丙辛合化水，丁壬合化木，戊癸合化火
 * 合化条件：需要月令五行支持，否则只是"合而不化"
 */
export const STEM_COMBINATIONS = {
    '甲己': { result: '土', type: '合', materializeMonths: ['辰', '戌', '丑', '未'] },
    '乙庚': { result: '金', type: '合', materializeMonths: ['申', '酉'] },
    '丙辛': { result: '水', type: '合', materializeMonths: ['亥', '子'] },
    '丁壬': { result: '木', type: '合', materializeMonths: ['寅', '卯'] },
    '戊癸': { result: '火', type: '合', materializeMonths: ['巳', '午'] }
};

/**
 * 天干相冲（隔五位）
 */
export const STEM_CLASHES = ['甲庚', '乙辛', '丙壬', '丁癸'];

/**
 * [NiShi-TJ-06] 地支六合
 */
export const BRANCH_SIX_COMBINATIONS = {
    '子丑': { result: '土', type: '六合' },
    '寅亥': { result: '木', type: '六合' },
    '卯戌': { result: '火', type: '六合' },
    '辰酉': { result: '金', type: '六合' },
    '巳申': { result: '水', type: '六合' },
    '午未': { result: '火', type: '六合' }  // 或土
};

/**
 * 地支六冲
 */
export const BRANCH_CLASHES = {
    '子午': { type: '六冲', desc: '子午相冲，水火不容' },
    '丑未': { type: '六冲', desc: '丑未相冲，土土相刑' },
    '寅申': { type: '六冲', desc: '寅申相冲，金木交战' },
    '卯酉': { type: '六冲', desc: '卯酉相冲，金木相克' },
    '辰戌': { type: '六冲', desc: '辰戌相冲，土土相争' },
    '巳亥': { type: '六冲', desc: '巳亥相冲，水火相激' }
};

/**
 * 地支三合局
 */
export const BRANCH_THREE_COMBINATIONS = {
    '申子辰': { result: '水', type: '三合水局' },
    '寅午戌': { result: '火', type: '三合火局' },
    '亥卯未': { result: '木', type: '三合木局' },
    '巳酉丑': { result: '金', type: '三合金局' }
};

/**
 * 地支三刑
 */
export const BRANCH_THREE_PUNISHMENTS = {
    '寅巳申': { type: '无恩之刑', desc: '寅巳申三刑，易有意外' },
    '丑戌未': { type: '恃势之刑', desc: '丑戌未三刑，易生是非' },
    '子卯': { type: '无礼之刑', desc: '子卯相刑，名誉受损' },
    '辰辰': { type: '自刑', desc: '辰辰自刑，自寻烦恼' },
    '午午': { type: '自刑', desc: '午午自刑，心神不宁' },
    '酉酉': { type: '自刑', desc: '酉酉自刑，自伤自损' },
    '亥亥': { type: '自刑', desc: '亥亥自刑，独自忧愁' }
};

/**
 * 地支相害（六害）
 */
export const BRANCH_HARMS = {
    '子未': { type: '六害', desc: '子未相害，小人暗算' },
    '丑午': { type: '六害', desc: '丑午相害，志向受阻' },
    '寅巳': { type: '六害', desc: '寅巳相害，功亏一篑' },
    '卯辰': { type: '六害', desc: '卯辰相害，名利两失' },
    '申亥': { type: '六害', desc: '申亥相害，贵人难遇' },
    '酉戌': { type: '六害', desc: '酉戌相害，口舌是非' }
};

/**
 * 流年分析核心类
 */
export class LiuNianCalculator {
    
    /**
     * [NiShi-TJ-04] 获取流年干支
     * @param {number} year - 公历年份
     * @returns {Object} { stem, branch, pillar, element, tenGod }
     */
    static getLiuNianGanZhi(year) {
        const yearPillar = ChineseCalendar.getYearPillar(year);
        return {
            year,
            stem: yearPillar.stem,
            branch: yearPillar.branch,
            pillar: yearPillar.pillar,
            stemElement: STEM_ELEMENTS[yearPillar.stem],
            branchElement: BRANCH_ELEMENTS[yearPillar.branch],
            ruleRef: 'NiShi-TJ-04'
        };
    }
    
    /**
     * 分析天干关系
     * @param {string} stem1 - 天干1
     * @param {string} stem2 - 天干2
     * @param {string} monthBranch - 月支（用于判断合化条件）
     * @returns {Object|null} 关系信息
     */
    static analyzeStemRelation(stem1, stem2, monthBranch = null) {
        const key1 = stem1 + stem2;
        const key2 = stem2 + stem1;

        // 检查五合
        const combo = STEM_COMBINATIONS[key1] || STEM_COMBINATIONS[key2];
        if (combo) {
            const actualKey = STEM_COMBINATIONS[key1] ? key1 : key2;
            // 检查是否合化成功
            let materialized = false;
            if (monthBranch && combo.materializeMonths) {
                materialized = combo.materializeMonths.includes(monthBranch);
            }
            return {
                ...combo,
                stems: actualKey,
                materialized,
                type: materialized ? '合化' : '合',
                desc: materialized
                    ? `${actualKey}合化${combo.result}`
                    : `${actualKey}相合（未化）`,
                ruleRef: 'NiShi-TJ-05'
            };
        }

        // 检查相冲
        if (STEM_CLASHES.includes(key1) || STEM_CLASHES.includes(key2)) {
            return { type: '冲', stems: key1, desc: `${stem1}${stem2}相冲`, ruleRef: 'NiShi-TJ-05' };
        }

        // 五行生克关系
        const e1 = STEM_ELEMENTS[stem1];
        const e2 = STEM_ELEMENTS[stem2];
        const relation = ChineseCalendar.WuXing.getRelation(e1, e2);

        return { type: relation, stems: key1, element1: e1, element2: e2 };
    }
    
    /**
     * [NiShi-TJ-06] 分析地支关系（两支之间）
     * @param {string} branch1 - 地支1
     * @param {string} branch2 - 地支2
     * @returns {Object|null} 关系信息
     */
    static analyzeBranchRelation(branch1, branch2) {
        const key1 = branch1 + branch2;
        const key2 = branch2 + branch1;

        // 检查六合
        if (BRANCH_SIX_COMBINATIONS[key1]) {
            return { ...BRANCH_SIX_COMBINATIONS[key1], branches: key1, ruleRef: 'NiShi-TJ-06' };
        }
        if (BRANCH_SIX_COMBINATIONS[key2]) {
            return { ...BRANCH_SIX_COMBINATIONS[key2], branches: key2, ruleRef: 'NiShi-TJ-06' };
        }

        // 检查六冲
        if (BRANCH_CLASHES[key1]) {
            return { ...BRANCH_CLASHES[key1], branches: key1, ruleRef: 'NiShi-TJ-06' };
        }
        if (BRANCH_CLASHES[key2]) {
            return { ...BRANCH_CLASHES[key2], branches: key2, ruleRef: 'NiShi-TJ-06' };
        }

        // 检查六害
        if (BRANCH_HARMS[key1]) {
            return { ...BRANCH_HARMS[key1], branches: key1, ruleRef: 'NiShi-TJ-06' };
        }
        if (BRANCH_HARMS[key2]) {
            return { ...BRANCH_HARMS[key2], branches: key2, ruleRef: 'NiShi-TJ-06' };
        }

        // 自刑检查
        if (branch1 === branch2) {
            const selfPunishment = BRANCH_THREE_PUNISHMENTS[branch1 + branch1];
            if (selfPunishment) {
                return { ...selfPunishment, branches: key1, ruleRef: 'NiShi-TJ-06' };
            }
        }

        return null;
    }

    /**
     * [NiShi-TJ-06] 检测三合局（需要三支同时出现）
     * @param {Array<string>} allBranches - 所有地支数组（命局+大运+流年）
     * @returns {Array<Object>} 检测到的三合局列表
     */
    static detectThreeCombinations(allBranches) {
        const results = [];
        const branchSet = new Set(allBranches);

        for (const [key, combo] of Object.entries(BRANCH_THREE_COMBINATIONS)) {
            const required = key.split(''); // ['申', '子', '辰']
            const present = required.filter(b => branchSet.has(b));

            if (present.length === 3) {
                // 三支齐全，三合成局
                results.push({
                    ...combo,
                    branches: key,
                    complete: true,
                    desc: `${key}三合${combo.result}局成立`,
                    ruleRef: 'NiShi-TJ-06'
                });
            } else if (present.length === 2) {
                // 两支在，待合
                results.push({
                    ...combo,
                    branches: present.join(''),
                    complete: false,
                    desc: `${present.join('')}待合${combo.result}局（缺${required.find(b => !branchSet.has(b))}）`,
                    ruleRef: 'NiShi-TJ-06'
                });
            }
        }

        return results;
    }

    /**
     * [NiShi-TJ-06] 检测三刑（需要三支或特定两支同时出现）
     * @param {Array<string>} allBranches - 所有地支数组
     * @returns {Array<Object>} 检测到的三刑列表
     */
    static detectThreePunishments(allBranches) {
        const results = [];
        const branchCount = {};
        allBranches.forEach(b => {
            branchCount[b] = (branchCount[b] || 0) + 1;
        });

        // 1. 寅巳申 无恩之刑（需三支齐）
        if (branchCount['寅'] && branchCount['巳'] && branchCount['申']) {
            results.push({
                type: '无恩之刑',
                branches: '寅巳申',
                desc: '寅巳申三刑齐聚，主意外伤灾',
                severity: 'high',
                ruleRef: 'NiShi-TJ-06'
            });
        }

        // 2. 丑戌未 恃势之刑（需三支齐）
        if (branchCount['丑'] && branchCount['戌'] && branchCount['未']) {
            results.push({
                type: '恃势之刑',
                branches: '丑戌未',
                desc: '丑戌未三刑齐聚，主是非官讼',
                severity: 'high',
                ruleRef: 'NiShi-TJ-06'
            });
        }

        // 3. 子卯相刑（无礼之刑，两支即成）
        if (branchCount['子'] && branchCount['卯']) {
            results.push({
                type: '无礼之刑',
                branches: '子卯',
                desc: '子卯相刑，主名誉受损',
                severity: 'medium',
                ruleRef: 'NiShi-TJ-06'
            });
        }

        // 4. 自刑（辰辰、午午、酉酉、亥亥）
        ['辰', '午', '酉', '亥'].forEach(branch => {
            if (branchCount[branch] >= 2) {
                results.push({
                    type: '自刑',
                    branches: branch + branch,
                    desc: `${branch}${branch}自刑，主自寻烦恼`,
                    severity: 'low',
                    ruleRef: 'NiShi-TJ-06'
                });
            }
        });

        return results;
    }

    /**
     * 获取月令对流年五行的影响
     * @param {string} monthBranch - 月支
     * @param {string} element - 五行
     * @returns {Object} { status, modifier }
     */
    static getMonthInfluence(monthBranch, element) {
        const strength = MONTH_ELEMENT_STRENGTH[monthBranch];
        if (!strength) return { status: '休', modifier: 0 };

        const status = strength[element];
        const modifiers = {
            '旺': 8,   // 当令得势
            '相': 5,   // 次旺
            '休': 0,   // 休息
            '囚': -5,  // 被困
            '死': -8   // 最弱
        };

        return {
            status,
            modifier: modifiers[status] || 0,
            desc: `${element}在${monthBranch}月为「${status}」`
        };
    }
    
    /**
     * [NiShi-TJ-07] 流年与大运叠加分析（优化版）
     * @param {Object} liuNian - 流年信息
     * @param {Object} daYun - 当前大运信息
     * @param {Object} pillars - 原局四柱
     * @returns {Object} 叠加分析结果
     */
    static analyzeOverlay(liuNian, daYun, pillars) {
        const factors = [];
        let score = 60; // 基础分

        const dayMaster = pillars.day.stem;
        const dayElement = STEM_ELEMENTS[dayMaster];
        const monthBranch = pillars.month.branch;

        // 收集所有地支（用于三合局、三刑检测）
        const allBranches = [
            pillars.year.branch,
            pillars.month.branch,
            pillars.day.branch,
            pillars.hour.branch,
            liuNian.branch
        ];
        if (daYun) allBranches.push(daYun.branch);

        // === 1. 流年天干与日主关系（传入月支检测合化）===
        const liuNianStemRelation = this.analyzeStemRelation(liuNian.stem, dayMaster, monthBranch);
        if (liuNianStemRelation) {
            if (liuNianStemRelation.type === '合化') {
                score += 12;
                factors.push({
                    source: '流年干与日主',
                    relation: liuNianStemRelation.desc,
                    effect: '+12',
                    desc: '流年与日主合化成功，运势大顺',
                    ruleRef: 'NiShi-TJ-07'
                });
            } else if (liuNianStemRelation.type === '合') {
                score += 8;
                factors.push({
                    source: '流年干与日主',
                    relation: liuNianStemRelation.desc,
                    effect: '+8',
                    desc: '流年天干与日主相合，有贵人助力',
                    ruleRef: 'NiShi-TJ-07'
                });
            } else if (liuNianStemRelation.type === '冲') {
                score -= 10;
                factors.push({
                    source: '流年干与日主',
                    relation: `${liuNian.stem}${dayMaster}相冲`,
                    effect: '-10',
                    desc: '流年天干与日主相冲，易有波折',
                    ruleRef: 'NiShi-TJ-07'
                });
            } else if (liuNianStemRelation.type === '生我') {
                score += 8;
                factors.push({
                    source: '流年干与日主',
                    relation: `${liuNian.stemElement}生${dayElement}`,
                    effect: '+8',
                    desc: '流年五行生扶日主，运势顺遂',
                    ruleRef: 'NiShi-TJ-07'
                });
            } else if (liuNianStemRelation.type === '克我') {
                score -= 8;
                factors.push({
                    source: '流年干与日主',
                    relation: `${liuNian.stemElement}克${dayElement}`,
                    effect: '-8',
                    desc: '流年五行克制日主，需谨慎行事',
                    ruleRef: 'NiShi-TJ-07'
                });
            }
        }

        // === 2. 流年地支与年支关系（太岁）- 调整权重 ===
        const liuNianBranchRelation = this.analyzeBranchRelation(liuNian.branch, pillars.year.branch);
        if (liuNianBranchRelation) {
            if (liuNianBranchRelation.type === '六合') {
                score += 8;
                factors.push({
                    source: '流年支与年支',
                    relation: liuNianBranchRelation.branches + '六合',
                    effect: '+8',
                    desc: '流年与年支六合，太岁相助',
                    ruleRef: 'NiShi-TJ-07'
                });
            } else if (liuNianBranchRelation.type === '六冲') {
                // 调整：-15 → -12
                score -= 12;
                factors.push({
                    source: '流年支与年支',
                    relation: liuNianBranchRelation.branches + '六冲',
                    effect: '-12',
                    desc: '冲太岁，变动较大，需化解',
                    ruleRef: 'NiShi-TJ-07'
                });
            } else if (liuNianBranchRelation.type === '六害') {
                score -= 8;
                factors.push({
                    source: '流年支与年支',
                    relation: liuNianBranchRelation.branches + '六害',
                    effect: '-8',
                    desc: '害太岁，' + liuNianBranchRelation.desc,
                    ruleRef: 'NiShi-TJ-07'
                });
            }
        }

        // === 3. 本命年检查 ===
        if (liuNian.branch === pillars.year.branch) {
            score -= 5;
            factors.push({
                source: '本命年',
                relation: `值太岁（${liuNian.branch}年）`,
                effect: '-5',
                desc: '本命年，诸事宜稳不宜急',
                ruleRef: 'NiShi-TJ-07'
            });
        }

        // === 4. 大运与流年叠加（调整权重）===
        if (daYun) {
            // 大运与流年天干关系
            const daYunLiuNianStem = this.analyzeStemRelation(daYun.stem, liuNian.stem, monthBranch);
            if (daYunLiuNianStem && (daYunLiuNianStem.type === '合' || daYunLiuNianStem.type === '合化')) {
                score += 6;
                factors.push({
                    source: '大运干与流年干',
                    relation: daYunLiuNianStem.desc || `${daYun.stem}${liuNian.stem}相合`,
                    effect: '+6',
                    desc: '大运流年天干相合，运势平顺',
                    ruleRef: 'NiShi-TJ-07'
                });
            } else if (daYunLiuNianStem && daYunLiuNianStem.type === '冲') {
                score -= 6;
                factors.push({
                    source: '大运干与流年干',
                    relation: `${daYun.stem}${liuNian.stem}相冲`,
                    effect: '-6',
                    desc: '大运流年天干相冲，易有变动',
                    ruleRef: 'NiShi-TJ-07'
                });
            }

            // 大运与流年地支关系
            const daYunLiuNianBranch = this.analyzeBranchRelation(daYun.branch, liuNian.branch);
            if (daYunLiuNianBranch) {
                if (daYunLiuNianBranch.type === '六合') {
                    // 新增：大运支合流年支
                    score += 6;
                    factors.push({
                        source: '大运支与流年支',
                        relation: daYunLiuNianBranch.branches + '六合',
                        effect: '+6',
                        desc: '大运流年地支相合，运势顺遂',
                        ruleRef: 'NiShi-TJ-07'
                    });
                } else if (daYunLiuNianBranch.type === '六冲') {
                    // 调整：-5 → -8
                    score -= 8;
                    factors.push({
                        source: '大运支与流年支',
                        relation: daYunLiuNianBranch.branches + '六冲',
                        effect: '-8',
                        desc: '大运流年地支相冲，交运年需注意',
                        ruleRef: 'NiShi-TJ-07'
                    });
                }
            }
        }

        // === 5. 三合局检测 ===
        const threeCombos = this.detectThreeCombinations(allBranches);
        for (const combo of threeCombos) {
            if (combo.complete) {
                // 三合成局，根据合出的五行与日主关系判断吉凶
                const comboElement = combo.result;
                if (comboElement === dayElement || WUXING.generatedBy[dayElement] === comboElement) {
                    score += 10;
                    factors.push({
                        source: '三合局',
                        relation: combo.desc,
                        effect: '+10',
                        desc: `${combo.branches}三合${comboElement}局，生扶日主`,
                        ruleRef: 'NiShi-TJ-06'
                    });
                } else if (WUXING.controlledBy[dayElement] === comboElement) {
                    score -= 6;
                    factors.push({
                        source: '三合局',
                        relation: combo.desc,
                        effect: '-6',
                        desc: `${combo.branches}三合${comboElement}局，克制日主`,
                        ruleRef: 'NiShi-TJ-06'
                    });
                } else {
                    score += 4;
                    factors.push({
                        source: '三合局',
                        relation: combo.desc,
                        effect: '+4',
                        desc: `${combo.branches}三合${comboElement}局成立`,
                        ruleRef: 'NiShi-TJ-06'
                    });
                }
            }
        }

        // === 6. 三刑检测 ===
        const punishments = this.detectThreePunishments(allBranches);
        for (const punishment of punishments) {
            const penaltyScore = punishment.severity === 'high' ? -12 : punishment.severity === 'medium' ? -8 : -4;
            score += penaltyScore;
            factors.push({
                source: '三刑',
                relation: punishment.type,
                effect: `${penaltyScore}`,
                desc: punishment.desc,
                ruleRef: 'NiShi-TJ-06'
            });
        }

        // === 7. 月令对流年五行的影响 ===
        const monthInfluence = this.getMonthInfluence(monthBranch, liuNian.stemElement);
        if (monthInfluence.modifier !== 0) {
            score += monthInfluence.modifier;
            factors.push({
                source: '月令影响',
                relation: monthInfluence.desc,
                effect: monthInfluence.modifier > 0 ? `+${monthInfluence.modifier}` : `${monthInfluence.modifier}`,
                desc: `流年${liuNian.stemElement}${monthInfluence.status === '旺' || monthInfluence.status === '相' ? '得月令之气' : '失月令之气'}`,
                ruleRef: 'NiShi-TJ-07'
            });
        }

        // 确保分数在合理范围
        score = Math.max(20, Math.min(100, score));

        // 生成运势等级
        let level, levelDesc;
        if (score >= 80) {
            level = '上吉';
            levelDesc = '诸事顺遂，把握机遇';
        } else if (score >= 65) {
            level = '小吉';
            levelDesc = '稳中有进，循序渐进';
        } else if (score >= 50) {
            level = '平';
            levelDesc = '平稳过渡，守成为宜';
        } else if (score >= 35) {
            level = '小凶';
            levelDesc = '多有阻碍，谨慎行事';
        } else {
            level = '凶';
            levelDesc = '变动频繁，化解为先';
        }

        return {
            score,
            level,
            levelDesc,
            factors,
            liuNian,
            daYun,
            threeCombinations: threeCombos.filter(c => c.complete),
            punishments,
            ruleRef: 'NiShi-TJ-07',
            explanation: factors.map(f => f.desc).join('；')
        };
    }
    
    /**
     * 生成未来N年的流年运势表
     * @param {Date|string} birthDate - 出生日期
     * @param {number} hourIndex - 时辰索引
     * @param {string} gender - 性别
     * @param {number} years - 年数（默认10年）
     * @param {number} startYear - 起始年份（默认当年）
     * @returns {Array} 流年运势列表
     */
    static generateLiuNianTable(birthDate, hourIndex, gender, years = 10, startYear = null) {
        // 计算大运
        const daYunResult = DaYunCalculator.calculate(birthDate, hourIndex, gender);
        const { pillars, daYunList } = daYunResult;
        
        const currentYear = startYear || new Date().getFullYear();
        const birthDateTime = ChineseCalendar.buildBirthDateTime(birthDate, hourIndex);
        const birthYear = birthDateTime.getFullYear();
        
        const liuNianTable = [];
        
        for (let i = 0; i < years; i++) {
            const year = currentYear + i;
            const age = year - birthYear;
            
            // 获取流年干支
            const liuNian = this.getLiuNianGanZhi(year);
            
            // 获取当年所处大运
            const currentDaYun = DaYunCalculator.getCurrentDaYun(daYunList, age);
            
            // 叠加分析
            const overlay = this.analyzeOverlay(liuNian, currentDaYun, pillars);
            
            // 检测是否为交运年
            const isJiaoYun = currentDaYun && age === currentDaYun.startAge;
            
            liuNianTable.push({
                year,
                age,
                liuNian,
                daYun: currentDaYun,
                overlay,
                isJiaoYun,
                jiaoYunNote: isJiaoYun ? `交运年：进入${currentDaYun.pillar}大运` : null
            });
        }
        
        return {
            birthInfo: {
                birthDate: birthDateTime.toISOString().split('T')[0],
                pillars,
                gender: gender === 'male' ? '男' : '女'
            },
            qiYun: daYunResult.qiYun,
            direction: daYunResult.direction,
            daYunList,
            liuNianTable,
            ruleRefs: [
                ...daYunResult.ruleRefs,
                { code: 'NiShi-TJ-04', desc: '流年干支计算' },
                { code: 'NiShi-TJ-05', desc: '天干五合、相冲规则' },
                { code: 'NiShi-TJ-06', desc: '地支六合、六冲、三刑、六害规则' },
                { code: 'NiShi-TJ-07', desc: '运势叠加权重计算' }
            ]
        };
    }
}

export default LiuNianCalculator;

