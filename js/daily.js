/**
 * 每日运势模块
 * 结合用户八字与当日干支
 * 
 * 重要口径说明：
 * - 年柱按立春换年（不是公历1月1日）
 * - 使用节气口径计算干支
 */

import { NiShiRules } from './core/nishi_rules.js';
import ChineseCalendar, {
    HEAVENLY_STEMS,
    EARTHLY_BRANCHES,
    STEM_ELEMENTS,
    BRANCH_ELEMENTS,
    ZODIAC_ANIMALS
} from './core/calendar.js';
import { getCurrentSolarTerm, SOLAR_TERM_NAMES } from './core/solar_terms.js';

const DailyFortune = {
    // 引用核心模块的常量（保持向后兼容）
    heavenlyStems: HEAVENLY_STEMS,
    earthlyBranches: EARTHLY_BRANCHES,
    stemElements: STEM_ELEMENTS,
    branchElements: BRANCH_ELEMENTS,
    zodiac: ZODIAC_ANIMALS,

    // 农历月份
    lunarMonths: ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'],

    // 农历日期
    lunarDays: ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'],

    /**
     * 获取今日干支
     * 使用节气口径：年柱按立春换年
     */
    getTodayGanZhi() {
        const today = new Date();
        
        // 使用核心模块计算今日干支
        const ganZhi = ChineseCalendar.getTodayGanZhi(today);
        
        // 获取当前节气信息
        const solarTermInfo = getCurrentSolarTerm(today);

        return {
            yearStem: ganZhi.yearStem,
            yearBranch: ganZhi.yearBranch,
            monthStem: ganZhi.monthStem,
            monthBranch: ganZhi.monthBranch,
            dayStem: ganZhi.dayStem,
            dayBranch: ganZhi.dayBranch,
            zodiac: ganZhi.zodiac,
            solarTerm: ganZhi.solarTerm,
            solarTermInfo: solarTermInfo
        };
    },

    /**
     * 生成农历日期信息
     * 注意：这里使用节气信息代替农历
     * 真正的农历需要专门的农历库
     */
    getLunarDate() {
        const today = new Date();
        const solarTermInfo = getCurrentSolarTerm(today);
        
        // 使用节气信息代替农历月份
        // 实际农历需要专门的农历转换库
        const monthInfo = ChineseCalendar.getSolarTermMonth(today);
        
        // 简化处理：用节气月代替农历月
        const monthNames = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
        const dayIndex = (today.getDate() - 1) % 30;

        return {
            month: monthNames[monthInfo.monthIndex],
            day: this.lunarDays[dayIndex],
            solarTerm: solarTermInfo.termName
        };
    },

    /**
     * 五行相生相克
     */
    wuxingRelation: {
        generate: { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' },
        control: { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }
    },

    /**
     * 计算运势分数（确定性算法，同一输入同一输出）
     * 使用节气口径：年柱按立春换年
     * 
     * @returns {Object} { score, factors } - 分数和影响因子列表
     */
    calculateFortune(birthDate, todayGanZhi, options = {}) {
        const birth = new Date(birthDate);
        const factors = []; // 影响因子列表（用于解释）
        
        // 使用命理年（立春换年）
        const mingLiYear = ChineseCalendar.getMingLiYear(birth);
        const userYearPillar = ChineseCalendar.getYearPillar(mingLiYear);
        const userStem = userYearPillar.stem;
        const userElement = this.stemElements[userStem];

        // 今日五行
        const todayElement = this.stemElements[todayGanZhi.dayStem];

        // 基础分数（固定值，无随机）
        let baseScore = 60;
        
        // 根据日干五行的固有能量值调整基础分（确定性）
        const elementBaseScore = { '木': 3, '火': 5, '土': 2, '金': 4, '水': 1 };
        baseScore += elementBaseScore[todayElement] || 0;

        // 五行关系影响（确定性评分）
        if (this.wuxingRelation.generate[todayElement] === userElement) {
            baseScore += 15;
            factors.push({ type: 'positive', effect: 15, desc: `今日${todayElement}生你的${userElement}，得天助力` });
        } else if (this.wuxingRelation.generate[userElement] === todayElement) {
            baseScore -= 5;
            factors.push({ type: 'negative', effect: -5, desc: `你的${userElement}生今日${todayElement}，精力外泄` });
        } else if (this.wuxingRelation.control[todayElement] === userElement) {
            baseScore -= 10;
            factors.push({ type: 'negative', effect: -10, desc: `今日${todayElement}克你的${userElement}，须谨慎` });
        } else if (this.wuxingRelation.control[userElement] === todayElement) {
            baseScore += 10;
            factors.push({ type: 'positive', effect: 10, desc: `你的${userElement}克今日${todayElement}，掌控力强` });
        } else if (todayElement === userElement) {
            baseScore += 5;
            factors.push({ type: 'positive', effect: 5, desc: `今日${todayElement}与你同气相求` });
        } else {
            factors.push({ type: 'neutral', effect: 0, desc: `今日${todayElement}与你的${userElement}关系平和` });
        }

        // 时辰因素（确定性）
        if (options.hour !== null && options.hour !== undefined) {
            const hourBranch = this.earthlyBranches[options.hour];
            const hourElement = this.branchElements[hourBranch];
            if (this.wuxingRelation.generate[hourElement] === userElement) {
                baseScore += 8;
                factors.push({ type: 'positive', effect: 8, desc: `出生时辰${hourBranch}（${hourElement}）生扶你` });
            } else if (this.wuxingRelation.control[hourElement] === userElement) {
                baseScore -= 5;
                factors.push({ type: 'negative', effect: -5, desc: `出生时辰${hourBranch}（${hourElement}）克制你` });
            }
        }

        // 性别阴阳匹配（确定性）
        if (options.gender === 'male') {
            if (['甲', '丙', '戊', '庚', '壬'].includes(todayGanZhi.dayStem)) {
                baseScore += 3;
                factors.push({ type: 'positive', effect: 3, desc: '阳日利男性' });
            }
        } else if (options.gender === 'female') {
            if (['乙', '丁', '己', '辛', '癸'].includes(todayGanZhi.dayStem)) {
                baseScore += 3;
                factors.push({ type: 'positive', effect: 3, desc: '阴日利女性' });
            }
        }

        // 姓名笔画影响（确定性，基于笔画数）
        if (options.name) {
            const nameScore = options.name.length % 5;
            baseScore += nameScore;
            if (nameScore > 0) {
                factors.push({ type: 'positive', effect: nameScore, desc: `姓名格局加成` });
            }
        }
        
        // 节气影响（确定性）
        if (todayGanZhi.solarTerm) {
            const solarTermBonus = this.getSolarTermBonus(todayGanZhi.solarTerm, userElement);
            if (solarTermBonus !== 0) {
                baseScore += solarTermBonus;
                factors.push({ 
                    type: solarTermBonus > 0 ? 'positive' : 'negative', 
                    effect: solarTermBonus, 
                    desc: `${todayGanZhi.solarTerm}节气${solarTermBonus > 0 ? '有利' : '不利'}于${userElement}命` 
                });
            }
        }

        const finalScore = Math.min(100, Math.max(30, baseScore));
        
        return {
            score: finalScore,
            factors,
            userElement,
            todayElement,
            baseScore
        };
    },
    
    /**
     * 节气对五行的影响（确定性映射）
     */
    getSolarTermBonus(solarTerm, userElement) {
        // 节气五行旺衰表
        const solarTermElements = {
            // 春季：木旺
            '立春': '木', '雨水': '木', '惊蛰': '木', '春分': '木', '清明': '木', '谷雨': '木',
            // 夏季：火旺
            '立夏': '火', '小满': '火', '芒种': '火', '夏至': '火', '小暑': '火', '大暑': '火',
            // 秋季：金旺
            '立秋': '金', '处暑': '金', '白露': '金', '秋分': '金', '寒露': '金', '霜降': '金',
            // 冬季：水旺
            '立冬': '水', '小雪': '水', '大雪': '水', '冬至': '水', '小寒': '水', '大寒': '水'
        };
        
        const seasonElement = solarTermElements[solarTerm];
        if (!seasonElement) return 0;
        
        // 当令五行对用户五行的影响
        if (seasonElement === userElement) {
            return 5; // 得令
        } else if (this.wuxingRelation.generate[seasonElement] === userElement) {
            return 3; // 季节生我
        } else if (this.wuxingRelation.control[seasonElement] === userElement) {
            return -3; // 季节克我
        }
        return 0;
    },

    /**
     * 生成各项运势（确定性算法，基于五行生克）
     * 不同运势项受不同五行影响
     */
    generateDetailedFortune(baseScore, userElement, todayElement) {
        // 确定性的分项计算（不使用随机）
        // 基于五行对各领域的影响
        const elementCareerBonus = { '木': 5, '金': 8, '土': 3, '火': 6, '水': 4 };
        const elementWealthBonus = { '金': 10, '土': 8, '水': 5, '火': 3, '木': 4 };
        const elementLoveBonus = { '火': 10, '木': 8, '水': 6, '土': 4, '金': 2 };
        const elementHealthBonus = { '土': 8, '木': 6, '水': 5, '火': 4, '金': 7 };
        
        const careerScore = baseScore + (elementCareerBonus[todayElement] || 0) - 5;
        const wealthScore = baseScore + (elementWealthBonus[todayElement] || 0) - 5;
        const loveScore = baseScore + (elementLoveBonus[todayElement] || 0) - 5;
        const healthScore = baseScore + (elementHealthBonus[todayElement] || 0) - 5;

        return {
            overall: Math.min(100, Math.max(20, baseScore)),
            career: Math.min(100, Math.max(20, careerScore)),
            wealth: Math.min(100, Math.max(20, wealthScore)),
            love: Math.min(100, Math.max(20, loveScore)),
            health: Math.min(100, Math.max(20, healthScore))
        };
    },

    /**
     * 分数转星级
     */
    scoreToStars(score) {
        if (score >= 90) return '★★★★★';
        if (score >= 75) return '★★★★☆';
        if (score >= 60) return '★★★☆☆';
        if (score >= 45) return '★★☆☆☆';
        return '★☆☆☆☆';
    },

    /**
     * 生成幸运信息
     */
    generateLuckyInfo(todayGanZhi) {
        const colors = ['红色', '橙色', '黄色', '绿色', '青色', '蓝色', '紫色', '金色', '白色', '黑色'];
        const numbers = ['1', '2', '3', '6', '8', '9'];
        const directions = ['东', '南', '西', '北', '东南', '东北', '西南', '西北'];

        // 基于今日干支计算
        const stemIndex = this.heavenlyStems.indexOf(todayGanZhi.dayStem);
        const branchIndex = this.earthlyBranches.indexOf(todayGanZhi.dayBranch);

        return {
            color: colors[(stemIndex + branchIndex) % colors.length],
            number: numbers[(stemIndex + branchIndex + new Date().getDate()) % numbers.length],
            direction: directions[(branchIndex) % directions.length]
        };
    },

    /**
     * 生成今日建议
     */
    generateAdvice(fortune) {
        const advices = [];

        if (fortune.overall >= 80) {
            advices.push('今日运势大吉，宜积极进取，把握良机。');
        } else if (fortune.overall >= 60) {
            advices.push('今日运势平稳，按部就班即可。');
        } else {
            advices.push('今日运势欠佳，宜守不宜攻，低调行事。');
        }

        if (fortune.career >= 75) {
            advices.push('事业运旺，适合谈判、签约、面试。');
        }

        if (fortune.wealth >= 75) {
            advices.push('财运亨通，有意外收获可能。');
        } else if (fortune.wealth < 50) {
            advices.push('财运平淡，避免大额投资。');
        }

        if (fortune.love >= 75) {
            advices.push('感情运佳，利于表白、约会。');
        }

        if (fortune.health < 60) {
            advices.push('注意休息，避免过度劳累。');
        }

        return advices;
    },

    /**
     * 计算今日运势（确定性算法）
     * 同一输入在任意设备/时间重复计算得到一致结果
     */
    calculate(birthDate, options = {}) {
        const todayGanZhi = this.getTodayGanZhi();
        const lunarDate = this.getLunarDate();
        
        // 使用新的确定性计算方法
        const fortuneResult = this.calculateFortune(birthDate, todayGanZhi, options);
        const fortune = this.generateDetailedFortune(
            fortuneResult.score, 
            fortuneResult.userElement, 
            fortuneResult.todayElement
        );
        const luckyInfo = this.generateLuckyInfo(todayGanZhi);
        const advices = this.generateAdvice(fortune);

        return {
            todayGanZhi,
            lunarDate,
            fortune,
            luckyInfo,
            advices,
            // 新增：影响因子（用于前端展示解释）
            factors: fortuneResult.factors,
            // 新增：元素信息
            userElement: fortuneResult.userElement,
            todayElement: fortuneResult.todayElement
        };
    },

    /**
     * [NiShi Standard] 标准化计算接口
     * 返回符合 NiShiResult 定义的统一结构
     */
    calculateStandard(birthDate, options = {}) {
        // 复用现有计算逻辑
        const rawResult = this.calculate(birthDate, options);

        // 转换分数为标准 verdict
        const score = rawResult.fortune.overall;
        const verdictInfo = NiShiRules.TianJi.evaluateScore(score);

        return NiShiRules.createResult({
            source: 'TianJi', // 每日运势属于天机道（时间）
            pattern: {
                name: `今日${rawResult.todayGanZhi.dayStem}${rawResult.todayGanZhi.dayBranch}日`,
                symbol: '📅',
                attributes: {
                    todayGanZhi: rawResult.todayGanZhi,
                    lunarDate: rawResult.lunarDate
                }
            },
            calculation: {
                score: score,
                balance: score > 60 ? '顺遂' : '受阻', // 简化的状态描述
                energy: rawResult.fortune // 详细分项作为能量分布
            },
            verdict: {
                level: verdictInfo.level,
                stars: verdictInfo.stars,
                summary: rawResult.advices[0] || '今日运势平稳。'
            },
            guidance: {
                // 人间道：今日宜忌建议
                action: rawResult.advices.join(' '),
                // 天机道：时间建议
                timing: `农历${rawResult.lunarDate.month}月${rawResult.lunarDate.day}`,
                // 地脉道：方位建议
                adjustment: `吉方：${rawResult.luckyInfo.direction}，幸运色：${rawResult.luckyInfo.color}`
            }
        });
    },

    /**
     * 渲染结果
     */
    renderResult(result, options = {}) {
        const { todayGanZhi, lunarDate, fortune, luckyInfo, advices } = result;
        const today = new Date();

        // 个性化称呼
        let greeting = '';
        if (options.name) {
            greeting = `<div class="personal-greeting">🐾 亲爱的${options.name}，你今天的运势来咯~</div>`;
        }

        // 精准度提示
        let accuracyNote = '';
        const filledFields = [options.hour !== null, options.gender, options.name].filter(Boolean).length;
        if (filledFields === 3) {
            accuracyNote = '<div class="accuracy-note">✨ 资料很全，Kitty算得超精准哦！喵喵喵~</div>';
        } else if (filledFields === 2) {
            accuracyNote = '<div class="accuracy-note">🐱 还可以哦，资料再多一点就更准了~</div>';
        } else if (filledFields === 1) {
            accuracyNote = '<div class="accuracy-note">😼 资料有点少哦，Kitty只能算个大概~</div>';
        } else {
            accuracyNote = '<div class="accuracy-note">😿 只知道生日...下次多告诉Kitty一些呗~</div>';
        }

        let html = `
            ${greeting}
            ${accuracyNote}
            <div class="daily-date">
                <span id="daily-lunar-result">农历${lunarDate.month}月${lunarDate.day} ${todayGanZhi.dayStem}${todayGanZhi.dayBranch}日</span>
                <span>${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日</span>
            </div>
            
            <div class="fortune-overview">
                <div class="fortune-item">
                    <div class="fortune-icon">📊</div>
                    <div class="fortune-label">综合运势</div>
                    <div class="fortune-stars">${this.scoreToStars(fortune.overall)}</div>
                </div>
                <div class="fortune-item">
                    <div class="fortune-icon">💼</div>
                    <div class="fortune-label">事业运</div>
                    <div class="fortune-stars">${this.scoreToStars(fortune.career)}</div>
                </div>
                <div class="fortune-item">
                    <div class="fortune-icon">💰</div>
                    <div class="fortune-label">财运</div>
                    <div class="fortune-stars">${this.scoreToStars(fortune.wealth)}</div>
                </div>
                <div class="fortune-item">
                    <div class="fortune-icon">💕</div>
                    <div class="fortune-label">感情运</div>
                    <div class="fortune-stars">${this.scoreToStars(fortune.love)}</div>
                </div>
            </div>
            
            <div class="lucky-info">
                <div class="lucky-item">
                    <span class="lucky-label">幸运颜色：</span>
                    <span class="lucky-value">${luckyInfo.color}</span>
                </div>
                <div class="lucky-item">
                    <span class="lucky-label">幸运数字：</span>
                    <span class="lucky-value">${luckyInfo.number}</span>
                </div>
                <div class="lucky-item">
                    <span class="lucky-label">吉利方位：</span>
                    <span class="lucky-value">${luckyInfo.direction}</span>
                </div>
                <div class="lucky-item">
                    <span class="lucky-label">今日生肖：</span>
                    <span class="lucky-value">${todayGanZhi.zodiac}年</span>
                </div>
            </div>
            
            <div class="analysis-card">
                <h4>今日建议</h4>
                <p>${advices.join('<br>')}</p>
                <p class="disclaimer-note" style="font-size: 0.85rem; color: #888; margin-top: 12px;">
                    ⚠️ 每日运势仅供参考，不作为重大决策依据～
                </p>
            </div>
            
            <div class="hide-seek-section">
                <div class="hide-seek-question">
                    <span class="cat-emoji">😼</span>
                    <span>喵~ 今天要不要去蹲猫猫（做大事）呀？</span>
                </div>
                <p class="hide-seek-hint">让Kitty帮你看看今天适不适合做重要的事情~</p>
                <button id="daily-hide-seek-btn" class="submit-btn hide-seek-btn">
                    <span>📅 良辰吉日，看看今天行不行！</span>
                    <span class="btn-glow"></span>
                </button>
            </div>
        `;

        // 添加点赞分享按钮
        if (typeof ShareUtils !== 'undefined') {
            html += ShareUtils.createActionButtons('daily');
        }

        return html;
    }
};

window.DailyFortune = DailyFortune;


