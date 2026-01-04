/**
 * 良辰吉日择日模块
 * 基于倪海厦《天纪》理论
 * 
 * 重要口径说明：
 * - 月建按节气定月（寅月从立春起）
 * - 十二建除起于月建地支
 * - 黄道吉日按节气月计算
 */

import { NiShiRules } from './core/nishi_rules.js';
import ChineseCalendar, {
    STEM_ELEMENTS,
    EARTHLY_BRANCHES
} from './core/calendar.js';

const AuspiciousDay = {

    // 十二建除 (从正月建寅开始)
    jianChuNames: ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'],

    // 各建除的基本吉凶
    jianChuInfo: {
        '建': { type: '吉', desc: '万事创基之日，宜开业、动工、建造' },
        '除': { type: '吉', desc: '扫除之日，宜除旧布新、清洁、医疗' },
        '满': { type: '吉', desc: '圆满之日，宜祈福、嫁娶、庆贺' },
        '平': { type: '中', desc: '平常之日，诸事皆宜' },
        '定': { type: '吉', desc: '安定之日，宜签约、定盟、置产' },
        '执': { type: '中', desc: '执持之日，宜捕捉、栽种' },
        '破': { type: '凶', desc: '破败之日，诸事不宜' },
        '危': { type: '凶', desc: '危险之日，宜谨慎行事' },
        '成': { type: '吉', desc: '成就之日，百事皆成' },
        '收': { type: '吉', desc: '收获之日，宜收账、入库' },
        '开': { type: '吉', desc: '开通之日，宜开张、出行、交易' },
        '闭': { type: '凶', desc: '闭塞之日，宜静养安息' }
    },

    // 六种活动类型配置
    activityConfig: {
        '表白': {
            icon: '💕',
            suitable: ['成', '开', '定', '满'],
            unsuitable: ['破', '危', '闭'],
            goodElements: ['火', '木'],  // 桃花属火木
            description: '告白表达爱意'
        },
        '结婚': {
            icon: '💒',
            suitable: ['成', '开', '满', '定'],
            unsuitable: ['破', '危', '闭', '建'],
            goodElements: ['火', '土'],  // 婚姻属土火
            description: '婚嫁喜事'
        },
        '打麻将': {
            icon: '🀄',
            suitable: ['满', '收', '开', '成'],
            unsuitable: ['破', '闭', '危'],
            goodElements: ['金', '水'],  // 偏财属金水
            description: '娱乐博弈'
        },
        '搬家': {
            icon: '🏠',
            suitable: ['成', '开', '除', '定'],
            unsuitable: ['破', '闭', '危', '建'],
            goodElements: ['土', '木'],  // 宅运属土木
            description: '乔迁入宅'
        },
        '聚餐': {
            icon: '🍜',
            suitable: ['成', '开', '满', '平'],
            unsuitable: ['破', '危'],
            goodElements: ['火', '土'],  // 食神属火土
            description: '聚会宴请'
        },
        '出远门': {
            icon: '✈️',
            suitable: ['开', '除', '定', '成'],
            unsuitable: ['闭', '破', '危'],
            goodElements: ['水', '木'],  // 出行属水木
            description: '远行出游'
        }
    },

    // 地支相冲
    branchClash: {
        '子': '午', '丑': '未', '寅': '申', '卯': '酉',
        '辰': '戌', '巳': '亥', '午': '子', '未': '丑',
        '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳'
    },

    // 地支六合
    branchHarmony: {
        '子': '丑', '丑': '子', '寅': '亥', '卯': '戌',
        '辰': '酉', '巳': '申', '午': '未', '未': '午',
        '申': '巳', '酉': '辰', '戌': '卯', '亥': '寅'
    },

    /**
     * 计算某日的十二建除
     * 使用节气月建（不是公历月份）
     * @param {Date} date - 目标日期
     * @returns {string} - 建除名称
     */
    getJianChu(date) {
        // 使用节气月建（核心改动点）
        const monthInfo = ChineseCalendar.getSolarTermMonth(date);
        const monthBranchIndex = monthInfo.branchIndex;

        // 获取该日的地支
        const dayPillar = ChineseCalendar.getDayPillar(date);
        const dayBranch = dayPillar.branch;
        const dayBranchIndex = EARTHLY_BRANCHES.indexOf(dayBranch);

        // 建除起于月建
        // 月建为该月地支，建日即月建日
        // 例如：寅月，寅日为"建"，卯日为"除"...
        const jianChuIndex = (dayBranchIndex - monthBranchIndex + 12) % 12;

        return this.jianChuNames[jianChuIndex];
    },

    /**
     * 判断是否为黄道吉日
     * 青龙、明堂、金匮、天德、玉堂、司命为六黄道
     * 使用节气月建（不是公历月份）
     * @param {Date} date - 目标日期
     * @returns {object} - { isHuangDao: boolean, name: string }
     */
    getHuangDao(date) {
        const dayPillar = ChineseCalendar.getDayPillar(date);
        const dayBranch = dayPillar.branch;
        const dayBranchIndex = EARTHLY_BRANCHES.indexOf(dayBranch);

        // 十二值日神（按地支顺序）
        const huangDaoNames = ['青龙', '明堂', '天刑', '朱雀', '金匮', '天德',
            '白虎', '玉堂', '天牢', '玄武', '司命', '勾陈'];

        // 使用节气月建确定起始位置（核心改动点）
        // monthIndex: 0=寅月, 1=卯月, ... 11=丑月
        const monthInfo = ChineseCalendar.getSolarTermMonth(date);
        const monthIndex = monthInfo.monthIndex;
        
        // 十二值神起始：寅月从辰起，卯月从午起... 每月进两位
        // startIndex = (monthIndex * 2 + 4) % 12 （从寅月辰位开始）
        const startIndex = (monthIndex * 2 + 4) % 12;

        const currentIndex = (dayBranchIndex - startIndex + 12) % 12;
        const huangDaoName = huangDaoNames[currentIndex];

        // 六黄道吉日
        const liuHuangDao = ['青龙', '明堂', '金匮', '天德', '玉堂', '司命'];
        const isHuangDao = liuHuangDao.includes(huangDaoName);

        return { isHuangDao, name: huangDaoName };
    },

    /**
     * 分析某日对于某活动的适宜程度
     * @param {Date} targetDate - 计划日期
     * @param {string} activity - 活动类型
     * @param {object} userBazi - 用户八字信息
     * @returns {object} - 分析结果
     */
    analyzeDate(targetDate, activity, userBazi) {
        const jianChu = this.getJianChu(targetDate);
        const huangDao = this.getHuangDao(targetDate);
        const dayPillar = ChineseCalendar.getDayPillar(targetDate);
        const config = this.activityConfig[activity];

        let score = 50; // 基础分数
        const factors = [];

        // 1. 十二建除分析
        if (config.suitable.includes(jianChu)) {
            score += 20;
            factors.push({
                type: 'positive',
                text: `【${jianChu}日】${this.jianChuInfo[jianChu].desc}，适宜${activity}`
            });
        } else if (config.unsuitable.includes(jianChu)) {
            score -= 25;
            factors.push({
                type: 'negative',
                text: `【${jianChu}日】${this.jianChuInfo[jianChu].desc}，不宜${activity}`
            });
        } else {
            factors.push({
                type: 'neutral',
                text: `【${jianChu}日】${this.jianChuInfo[jianChu].desc}`
            });
        }

        // 2. 黄道吉日分析
        if (huangDao.isHuangDao) {
            score += 15;
            factors.push({
                type: 'positive',
                text: `✨ 六黄道【${huangDao.name}】吉日，诸事皆宜`
            });
        } else {
            score -= 5;
            factors.push({
                type: 'neutral',
                text: `【${huangDao.name}】日，非黄道日`
            });
        }

        // 3. 日支与用户年支的关系
        const userYearBranch = userBazi.pillars.year.branch;
        const dayBranch = dayPillar.branch;

        // 检查冲克
        if (this.branchClash[userYearBranch] === dayBranch) {
            score -= 20;
            factors.push({
                type: 'negative',
                text: `⚠️ 日支与你的年支相冲（${dayBranch}冲${userYearBranch}），宜避开`
            });
        }

        // 检查六合
        if (this.branchHarmony[userYearBranch] === dayBranch) {
            score += 15;
            factors.push({
                type: 'positive',
                text: `💫 日支与你的年支六合（${dayBranch}合${userYearBranch}），有助运势`
            });
        }

        // 4. 五行配合分析
        const dayElement = STEM_ELEMENTS[dayPillar.stem];
        if (config.goodElements.includes(dayElement)) {
            score += 10;
            factors.push({
                type: 'positive',
                text: `🎯 日干五行【${dayElement}】与${activity}相配`
            });
        }

        // 5. 日主强弱考虑
        if (userBazi.dayMasterStrength.level === '身弱') {
            // 身弱者宜选择生扶日主的日子
            const dayMasterElement = userBazi.dayMasterElement;
            if (ChineseCalendar.WuXing.generates[dayElement] === dayMasterElement) {
                score += 10;
                factors.push({
                    type: 'positive',
                    text: `🌱 此日五行生扶你的日主，有利行事`
                });
            }
        }

        // 计算评级
        let rating;
        if (score >= 80) rating = '大吉';
        else if (score >= 65) rating = '吉';
        else if (score >= 50) rating = '平';
        else if (score >= 35) rating = '凶';
        else rating = '大凶';

        return {
            date: targetDate,
            jianChu,
            huangDao,
            dayPillar,
            score,
            rating,
            factors,
            activity,
            config
        };
    },

    /**
     * [NiShi Standard] 标准化择日接口
     */
    analyzeDateStandard(targetDate, activity, userBazi) {
        // 1. 获取基础计算结果
        const result = this.analyzeDate(targetDate, activity, userBazi);

        // 2. 映射到标准结论
        const score = result.score;
        const verdictInfo = NiShiRules.TianJi.evaluateScore(score);

        return NiShiRules.createResult({
            source: 'TianJi', // 择日属于天机道（时间）
            pattern: {
                name: `${activity}择日`,
                symbol: result.config.icon,
                attributes: {
                    date: result.date,
                    jianChu: result.jianChu,
                    huangDao: result.huangDao
                }
            },
            calculation: {
                score: score,
                balance: result.rating,
                energy: { '吉凶因子': result.factors.length }
            },
            verdict: {
                level: verdictInfo.level,
                stars: verdictInfo.stars,
                summary: `${result.date.toLocaleDateString()} ${result.rating}，${result.factors[0]?.text || ''}`
            },
            guidance: {
                // 人间道：行动建议
                action: result.rating.includes('吉') ? `宜大胆进行${activity}。` : `建议另择吉日，或小心行事。`,
                // 天机道：时机
                timing: `建除：${result.jianChu}，黄道：${result.huangDao.name}`,
                // 地脉道：
                adjustment: '吉日良辰，天时地利人和缺一不可。'
            }
        });
    },

    /**
     * 寻找推荐日期
     * @param {Date} startDate - 开始日期
     * @param {string} activity - 活动类型
     * @param {object} userBazi - 用户八字
     * @param {number} days - 搜索天数范围
     * @returns {Array} - 推荐日期列表（按评分排序）
     */
    findGoodDates(startDate, activity, userBazi, days = 30) {
        const results = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < days; i++) {
            const checkDate = new Date(startDate);
            checkDate.setDate(checkDate.getDate() + i);

            // 只考虑今天及以后的日期
            if (checkDate >= today) {
                const analysis = this.analyzeDate(checkDate, activity, userBazi);
                if (analysis.score >= 65) { // 只推荐吉及以上的日子
                    results.push(analysis);
                }
            }
        }

        // 按分数排序
        return results.sort((a, b) => b.score - a.score).slice(0, 5);
    },

    /**
     * 生成完整的择日报告
     */
    generateReport(targetDate, activity, userBazi) {
        const analysis = this.analyzeDate(targetDate, activity, userBazi);
        const config = this.activityConfig[activity];
        const recommendations = this.findGoodDates(new Date(), activity, userBazi, 30);

        return {
            targetAnalysis: analysis,
            recommendations,
            userBazi,
            activity,
            config
        };
    },

    /**
     * 格式化日期为中文
     */
    formatDateChinese(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekDay = weekDays[date.getDay()];
        return `${year}年${month}月${day}日（星期${weekDay}）`;
    },

    /**
     * 渲染结果HTML
     */
    renderResult(report) {
        const { targetAnalysis, recommendations, activity, config } = report;
        
        // 检测语言
        const isEn = typeof I18n !== 'undefined' && I18n.isEnglish();
        const isJa = typeof I18n !== 'undefined' && I18n.isJapanese();

        // 评级对应的样式和emoji
        const ratingStyles = {
            '大吉': { emoji: '🌟', class: 'rating-great', color: '#ff69b4', en: 'Very Auspicious', ja: '大吉' },
            '吉': { emoji: '✨', class: 'rating-good', color: '#90EE90', en: 'Auspicious', ja: '吉' },
            '平': { emoji: '☯️', class: 'rating-neutral', color: '#FFD700', en: 'Neutral', ja: '平' },
            '凶': { emoji: '⚠️', class: 'rating-bad', color: '#FFA500', en: 'Unfavorable', ja: '凶' },
            '大凶': { emoji: '💀', class: 'rating-terrible', color: '#FF6B6B', en: 'Very Unfavorable', ja: '大凶' }
        };

        const ratingStyle = ratingStyles[targetAnalysis.rating];
        
        // 活动名称翻译
        const activityEn = {
            '表白': 'Confession', '结婚': 'Wedding', '打麻将': 'Mahjong',
            '搬家': 'Moving', '聚餐': 'Gathering', '出远门': 'Travel'
        };
        const activityJa = {
            '表白': '告白', '结婚': '結婚', '打麻将': '麻雀',
            '搬家': '引越し', '聚餐': '会食', '出远门': '遠出'
        };
        
        const activityName = isJa ? (activityJa[activity] || activity) : isEn ? (activityEn[activity] || activity) : activity;
        const analysisTitle = isJa ? `${activityName}の吉日分析` : isEn ? `${activityName} Date Analysis` : `${activity}择日分析`;

        let html = `
            <div class="auspicious-result">
                <div class="result-card">
                    <h3>${config.icon} ${analysisTitle} ${config.icon}</h3>
                    
                    <div class="date-info">
                        <div class="target-date">
                            <span class="date-label">📅 ${isJa ? '予定日' : isEn ? 'Planned Date' : '计划日期'}</span>
                            <span class="date-value">${isJa ? this.formatDateJapanese(targetAnalysis.date) : isEn ? this.formatDateEnglish(targetAnalysis.date) : this.formatDateChinese(targetAnalysis.date)}</span>
                        </div>
                        <div class="day-pillar">
                            <span class="pillar-label">${isJa ? '干支' : isEn ? 'Gan Zhi' : '干支'}</span>
                            <span class="pillar-value">${targetAnalysis.dayPillar.stem}${targetAnalysis.dayPillar.branch}${isJa ? '日' : isEn ? ' Day' : '日'}</span>
                        </div>
                    </div>
                    
                    <div class="rating-display ${ratingStyle.class}">
                        <span class="rating-emoji">${ratingStyle.emoji}</span>
                        <span class="rating-text">${isJa ? ratingStyle.ja : isEn ? ratingStyle.en : targetAnalysis.rating}</span>
                        <span class="rating-score">${isJa ? '総合評価：' : isEn ? 'Score:' : '综合评分：'}${targetAnalysis.score}${isJa ? '点' : isEn ? ' pts' : '分'}</span>
                    </div>
                    
                    <div class="factors-list">
                        <h4>📊 ${isJa ? '詳細分析' : isEn ? 'Detailed Analysis' : '详细分析'}</h4>
                        ${targetAnalysis.factors.map(f => `
                            <div class="factor-item factor-${f.type}">
                                ${f.text}
                            </div>
                        `).join('')}
                    </div>
                </div>
        `;

        // 如果评分不高，显示推荐日期
        if (targetAnalysis.score < 65 && recommendations.length > 0) {
            const recTitle = isJa ? 'Kittyおすすめの吉日' : isEn ? 'Kitty\'s Recommended Dates' : 'Kitty推荐的吉日';
            const recHint = isJa ? `これから30日間で${activityName}にもっと向いてる日はこちら～` : isEn ? `Here are better days for ${activityEn[activity] || activity} in the next 30 days~` : `以下是未来30天内更适合${activity}的日子~`;
            html += `
                <div class="result-card recommendations-card">
                    <h3>🗓️ ${recTitle} 🗓️</h3>
                    <p class="rec-hint">${recHint}</p>
                    <div class="rec-list">
                        ${recommendations.slice(0, 3).map((rec, index) => `
                            <div class="rec-item">
                                <span class="rec-rank">${index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                                <span class="rec-date">${isJa ? this.formatDateJapanese(rec.date) : isEn ? this.formatDateEnglish(rec.date) : this.formatDateChinese(rec.date)}</span>
                                <span class="rec-info">【${rec.jianChu}${isJa ? '日' : isEn ? '' : '日'}】${rec.huangDao.isHuangDao ? (isJa ? '黄道' : isEn ? 'Lucky' : '黄道') : ''}</span>
                                <span class="rec-rating">${ratingStyles[rec.rating].emoji} ${isJa ? ratingStyles[rec.rating].ja : isEn ? ratingStyles[rec.rating].en : rec.rating}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (targetAnalysis.score >= 65) {
            const congratsTitle = isJa ? `おめでとう！この日は${activityName}にピッタリよ～` : isEn ? `Great! This day is perfect for ${activityEn[activity] || activity}~` : `恭喜！这天很适合${activity}哦~`;
            const congratsText = isJa ? 'Kittyが見たところ、あなたが選んだ日はなかなかいいわよ、安心して進めて～' : isEn ? 'Kitty thinks the day you chose is quite nice. Go ahead with confidence~' : `本喵觉得你选的这个日子挺不错的，可以放心去${config.description}啦~`;
            html += `
                <div class="result-card congrats-card">
                    <h3>🎉 ${congratsTitle} 🎉</h3>
                    <p>${congratsText}</p>
                </div>
            `;
        }

        // 喵喵小贴士
        const tips = this.getCatTips(activity, targetAnalysis, isEn, isJa);
        html += `
            <div class="result-card cat-tips-card">
                <h3>🐱 ${isJa ? 'Kittyのワンポイント' : isEn ? 'Kitty\'s Tips' : '喵喵小贴士'}</h3>
                <p>${tips}</p>
            </div>
        `;

        // 添加点赞和分享按钮
        if (typeof ShareUtils !== 'undefined') {
            html += ShareUtils.createActionButtons('auspicious');
        }

        html += '</div>';

        return html;
    },
    
    /**
     * 格式化日期（英文）
     */
    formatDateEnglish(date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    },
    
    /**
     * 格式化日期（日本語）
     */
    formatDateJapanese(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
        const weekDay = weekDays[date.getDay()];
        return `${year}年${month}月${day}日（${weekDay}曜日）`;
    },

    /**
     * 生成猫咪语气的小贴士
     */
    getCatTips(activity, analysis, isEn = false, isJa = false) {
        const catFaces = ['(=^･ω･^=)', '(=´∇｀=)', '(^・ω・^)', 'ฅ^•ﻌ•^ฅ'];
        const randomFace = catFaces[Math.floor(Math.random() * catFaces.length)];

        const tipsZh = {
            '表白': [
                `${randomFace} 告白要真诚哦~本喵相信真心最重要，日子只是锦上添花喵~`,
                `${randomFace} 无论什么日子，勇敢表达爱意最可爱！加油喵~`,
                `${randomFace} 本喵偷偷告诉你，傍晚时分告白成功率更高哦~`
            ],
            '结婚': [
                `${randomFace} 结婚是人生大事，除了日子，两个人的感情才是最重要的喵~`,
                `${randomFace} 祝你们百年好合，早生贵子...咳咳，早生小猫咪喵~`,
                `${randomFace} 本喵觉得只要两情相悦，每天都是好日子喵~`
            ],
            '打麻将': [
                `${randomFace} 打麻将要适度哦~本喵提醒你小赌怡情，大赌伤身喵~`,
                `${randomFace} 记住，输赢是其次，开心最重要喵~`,
                `${randomFace} 本喵的秘诀：坐北朝南，财运亨通喵~ (不过要看自己的八字哦)`
            ],
            '搬家': [
                `${randomFace} 搬家记得先搬水和米，寓意生活富足喵~`,
                `${randomFace} 新家记得开窗通风，让好运气进来喵~`,
                `${randomFace} 本喵建议搬家当天做顿好吃的，暖宅又暖心喵~`
            ],
            '聚餐': [
                `${randomFace} 聚餐开心最重要~记得多拍照留念喵~`,
                `${randomFace} 本喵觉得和好朋友在一起，吃什么都香喵~`,
                `${randomFace} 记得给本喵带点小鱼干回来喵~`
            ],
            '出远门': [
                `${randomFace} 出门在外注意安全哦~本喵会想你的喵~`,
                `${randomFace} 记得带好证件和钱包，还有一颗快乐的心喵~`,
                `${randomFace} 旅途愉快！记得给本喵带特产喵~`
            ]
        };
        
        const tipsEn = {
            '表白': [
                `${randomFace} Be sincere when confessing~ Kitty believes true love matters most, the date is just icing on the cake~`,
                `${randomFace} No matter the day, bravely expressing love is the cutest! Go for it~`,
                `${randomFace} Kitty's secret: evening confessions have higher success rates~`
            ],
            '结婚': [
                `${randomFace} Marriage is a big life event. Beyond the date, your love for each other matters most~`,
                `${randomFace} Wishing you a lifetime of happiness... and maybe some little kittens~`,
                `${randomFace} Kitty believes when two hearts are in love, every day is a good day~`
            ],
            '打麻将': [
                `${randomFace} Play mahjong moderately~ Small bets are fun, big ones are harmful~`,
                `${randomFace} Remember, winning or losing is secondary, having fun is what counts~`,
                `${randomFace} Kitty's secret: sit facing south for prosperity~ (but check your BaZi first)`
            ],
            '搬家': [
                `${randomFace} When moving, bring water and rice first for abundance~`,
                `${randomFace} Open windows in your new home to let good luck in~`,
                `${randomFace} Kitty suggests cooking a nice meal on moving day to warm the house~`
            ],
            '聚餐': [
                `${randomFace} Having fun is what matters at gatherings~ Take lots of photos~`,
                `${randomFace} Kitty believes everything tastes better with good friends~`,
                `${randomFace} Remember to bring some fish snacks back for Kitty~`
            ],
            '出远门': [
                `${randomFace} Stay safe while traveling~ Kitty will miss you~`,
                `${randomFace} Remember to bring your ID, wallet, and a happy heart~`,
                `${randomFace} Have a great trip! Bring Kitty some souvenirs~`
            ]
        };
        
        const tipsJa = {
            '表白': [
                `${randomFace} 告白は誠実にね～Kittyは本当の気持ちが一番大事だと思うわ、日取りは錦上添花よ～`,
                `${randomFace} どんな日でも、勇気を持って愛を伝えるのが一番可愛いわ！頑張って～`,
                `${randomFace} Kittyのシークレット：夕方の告白は成功率高いのよ～`
            ],
            '结婚': [
                `${randomFace} 結婚は人生の一大事、日取りより二人の愛情が一番大事よ～`,
                `${randomFace} 末永くお幸せに…子猫ちゃんもたくさん生まれますように～`,
                `${randomFace} Kittyは愛し合っていれば毎日が吉日だと思うわ～`
            ],
            '打麻将': [
                `${randomFace} 麻雀はほどほどにね～Kittyからのお願い、小さな賭けは楽しいけど大きいのはダメよ～`,
                `${randomFace} 勝ち負けは二の次、楽しむのが一番よ～`,
                `${randomFace} Kittyの秘訣：南向きに座ると金運アップ～（でも八字を確認してね）`
            ],
            '搬家': [
                `${randomFace} 引越しの時は水とお米を先に運ぶと、豊かな生活の象徴よ～`,
                `${randomFace} 新居では窓を開けて、良い運気を入れてね～`,
                `${randomFace} Kittyのおすすめ：引越し当日は美味しいご飯を作って、家も心も温めて～`
            ],
            '聚餐': [
                `${randomFace} 会食は楽しむのが一番！たくさん写真撮ってね～`,
                `${randomFace} Kittyは思うの、いい友達と一緒なら何を食べても美味しいわ～`,
                `${randomFace} Kittyにお魚スナック持って帰ってきてね～`
            ],
            '出远门': [
                `${randomFace} 旅行中は安全にね～Kittyは寂しくなるわ～`,
                `${randomFace} パスポートとお財布と、楽しい心を忘れずにね～`,
                `${randomFace} 良い旅を！Kittyにお土産忘れないでね～`
            ]
        };

        const tips = isJa ? tipsJa : isEn ? tipsEn : tipsZh;
        const defaultTip = isJa ? '全てがうまくいきますように～' : isEn ? 'Wishing you all the best~' : '祝你一切顺利喵~';
        const activityTips = tips[activity] || [`${randomFace} ${defaultTip}`];
        return activityTips[Math.floor(Math.random() * activityTips.length)];
    }
};

window.AuspiciousDay = AuspiciousDay;

