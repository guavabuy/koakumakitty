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
import { generateDailyTip, kittySpeak } from './core/wuxing_tips.js';

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
     * 生成今日建议（新人设语气版本）
     */
    generateAdvice(fortune, options = {}) {
        const advices = [];
        const lang = options.lang || 'zh';
        const percent = Math.round(Math.abs(fortune.overall - 60) * 0.5 + 10);

        if (lang === 'zh') {
            if (fortune.overall >= 80) {
                advices.push(`今天数据满格，成功率比平时高${percent}%，冲！`);
            } else if (fortune.overall >= 60) {
                advices.push(`今天数据还行，按部就班就能稳稳的~`);
            } else {
                advices.push(`今天指标偏低，建议静养，刷剧>社交~`);
            }

            if (fortune.career >= 75) {
                advices.push(`事业数据亮眼，谈判/签约/面试成功率+${Math.round(fortune.career * 0.3)}%`);
            }

            if (fortune.wealth >= 75) {
                advices.push(`财运雷达显示有惊喜，留意意外收获~`);
            } else if (fortune.wealth < 50) {
                advices.push(`财运曲线平缓，大额投资今天pass~`);
            }

            if (fortune.love >= 75) {
                advices.push(`桃花指数爆表，表白/约会成功率+${Math.round(fortune.love * 0.25)}%`);
            }

            if (fortune.health < 60) {
                advices.push(`健康值偏低，多休息才能满血复活~`);
            }
        } else if (lang === 'en') {
            if (fortune.overall >= 80) {
                advices.push(`Data maxed today, success rate ${percent}% higher - go for it!`);
            } else if (fortune.overall >= 60) {
                advices.push(`Data looks decent, steady pace will do~`);
            } else {
                advices.push(`Metrics low today, rest mode - Netflix > socializing~`);
            }

            if (fortune.career >= 75) {
                advices.push(`Career data shines, negotiations/interviews +${Math.round(fortune.career * 0.3)}% success`);
            }

            if (fortune.wealth >= 75) {
                advices.push(`Wealth radar detects surprises, watch for bonuses~`);
            } else if (fortune.wealth < 50) {
                advices.push(`Wealth curve flat, skip big investments today~`);
            }

            if (fortune.love >= 75) {
                advices.push(`Romance index maxed, confessions/dates +${Math.round(fortune.love * 0.25)}% success`);
            }

            if (fortune.health < 60) {
                advices.push(`Health bar low, rest up to respawn at full HP~`);
            }
        } else if (lang === 'ja') {
            if (fortune.overall >= 80) {
                advices.push(`今日はデータ満タン、成功率が${percent}%アップ、行こう！`);
            } else if (fortune.overall >= 60) {
                advices.push(`今日のデータはまあまあ、コツコツやれば安定～`);
            } else {
                advices.push(`今日は指標低め、静養推奨、ドラマ鑑賞>社交～`);
            }

            if (fortune.career >= 75) {
                advices.push(`仕事データ絶好調、商談/面接の成功率+${Math.round(fortune.career * 0.3)}%`);
            }

            if (fortune.wealth >= 75) {
                advices.push(`金運レーダーがサプライズを検知、臨時収入あるかも～`);
            } else if (fortune.wealth < 50) {
                advices.push(`金運曲線フラット、大きな投資は今日はパス～`);
            }

            if (fortune.love >= 75) {
                advices.push(`桃花指数がMAX、告白/デートの成功率+${Math.round(fortune.love * 0.25)}%`);
            }

            if (fortune.health < 60) {
                advices.push(`健康値低め、休んでフルHPで復活して～`);
            }
        }

        return advices;
    },

    /**
     * 生成五行小贴士卡片
     */
    generateWuxingTipCard(todayElement, userElement, lang = 'zh') {
        const tip = generateDailyTip(todayElement, userElement, lang);
        if (!tip) return null;

        return {
            element: tip.needElement,
            reason: tip.reason,
            clothing: tip.clothing,
            food: tip.food,
            activity: tip.activity,
            item: tip.item,
            crazyTip: tip.crazyTip,
            kittyComment: tip.kittyComment
        };
    },

    /**
     * 计算今日运势（确定性算法）
     * 同一输入在任意设备/时间重复计算得到一致结果
     */
    calculate(birthDate, options = {}) {
        const todayGanZhi = this.getTodayGanZhi();
        const lunarDate = this.getLunarDate();

        // 检测语言
        const lang = options.lang || 'zh';

        // 使用新的确定性计算方法
        const fortuneResult = this.calculateFortune(birthDate, todayGanZhi, options);
        const fortune = this.generateDetailedFortune(
            fortuneResult.score,
            fortuneResult.userElement,
            fortuneResult.todayElement
        );
        const luckyInfo = this.generateLuckyInfo(todayGanZhi);
        const advices = this.generateAdvice(fortune, { lang });

        // 生成五行小贴士
        const wuxingTip = this.generateWuxingTipCard(
            fortuneResult.todayElement,
            fortuneResult.userElement,
            lang
        );

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
            todayElement: fortuneResult.todayElement,
            // 新增：五行小贴士
            wuxingTip
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
     * 渲染结果（新人设版本）
     */
    renderResult(result, options = {}) {
        const { todayGanZhi, lunarDate, fortune, luckyInfo, advices, wuxingTip, userElement, todayElement } = result;
        const today = new Date();

        // 检测语言
        const isEn = typeof I18n !== 'undefined' && I18n.isEnglish();
        const isJa = typeof I18n !== 'undefined' && I18n.isJapanese();
        const lang = isJa ? 'ja' : isEn ? 'en' : 'zh';

        // 个性化称呼
        let greeting = '';
        if (options.name) {
            greeting = isJa
                ? `<div class="personal-greeting">🐾 ${options.name}さん、今日の運勢だよ～</div>`
                : isEn
                ? `<div class="personal-greeting">🐾 Dear ${options.name}, here's your daily fortune~</div>`
                : `<div class="personal-greeting">🐾 亲爱的${options.name}，你今天的运势来咯~</div>`;
        }

        // 精准度提示
        let accuracyNote = '';
        const filledFields = [options.hour !== null, options.gender, options.name].filter(Boolean).length;
        if (filledFields === 3) {
            accuracyNote = isJa
                ? '<div class="accuracy-note high">✨ 情報バッチリ！Kittyの占い超精密だよ！ニャー～</div>'
                : isEn
                ? '<div class="accuracy-note high">✨ Great info! Kitty can be super accurate! Meow~</div>'
                : '<div class="accuracy-note high">✨ 资料很全，Kitty算得超精准哦！喵喵喵~</div>';
        } else if (filledFields === 2) {
            accuracyNote = isJa
                ? '<div class="accuracy-note medium">🐱 まあまあね、もうちょっと情報があれば完璧なのに～</div>'
                : isEn
                ? '<div class="accuracy-note medium">🐱 Not bad, a bit more info would be better~</div>'
                : '<div class="accuracy-note medium">🐱 还可以哦，资料再多一点就更准了~</div>';
        } else if (filledFields === 1) {
            accuracyNote = isJa
                ? '<div class="accuracy-note low">😼 情報少ないわね、大雑把にしか占えないよ～</div>'
                : isEn
                ? '<div class="accuracy-note low">😼 Info is sparse, Kitty can only give a rough reading~</div>'
                : '<div class="accuracy-note low">😼 资料有点少哦，Kitty只能算个大概~</div>';
        } else {
            accuracyNote = isJa
                ? '<div class="accuracy-note low">😿 誕生日だけ…次はもっと教えてよね～</div>'
                : isEn
                ? '<div class="accuracy-note low">😿 Only birthday... tell Kitty more next time~</div>'
                : '<div class="accuracy-note low">😿 只知道生日...下次多告诉Kitty一些呗~</div>';
        }

        // 翻译颜色和方位
        const colorTrans = this.translateColor(luckyInfo.color, isJa);
        const directionTrans = this.translateDirection(luckyInfo.direction, isJa);
        const zodiacTrans = this.translateZodiac(todayGanZhi.zodiac, isJa);

        // 日期显示格式
        const lunarLabel = isJa ? '旧暦' : isEn ? 'Lunar' : '农历';
        const monthSuffix = isJa ? '月' : isEn ? ' Month ' : '月';
        const daySuffix = isJa ? '日' : isEn ? ' Day' : '日';
        const yearSep = isEn ? '/' : '年';
        const monthSep = isEn ? '/' : '月';
        const dateSuffix = isEn ? '' : '日';

        // 五行标签映射
        const elementLabels = {
            zh: { '木': '木', '火': '火', '土': '土', '金': '金', '水': '水' },
            en: { '木': 'Wood', '火': 'Fire', '土': 'Earth', '金': 'Metal', '水': 'Water' },
            ja: { '木': '木', '火': '火', '土': '土', '金': '金', '水': '水' }
        };

        // 生成Kitty数据分析开场白
        const kittyIntro = isJa
            ? `今日のデータ：${todayElement}旺${userElement}弱、総合スコア${fortune.overall}点`
            : isEn
            ? `Today's Data: ${elementLabels.en[todayElement]} high, ${elementLabels.en[userElement]} low, score ${fortune.overall}`
            : `今日数据：${todayElement}旺${userElement}弱，综合评分${fortune.overall}分`;

        let html = `
            ${greeting}
            ${accuracyNote}
            <div class="daily-date">
                <span id="daily-lunar-result">${lunarLabel}${lunarDate.month}${monthSuffix}${lunarDate.day} ${todayGanZhi.dayStem}${todayGanZhi.dayBranch}${daySuffix}</span>
                <span>${today.getFullYear()}${yearSep}${today.getMonth() + 1}${monthSep}${today.getDate()}${dateSuffix}</span>
            </div>

            <!-- Kitty数据分析卡片 -->
            <div class="kitty-data-card">
                <div class="kitty-avatar">😺</div>
                <div class="kitty-speech">
                    <p class="kitty-intro">${kittyIntro}</p>
                </div>
            </div>

            <div class="fortune-overview">
                <div class="fortune-item">
                    <div class="fortune-icon">📊</div>
                    <div class="fortune-label">${isJa ? '総合運' : isEn ? 'Overall' : '综合运势'}</div>
                    <div class="fortune-stars">${this.scoreToStars(fortune.overall)}</div>
                </div>
                <div class="fortune-item">
                    <div class="fortune-icon">💼</div>
                    <div class="fortune-label">${isJa ? '仕事運' : isEn ? 'Career' : '事业运'}</div>
                    <div class="fortune-stars">${this.scoreToStars(fortune.career)}</div>
                </div>
                <div class="fortune-item">
                    <div class="fortune-icon">💰</div>
                    <div class="fortune-label">${isJa ? '金運' : isEn ? 'Wealth' : '财运'}</div>
                    <div class="fortune-stars">${this.scoreToStars(fortune.wealth)}</div>
                </div>
                <div class="fortune-item">
                    <div class="fortune-icon">💕</div>
                    <div class="fortune-label">${isJa ? '恋愛運' : isEn ? 'Love' : '感情运'}</div>
                    <div class="fortune-stars">${this.scoreToStars(fortune.love)}</div>
                </div>
            </div>

            <!-- 五行小贴士卡片 -->
            ${wuxingTip ? `
            <div class="wuxing-tip-card">
                <h4>✨ ${isJa ? '今日の五行Tips' : isEn ? "Today's Element Tips" : '今日五行小贴士'}</h4>
                <p class="wuxing-reason">${wuxingTip.reason}</p>
                <div class="wuxing-tips-grid">
                    <div class="wuxing-tip-item">
                        <span class="tip-icon">☕</span>
                        <span class="tip-label">${isJa ? '飲食' : isEn ? 'Food' : '饮食'}</span>
                        <span class="tip-value">${wuxingTip.food}</span>
                    </div>
                    <div class="wuxing-tip-item">
                        <span class="tip-icon">👕</span>
                        <span class="tip-label">${isJa ? 'ファッション' : isEn ? 'Wear' : '穿搭'}</span>
                        <span class="tip-value">${wuxingTip.clothing}</span>
                    </div>
                    <div class="wuxing-tip-item">
                        <span class="tip-icon">🎯</span>
                        <span class="tip-label">${isJa ? '行動' : isEn ? 'Action' : '行动'}</span>
                        <span class="tip-value">${wuxingTip.activity}</span>
                    </div>
                </div>
                <div class="wuxing-crazy-tip">
                    <span class="crazy-label">🔥 ${isJa ? '大胆アドバイス' : isEn ? 'Bold Tip' : '大胆建议'}：</span>
                    <span class="crazy-value">${wuxingTip.crazyTip}</span>
                </div>
                <p class="kitty-comment">${wuxingTip.kittyComment}</p>
            </div>
            ` : ''}

            <div class="lucky-info">
                <div class="lucky-item">
                    <span class="lucky-label">${isJa ? 'ラッキーカラー：' : isEn ? 'Lucky Color:' : '幸运颜色：'}</span>
                    <span class="lucky-value">${isJa || isEn ? colorTrans : luckyInfo.color}</span>
                </div>
                <div class="lucky-item">
                    <span class="lucky-label">${isJa ? 'ラッキーナンバー：' : isEn ? 'Lucky Number:' : '幸运数字：'}</span>
                    <span class="lucky-value">${luckyInfo.number}</span>
                </div>
                <div class="lucky-item">
                    <span class="lucky-label">${isJa ? '吉方位：' : isEn ? 'Lucky Direction:' : '吉利方位：'}</span>
                    <span class="lucky-value">${isJa || isEn ? directionTrans : luckyInfo.direction}</span>
                </div>
                <div class="lucky-item">
                    <span class="lucky-label">${isJa ? '今日の干支：' : isEn ? 'Today\'s Zodiac:' : '今日生肖：'}</span>
                    <span class="lucky-value">${isJa ? zodiacTrans + '年' : isEn ? zodiacTrans + ' Year' : todayGanZhi.zodiac + '年'}</span>
                </div>
            </div>

            <div class="analysis-card">
                <h4>${isJa ? 'Kittyのアドバイス' : isEn ? "Kitty's Advice" : 'Kitty说'}</h4>
                <p>${advices.join('<br>')}</p>
                <p class="disclaimer-note" style="font-size: 0.85rem; color: #888; margin-top: 12px;">
                    ${isJa ? '⚠️ 毎日の運勢は参考程度にね、重大な決断には使わないでよ～' : isEn ? '⚠️ Daily fortune is for reference only, not for major decisions~' : '⚠️ 每日运势仅供参考，不作为重大决策依据～'}
                </p>
            </div>

            <div class="hide-seek-section">
                <div class="hide-seek-question">
                    <span class="cat-emoji">😼</span>
                    <span>${isJa ? 'ニャ～今日大事なことする予定？' : isEn ? 'Meow~ Planning something big today?' : '喵~ 今天要不要去蹲猫猫（做大事）呀？'}</span>
                </div>
                <p class="hide-seek-hint">${isJa ? '今日が大事なことに向いてるか、Kittyが見てあげる～' : isEn ? 'Let Kitty check if today is suitable for important matters~' : '让Kitty帮你看看今天适不适合做重要的事情~'}</p>
                <button id="daily-hide-seek-btn" class="submit-btn hide-seek-btn">
                    <span>📅 ${isJa ? '吉日かどうか、チェック！' : isEn ? 'Check if today is auspicious!' : '良辰吉日，看看今天行不行！'}</span>
                    <span class="btn-glow"></span>
                </button>
            </div>
        `;

        // 添加点赞分享按钮
        if (typeof ShareUtils !== 'undefined') {
            html += ShareUtils.createActionButtons('daily');
        }

        return html;
    },
    
    /**
     * 翻译颜色
     */
    translateColor(color, isJa = false) {
        const mapEn = {
            '红色': 'Red', '橙色': 'Orange', '黄色': 'Yellow', '绿色': 'Green',
            '青色': 'Cyan', '蓝色': 'Blue', '紫色': 'Purple', '金色': 'Gold',
            '白色': 'White', '黑色': 'Black'
        };
        const mapJa = {
            '红色': '赤', '橙色': 'オレンジ', '黄色': '黄', '绿色': '緑',
            '青色': '青', '蓝色': '青', '紫色': '紫', '金色': 'ゴールド',
            '白色': '白', '黑色': '黒'
        };
        return isJa ? (mapJa[color] || color) : (mapEn[color] || color);
    },
    
    /**
     * 翻译方位
     */
    translateDirection(dir, isJa = false) {
        const mapEn = {
            '东': 'East', '南': 'South', '西': 'West', '北': 'North',
            '东南': 'Southeast', '东北': 'Northeast', '西南': 'Southwest', '西北': 'Northwest'
        };
        const mapJa = {
            '东': '東', '南': '南', '西': '西', '北': '北',
            '东南': '東南', '东北': '東北', '西南': '西南', '西北': '西北'
        };
        return isJa ? (mapJa[dir] || dir) : (mapEn[dir] || dir);
    },
    
    /**
     * 翻译生肖
     */
    translateZodiac(zodiac, isJa = false) {
        const mapEn = {
            '鼠': 'Rat', '牛': 'Ox', '虎': 'Tiger', '兔': 'Rabbit',
            '龙': 'Dragon', '蛇': 'Snake', '马': 'Horse', '羊': 'Goat',
            '猴': 'Monkey', '鸡': 'Rooster', '狗': 'Dog', '猪': 'Pig'
        };
        const mapJa = {
            '鼠': '子', '牛': '丑', '虎': '寅', '兔': '卯',
            '龙': '辰', '蛇': '巳', '马': '午', '羊': '未',
            '猴': '申', '鸡': '酉', '狗': '戌', '猪': '亥'
        };
        return isJa ? (mapJa[zodiac] || zodiac) : (mapEn[zodiac] || zodiac);
    },
    
    /**
     * 翻译每日建议（英文）
     */
    translateAdvices(advices) {
        const translations = {
            '今日运势大吉，宜积极进取，把握良机。': 'Excellent fortune today. Seize opportunities and take action.',
            '今日运势平稳，按部就班即可。': 'Steady fortune today. Follow the plan step by step.',
            '今日运势欠佳，宜守不宜攻，低调行事。': 'Weak fortune today. Stay defensive and keep a low profile.',
            '事业运旺，适合谈判、签约、面试。': 'Career luck is strong. Great for negotiations, contracts, interviews.',
            '财运亨通，有意外收获可能。': 'Wealth flows well. Unexpected gains possible.',
            '财运平淡，避免大额投资。': 'Wealth luck is flat. Avoid large investments.',
            '感情运佳，利于表白、约会。': 'Love luck is good. Great for confessions and dates.',
            '注意休息，避免过度劳累。': 'Rest well. Avoid overworking.'
        };
        return advices.map(a => translations[a] || a).join('<br>');
    },
    
    /**
     * 翻译每日建议（日文）
     */
    translateAdvicesJa(advices) {
        const translations = {
            '今日运势大吉，宜积极进取，把握良机。': '今日は大吉！積極的に動いてチャンスを掴んで～',
            '今日运势平稳，按部就班即可。': '今日は普通ね、いつも通りでいいわよ～',
            '今日运势欠佳，宜守不宜攻，低调行事。': '今日はイマイチ…守りに徹して、おとなしくしてて～',
            '事业运旺，适合谈判、签约、面试。': '仕事運バッチリ！商談・契約・面接にピッタリよ～',
            '财运亨通，有意外收获可能。': '金運絶好調！思わぬ臨時収入あるかも～',
            '财运平淡，避免大额投资。': '金運は平凡…大きな投資は控えてね～',
            '感情运佳，利于表白、约会。': '恋愛運アップ！告白やデートに最適だよ～',
            '注意休息，避免过度劳累。': 'ちゃんと休んで、無理しないでよね～'
        };
        return advices.map(a => translations[a] || a).join('<br>');
    }
};

window.DailyFortune = DailyFortune;


