/**
 * 婚恋匹配度分析模块 - 增强版
 * 基于八字配对 + 姓名配对 + 命卦配对的综合分析
 * 
 * 重要口径说明：
 * - 年柱按立春换年（不是公历1月1日）
 * - 命卦计算使用命理年
 */

import { NiShiRules } from './core/nishi_rules.js';
import ChineseCalendar, {
    HEAVENLY_STEMS,
    EARTHLY_BRANCHES,
    STEM_ELEMENTS,
    ZODIAC_ANIMALS
} from './core/calendar.js';

const Marriage = {

    // ========== 基础数据 ==========

    // 引用核心模块的常量（保持向后兼容）
    heavenlyStems: HEAVENLY_STEMS,
    earthlyBranches: EARTHLY_BRANCHES,
    zodiacAnimals: ZODIAC_ANIMALS,

    // 生肖emoji
    zodiacEmoji: {
        '鼠': '🐭', '牛': '🐮', '虎': '🐯', '兔': '🐰',
        '龙': '🐲', '蛇': '🐍', '马': '🐴', '羊': '🐑',
        '猴': '🐵', '鸡': '🐔', '狗': '🐕', '猪': '🐷'
    },

    // 引用核心模块的五行映射
    stemElements: STEM_ELEMENTS,

    // 天干合化（六合）
    stemCombine: {
        '甲': '己', '己': '甲',
        '乙': '庚', '庚': '乙',
        '丙': '辛', '辛': '丙',
        '丁': '壬', '壬': '丁',
        '戊': '癸', '癸': '戊'
    },

    // 天干相冲
    stemClash: {
        '甲': '庚', '庚': '甲',
        '乙': '辛', '辛': '乙',
        '丙': '壬', '壬': '丙',
        '丁': '癸', '癸': '丁'
    },

    // 地支六合
    branchHarmony: {
        '子': '丑', '丑': '子',
        '寅': '亥', '亥': '寅',
        '卯': '戌', '戌': '卯',
        '辰': '酉', '酉': '辰',
        '巳': '申', '申': '巳',
        '午': '未', '未': '午'
    },

    // 地支相冲
    branchClash: {
        '子': '午', '午': '子',
        '丑': '未', '未': '丑',
        '寅': '申', '申': '寅',
        '卯': '酉', '酉': '卯',
        '辰': '戌', '戌': '辰',
        '巳': '亥', '亥': '巳'
    },

    // 地支三合
    branchTriple: {
        '申': ['子', '辰'], '子': ['申', '辰'], '辰': ['申', '子'],  // 水局
        '亥': ['卯', '未'], '卯': ['亥', '未'], '未': ['亥', '卯'],  // 木局
        '寅': ['午', '戌'], '午': ['寅', '戌'], '戌': ['寅', '午'],  // 火局
        '巳': ['酉', '丑'], '酉': ['巳', '丑'], '丑': ['巳', '酉']   // 金局
    },

    // 地支相害
    branchHarm: {
        '子': '未', '未': '子',
        '丑': '午', '午': '丑',
        '寅': '巳', '巳': '寅',
        '卯': '辰', '辰': '卯',
        '申': '亥', '亥': '申',
        '酉': '戌', '戌': '酉'
    },

    // 生肖配对关系
    zodiacSixHarmony: {
        '鼠': '牛', '牛': '鼠', '虎': '猪', '猪': '虎',
        '兔': '狗', '狗': '兔', '龙': '鸡', '鸡': '龙',
        '蛇': '猴', '猴': '蛇', '马': '羊', '羊': '马'
    },

    zodiacTriangle: {
        '鼠': ['龙', '猴'], '龙': ['鼠', '猴'], '猴': ['鼠', '龙'],
        '牛': ['蛇', '鸡'], '蛇': ['牛', '鸡'], '鸡': ['牛', '蛇'],
        '虎': ['马', '狗'], '马': ['虎', '狗'], '狗': ['虎', '马'],
        '兔': ['羊', '猪'], '羊': ['兔', '猪'], '猪': ['兔', '羊']
    },

    zodiacClash: {
        '鼠': '马', '马': '鼠', '牛': '羊', '羊': '牛',
        '虎': '猴', '猴': '虎', '兔': '鸡', '鸡': '兔',
        '龙': '狗', '狗': '龙', '蛇': '猪', '猪': '蛇'
    },

    // 五行相生相克
    elementGenerate: { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' },
    elementOvercome: { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' },

    // 命卦相关
    eastLifeGuas: ['坎', '离', '震', '巽'],
    westLifeGuas: ['乾', '坤', '艮', '兑'],
    guaNames: { 1: '坎', 2: '坤', 3: '震', 4: '巽', 6: '乾', 7: '兑', 8: '艮', 9: '离' },
    guaElements: { '坎': '水', '坤': '土', '震': '木', '巽': '木', '乾': '金', '兑': '金', '艮': '土', '离': '火' },

    // ========== 常用汉字笔画数 ==========
    strokeData: {
        '王': 4, '李': 7, '张': 11, '刘': 15, '陈': 16, '杨': 13, '黄': 12, '赵': 14, '周': 8, '吴': 7,
        '徐': 10, '孙': 10, '马': 10, '朱': 6, '胡': 11, '郭': 15, '何': 7, '高': 10, '林': 8, '罗': 20,
        '郑': 19, '梁': 11, '谢': 17, '宋': 7, '唐': 10, '许': 11, '韩': 17, '冯': 12, '邓': 19, '曹': 11,
        '彭': 12, '曾': 12, '萧': 18, '田': 5, '董': 15, '袁': 10, '潘': 16, '于': 3, '蒋': 17, '蔡': 17,
        '余': 7, '杜': 7, '叶': 15, '程': 12, '苏': 22, '魏': 18, '吕': 6, '丁': 2, '任': 6, '沈': 8,
        '姚': 9, '卢': 16, '姜': 9, '崔': 11, '钟': 17, '谭': 19, '陆': 16, '汪': 8, '范': 15, '金': 8,
        '明': 8, '华': 14, '文': 4, '强': 12, '伟': 11, '军': 9, '平': 5, '东': 8, '海': 11, '建': 9,
        '国': 11, '志': 7, '宇': 6, '浩': 11, '涛': 18, '鹏': 19, '飞': 9, '龙': 16, '波': 9, '磊': 15,
        '超': 12, '杰': 12, '辉': 15, '敏': 11, '娟': 10, '芳': 10, '丽': 19, '燕': 16, '玲': 10, '红': 9,
        '静': 16, '雪': 11, '梅': 11, '艳': 24, '秀': 7, '云': 12, '霞': 17, '晶': 12, '莉': 13, '婷': 12,
        '慧': 15, '颖': 16, '欣': 8, '雅': 12, '洁': 16, '倩': 10, '琴': 13, '萍': 14, '佳': 8, '美': 9,
        '一': 1, '二': 2, '三': 3, '四': 5, '五': 4, '六': 4, '七': 2, '八': 2, '九': 2, '十': 2,
        '小': 3, '大': 3, '中': 4, '新': 13, '天': 4, '爱': 13, '心': 4, '月': 4, '日': 4, '春': 9,
        '夏': 10, '秋': 9, '冬': 5, '花': 8, '草': 12, '风': 9, '雨': 8, '山': 3, '水': 4, '石': 5,
        '子': 3, '女': 3, '男': 7, '生': 5, '长': 8, '成': 7, '思': 9, '德': 15, '仁': 4, '义': 13,
        '礼': 18, '智': 12, '信': 9, '安': 6, '乐': 15, '福': 14, '贵': 12, '富': 12, '荣': 14, '华': 14,
        '博': 12, '学': 16, '书': 10, '画': 12, '琪': 13, '瑶': 15, '璇': 16, '珊': 10, '珠': 11, '玉': 5,
        '峰': 10, '岩': 8, '帆': 6, '航': 10, '洋': 10, '源': 14, '泽': 17, '江': 7, '河': 9, '湖': 13
    },

    // ========== 八字计算方法 ==========

    /**
     * 获取简化的八字信息
     * 使用节气口径：年柱按立春换年
     */
    getSimpleBazi(date, hourIndex, gender) {
        // 构建完整的出生时间（使用时辰起点）
        const birthDateTime = ChineseCalendar.buildBirthDateTime(date, hourIndex);
        
        // 使用核心模块计算四柱（节气口径）
        const { pillars, zodiac, debug } = ChineseCalendar.calculateFourPillars(birthDateTime, hourIndex);
        
        const yearPillar = pillars.year;
        const dayPillar = pillars.day;
        const hourPillar = pillars.hour;
        
        // 获取命理年（用于命卦计算）
        const mingLiYear = ChineseCalendar.getMingLiYear(birthDateTime);

        // 计算命卦（使用命理年）
        const mingGua = this.calculateMingGua(mingLiYear, gender);

        // 日主五行
        const dayMasterElement = this.stemElements[dayPillar.stem];

        return {
            yearPillar: yearPillar.stem + yearPillar.branch,
            dayPillar: dayPillar.stem + dayPillar.branch,
            hourPillar: hourPillar.stem + hourPillar.branch,
            dayStem: dayPillar.stem,
            dayBranch: dayPillar.branch,
            yearBranch: yearPillar.branch,
            hourBranch: hourPillar.branch,
            zodiac,
            mingGua,
            dayMasterElement,
            year: mingLiYear,  // 使用命理年
            gender,
            debug  // 调试信息
        };
    },

    /**
     * 计算命卦
     * @param {number} mingLiYear - 命理年份（立春换年）
     * @param {string} gender - 性别
     */
    calculateMingGua(mingLiYear, gender) {
        const lastTwoDigits = mingLiYear % 100;
        let guaNumber;

        if (gender === 'male') {
            guaNumber = (100 - lastTwoDigits) % 9;
            if (guaNumber === 0) guaNumber = 9;
            if (guaNumber === 5) guaNumber = 2;
        } else {
            guaNumber = (lastTwoDigits - 4) % 9;
            if (guaNumber <= 0) guaNumber += 9;
            if (guaNumber === 5) guaNumber = 8;
        }

        return this.guaNames[guaNumber];
    },

    // ========== 姓名笔画计算 ==========

    /**
     * 获取汉字笔画数
     */
    getStrokeCount(char) {
        if (this.strokeData[char]) {
            return this.strokeData[char];
        }
        // 默认返回一个合理的笔画数
        return 10;
    },

    /**
     * 计算姓名五格
     */
    calculateWuGe(name) {
        if (!name || name.length < 2) {
            return null;
        }

        const strokes = [];
        for (let i = 0; i < name.length; i++) {
            strokes.push(this.getStrokeCount(name[i]));
        }

        let tianGe, renGe, diGe, waiGe, zongGe;

        if (name.length === 2) {
            tianGe = strokes[0] + 1;
            renGe = strokes[0] + strokes[1];
            diGe = strokes[1] + 1;
            waiGe = 2;
            zongGe = strokes[0] + strokes[1];
        } else if (name.length === 3) {
            tianGe = strokes[0] + 1;
            renGe = strokes[0] + strokes[1];
            diGe = strokes[1] + strokes[2];
            waiGe = strokes[0] + strokes[2] + 1;
            zongGe = strokes[0] + strokes[1] + strokes[2];
        } else {
            tianGe = strokes[0] + strokes[1];
            renGe = strokes[1] + strokes[2];
            diGe = strokes[2] + strokes[3];
            waiGe = strokes[0] + strokes[3];
            zongGe = strokes.reduce((a, b) => a + b, 0);
        }

        return { tianGe, renGe, diGe, waiGe, zongGe, totalStrokes: zongGe };
    },

    // ========== 综合分析 ==========

    /**
     * 综合分析两人的婚恋匹配度
     */
    analyze(person1, person2) {
        // 获取八字信息
        const bazi1 = this.getSimpleBazi(person1.date, person1.hour, person1.gender);
        const bazi2 = this.getSimpleBazi(person2.date, person2.hour, person2.gender);

        // 获取姓名信息
        const wuge1 = this.calculateWuGe(person1.name);
        const wuge2 = this.calculateWuGe(person2.name);

        // 各项配对分析
        const baziResult = this.analyzeBaziCompatibility(bazi1, bazi2);
        const zodiacResult = this.analyzeZodiacCompatibility(bazi1.zodiac, bazi2.zodiac);
        const guaResult = this.analyzeGuaCompatibility(bazi1.mingGua, bazi2.mingGua);
        const nameResult = this.analyzeNameCompatibility(wuge1, wuge2, bazi1.dayMasterElement, bazi2.dayMasterElement);

        // 综合得分（八字35%，生肖25%，命卦20%，姓名20%）
        const totalScore = Math.round(
            baziResult.score * 0.35 +
            zodiacResult.score * 0.25 +
            guaResult.score * 0.20 +
            nameResult.score * 0.20
        );

        // 确定综合等级和建议
        let overallLevel, overallAdvice;
        if (totalScore >= 90) {
            overallLevel = '💖 天作之合';
            overallAdvice = '你们简直是命中注定！八字、姓名、生肖全方位契合，珍惜这份难得的缘分吧~';
        } else if (totalScore >= 80) {
            overallLevel = '💕 情投意合';
            overallAdvice = '你们的匹配度相当高！虽有小差异，但正是互补的好搭档~';
        } else if (totalScore >= 70) {
            overallLevel = '💗 相知相惜';
            overallAdvice = '你们的缘分不错，用心经营就能白头偕老！';
        } else if (totalScore >= 60) {
            overallLevel = '💓 细水长流';
            overallAdvice = '你们需要更多的理解和包容，感情是需要经营的~';
        } else if (totalScore >= 50) {
            overallLevel = '💔 需要磨合';
            overallAdvice = '你们之间存在一些差异，但真爱可以克服一切！多了解对方吧~';
        } else {
            overallLevel = '🔮 挑战满满';
            overallAdvice = '命理只是参考！如果真心相爱，就勇敢走下去~';
        }

        return {
            person1: {
                ...person1,
                ...bazi1,
                wuge: wuge1,
                zodiacEmoji: this.zodiacEmoji[bazi1.zodiac]
            },
            person2: {
                ...person2,
                ...bazi2,
                wuge: wuge2,
                zodiacEmoji: this.zodiacEmoji[bazi2.zodiac]
            },
            baziResult,
            zodiacResult,
            guaResult,
            nameResult,
            totalScore,
            overallLevel,
            overallAdvice
        };
    },

    /**
     * [NiShi Standard] 标准化婚恋匹配接口
     */
    analyzeStandard(person1, person2) {
        // 1. 获取基础计算结果
        const result = this.analyze(person1, person2);

        // 2. 映射到标准结论
        const score = result.totalScore;
        const verdictInfo = NiShiRules.TianJi.evaluateScore(score);

        return NiShiRules.createResult({
            source: 'RenJian', // 婚恋属于人间道（人际）
            pattern: {
                name: `${person1.name} & ${person2.name}`,
                symbol: '💖',
                attributes: {
                    person1: result.person1,
                    person2: result.person2
                }
            },
            calculation: {
                score: score,
                balance: result.baziResult.score > 60 ? '和谐' : '互斥',
                energy: {
                    '八字': result.baziResult.score,
                    '生肖': result.zodiacResult.score,
                    '命卦': result.guaResult.score,
                    '姓名': result.nameResult.score
                }
            },
            verdict: {
                level: verdictInfo.level,
                stars: verdictInfo.stars,
                summary: result.overallLevel + '：' + result.overallAdvice
            },
            guidance: {
                // 人间道：相处之道
                action: this.generateRelationshipTips(result)[0] || '多沟通，多包容。',
                // 天机道：缘分
                timing: '缘分天注定，相守在人为。',
                // 地脉道：
                adjustment: result.guaResult.analysis[0]?.text || '根据命卦调整家居布局，可增进感情。'
            }
        });
    },

    /**
     * 八字配对分析
     */
    analyzeBaziCompatibility(bazi1, bazi2) {
        let score = 60;
        let analysis = [];

        const dayStem1 = bazi1.dayStem;
        const dayStem2 = bazi2.dayStem;
        const dayBranch1 = bazi1.dayBranch;
        const dayBranch2 = bazi2.dayBranch;

        // 日干合化（最佳）
        if (this.stemCombine[dayStem1] === dayStem2) {
            score += 30;
            analysis.push({
                type: 'excellent',
                title: '💞 日干相合',
                text: `${dayStem1}与${dayStem2}天干相合，这是八字配对中最美好的象征！代表两人心灵相通，有着天然的默契和吸引力。`
            });
        }
        // 日干相冲
        else if (this.stemClash[dayStem1] === dayStem2) {
            score -= 15;
            analysis.push({
                type: 'caution',
                title: '⚔️ 日干相冲',
                text: `${dayStem1}与${dayStem2}天干相冲，性格和处事风格有较大差异。建议多沟通，尊重彼此不同的观点。`
            });
        }

        // 日支六合
        if (this.branchHarmony[dayBranch1] === dayBranch2) {
            score += 25;
            analysis.push({
                type: 'excellent',
                title: '🌟 日支六合',
                text: `${dayBranch1}与${dayBranch2}地支六合，代表两人在生活习惯、作息方式上非常和谐，婚后生活会很融洽。`
            });
        }
        // 日支三合
        else if (this.branchTriple[dayBranch1]?.includes(dayBranch2)) {
            score += 20;
            analysis.push({
                type: 'great',
                title: '✨ 日支三合',
                text: `${dayBranch1}与${dayBranch2}地支三合，你们在事业和生活目标上容易达成共识，是很好的合作伙伴。`
            });
        }
        // 日支相冲
        else if (this.branchClash[dayBranch1] === dayBranch2) {
            score -= 10;
            analysis.push({
                type: 'caution',
                title: '💥 日支相冲',
                text: `${dayBranch1}与${dayBranch2}地支相冲，可能在生活细节上有分歧。建议提前沟通，制定双方都能接受的生活方式。`
            });
        }
        // 日支相害
        else if (this.branchHarm[dayBranch1] === dayBranch2) {
            score -= 5;
            analysis.push({
                type: 'caution',
                title: '💫 日支相害',
                text: `${dayBranch1}与${dayBranch2}地支相害，相处中可能有口舌之争。记得"己所不欲，勿施于人"~`
            });
        }

        // 日主五行分析
        const element1 = bazi1.dayMasterElement;
        const element2 = bazi2.dayMasterElement;

        if (this.elementGenerate[element1] === element2) {
            score += 10;
            analysis.push({
                type: 'great',
                title: '🌱 五行相生',
                text: `你的日主${element1}生对方的${element2}，你是对方的贵人，在关系中会自然地扶持和帮助TA。`
            });
        } else if (this.elementGenerate[element2] === element1) {
            score += 10;
            analysis.push({
                type: 'great',
                title: '🌱 五行相生',
                text: `对方的日主${element2}生你的${element1}，TA是你的贵人，会在生活中给你很多帮助。`
            });
        } else if (element1 === element2) {
            score += 5;
            analysis.push({
                type: 'normal',
                title: '🤝 日主同行',
                text: `两人日主都是${element1}，性格和价值观相近，容易理解对方的想法。`
            });
        }

        // 如果没有明显的合冲关系
        if (analysis.length === 0) {
            analysis.push({
                type: 'normal',
                title: '💕 八字平和',
                text: '两人八字没有明显的冲突或特殊组合，属于平和的配对，感情需要用心经营。'
            });
        }

        score = Math.max(30, Math.min(95, score));

        let level;
        if (score >= 85) level = '天生一对';
        else if (score >= 70) level = '佳偶天成';
        else if (score >= 55) level = '相濡以沫';
        else level = '需要努力';

        return { score, level, analysis, bazi1, bazi2 };
    },

    /**
     * 生肖配对分析
     */
    analyzeZodiacCompatibility(zodiac1, zodiac2) {
        let score = 60;
        let analysis = [];
        let level = '';

        if (this.zodiacSixHarmony[zodiac1] === zodiac2) {
            score = 95;
            level = '天作之合';
            analysis.push({
                type: 'excellent',
                title: '🎊 六合大吉',
                text: `${zodiac1}与${zodiac2}为六合关系！这是最佳的生肖配对，你们之间有着天然的默契~`
            });
        } else if (this.zodiacTriangle[zodiac1]?.includes(zodiac2)) {
            score = 88;
            level = '情投意合';
            analysis.push({
                type: 'great',
                title: '✨ 三合吉配',
                text: `${zodiac1}与${zodiac2}为三合关系，志趣相投，价值观相近！`
            });
        } else if (this.zodiacClash[zodiac1] === zodiac2) {
            score = 40;
            level = '需要磨合';
            analysis.push({
                type: 'bad',
                title: '⚠️ 六冲关系',
                text: `${zodiac1}与${zodiac2}为相冲关系，但真爱可以克服一切~需要更多包容和理解。`
            });
        } else {
            score = 65;
            level = '细水长流';
            analysis.push({
                type: 'normal',
                title: '💕 普通配对',
                text: `${zodiac1}与${zodiac2}属于普通配对，感情靠经营~`
            });
        }

        return { score, level, analysis, zodiac1, zodiac2 };
    },

    /**
     * 命卦配对分析
     */
    analyzeGuaCompatibility(gua1, gua2) {
        const isEast1 = this.eastLifeGuas.includes(gua1);
        const isEast2 = this.eastLifeGuas.includes(gua2);
        const element1 = this.guaElements[gua1];
        const element2 = this.guaElements[gua2];

        let score = 60;
        let analysis = [];

        if (isEast1 === isEast2) {
            score += 25;
            const lifeType = isEast1 ? '东四命' : '西四命';
            analysis.push({
                type: 'great',
                title: '🏠 宅命相合',
                text: `两人同属${lifeType}，居住喜好相近，婚后家居布置更容易达成一致！`
            });
        } else {
            score -= 5;
            analysis.push({
                type: 'caution',
                title: '🏡 东西命配',
                text: `一方东四命，一方西四命，在家居风水上需要找平衡点。`
            });
        }

        if (this.elementGenerate[element1] === element2 || this.elementGenerate[element2] === element1) {
            score += 15;
            analysis.push({
                type: 'excellent',
                title: '🌟 五行相生',
                text: `${gua1}卦与${gua2}卦五行相生，是很好的互补关系！`
            });
        } else if (element1 === element2) {
            score += 10;
            analysis.push({
                type: 'great',
                title: '🤝 五行比和',
                text: `两人命卦同属${element1}，性格处事风格相近。`
            });
        }

        let level;
        if (score >= 85) level = '天生一对';
        else if (score >= 70) level = '佳偶天成';
        else if (score >= 55) level = '相濡以沫';
        else level = '需要努力';

        return { score, level, analysis, gua1, gua2, element1, element2 };
    },

    /**
     * 姓名配对分析
     */
    analyzeNameCompatibility(wuge1, wuge2, element1, element2) {
        let score = 60;
        let analysis = [];

        if (!wuge1 || !wuge2) {
            return {
                score: 70,
                level: '待完善',
                analysis: [{
                    type: 'normal',
                    title: '📝 姓名信息不完整',
                    text: '请输入完整的中文姓名以获取更准确的分析~'
                }]
            };
        }

        // 人格相合分析
        const renGeDiff = Math.abs(wuge1.renGe - wuge2.renGe);
        if (renGeDiff <= 3) {
            score += 15;
            analysis.push({
                type: 'great',
                title: '💝 人格相近',
                text: '两人人格数相近，性格和内心世界容易产生共鸣，沟通顺畅~'
            });
        } else if (renGeDiff <= 7) {
            score += 5;
            analysis.push({
                type: 'normal',
                title: '💕 人格互补',
                text: '两人人格数有一定差距，性格互补，可以取长补短。'
            });
        }

        // 总格分析
        const zongGeSum = (wuge1.zongGe + wuge2.zongGe) % 10;
        const luckyNumbers = [1, 3, 5, 6, 8];
        if (luckyNumbers.includes(zongGeSum)) {
            score += 15;
            analysis.push({
                type: 'excellent',
                title: '🌟 姓名数理吉祥',
                text: `两人姓名总格相加尾数为${zongGeSum}，是吉祥的数字组合！婚后运势顺遂~`
            });
        }

        // 地格分析（代表婚姻家庭）
        const diGeDiff = Math.abs(wuge1.diGe - wuge2.diGe);
        if (diGeDiff <= 5) {
            score += 10;
            analysis.push({
                type: 'great',
                title: '🏠 地格和谐',
                text: '两人地格数接近，代表婚后家庭生活和谐，感情稳定。'
            });
        }

        // 如果没有分析结果
        if (analysis.length === 0) {
            analysis.push({
                type: 'normal',
                title: '📝 姓名配对正常',
                text: '两人姓名五格没有特殊的冲突或加成，属于普通配对。'
            });
        }

        score = Math.max(40, Math.min(95, score));

        let level;
        if (score >= 80) level = '姓名相合';
        else if (score >= 65) level = '姓名匹配';
        else level = '姓名普通';

        return { score, level, analysis, wuge1, wuge2 };
    },

    /**
     * 获取分数等级样式类
     */
    getScoreClass(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'average';
        return 'challenging';
    },

    /**
     * 生成相处建议
     */
    generateRelationshipTips(result) {
        const tips = [];
        const { baziResult, zodiacResult, guaResult, nameResult } = result;

        // 根据八字分数给建议
        if (baziResult.score >= 85) {
            tips.push('八字相合度很高，要珍惜这份缘分哦~');
        } else if (baziResult.score < 55) {
            tips.push('八字差异较大，多发现对方的优点，用欣赏的眼光看待彼此');
        }

        // 根据生肖关系给建议
        if (zodiacResult.score < 50) {
            tips.push('遇到分歧时冷静沟通，不要让情绪主导决定');
        }

        // 根据命卦关系给建议
        const isEast1 = this.eastLifeGuas.includes(result.person1.mingGua);
        const isEast2 = this.eastLifeGuas.includes(result.person2.mingGua);
        if (isEast1 !== isEast2) {
            tips.push('婚房装修时可以请教风水师，找到适合双方的布局~');
        }

        // 通用建议
        tips.push('定期安排约会时间，保持恋爱的新鲜感');
        tips.push('学会表达爱意，不要让对方猜心思');
        tips.push('尊重彼此的个人空间和兴趣爱好');

        return tips.map(tip => `<div class="tip-item">💫 ${tip}</div>`).join('');
    },

    /**
     * 渲染结果
     */
    renderResult(result) {
        const { person1, person2, baziResult, zodiacResult, guaResult, nameResult, totalScore, overallLevel, overallAdvice } = result;

        let html = '';

        // 综合得分大卡片
        html += `
            <div class="analysis-card marriage-score-card">
                <div class="score-display">
                    <div class="score-circle ${this.getScoreClass(totalScore)}">
                        <span class="score-number">${totalScore}</span>
                        <span class="score-label">综合匹配</span>
                    </div>
                </div>
                <h3 class="match-level">${overallLevel}</h3>
                <p class="match-advice">${overallAdvice}</p>
            </div>
        `;

        // 双方信息对比
        html += `
            <div class="analysis-card">
                <h4>👫 八字命盘对比</h4>
                <div class="couple-info">
                    <div class="person-card">
                        <div class="person-emoji">${person1.gender === 'male' ? '👦' : '👧'}</div>
                        <div class="person-name">${person1.name}</div>
                        <div class="person-zodiac">${person1.zodiacEmoji} ${person1.zodiac}</div>
                        <div class="person-bazi">日柱：${person1.dayPillar}</div>
                        <div class="person-gua">${person1.mingGua}卦·${this.guaElements[person1.mingGua]}</div>
                    </div>
                    <div class="heart-connector">💕</div>
                    <div class="person-card">
                        <div class="person-emoji">${person2.gender === 'male' ? '👦' : '👧'}</div>
                        <div class="person-name">${person2.name}</div>
                        <div class="person-zodiac">${person2.zodiacEmoji} ${person2.zodiac}</div>
                        <div class="person-bazi">日柱：${person2.dayPillar}</div>
                        <div class="person-gua">${person2.mingGua}卦·${this.guaElements[person2.mingGua]}</div>
                    </div>
                </div>
            </div>
        `;

        // 八字配对分析
        html += `
            <div class="analysis-card">
                <h4>☯️ 八字配对分析 <span class="score-badge">${baziResult.score}分</span></h4>
                <div class="bazi-match">
                    <span class="bazi-pair">${person1.dayPillar}</span>
                    <span class="bazi-vs">×</span>
                    <span class="bazi-pair">${person2.dayPillar}</span>
                </div>
                ${baziResult.analysis.map(item => `
                    <div class="match-detail ${item.type}">
                        <div class="detail-title">${item.title}</div>
                        <p>${item.text}</p>
                    </div>
                `).join('')}
            </div>
        `;

        // 生肖配对分析
        html += `
            <div class="analysis-card">
                <h4>🐾 生肖配对分析 <span class="score-badge">${zodiacResult.score}分</span></h4>
                <div class="zodiac-match">
                    <span class="zodiac-pair">${person1.zodiacEmoji} ${person1.zodiac}</span>
                    <span class="zodiac-vs">×</span>
                    <span class="zodiac-pair">${person2.zodiacEmoji} ${person2.zodiac}</span>
                </div>
                ${zodiacResult.analysis.map(item => `
                    <div class="match-detail ${item.type}">
                        <div class="detail-title">${item.title}</div>
                        <p>${item.text}</p>
                    </div>
                `).join('')}
            </div>
        `;

        // 命卦配对分析
        html += `
            <div class="analysis-card">
                <h4>🏠 命卦配对分析 <span class="score-badge">${guaResult.score}分</span></h4>
                <div class="gua-match">
                    <span class="gua-pair">${guaResult.gua1}卦(${guaResult.element1})</span>
                    <span class="gua-vs">×</span>
                    <span class="gua-pair">${guaResult.gua2}卦(${guaResult.element2})</span>
                </div>
                ${guaResult.analysis.map(item => `
                    <div class="match-detail ${item.type}">
                        <div class="detail-title">${item.title}</div>
                        <p>${item.text}</p>
                    </div>
                `).join('')}
            </div>
        `;

        // 姓名配对分析
        html += `
            <div class="analysis-card">
                <h4>📝 姓名配对分析 <span class="score-badge">${nameResult.score}分</span></h4>
                <div class="name-match">
                    <span class="name-pair">${person1.name}</span>
                    <span class="name-vs">×</span>
                    <span class="name-pair">${person2.name}</span>
                </div>
                ${nameResult.analysis.map(item => `
                    <div class="match-detail ${item.type}">
                        <div class="detail-title">${item.title}</div>
                        <p>${item.text}</p>
                    </div>
                `).join('')}
            </div>
        `;

        // 相处建议
        html += `
            <div class="analysis-card">
                <h4>💝 相处小建议</h4>
                <div class="tips-list">
                    ${this.generateRelationshipTips(result)}
                </div>
            </div>
        `;

        // 温馨提示与免责声明
        html += `
            <div class="analysis-card">
                <h4>🌸 Kitty悄悄话</h4>
                <p>命理配对只是参考啦~ 真正的感情是靠两个人用心经营的！</p>
                <p>不管命理怎么说，只要你们真心相爱、互相尊重、共同成长，就一定能收获幸福！</p>
                <p style="color: var(--color-pink-hot);">💕 相信爱情，勇敢去爱~ 💕</p>
                <p class="disclaimer-note" style="margin-top: 12px; font-size: 0.85rem; color: #888;">
                    ⚠️ 本分析仅供娱乐参考，不作为婚恋决策依据。真正的缘分需要双方用心经营~
                </p>
            </div>
        `;

        // 添加点赞分享按钮
        if (typeof ShareUtils !== 'undefined') {
            html += ShareUtils.createActionButtons('marriage');
        }

        return html;
    }
};

window.Marriage = Marriage;

