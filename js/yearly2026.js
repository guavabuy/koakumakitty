/**
 * 2026丙午年运势分析模块
 * 基于倪海厦《天纪》理论
 * 
 * 重要口径说明：
 * - 生肖和年柱按立春换年（不是公历1月1日）
 * - 使用命理年计算
 */

import { NiShiRules } from './core/nishi_rules.js';
import ChineseCalendar, {
    HEAVENLY_STEMS,
    EARTHLY_BRANCHES,
    STEM_ELEMENTS,
    BRANCH_ELEMENTS,
    STEM_YIN_YANG,
    ZODIAC_ANIMALS
} from './core/calendar.js';

const Yearly2026 = {

    // 2026年流年干支
    flowYear: {
        stem: '丙',      // 天干
        branch: '午',    // 地支
        element: '火',   // 五行（丙=火，午=火）
        zodiac: '马'     // 生肖
    },

    // 引用核心模块的常量（保持向后兼容）
    heavenlyStems: HEAVENLY_STEMS,
    earthlyBranches: EARTHLY_BRANCHES,
    stemElements: STEM_ELEMENTS,
    branchElements: BRANCH_ELEMENTS,
    stemYinYang: STEM_YIN_YANG,
    zodiac: ZODIAC_ANIMALS,

    // 五行相生相克
    wuxing: {
        generate: { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' },
        control: { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }
    },

    // 生肖与太岁（午）的关系
    zodiacTaiSui: {
        '鼠': { relation: '冲太岁', level: 'danger', desc: '子午相冲，2026年需格外小心，易有动荡变化' },
        '牛': { relation: '害太岁', level: 'warning', desc: '丑午相害，人际关系易生矛盾，注意口舌是非' },
        '虎': { relation: '三合贵人', level: 'good', desc: '寅午戌三合，有贵人相助，事业顺遂' },
        '兔': { relation: '相破', level: 'warning', desc: '卯午相破，计划易受阻，需有备案' },
        '龙': { relation: '平稳', level: 'neutral', desc: '与太岁无刑冲，运势平稳' },
        '蛇': { relation: '六合吉', level: 'good', desc: '巳午同属火，气场相投，运势顺利' },
        '马': { relation: '本命年', level: 'warning', desc: '值太岁，本命年变数多，谨慎行事' },
        '羊': { relation: '六合吉', level: 'good', desc: '午未相合，人缘佳，有桃花运' },
        '猴': { relation: '平稳', level: 'neutral', desc: '与太岁无刑冲，稳中有进' },
        '鸡': { relation: '平稳', level: 'neutral', desc: '与太岁无刑冲，保持现状即可' },
        '狗': { relation: '三合贵人', level: 'good', desc: '寅午戌三合，2026年贵人运旺' },
        '猪': { relation: '平稳', level: 'neutral', desc: '与太岁无刑冲，平顺度日' }
    },

    /**
     * 获取用户生肖
     * 使用命理年（立春换年）
     * @param {number} mingLiYear - 命理年份
     */
    getUserZodiac(mingLiYear) {
        const yearPillar = ChineseCalendar.getYearPillar(mingLiYear);
        return ZODIAC_ANIMALS[yearPillar.branchIndex];
    },

    /**
     * 获取用户年柱
     * 使用命理年（立春换年）
     * @param {number} mingLiYear - 命理年份
     */
    getUserYearPillar(mingLiYear) {
        const yearPillar = ChineseCalendar.getYearPillar(mingLiYear);
        return {
            stem: yearPillar.stem,
            branch: yearPillar.branch
        };
    },

    /**
     * 计算日主（使用核心模块）
     */
    getDayMaster(birthDate) {
        const date = new Date(birthDate);
        const dayPillar = ChineseCalendar.getDayPillar(date);
        return dayPillar.stem;
    },

    /**
     * 计算流年十神（2026丙火对用户日主）
     */
    getFlowYearTenGod(dayMaster) {
        const dayElement = this.stemElements[dayMaster];
        const dayYinYang = this.stemYinYang[dayMaster];
        const flowElement = this.flowYear.element; // 火
        const flowYinYang = this.stemYinYang[this.flowYear.stem]; // 丙=阳

        let godName = '';
        let meaning = '';

        if (flowElement === dayElement) {
            godName = flowYinYang === dayYinYang ? '比肩' : '劫财';
            meaning = godName === '比肩' ? '竞争与合作并存，贵在坚持' : '财运动荡，须防破财';
        } else if (this.wuxing.generate[dayElement] === flowElement) {
            godName = flowYinYang === dayYinYang ? '食神' : '伤官';
            meaning = godName === '食神' ? '才华横溢，创意满满' : '锋芒毕露，言辞需谨慎';
        } else if (this.wuxing.generate[flowElement] === dayElement) {
            godName = flowYinYang === dayYinYang ? '偏印' : '正印';
            meaning = godName === '正印' ? '学业事业有贵人助力' : '思维活跃，适合研究';
        } else if (this.wuxing.control[flowElement] === dayElement) {
            godName = flowYinYang === dayYinYang ? '偏官' : '正官';
            meaning = godName === '正官' ? '事业稳步上升，利于晋升' : '压力较大，须化压力为动力';
        } else if (this.wuxing.control[dayElement] === flowElement) {
            godName = flowYinYang === dayYinYang ? '偏财' : '正财';
            meaning = godName === '正财' ? '收入稳定，财源广进' : '有意外之财，投资需谨慎';
        }

        return { godName, meaning };
    },

    /**
     * 计算2026年运势
     * 使用命理年（立春换年）
     */
    calculate(birthDate, options = {}) {
        const birth = new Date(birthDate);
        
        // 使用命理年（立春换年）
        const mingLiYear = ChineseCalendar.getMingLiYear(birth);

        // 基础信息（使用命理年）
        const userZodiac = this.getUserZodiac(mingLiYear);
        const userYearPillar = this.getUserYearPillar(mingLiYear);
        const userYearElement = this.stemElements[userYearPillar.stem];

        // 太岁关系
        const taiSuiRelation = this.zodiacTaiSui[userZodiac];

        // 日主和十神（如果有日期）
        let dayMaster = null;
        let flowYearTenGod = null;
        if (birthDate) {
            dayMaster = this.getDayMaster(birthDate);
            flowYearTenGod = this.getFlowYearTenGod(dayMaster);
        }

        // 计算运势分数（将mingLiYear加入options，用于性别+阴阳年的大运计算）
        const fortuneOptions = { ...options, birthYear: mingLiYear };
        const fortune = this.calculateFortuneScores(userYearElement, taiSuiRelation, flowYearTenGod, fortuneOptions);

        return {
            birthYear: mingLiYear,  // 返回命理年
            publicYear: birth.getFullYear(),  // 保留公历年供参考
            userZodiac,
            userYearPillar,
            userYearElement,
            taiSuiRelation,
            dayMaster,
            flowYearTenGod,
            fortune,
            options
        };
    },

    /**
     * [NiShi Standard] 标准化2026运势接口
     */
    calculateStandard(birthDate, options = {}) {
        // 1. 获取基础计算结果
        const result = this.calculate(birthDate, options);

        // 2. 映射到标准结论
        const score = result.fortune.overall;
        const verdictInfo = NiShiRules.TianJi.evaluateScore(score);

        return NiShiRules.createResult({
            source: 'TianJi', // 流年运势属于天机道（时间）
            pattern: {
                name: `2026丙午年流年`,
                symbol: '🐴',
                attributes: {
                    zodiac: result.userZodiac,
                    taiSui: result.taiSuiRelation,
                    tenGod: result.flowYearTenGod
                }
            },
            calculation: {
                score: score,
                balance: result.taiSuiRelation.level === 'good' ? '合' : (result.taiSuiRelation.level === 'danger' ? '冲' : '平'),
                energy: result.fortune // 包含各项运势分数
            },
            verdict: {
                level: verdictInfo.level,
                stars: verdictInfo.stars,
                summary: `生肖${result.userZodiac}，${result.taiSuiRelation.desc}`
            },
            guidance: {
                // 人间道：行动建议
                action: this.generateAdvice(result, options).career[0] || '稳扎稳打。',
                // 天机道：流年
                timing: '丙午火旺之年，顺势而为。',
                // 地脉道：
                adjustment: this.generateLuckyTips(result)[0] || '多穿红色衣物增强运势。'
            }
        });
    },

    /**
     * 计算各项运势分数（基于倪师《天纪》理论）
     */
    calculateFortuneScores(userElement, taiSui, tenGod, options) {
        // 流年火气影响 - 基础分
        let baseScore = 60;

        // 太岁关系影响（保持不变）
        if (taiSui.level === 'good') baseScore += 15;
        else if (taiSui.level === 'danger') baseScore -= 15;
        else if (taiSui.level === 'warning') baseScore -= 8;

        // 五行生克影响（2026火年）
        if (this.wuxing.generate['火'] === userElement) {
            baseScore += 10; // 火生土
        } else if (this.wuxing.generate[userElement] === '火') {
            baseScore += 5; // 木生火
        } else if (this.wuxing.control['火'] === userElement) {
            baseScore -= 10; // 火克金
        } else if (this.wuxing.control[userElement] === '火') {
            baseScore += 8; // 水克火（我克它）
        } else if (userElement === '火') {
            baseScore += 12; // 同类
        }

        // 十神影响
        if (tenGod) {
            const goodGods = ['正印', '食神', '正财', '正官'];
            const badGods = ['偏官', '劫财', '伤官'];
            if (goodGods.includes(tenGod.godName)) baseScore += 8;
            else if (badGods.includes(tenGod.godName)) baseScore -= 5;
        }

        // 各项运势的偏移量
        let careerOffset = 0;
        let wealthOffset = 0;
        let loveOffset = 0;
        let healthOffset = 0;

        // ========== 时辰权重修正（倪师理论：时柱占四柱之一，权重 20-25%）==========
        if (options.hour !== null && options.hour !== undefined) {
            const hourBranch = this.earthlyBranches[options.hour];
            const hourElement = this.branchElements[hourBranch];

            // 时柱与流年午火的关系
            // 三合：寅午戌
            if (['寅', '戌'].includes(hourBranch)) {
                careerOffset += 15;  // 三合贵人助事业
                wealthOffset += 10;
            }
            // 六合：午未相合
            else if (hourBranch === '未') {
                loveOffset += 18;    // 六合利感情
                careerOffset += 8;
            }
            // 相冲：子午相冲
            else if (hourBranch === '子') {
                careerOffset -= 20;  // 冲太岁，事业动荡
                healthOffset -= 15;
                loveOffset -= 10;
            }
            // 相害：丑午相害
            else if (hourBranch === '丑') {
                loveOffset -= 15;    // 害太岁，人际关系差
                careerOffset -= 8;
            }
            // 相破：卯午相破
            else if (hourBranch === '卯') {
                wealthOffset -= 12;  // 破财
                careerOffset -= 5;
            }
            // 自刑：午午自刑
            else if (hourBranch === '午') {
                healthOffset -= 18;  // 自刑伤身
                careerOffset += 5;   // 但火旺利事业
            }
            // 时辰五行与2026火年的一般关系
            else if (hourElement === '火') {
                careerOffset += 12;
                healthOffset -= 8;   // 火旺伤身
            } else if (hourElement === '木') {
                careerOffset += 10;  // 木生火
                wealthOffset += 8;
            } else if (hourElement === '土') {
                wealthOffset += 12;  // 火生土，财运旺
            } else if (hourElement === '金') {
                careerOffset -= 12;  // 火克金
                healthOffset -= 8;
            } else if (hourElement === '水') {
                loveOffset += 10;    // 水主智，桃花运
                healthOffset += 10;  // 水克火，平衡火气
            }
        }

        // ========== 性别权重修正（倪师理论：决定大运顺逆，权重 15-20%）==========
        if (options.gender && options.birthYear) {
            const yearStem = this.getUserYearPillar(options.birthYear).stem;
            const isYangYear = this.stemYinYang[yearStem] === '阳';
            const isMale = options.gender === 'male';

            // 阳年男/阴年女：大运顺行
            // 阴年男/阳年女：大运逆行
            const isShunXing = (isYangYear && isMale) || (!isYangYear && !isMale);

            // 2026丙午为阳火旺年
            if (isShunXing) {
                // 顺行大运遇阳火年，气势相合
                careerOffset += 15;
                wealthOffset += 10;
                if (isMale) {
                    careerOffset += 5;   // 男性阳刚之气更强
                } else {
                    loveOffset += 8;     // 女性顺行遇火年，桃花旺
                }
            } else {
                // 逆行大运遇阳火年，需要调和
                loveOffset += 5;         // 逆行者感情细腻
                healthOffset -= 5;       // 但火气难调
                if (isMale) {
                    loveOffset += 10;    // 男性逆行，感情运势好
                    careerOffset -= 8;   // 事业需努力
                } else {
                    careerOffset += 8;   // 女性逆行，事业有突破
                    loveOffset -= 5;     // 感情需主动
                }
            }
        } else if (options.gender) {
            // 没有出生年份时的简化计算
            if (options.gender === 'male') {
                careerOffset += 10;
                wealthOffset += 5;
                loveOffset -= 3;
            } else if (options.gender === 'female') {
                loveOffset += 12;
                careerOffset += 5;
                healthOffset += 5;
            }
        }

        // ========== 姓名权重修正（倪师理论：笔画五行法，权重 5-10%）==========
        if (options.name && options.name.length > 0) {
            // 计算姓名总笔画（简化：中文字符平均按8画计算）
            const nameLength = options.name.length;
            // 实际应用中可以用完整笔画库，这里用字数近似
            const approxStrokes = nameLength * 8;
            const lastDigit = approxStrokes % 10;

            // 笔画尾数对应五行：1/2木, 3/4火, 5/6土, 7/8金, 9/0水
            let nameElement = '';
            if ([1, 2].includes(lastDigit)) nameElement = '木';
            else if ([3, 4].includes(lastDigit)) nameElement = '火';
            else if ([5, 6].includes(lastDigit)) nameElement = '土';
            else if ([7, 8].includes(lastDigit)) nameElement = '金';
            else nameElement = '水'; // 9, 0

            // 姓名五行与流年火的关系
            if (nameElement === '火') {
                careerOffset += 8;   // 同类相助
                healthOffset -= 5;   // 火太旺
            } else if (nameElement === '木') {
                careerOffset += 10;  // 木生火，助运
                wealthOffset += 5;
            } else if (nameElement === '土') {
                wealthOffset += 10;  // 火生土，财运佳
                healthOffset += 3;
            } else if (nameElement === '金') {
                careerOffset -= 5;   // 火克金
                wealthOffset -= 3;
            } else if (nameElement === '水') {
                healthOffset += 8;   // 水克火，健康平衡
                loveOffset += 5;     // 水主智慧，利感情
            }

            // 字数影响（保留原有逻辑但降低权重）
            if (nameLength === 2) {
                loveOffset += 3;     // 双字名利感情
            } else if (nameLength === 3) {
                careerOffset += 3;   // 三字名利事业
            } else if (nameLength >= 4) {
                wealthOffset += 3;   // 四字名利财运
            }
        }

        return {
            overall: Math.min(100, Math.max(30, baseScore + Math.round((careerOffset + wealthOffset + loveOffset + healthOffset) / 4))),
            career: Math.min(100, Math.max(30, baseScore + careerOffset)),
            wealth: Math.min(100, Math.max(30, baseScore + wealthOffset)),
            love: Math.min(100, Math.max(30, baseScore + loveOffset)),
            health: Math.min(100, Math.max(30, baseScore + healthOffset))
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
     * 生成各方面详细建议（基于倪师《天纪》理论）
     */
    generateAdvice(result, options = {}) {
        const advices = {
            career: [],
            wealth: [],
            love: [],
            health: []
        };

        const { fortune, taiSuiRelation, flowYearTenGod, userYearElement } = result;
        const gender = options.gender;
        const hour = options.hour;

        // ========== 时辰特定建议（基于六合/三合/刑冲害）==========
        if (hour !== null && hour !== undefined) {
            const hourBranch = this.earthlyBranches[hour];

            // 三合：寅午戌
            if (['寅', '戌'].includes(hourBranch)) {
                if (fortune.career > 80) {
                    advices.career.push('🌟 你的时辰与2026午火三合，贵人运旺，可大胆发展事业！');
                    advices.wealth.push('💫 三合之年利于合作投资，与属虎、属狗的人合作更佳');
                } else if (fortune.career < 60) {
                    advices.career.push('🛡️ 虽有三合贵人照拂，但自身运势稍弱，仍需谨慎把握机会');
                    advices.wealth.push('💰 合作需谨慎，即便有贵人也要看清形势');
                } else {
                    advices.career.push('✨ 三合贵人助力，事业无功无过，跟随自己的心走哦~');
                    advices.wealth.push('🤝 投资合作保持平常心即可');
                }
            }
            // 六合：午未相合
            else if (hourBranch === '未') {
                if (fortune.love > 80) {
                    advices.love.push('💕 你的时辰与2026午火六合，桃花运极旺，单身者今年必有良缘！');
                    advices.career.push('🤝 人际关系和谐，适合从事需要沟通协调的工作');
                } else if (fortune.love < 60) {
                    advices.love.push('🥀 虽有六合桃花，但运势欠佳，需谨慎把握，宁缺毋滥');
                    advices.career.push('🤐 职场人际虽好，仍需谨言慎行');
                } else {
                    advices.love.push('🌸 六合助运，感情平稳，跟随自己的心走哦~');
                    advices.career.push('🤝 人际关系尚可，保持真诚即可');
                }
            }
            // 相冲：子午相冲
            else if (hourBranch === '子') {
                advices.career.push('⚠️ 你的时辰与2026午火相冲，事业易有变动，宜守不宜攻');
                advices.health.push('❗ 子午相冲伤身，2026年尤其注意心脏和肾脏健康');
                advices.love.push('💔 感情易有波折，避免冲动决定，多沟通多包容');
            }
            // 相害：丑午相害
            else if (hourBranch === '丑') {
                advices.love.push('⚠️ 你的时辰与2026午火相害，人际关系需谨慎处理');
                advices.career.push('🗣️ 注意口舌是非，少说多做，避免与人争执');
            }
            // 相破：卯午相破
            else if (hourBranch === '卯') {
                advices.wealth.push('⚠️ 你的时辰与2026午火相破，财运有波动，避免大额投资');
                advices.career.push('📋 计划易受阻，建议提前准备备选方案');
            }
            // 自刑：午午自刑
            else if (hourBranch === '午') {
                advices.health.push('❗ 时辰午与流年午自刑，火气过旺，2026年需格外注意健康');
                advices.career.push('🔥 火旺利事业进取，但要控制情绪，避免冲动决策');
            }
        }

        // ========== 事业建议 ==========
        if (fortune.career >= 75) {
            advices.career.push('2026事业运旺，适合主动出击，争取晋升机会');
            advices.career.push('可以尝试跳槽或创业，机遇难得');
        } else if (fortune.career >= 60) {
            advices.career.push('事业平稳发展，按部就班即可');
            advices.career.push('多提升专业技能，厚积薄发');
        } else {
            advices.career.push('事业运势欠佳，宜守不宜攻');
            advices.career.push('避免与上司冲突，低调行事');
        }

        // ========== 财运建议 ==========
        if (fortune.wealth >= 75) {
            advices.wealth.push('财运亨通，可适度投资理财');
            advices.wealth.push('偏财运不错，可能有意外收获');
        } else if (fortune.wealth >= 60) {
            advices.wealth.push('正财稳定，控制消费即可');
            advices.wealth.push('不宜投机，稳健理财为上');
        } else {
            advices.wealth.push('财运较弱，避免大额投资');
            advices.wealth.push('注意防范破财风险，谨慎借贷');
        }

        // ========== 感情建议 ==========
        if (fortune.love >= 75) {
            advices.love.push('桃花运旺，单身者易遇良缘');
            advices.love.push('已婚者感情甜蜜，可考虑添丁');
        } else if (fortune.love >= 60) {
            advices.love.push('感情平稳，多沟通多陪伴');
            advices.love.push('单身者可主动出击，但不必强求');
        } else {
            advices.love.push('感情易生波折，需多包容理解');
            advices.love.push('避免冲动决定，冷静处理矛盾');
        }

        // ========== 性别特定建议 ==========
        if (gender === 'male') {
            if (fortune.love >= 60) {
                advices.love.push('💪 男士2026阳火年宜主动追求，展现魅力');
            } else {
                advices.love.push('💪 男士宜多些耐心，切勿急躁吓跑对方');
            }

            if (fortune.career >= 60) {
                advices.career.push('👔 男性可大胆争取领导岗位');
            } else {
                advices.career.push('👔 男性宜韬光养晦，积累实力待时而动');
            }
        } else if (gender === 'female') {
            if (fortune.love >= 60) {
                advices.love.push('💐 女士2026年桃花旺，静待良缘');
            } else {
                advices.love.push('💐 女士需擦亮眼睛，宁缺毋滥');
            }

            if (fortune.career >= 60) {
                advices.career.push('👠 女性可尝试跨界发展，潜力无限');
            } else {
                advices.career.push('👠 女性宜稳守岗位，以柔克刚');
            }
        }

        // ========== 健康建议 ==========
        advices.health.push('2026火气旺盛，注意心脏和血压');
        if (userYearElement === '金') {
            advices.health.push('金怕火克，多注意肺部和呼吸系统');
        } else if (userYearElement === '木') {
            advices.health.push('木生火泄气，注意肝脏保养，避免熬夜');
        } else if (userYearElement === '水') {
            advices.health.push('水火相克，注意肾脏和泌尿系统');
        }

        // 性别健康建议
        if (gender === 'male') {
            advices.health.push('🏃 男性宜多运动，释放过剩火气');
        } else if (gender === 'female') {
            advices.health.push('🧘 女性宜静心养神，避免燥热');
        }

        advices.health.push('保持心态平和，避免情绪过激');

        return advices;
    },


    /**
     * 生成开运建议
     */
    generateLuckyTips(result) {
        const { userYearElement, taiSuiRelation, userZodiac } = result;

        const tips = [];

        // 基于太岁关系
        if (taiSuiRelation.level === 'danger' || taiSuiRelation.level === 'warning') {
            tips.push('🙏 可在春节期间祈福化解太岁');
            tips.push('🔴 建议多穿红色衣物增强运势');
        }

        // 基于五行补充（2026火年）
        if (userYearElement === '金') {
            tips.push('💧 多穿白色、金色，或接触水元素');
            tips.push('🧭 有利方位：西方、北方');
        } else if (userYearElement === '木') {
            tips.push('💧 多喝水，多去水边休息');
            tips.push('🧭 有利方位：北方、东方');
        } else if (userYearElement === '水') {
            tips.push('🌳 多穿绿色，多接触植物');
            tips.push('🧭 有利方位：东方');
        } else if (userYearElement === '火') {
            tips.push('🔥 本命年火旺，多穿红色增强气场');
            tips.push('🧭 有利方位：南方');
        } else if (userYearElement === '土') {
            tips.push('🔥 火生土，2026对你有利');
            tips.push('🧭 有利方位：南方、中央');
        }

        // 贵人生肖
        if (['鼠', '马'].includes(userZodiac)) {
            tips.push('🐯🐶 贵人生肖：虎、狗');
        } else {
            tips.push('🐴 多与属马的朋友交往，借运势');
        }

        return tips;
    },

    /**
     * 渲染结果
     */
    renderResult(result, options = {}) {
        const { userZodiac, taiSuiRelation, flowYearTenGod, fortune, dayMaster } = result;
        const advices = this.generateAdvice(result, options);
        const luckyTips = this.generateLuckyTips(result);
        
        // 检测语言
        const isEn = typeof I18n !== 'undefined' && I18n.isEnglish();
        const isJa = typeof I18n !== 'undefined' && I18n.isJapanese();

        // 个性化称呼
        let greeting = '';
        if (options.name) {
            greeting = isJa 
                ? `<div class="personal-greeting">🐾 ${options.name}さん、2026丙午年の運勢レポートだよ～</div>`
                : isEn 
                ? `<div class="personal-greeting">🐾 Dear ${options.name}, here's your 2026 Fire Horse Year fortune~</div>`
                : `<div class="personal-greeting">🐾 亲爱的${options.name}，这是你的2026丙午年运势报告~</div>`;
        }

        // 精准度提示
        let accuracyNote = '';
        const filledFields = [options.hour !== null && options.hour !== undefined, options.gender, options.name].filter(Boolean).length;
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

        // 太岁关系颜色
        const taiSuiClass = taiSuiRelation.level === 'good' ? 'good' :
            taiSuiRelation.level === 'danger' ? 'danger' :
                taiSuiRelation.level === 'warning' ? 'warning' : 'neutral';
        
        // 翻译版太岁关系
        const taiSuiRelationTrans = isJa ? this.getTaiSuiRelationJa(taiSuiRelation) : this.getTaiSuiRelationEn(taiSuiRelation);
        
        // 翻译版生肖
        const zodiacTrans = isJa ? this.getZodiacJa(userZodiac) : this.getZodiacEn(userZodiac);

        let html = `
            ${greeting}
            ${accuracyNote}
            
            <div class="yearly-header">
                <div class="year-badge">🐴 2026 ${isJa ? '丙午年' : isEn ? 'Fire Horse Year' : '丙午年'}</div>
                <div class="zodiac-info">
                    <span class="user-zodiac">${isJa ? zodiacTrans + '年' : isEn ? zodiacTrans : '属' + userZodiac}</span>
                    ${dayMaster ? `<span class="day-master">${isJa ? '日主' : isEn ? 'Day Master' : '日主'}：${dayMaster}</span>` : ''}
                </div>
            </div>

            <div class="taisui-card ${taiSuiClass}">
                <div class="taisui-title">📿 ${isJa ? '太歳との関係' : isEn ? 'Tai Sui Relation' : '太岁关系'}</div>
                <div class="taisui-relation">${isJa || isEn ? taiSuiRelationTrans.relation : taiSuiRelation.relation}</div>
                <div class="taisui-desc">${isJa || isEn ? taiSuiRelationTrans.desc : taiSuiRelation.desc}</div>
            </div>

            ${flowYearTenGod ? `
            <div class="tengod-card">
                <div class="tengod-title">🔮 ${isJa ? '流年十神' : isEn ? 'Annual Ten God' : '流年十神'}</div>
                <div class="tengod-name">${isJa ? `2026丙火はあなたの「${this.getTenGodJa(flowYearTenGod.godName)}」` : isEn ? `2026 Fire is your "${this.getTenGodEn(flowYearTenGod.godName)}"` : `2026丙火为你的「${flowYearTenGod.godName}」`}</div>
                <div class="tengod-meaning">${isJa ? this.getTenGodMeaningJa(flowYearTenGod.godName) : isEn ? this.getTenGodMeaningEn(flowYearTenGod.godName) : flowYearTenGod.meaning}</div>
            </div>
            ` : ''}

            <div class="fortune-overview yearly">
                <div class="fortune-item">
                    <div class="fortune-icon">📊</div>
                    <div class="fortune-label">${isJa ? '2026総合運' : isEn ? '2026 Overall' : '2026综合运势'}</div>
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
                <div class="fortune-item">
                    <div class="fortune-icon">🏥</div>
                    <div class="fortune-label">${isJa ? '健康運' : isEn ? 'Health' : '健康运'}</div>
                    <div class="fortune-stars">${this.scoreToStars(fortune.health)}</div>
                </div>
            </div>

            <div class="analysis-card">
                <h4>💼 ${isJa ? '仕事アドバイス' : isEn ? 'Career Advice' : '事业建议'}</h4>
                <p>${isJa ? this.translateAdvicesJa(advices.career, 'career') : isEn ? this.translateAdvices(advices.career, 'career') : advices.career.join('<br>')}</p>
            </div>
            <div class="analysis-card">
                <h4>💰 ${isJa ? '金運アドバイス' : isEn ? 'Wealth Advice' : '财运建议'}</h4>
                <p>${isJa ? this.translateAdvicesJa(advices.wealth, 'wealth') : isEn ? this.translateAdvices(advices.wealth, 'wealth') : advices.wealth.join('<br>')}</p>
            </div>
            <div class="analysis-card">
                <h4>💕 ${isJa ? '恋愛アドバイス' : isEn ? 'Love Advice' : '感情建议'}</h4>
                <p>${isJa ? this.translateAdvicesJa(advices.love, 'love') : isEn ? this.translateAdvices(advices.love, 'love') : advices.love.join('<br>')}</p>
            </div>
            <div class="analysis-card">
                <h4>🏥 ${isJa ? '健康アドバイス' : isEn ? 'Health Advice' : '健康建议'}</h4>
                <p>${isJa ? this.translateAdvicesJa(advices.health, 'health') : isEn ? this.translateAdvices(advices.health, 'health') : advices.health.join('<br>')}</p>
            </div>

            <div class="analysis-card">
                <h4>🍀 ${isJa ? '2026開運のコツ' : isEn ? '2026 Lucky Tips' : '2026开运锦囊'}</h4>
                <p>${isJa ? this.translateLuckyTipsJa(luckyTips) : isEn ? this.translateLuckyTips(luckyTips) : luckyTips.join('<br>')}</p>
            </div>

            <div class="cat-summary">
                <div class="cat-face">(=^･ω･^=)</div>
                <p>${isJa 
                    ? `ニャ～2026丙午年は火のエネルギー満載！${zodiacTrans}年のあなた、${taiSuiRelation.level === 'good' ? '運勢いい感じだよ！' : taiSuiRelation.level === 'danger' ? '太歳に気をつけてね～' : '安定してれば大丈夫～'}`
                    : isEn 
                    ? `Meow~ 2026 Fire Horse Year is full of energy! ${zodiacTrans} friend, ${taiSuiRelation.level === 'good' ? 'your fortune looks great!' : taiSuiRelation.level === 'danger' ? 'be careful with Tai Sui this year~' : 'stay steady and you\'ll be fine~'}`
                    : `喵~ 2026丙午年火气旺盛，${userZodiac}宝宝${taiSuiRelation.level === 'good' ? '运势不错哦！' : taiSuiRelation.level === 'danger' ? '要注意化解太岁喵~' : '稳稳当当就好~'}`}</p>
                <p>${isJa ? '運命は自分で切り開くもの！2026年も頑張ってね！ニャ～' : isEn ? 'Remember, your destiny is in your own hands! Kitty believes you can rock 2026! Meow~' : '记住，命运掌握在自己手里！本喵相信你2026一定能行！喵~'}</p>
                <p class="disclaimer-note" style="font-size: 0.85rem; color: #888; margin-top: 8px;">
                    ${isJa ? '⚠️ エンタメ参考用だよ、投資・就職・結婚などの重大な決断には使わないでね' : isEn ? '⚠️ For entertainment only, not for investment, career, or marriage decisions' : '⚠️ 以上分析仅供娱乐参考，不作为投资、求职、婚姻等重大决策依据'}
                </p>
            </div>

            <div class="jump-section">
                <div class="jump-hint">🐾 ${isJa ? '今日何が向いてるか知りたい？' : isEn ? 'Want to know what suits today?' : '想知道今天适合做什么？'}</div>
                <button id="jump-to-daily-btn" class="submit-btn jump-daily-btn">
                    <span>🌙 ${isJa ? '今日の運勢をチェック' : isEn ? 'Check Daily Fortune' : '查看今日运势'}</span>
                    <span class="btn-glow"></span>
                </button>
            </div>
        `;

        // 添加点赞分享按钮
        if (typeof ShareUtils !== 'undefined') {
            html += ShareUtils.createActionButtons('yearly2026');
        }

        return html;
    },
    
    /**
     * 英文版生肖
     */
    getZodiacEn(zodiac) {
        const map = {
            '鼠': 'Rat', '牛': 'Ox', '虎': 'Tiger', '兔': 'Rabbit',
            '龙': 'Dragon', '蛇': 'Snake', '马': 'Horse', '羊': 'Goat',
            '猴': 'Monkey', '鸡': 'Rooster', '狗': 'Dog', '猪': 'Pig'
        };
        return map[zodiac] || zodiac;
    },
    
    /**
     * 英文版太岁关系
     */
    getTaiSuiRelationEn(taiSui) {
        const relationMap = {
            '冲太岁': 'Clash with Tai Sui',
            '害太岁': 'Harm with Tai Sui', 
            '三合贵人': 'Triple Harmony - Benefactor',
            '相破': 'Break',
            '平稳': 'Neutral',
            '六合吉': 'Six Harmony - Auspicious',
            '本命年': 'Birth Year (Ben Ming Nian)'
        };
        const descMap = {
            '子午相冲，2026年需格外小心，易有动荡变化': 'Clash energy in 2026. Be extra careful, expect changes and turbulence.',
            '丑午相害，人际关系易生矛盾，注意口舌是非': 'Harm energy affects relationships. Watch out for conflicts and gossip.',
            '寅午戌三合，有贵人相助，事业顺遂': 'Triple Harmony brings benefactors. Career will be smooth.',
            '卯午相破，计划易受阻，需有备案': 'Break energy may obstruct plans. Have backup options ready.',
            '与太岁无刑冲，运势平稳': 'No conflict with Tai Sui. Fortune remains stable.',
            '巳午同属火，气场相投，运势顺利': 'Fire energy aligns. Fortune flows smoothly.',
            '值太岁，本命年变数多，谨慎行事': 'Birth year brings many variables. Act cautiously.',
            '午未相合，人缘佳，有桃花运': 'Harmony brings good relationships and romance luck.',
            '与太岁无刑冲，稳中有进': 'No conflict with Tai Sui. Steady progress ahead.',
            '与太岁无刑冲，保持现状即可': 'No conflict with Tai Sui. Maintain current course.',
            '与太岁无刑冲，平顺度日': 'No conflict with Tai Sui. Peaceful days ahead.'
        };
        return {
            relation: relationMap[taiSui.relation] || taiSui.relation,
            desc: descMap[taiSui.desc] || taiSui.desc
        };
    },
    
    /**
     * 英文版十神
     */
    getTenGodEn(godName) {
        const map = {
            '比肩': 'Bi Jian (Friend)',
            '劫财': 'Jie Cai (Rob Wealth)',
            '食神': 'Shi Shen (Eating God)',
            '伤官': 'Shang Guan (Hurting Officer)',
            '偏印': 'Pian Yin (Indirect Seal)',
            '正印': 'Zheng Yin (Direct Seal)',
            '偏官': 'Pian Guan (7 Killings)',
            '正官': 'Zheng Guan (Direct Officer)',
            '偏财': 'Pian Cai (Indirect Wealth)',
            '正财': 'Zheng Cai (Direct Wealth)'
        };
        return map[godName] || godName;
    },
    
    /**
     * 英文版十神含义
     */
    getTenGodMeaningEn(godName) {
        const map = {
            '比肩': 'Competition and cooperation coexist. Persistence is key.',
            '劫财': 'Wealth fluctuates. Guard against financial loss.',
            '食神': 'Creativity flows. Artistic talents shine.',
            '伤官': 'Sharp wit shows. Be mindful of your words.',
            '偏印': 'Active thinking. Good for research.',
            '正印': 'Academic and career support from benefactors.',
            '偏官': 'Pressure mounts. Transform stress into motivation.',
            '正官': 'Career rises steadily. Promotion opportunities.',
            '偏财': 'Unexpected fortune. Invest wisely.',
            '正财': 'Stable income. Wealth flows in.'
        };
        return map[godName] || '';
    },
    
    /**
     * 翻译建议数组
     */
    translateAdvices(advices, type) {
        const translations = {
            // Career
            '2026事业运旺，适合主动出击，争取晋升机会': 'Strong career luck in 2026. Take initiative and pursue promotions.',
            '可以尝试跳槽或创业，机遇难得': 'Good time to switch jobs or start a business. Opportunities are rare.',
            '事业平稳发展，按部就班即可': 'Career develops steadily. Follow the plan step by step.',
            '多提升专业技能，厚积薄发': 'Improve professional skills. Accumulate for future breakthroughs.',
            '事业运势欠佳，宜守不宜攻': 'Career luck is weak. Defend rather than attack.',
            '避免与上司冲突，低调行事': 'Avoid conflicts with superiors. Keep a low profile.',
            // Wealth
            '财运亨通，可适度投资理财': 'Wealth flows well. Moderate investments are favorable.',
            '偏财运不错，可能有意外收获': 'Side income luck is good. Unexpected gains possible.',
            '正财稳定，控制消费即可': 'Regular income is stable. Control spending.',
            '不宜投机，稳健理财为上': 'Avoid speculation. Conservative finance is best.',
            '财运较弱，避免大额投资': 'Wealth luck is weak. Avoid large investments.',
            '注意防范破财风险，谨慎借贷': 'Guard against financial loss. Be careful with loans.',
            // Love
            '桃花运旺，单身者易遇良缘': 'Romance luck blooms. Singles may find true love.',
            '已婚者感情甜蜜，可考虑添丁': 'Married couples enjoy sweetness. Consider having children.',
            '感情平稳，多沟通多陪伴': 'Love is stable. Communicate more and spend time together.',
            '单身者可主动出击，但不必强求': 'Singles can take initiative, but don\'t force it.',
            '感情易生波折，需多包容理解': 'Love may face challenges. Be more tolerant and understanding.',
            '避免冲动决定，冷静处理矛盾': 'Avoid impulsive decisions. Handle conflicts calmly.',
            // Health
            '2026火气旺盛，注意心脏和血压': '2026 Fire energy is strong. Watch heart and blood pressure.',
            '金怕火克，多注意肺部和呼吸系统': 'Metal fears Fire. Pay attention to lungs and respiratory system.',
            '木生火泄气，注意肝脏保养，避免熬夜': 'Wood feeds Fire, draining energy. Protect liver, avoid staying up late.',
            '水火相克，注意肾脏和泌尿系统': 'Water-Fire clash. Watch kidneys and urinary system.',
            '保持心态平和，避免情绪过激': 'Keep calm. Avoid emotional extremes.',
            // Gender specific
            '🏃 男性宜多运动，释放过剩火气': '🏃 Men should exercise more to release excess Fire energy.',
            '🧘 女性宜静心养神，避免燥热': '🧘 Women should calm the mind and avoid irritability.',
            '💪 男士2026阳火年宜主动追求，展现魅力': '💪 Men: 2026 Fire year favors bold pursuit. Show your charm.',
            '💪 男士宜多些耐心，切勿急躁吓跑对方': '💪 Men: Be more patient. Don\'t scare them away with impatience.',
            '💐 女士2026年桃花旺，静待良缘': '💐 Women: Romance blooms in 2026. Good matches await.',
            '💐 女士需擦亮眼睛，宁缺毋滥': '💐 Women: Be discerning. Better single than wrong match.',
            '👔 男性可大胆争取领导岗位': '👔 Men can boldly pursue leadership positions.',
            '👔 男性宜韬光养晦，积累实力待时而动': '👔 Men should build strength quietly and wait for the right moment.',
            '👠 女性可尝试跨界发展，潜力无限': '👠 Women can try cross-field development. Unlimited potential.',
            '👠 女性宜稳守岗位，以柔克刚': '👠 Women should hold steady and use softness to overcome hardness.'
        };
        
        return advices.map(a => translations[a] || a).join('<br>');
    },
    
    /**
     * 翻译开运建议
     */
    translateLuckyTips(tips) {
        const translations = {
            '🙏 可在春节期间祈福化解太岁': '🙏 Pray during Spring Festival to resolve Tai Sui conflicts.',
            '🔴 建议多穿红色衣物增强运势': '🔴 Wear red clothing to boost fortune.',
            '💧 多穿白色、金色，或接触水元素': '💧 Wear white or gold. Connect with Water element.',
            '🧭 有利方位：西方、北方': '🧭 Favorable directions: West, North',
            '💧 多喝水，多去水边休息': '💧 Drink more water. Rest near water.',
            '🧭 有利方位：北方、东方': '🧭 Favorable directions: North, East',
            '🌳 多穿绿色，多接触植物': '🌳 Wear green. Spend time with plants.',
            '🧭 有利方位：东方': '🧭 Favorable direction: East',
            '🔥 本命年火旺，多穿红色增强气场': '🔥 Birth year Fire is strong. Wear red to boost aura.',
            '🧭 有利方位：南方': '🧭 Favorable direction: South',
            '🔥 火生土，2026对你有利': '🔥 Fire generates Earth. 2026 favors you.',
            '🧭 有利方位：南方、中央': '🧭 Favorable directions: South, Center',
            '🐯🐶 贵人生肖：虎、狗': '🐯🐶 Benefactor zodiac: Tiger, Dog',
            '🐴 多与属马的朋友交往，借运势': '🐴 Befriend Horse people to borrow their luck.'
        };
        
        return tips.map(t => translations[t] || t).join('<br>');
    },
    
    /**
     * 日文版生肖
     */
    getZodiacJa(zodiac) {
        const map = {
            '鼠': '子', '牛': '丑', '虎': '寅', '兔': '卯',
            '龙': '辰', '蛇': '巳', '马': '午', '羊': '未',
            '猴': '申', '鸡': '酉', '狗': '戌', '猪': '亥'
        };
        return map[zodiac] || zodiac;
    },
    
    /**
     * 日文版太岁关系
     */
    getTaiSuiRelationJa(taiSui) {
        const relationMap = {
            '冲太岁': '太歳と衝突',
            '害太岁': '太歳と害', 
            '三合贵人': '三合（貴人あり）',
            '相破': '破',
            '平稳': '平穏',
            '六合吉': '六合吉',
            '本命年': '本命年'
        };
        const descMap = {
            '子午相冲，2026年需格外小心，易有动荡变化': '子午相冲…2026年は要注意！変化が多いかもね～',
            '丑午相害，人际关系易生矛盾，注意口舌是非': '丑午相害…人間関係にトラブルあるかも、口は災いの元よ～',
            '寅午戌三合，有贵人相助，事业顺遂': '寅午戌三合！貴人に恵まれて仕事もスムーズ～',
            '卯午相破，计划易受阻，需有备案': '卯午相破…計画が邪魔されやすいから、バックアップ用意してね～',
            '与太岁无刑冲，运势平稳': '太歳との衝突なし、運勢は安定してるよ～',
            '巳午同属火，气场相投，运势顺利': '巳午はどっちも火！気が合って運勢順調～',
            '值太岁，本命年变数多，谨慎行事': '本命年！変数多いから慎重にね～',
            '午未相合，人缘佳，有桃花运': '午未相合！人気者で恋愛運もアップ～',
            '与太岁无刑冲，稳中有进': '太歳との衝突なし、着実に前進できるよ～',
            '与太岁无刑冲，保持现状即可': '太歳との衝突なし、今のままでOK～',
            '与太岁无刑冲，平顺度日': '太歳との衝突なし、穏やかに過ごせるよ～'
        };
        return {
            relation: relationMap[taiSui.relation] || taiSui.relation,
            desc: descMap[taiSui.desc] || taiSui.desc
        };
    },
    
    /**
     * 日文版十神
     */
    getTenGodJa(godName) {
        const map = {
            '比肩': '比肩（ひけん）',
            '劫财': '劫財（ごうざい）',
            '食神': '食神（しょくじん）',
            '伤官': '傷官（しょうかん）',
            '偏印': '偏印（へんいん）',
            '正印': '正印（せいいん）',
            '偏官': '偏官（へんかん）',
            '正官': '正官（せいかん）',
            '偏财': '偏財（へんざい）',
            '正财': '正財（せいざい）'
        };
        return map[godName] || godName;
    },
    
    /**
     * 日文版十神含义
     */
    getTenGodMeaningJa(godName) {
        const map = {
            '比肩': '競争と協力が共存、頑張り続けることが大事よ～',
            '劫财': '財運が不安定…お金の管理しっかりね～',
            '食神': '創造力爆発！アーティスティックな才能が光る～',
            '伤官': '鋭い発言に注意、口は災いの元よ～',
            '偏印': '思考が活発、研究や勉強に向いてるわ～',
            '正印': '学業・仕事で貴人のサポートあり～',
            '偏官': 'プレッシャー大きいけど、それを力に変えて～',
            '正官': '仕事運上昇中、昇進のチャンスあるかも～',
            '偏财': '臨時収入の予感！でも投資は慎重にね～',
            '正财': '安定した収入、財運順調よ～'
        };
        return map[godName] || '';
    },
    
    /**
     * 日文版建议翻译
     */
    translateAdvicesJa(advices, type) {
        const translations = {
            // Career
            '2026事业运旺，适合主动出击，争取晋升机会': '2026仕事運絶好調！積極的に動いて昇進を狙って～',
            '可以尝试跳槽或创业，机遇难得': '転職や起業のチャンス！貴重なタイミングよ～',
            '事业平稳发展，按部就班即可': '仕事は安定して発展中、コツコツやればOK～',
            '多提升专业技能，厚积薄发': 'スキルアップに励んで、力を蓄えて～',
            '事业运势欠佳，宜守不宜攻': '仕事運イマイチ…守りに徹して～',
            '避免与上司冲突，低调行事': '上司とのトラブル避けて、おとなしくしてて～',
            // Wealth
            '财运亨通，可适度投资理财': '金運絶好調！程よく投資してもいいよ～',
            '偏财运不错，可能有意外收获': '臨時収入の予感！思わぬボーナスあるかも～',
            '正财稳定，控制消费即可': '安定収入、出費を抑えればOK～',
            '不宜投机，稳健理财为上': '投機はダメ、堅実な資産運用を～',
            '财运较弱，避免大额投资': '金運弱め…大きな投資は控えて～',
            '注意防范破财风险，谨慎借贷': '散財に注意、借金は慎重にね～',
            // Love
            '桃花运旺，单身者易遇良缘': '恋愛運アップ！独身なら良い出会いあるかも～',
            '已婚者感情甜蜜，可考虑添丁': '既婚者はラブラブ、子作りも考えてみて～',
            '感情平稳，多沟通多陪伴': '恋愛は安定、コミュニケーションと一緒の時間を大切に～',
            '单身者可主动出击，但不必强求': '独身なら積極的に！でも無理は禁物よ～',
            '感情易生波折，需多包容理解': '恋愛にトラブルあるかも…寛容と理解が大事～',
            '避免冲动决定，冷静处理矛盾': '衝動的な決断はダメ、冷静に対処して～',
            // Health
            '2026火气旺盛，注意心脏和血压': '2026年は火のエネルギー強め、心臓と血圧に注意～',
            '金怕火克，多注意肺部和呼吸系统': '金は火に弱い…肺と呼吸器系に気をつけて～',
            '木生火泄气，注意肝脏保养，避免熬夜': '木は火に消耗される…肝臓ケアして、夜更かし禁止～',
            '水火相克，注意肾脏和泌尿系统': '水と火は相克…腎臓と泌尿器系に注意～',
            '保持心态平和，避免情绪过激': '心穏やかに、感情的にならないでね～',
            // Gender specific
            '🏃 男性宜多运动，释放过剩火气': '🏃 男性は運動して余分な火のエネルギーを発散して～',
            '🧘 女性宜静心养神，避免燥热': '🧘 女性は心を落ち着けて、イライラ注意～',
            '💪 男士2026阳火年宜主动追求，展现魅力': '💪 男性は2026年積極的にアピールして、魅力を見せて～',
            '💪 男士宜多些耐心，切勿急躁吓跑对方': '💪 男性は焦らないで、相手を怖がらせないように～',
            '💐 女士2026年桃花旺，静待良缘': '💐 女性は2026年モテ期！いい人を待って～',
            '💐 女士需擦亮眼睛，宁缺毋滥': '💐 女性は見る目を持って、妥協しないで～',
            '👔 男性可大胆争取领导岗位': '👔 男性はリーダーポジションを積極的に狙って～',
            '👔 男性宜韬光养晦，积累实力待时而动': '👔 男性は力を蓄えて、チャンスを待って～',
            '👠 女性可尝试跨界发展，潜力无限': '👠 女性は異分野への挑戦もアリ、可能性無限大～',
            '👠 女性宜稳守岗位，以柔克刚': '👠 女性は今のポジションをキープ、柔よく剛を制す～'
        };
        
        return advices.map(a => translations[a] || a).join('<br>');
    },
    
    /**
     * 日文版开运建议
     */
    translateLuckyTipsJa(tips) {
        const translations = {
            '🙏 可在春节期间祈福化解太岁': '🙏 お正月に太歳のお祓いをしてね～',
            '🔴 建议多穿红色衣物增强运势': '🔴 赤い服を着ると運気アップ～',
            '💧 多穿白色、金色，或接触水元素': '💧 白や金色の服、水に触れると吉～',
            '🧭 有利方位：西方、北方': '🧭 ラッキー方位：西、北',
            '💧 多喝水，多去水边休息': '💧 お水をたくさん飲んで、水辺でリラックス～',
            '🧭 有利方位：北方、东方': '🧭 ラッキー方位：北、東',
            '🌳 多穿绿色，多接触植物': '🌳 緑の服を着て、植物に触れると吉～',
            '🧭 有利方位：东方': '🧭 ラッキー方位：東',
            '🔥 本命年火旺，多穿红色增强气场': '🔥 本命年は火が強い、赤を着てオーラ強化～',
            '🧭 有利方位：南方': '🧭 ラッキー方位：南',
            '🔥 火生土，2026对你有利': '🔥 火は土を生む、2026年はあなたに有利～',
            '🧭 有利方位：南方、中央': '🧭 ラッキー方位：南、中央',
            '🐯🐶 贵人生肖：虎、狗': '🐯🐶 貴人の干支：寅、戌',
            '🐴 多与属马的朋友交往，借运势': '🐴 午年の友達と仲良くして運気をもらおう～'
        };
        
        return tips.map(t => translations[t] || t).join('<br>');
    }
};

// 页面初始化
document.addEventListener('DOMContentLoaded', function () {
    const submitBtn = document.getElementById('yearly2026-submit');
    const resultDiv = document.getElementById('yearly2026-result');

    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            const birthDate = document.getElementById('yearly2026-birthdate').value;

            if (!birthDate) {
                alert('请输入你的出生日期~');
                return;
            }

            // 可选字段
            const hourSelect = document.getElementById('yearly2026-hour');
            const hour = hourSelect && hourSelect.value !== '' ? parseInt(hourSelect.value) : null;

            const genderInputs = document.getElementsByName('yearly2026-gender');
            let gender = null;
            for (const input of genderInputs) {
                if (input.checked && input.value) {
                    gender = input.value;
                    break;
                }
            }

            const nameInput = document.getElementById('yearly2026-name');
            const name = nameInput ? nameInput.value.trim() : '';

            // 计算结果
            console.log('=== 2026运势调试信息 ===');
            console.log('时辰 hour:', hour, '类型:', typeof hour);
            console.log('性别 gender:', gender, '类型:', typeof gender);
            console.log('姓名 name:', name, '类型:', typeof name);

            const result = Yearly2026.calculate(birthDate, { hour, gender, name });

            console.log('计算结果 fortune:', result.fortune);
            console.log('事业分:', result.fortune.career, '感情分:', result.fortune.love);

            // 渲染结果
            resultDiv.innerHTML = Yearly2026.renderResult(result, { hour, gender, name });
            resultDiv.classList.remove('hidden');

            // 滚动到结果
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // 绑定跳转按钮
            const jumpBtn = document.getElementById('jump-to-daily-btn');
            if (jumpBtn) {
                jumpBtn.addEventListener('click', function () {
                    // 切换到每日运势标签
                    const dailyTab = document.querySelector('[data-tab="daily"]');
                    if (dailyTab) {
                        dailyTab.click();
                    }
                });
            }

            // GA追踪
            if (typeof gtag === 'function') {
                gtag('event', 'yearly2026_calculate', {
                    'event_category': 'fortune',
                    'event_label': result.userZodiac
                });
            }
        });
    }
});

console.log('Yearly2026 module loaded');

window.Yearly2026 = Yearly2026;

