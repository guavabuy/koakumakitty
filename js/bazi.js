/**
 * 八字命理分析模块
 * 基于倪海厦《天纪》理论
 * 
 * 重要口径说明：
 * - 年柱：立春换年（不是公历1月1日）
 * - 月柱：节气定月（寅月从立春起）
 * - 日柱：统一儒略日算法
 * - 时柱：按时辰起点计算
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
import { DaYunCalculator } from './core/dayun.js';
import { LiuNianCalculator } from './core/liunian.js';

const BaZi = {
    // 引用核心模块的常量（保持向后兼容）
    heavenlyStems: HEAVENLY_STEMS,
    earthlyBranches: EARTHLY_BRANCHES,
    stemElements: STEM_ELEMENTS,
    branchElements: BRANCH_ELEMENTS,
    stemYinYang: STEM_YIN_YANG,

    // 地支藏干
    branchHiddenStems: {
        '子': ['癸'],
        '丑': ['己', '癸', '辛'],
        '寅': ['甲', '丙', '戊'],
        '卯': ['乙'],
        '辰': ['戊', '乙', '癸'],
        '巳': ['丙', '庚', '戊'],
        '午': ['丁', '己'],
        '未': ['己', '丁', '乙'],
        '申': ['庚', '壬', '戊'],
        '酉': ['辛'],
        '戌': ['戊', '辛', '丁'],
        '亥': ['壬', '甲']
    },

    // 十神名称
    tenGods: {
        same_yang: '比肩',
        same_yin: '劫财',
        produce_yang: '食神',
        produce_yin: '伤官',
        produced_yang: '偏印',
        produced_yin: '正印',
        control_yang: '偏官',
        control_yin: '正官',
        controlled_yang: '偏财',
        controlled_yin: '正财'
    },

    // 五行相生相克
    wuxing: {
        generate: { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' },
        control: { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' }
    },

    // 地支对应生肖
    zodiac: {
        '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔',
        '辰': '龙', '巳': '蛇', '午': '马', '未': '羊',
        '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
    },

    /**
     * 计算年柱（委托给核心模块）
     * @deprecated 请直接使用 ChineseCalendar.getYearPillar
     */
    getYearPillar(mingLiYear) {
        const result = ChineseCalendar.getYearPillar(mingLiYear);
        return { stem: result.stem, branch: result.branch };
    },

    /**
     * 计算月柱（委托给核心模块）
     * @deprecated 请直接使用 ChineseCalendar.getMonthPillar
     */
    getMonthPillar(mingLiYear, monthBranchIndex) {
        const result = ChineseCalendar.getMonthPillar(mingLiYear, monthBranchIndex);
        return { stem: result.stem, branch: result.branch };
    },

    /**
     * 计算日柱（委托给核心模块）
     */
    getDayPillar(date) {
        const result = ChineseCalendar.getDayPillar(date);
        return { stem: result.stem, branch: result.branch };
    },

    /**
     * 计算时柱（委托给核心模块）
     */
    getHourPillar(dayPillar, hourIndex) {
        const result = ChineseCalendar.getHourPillar(dayPillar.stem, hourIndex);
        return { stem: result.stem, branch: result.branch };
    },

    /**
     * 计算四柱八字
     * 使用节气口径：年柱按立春换年，月柱按节气定月
     */
    calculate(birthDate, hourIndex, gender) {
        // 构建完整的出生时间（使用时辰起点）
        const birthDateTime = ChineseCalendar.buildBirthDateTime(birthDate, hourIndex);
        
        // 使用核心模块计算四柱（节气口径）
        const { pillars, zodiac, debug } = ChineseCalendar.calculateFourPillars(birthDateTime, hourIndex);
        
        // 转换为简化格式
        const yearPillar = { stem: pillars.year.stem, branch: pillars.year.branch };
        const monthPillar = { stem: pillars.month.stem, branch: pillars.month.branch };
        const dayPillar = { stem: pillars.day.stem, branch: pillars.day.branch };
        const hourPillar = { stem: pillars.hour.stem, branch: pillars.hour.branch };

        // 统计五行
        const elements = this.countElements([yearPillar, monthPillar, dayPillar, hourPillar]);

        // 日主分析
        const dayMaster = dayPillar.stem;
        const dayMasterElement = this.stemElements[dayMaster];
        const dayMasterStrength = this.analyzeDayMasterStrength(dayMaster, elements, monthPillar.branch);

        // 十神分析
        const tenGodsAnalysis = this.analyzeTenGods(dayMaster, [yearPillar, monthPillar, hourPillar]);

        // 阶段3新增：计算大运
        let daYunInfo = null;
        try {
            daYunInfo = DaYunCalculator.calculate(birthDate, hourIndex, gender, { steps: 10 });
        } catch (e) {
            console.warn('大运计算失败:', e);
        }

        return {
            pillars: {
                year: yearPillar,
                month: monthPillar,
                day: dayPillar,
                hour: hourPillar
            },
            elements: elements,
            dayMaster: dayMaster,
            dayMasterElement: dayMasterElement,
            dayMasterStrength: dayMasterStrength,
            tenGods: tenGodsAnalysis,
            zodiac: zodiac,
            gender: gender,
            // 阶段3新增：大运信息
            daYun: daYunInfo,
            // 新增：调试信息（用于验证节气口径）
            debug: debug
        };
    },

    /**
     * [NiShi Standard] 标准化八字计算接口
     */
    calculateStandard(birthDate, hourIndex, gender) {
        // 1. 获取基础计算结果
        const rawResult = this.calculate(birthDate, hourIndex, gender);

        // 2. 映射到标准结论
        const levelMap = { '身强': '吉', '中和': '大吉', '身弱': '平' };

        return NiShiRules.createResult({
            source: 'TianJi', // 八字属于天机道
            pattern: {
                name: `${rawResult.dayMaster}${rawResult.dayMasterElement}命`,
                symbol: rawResult.zodiac,
                attributes: {
                    pillars: rawResult.pillars,
                    tenGods: rawResult.tenGods
                }
            },
            calculation: {
                score: rawResult.dayMasterStrength.level === '中和' ? 88 : 75,
                balance: rawResult.dayMasterStrength.level,
                energy: rawResult.elements
            },
            verdict: {
                level: levelMap[rawResult.dayMasterStrength.level] || '平',
                stars: rawResult.dayMasterStrength.level === '中和' ? 5 : 4,
                summary: `日主${rawResult.dayMaster}，格局${rawResult.dayMasterStrength.level}，五行${Object.keys(rawResult.elements).find(k => rawResult.elements[k] === 0) ? '有缺' : '俱全'}。`
            },
            guidance: {
                // 人间道：职业建议
                action: this.getCareerAdvice(rawResult.dayMaster, rawResult.dayMasterStrength.level, rawResult.tenGods).substring(0, 100) + '...',
                // 天机道：流年大运（简化）
                timing: '暂无流年数据',
                // 地脉道：方位建议
                adjustment: `宜向${rawResult.dayMaster === '甲' ? '东' : '自坐方位'}发展。`
            }
        });
    },

    /**
     * 统计五行数量
     */
    countElements(pillars) {
        const count = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };

        pillars.forEach(pillar => {
            count[this.stemElements[pillar.stem]]++;
            count[this.branchElements[pillar.branch]]++;
        });

        return count;
    },

    /**
     * 分析日主强弱
     */
    analyzeDayMasterStrength(dayMaster, elements, monthBranch) {
        const dayElement = this.stemElements[dayMaster];

        // 同类元素（生我和同我）
        let supportCount = elements[dayElement];

        // 查找生我的元素
        for (let el in this.wuxing.generate) {
            if (this.wuxing.generate[el] === dayElement) {
                supportCount += elements[el];
                break;
            }
        }

        // 简单判断
        const total = Object.values(elements).reduce((a, b) => a + b, 0);
        const ratio = supportCount / total;

        if (ratio >= 0.5) {
            return { level: '身强', description: '日主得令、得地、得生，命格偏强' };
        } else if (ratio >= 0.35) {
            return { level: '中和', description: '日主不强不弱，五行较为平衡' };
        } else {
            return { level: '身弱', description: '日主失令、失地，命格偏弱' };
        }
    },

    /**
     * 分析十神
     */
    analyzeTenGods(dayMaster, pillars) {
        const dayElement = this.stemElements[dayMaster];
        const dayYinYang = this.stemYinYang[dayMaster];
        const result = [];

        const pillarNames = ['年干', '月干', '时干'];

        pillars.forEach((pillar, index) => {
            const stem = pillar.stem;
            const stemElement = this.stemElements[stem];
            const stemYinYang = this.stemYinYang[stem];

            let godName = '';

            if (stemElement === dayElement) {
                // 同类
                godName = stemYinYang === dayYinYang ? '比肩' : '劫财';
            } else if (this.wuxing.generate[dayElement] === stemElement) {
                // 我生
                godName = stemYinYang === dayYinYang ? '食神' : '伤官';
            } else if (this.wuxing.generate[stemElement] === dayElement) {
                // 生我
                godName = stemYinYang === dayYinYang ? '偏印' : '正印';
            } else if (this.wuxing.control[stemElement] === dayElement) {
                // 克我
                godName = stemYinYang === dayYinYang ? '偏官' : '正官';
            } else if (this.wuxing.control[dayElement] === stemElement) {
                // 我克
                godName = stemYinYang === dayYinYang ? '偏财' : '正财';
            }

            result.push({
                position: pillarNames[index],
                god: godName,
                stem: stem
            });
        });

        return result;
    },

    /**
     * 生成命理解读
     */
    generateInterpretation(result) {
        const interpretations = [];

        // 日主解读 - 详细版本，包含性格、职业、人际建议
        const dayMasterInterpretations = {
            '甲': `【甲木·参天大树】
🌳 基本特质：甲木为阳木，就像一棵参天大树，性格正直、仁慈、有担当，做事有原则，不轻易妥协。

💼 适合方向：适合从事需要领导力和决策的工作，如管理层、创业者、教育工作者。甲木人有"顶天立地"的气质，适合做团队的主心骨。

💕 人际关系：待人真诚但有时过于固执，建议多听取他人意见。在感情中是可靠的伴侣，但要注意不要太过强势。

✨ 小贴士：甲木需要阳光和水的滋养，多接触大自然会让你更有活力哦~`,

            '乙': `【乙木·花草藤萝】
🌿 基本特质：乙木为阴木，如同柔软的花草藤萝，性格温柔、细腻、善于变通，懂得"以柔克刚"的道理。

💼 适合方向：适合艺术设计、文案策划、心理咨询、园艺美容等需要细腻感受力的工作。乙木人有很强的适应能力，能在各种环境中找到自己的位置。

💕 人际关系：善于察言观色，人缘很好。但有时过于依赖他人，要学会独立做决定。在感情中温柔体贴，是很好的倾听者。

✨ 小贴士：乙木虽柔但韧性强，遇到困难不要轻言放弃，你比想象中更坚强~`,

            '丙': `【丙火·太阳之火】
☀️ 基本特质：丙火为阳火，就像太阳一样光芒四射，性格热情、开朗、有感染力，走到哪里都是人群的焦点。

💼 适合方向：适合公关、销售、演艺、教育培训等需要表达力和感染力的工作。丙火人天生有舞台魅力，适合需要"抛头露面"的职业。

💕 人际关系：朋友众多，是社交达人。但有时过于张扬，容易忽略他人感受。在感情中热情似火，但要注意给对方空间。

✨ 小贴士：太阳虽好，但也需要落山休息。记得适时调节情绪，避免过度消耗自己~`,

            '丁': `【丁火·灯烛之火】
🕯️ 基本特质：丁火为阴火，如同温暖的烛光，性格温和、细心、富有洞察力，能看透事物的本质。

💼 适合方向：适合科研、文学创作、心理分析、中医等需要深度思考的工作。丁火人善于在暗处发光，是很好的幕后支持者。

💕 人际关系：不爱张扬但内心温暖，朋友不多但都是知心好友。在感情中细腻浪漫，善于制造小惊喜。

✨ 小贴士：丁火虽小但能指引方向，相信自己的直觉，你的洞察力是你最大的优势~`,

            '戊': `【戊土·高山之土】
⛰️ 基本特质：戊土为阳土，如同巍峨的高山，性格厚重、稳重、可靠，是朋友眼中的"靠谱"代名词。

💼 适合方向：适合房地产、建筑工程、投资理财、行政管理等需要稳定和信任的工作。戊土人给人安全感，适合需要长期积累的事业。

💕 人际关系：值得信赖但有时反应较慢，不善于表达情感。在感情中是可靠的伴侣，但要学会主动表达爱意。

✨ 小贴士：高山不动但万物依靠，你的稳重是团队的定海神针。记得偶尔也要活泼一下~`,

            '己': `【己土·田园之土】
🌾 基本特质：己土为阴土，如同肥沃的田园，性格包容、务实、注重细节，能够接纳各种不同的人和事。

💼 适合方向：适合农业、餐饮、服务业、人事管理等需要细心和耐心的工作。己土人善于培养和照顾他人，是很好的团队协调者。

💕 人际关系：善解人意，是大家的知心姐姐/哥哥。但有时过于操心他人，要学会适度放手。在感情中体贴入微，但要注意自己的需求。

✨ 小贴士：田园虽然不起眼，但是万物生长的根基。你的付出终会有回报~`,

            '庚': `【庚金·宝剑之金】
⚔️ 基本特质：庚金为阳金，如同锋利的宝剑，性格刚毅、果断、有魄力，做事雷厉风行，不拖泥带水。

💼 适合方向：适合法律、金融、军警、外科医生等需要果断决策的工作。庚金人有"杀伐决断"的能力，适合竞争激烈的领域。

💕 人际关系：直来直去，不喜欢拐弯抹角。但有时过于锋芒毕露，容易伤人。在感情中要学会柔软，硬碰硬不是解决问题的办法。

✨ 小贴士：宝剑需要剑鞘，锋芒也需要收敛。学会在适当时候展现柔和的一面~`,

            '辛': `【辛金·珠玉之金】
💎 基本特质：辛金为阴金，如同珍贵的珠宝玉石，性格敏锐、精致、有品味，对美有独特的追求。

💼 适合方向：适合珠宝设计、金融分析、品牌策划、艺术鉴赏等需要精细眼光的工作。辛金人追求完美，适合高端精品领域。

💕 人际关系：外表高冷但内心柔软，朋友圈精而不多。在感情中比较挑剔，但一旦认定就会全心付出。

✨ 小贴士：珠玉需要打磨才能闪耀，困难和磨练是让你更加耀眼的过程~`,

            '壬': `【壬水·江河之水】
🌊 基本特质：壬水为阳水，如同奔腾的江河，性格聪明、机智、适应力强，思维活跃，点子多多。

💼 适合方向：适合贸易、物流、传媒、IT技术等需要灵活变通的工作。壬水人善于发现机会，适合需要"水利万物"思维的行业。

💕 人际关系：朋友遍天下，社交能力强。但有时过于善变，给人不稳定的感觉。在感情中要学会专注，不要"脚踏两条船"。

✨ 小贴士：江河虽然自由奔放，但也需要河道的引导。找到人生方向会让你事半功倍~`,

            '癸': `【癸水·雨露之水】
💧 基本特质：癸水为阴水，如同滋润万物的雨露，性格细腻、敏感、富有想象力，内心世界非常丰富。

💼 适合方向：适合文学创作、心理咨询、艺术表演、灵性疗愈等需要感知力的工作。癸水人直觉敏锐，适合需要"润物细无声"的领域。

💕 人际关系：善于倾听和理解他人，是很好的情感支持者。但有时过于敏感，容易多想。在感情中深情款款，但要学会保护自己。

✨ 小贴士：雨露虽小但能滋养万物，不要小看自己的力量。你的温柔是这个世界需要的~`
        };

        interpretations.push({
            title: '日主特质',
            content: dayMasterInterpretations[result.dayMaster]
        });

        // 身强弱解读 - 详细版本
        const strengthAdvice = {
            '身强': `【命格偏强】💪

📊 什么是"身强"？
简单说，你的八字中"帮助你的力量"比较多。就像一个人精力充沛、底气十足，但有时可能过于强势。

⚖️ 调节建议：
• 工作上：适合独立创业、竞争性强的领域，但要学会团队合作
• 生活中：多做一些"消耗精力"的活动，如运动、旅游、学习新技能
• 心态上：学会示弱和倾听，不必事事争第一

🎨 开运方向：可以多接触"克制"和"消耗"你的五行颜色和方位（详见五行建议）`,

            '中和': `【命格中和】☯️

📊 什么是"中和"？
恭喜！你的八字比较平衡，五行力量分布均匀。这是比较理想的命格，稳中有福。

⚖️ 生活建议：
• 工作上：适合稳定发展的路线，不必冒太大风险
• 生活中：保持现有的生活节奏，顺其自然
• 心态上：随遇而安，根据流年运势适当调整

🎨 开运方向：保持均衡即可，哪个五行弱就适当补充`,

            '身弱': `【命格偏弱】🌱

📊 什么是"身弱"？
简单说，你的八字中"帮助你的力量"相对较少。就像一棵小树苗，需要更多的阳光和养分来成长。

⚖️ 调节建议：
• 工作上：适合与人合作、借助团队的力量，避免单打独斗
• 生活中：多休息、多养生，不要过度劳累，学会借力
• 心态上：多依靠贵人和朋友，不必什么事都自己扛

🎨 开运方向：多接触"生扶"和"帮助"你的五行颜色和方位（详见五行建议）`
        };

        interpretations.push({
            title: '命格强弱分析',
            content: strengthAdvice[result.dayMasterStrength.level]
        });

        // 五行建议 - 详细版本
        const missingElements = Object.entries(result.elements)
            .filter(([el, count]) => count === 0)
            .map(([el]) => el);

        const weakElements = Object.entries(result.elements)
            .filter(([el, count]) => count === 1)
            .map(([el]) => el);

        // 五行补充方法详解
        const elementRemedies = {
            '木': '🌳 补木方法：多穿绿色衣服、多接触花草树木、家中摆放绿植、职业可选教育/文化/环保行业、方位朝东',
            '火': '🔥 补火方法：多穿红色/紫色衣服、多晒太阳、家中增加暖色调装饰、职业可选传媒/能源/餐饮行业、方位朝南',
            '土': '⛰️ 补土方法：多穿黄色/棕色衣服、多接触大地（爬山、园艺）、家中摆放陶瓷器皿、职业可选房产/建筑/农业行业、方位居中或东北/西南',
            '金': '⚔️ 补金方法：多穿白色/金色衣服、佩戴金银饰品、家中摆放金属工艺品、职业可选金融/机械/IT行业、方位朝西',
            '水': '💧 补水方法：多穿黑色/蓝色衣服、多喝水、多去水边散步、家中摆放鱼缸或水景、职业可选贸易/物流/咨询行业、方位朝北'
        };

        let wuxingAdvice = '';
        if (missingElements.length > 0) {
            wuxingAdvice = `【五行缺${missingElements.join('、')}】⚠️

你的八字中没有"${missingElements.join('"和"')}"这个元素，建议适当补充：

${missingElements.map(el => elementRemedies[el]).join('\n\n')}

💡 温馨提示：五行补充是一种生活调节方式，不必过于刻意，自然融入生活即可~`;
        } else if (weakElements.length > 0) {
            wuxingAdvice = `【${weakElements.join('、')}较弱】📉

你的八字中"${weakElements.join('"和"')}"元素较少，可以适当加强：

${weakElements.map(el => elementRemedies[el]).join('\n\n')}

💡 温馨提示：弱不代表缺，只是相对较少。适当补充即可，不必过度~`;
        } else {
            wuxingAdvice = `【五行均衡】✨

恭喜！你的八字五行分布比较均衡，这是很好的命局基础。

💡 保持建议：
• 生活中各种颜色都可以穿，不必刻意偏重
• 保持多元化的生活方式，接触不同的人和事
• 顺应自然，不需要特别的五行调节`;
        }

        interpretations.push({
            title: '五行调节指南',
            content: wuxingAdvice
        });

        // 生肖运势 - 详细版本
        interpretations.push({
            title: '生肖性格',
            content: `【属${result.zodiac}】${this.getZodiacEmoji(result.zodiac)}\n\n${this.getZodiacInfo(result.zodiac)}`
        });

        // 十神解读
        const tenGodsContent = this.getTenGodsInterpretation(result.tenGods);
        interpretations.push({
            title: '十神格局',
            content: tenGodsContent
        });

        // 事业财运建议
        const careerAdvice = this.getCareerAdvice(result.dayMaster, result.dayMasterStrength.level, result.tenGods);
        interpretations.push({
            title: '事业财运指南',
            content: careerAdvice
        });

        // 健康养生建议
        const healthAdvice = this.getHealthAdvice(result.dayMasterElement, result.elements);
        interpretations.push({
            title: '健康养生建议',
            content: healthAdvice
        });

        // 猫咪小总结
        const catSummary = this.generateCatSummary(result);
        interpretations.push({
            title: '🐱 喵喵小总结',
            content: catSummary
        });

        return interpretations;
    },

    /**
     * 十神解读
     */
    getTenGodsInterpretation(tenGods) {
        const godMeanings = {
            '比肩': '🤝 比肩代表兄弟姐妹、朋友、同辈竞争者。有比肩的人重义气，朋友多，但也容易有竞争压力。',
            '劫财': '⚡ 劫财代表竞争、争夺、冒险精神。有劫财的人敢拼敢闯，但要注意理财，容易有破财倾向。',
            '食神': '🍜 食神代表才华、口福、享受生活。有食神的人有艺术天赋，热爱美食，生活品质高。',
            '伤官': '💫 伤官代表创意、叛逆、表现欲。有伤官的人聪明有才华，但言辞犀利，容易得罪人。',
            '偏印': '📚 偏印代表偏门学问、灵感、特殊技能。有偏印的人思想独特，适合研究冷门领域。',
            '正印': '🎓 正印代表学历、长辈庇护、贵人运。有正印的人受人尊敬，容易得到长辈提携。',
            '偏官': '⚔️ 偏官（七杀）代表权威、压力、挑战。有偏官的人有领导力，但压力也大，需要学会减压。',
            '正官': '👔 正官代表事业、名声、社会地位。有正官的人注重规则，适合在体制内发展。',
            '偏财': '💰 偏财代表意外之财、投资、人缘。有偏财的人财运好，但来得快去得也快。',
            '正财': '💵 正财代表稳定收入、工资、正当财富。有正财的人理财能力强，收入稳定。'
        };

        let content = `【你的十神分布】🌟\n\n`;

        tenGods.forEach(god => {
            content += `${god.position}（${god.stem}）→ ${god.god}\n`;
            content += `${godMeanings[god.god] || ''}\n\n`;
        });

        // 找出主要十神
        const godCounts = {};
        tenGods.forEach(god => {
            godCounts[god.god] = (godCounts[god.god] || 0) + 1;
        });

        const dominantGod = Object.entries(godCounts).sort((a, b) => b[1] - a[1])[0];
        if (dominantGod) {
            content += `\n💡 你的命局中「${dominantGod[0]}」较为突出，这会对你的性格和运势产生重要影响。`;
        }

        return content;
    },

    /**
     * 事业财运建议
     */
    getCareerAdvice(dayMaster, strengthLevel, tenGods) {
        const elementCareers = {
            '甲': { industry: '教育、文化、环保、园林、木材', direction: '东方' },
            '乙': { industry: '花艺、服装设计、文案策划、咨询', direction: '东方' },
            '丙': { industry: '传媒、能源、餐饮、演艺、电力', direction: '南方' },
            '丁': { industry: '科研、心理咨询、中医、文学创作', direction: '南方' },
            '戊': { industry: '房地产、建筑、矿业、农业', direction: '中央/本地' },
            '己': { industry: '服务业、餐饮、人力资源、仓储', direction: '中央/本地' },
            '庚': { industry: '金融、法律、机械、IT硬件', direction: '西方' },
            '辛': { industry: '珠宝、金融分析、品牌策划、医疗器械', direction: '西方' },
            '壬': { industry: '贸易、物流、旅游、IT软件、传媒', direction: '北方' },
            '癸': { industry: '文艺创作、心理咨询、水产、酒类', direction: '北方' }
        };

        const career = elementCareers[dayMaster] || { industry: '多元化行业', direction: '随缘' };

        let content = `【事业方向】💼\n\n`;
        content += `✨ 适合行业：${career.industry}\n\n`;
        content += `🧭 有利方位：${career.direction}\n\n`;

        // 根据身强身弱给出不同建议
        if (strengthLevel === '身强') {
            content += `💪 身强者事业建议：\n`;
            content += `• 你精力充沛，适合独立创业或担任领导岗位\n`;
            content += `• 可以选择竞争激烈的行业，你有实力脱颖而出\n`;
            content += `• 建议多做消耗精力的工作，把能量用在正确的地方\n`;
            content += `• 积极争取机会，不要太过保守\n\n`;
        } else if (strengthLevel === '身弱') {
            content += `🌱 身弱者事业建议：\n`;
            content += `• 适合加入成熟的团队或大公司，借助平台力量发展\n`;
            content += `• 多结交贵人，借力使力，不要单打独斗\n`;
            content += `• 选择稳定的职业路线，避免高风险创业\n`;
            content += `• 注重休息养生，保持精力才能走得更远\n\n`;
        } else {
            content += `⚖️ 命格中和者事业建议：\n`;
            content += `• 你的发展比较均衡，创业或就业都可以\n`;
            content += `• 根据自己的兴趣选择方向，顺其自然\n`;
            content += `• 保持稳定发展，不必冒太大风险\n`;
            content += `• 随流年运势调整方向即可\n\n`;
        }

        content += `【财运分析】💰\n\n`;

        // 检查十神中有无财星
        const hasWealth = tenGods.some(g => g.god === '正财' || g.god === '偏财');
        if (hasWealth) {
            content += `🎉 你的命局有财星出现，财运基础不错！\n`;
            content += `• 正财旺：收入稳定，适合固定工作积累财富\n`;
            content += `• 偏财旺：有意外之财，适合投资理财\n\n`;
        } else {
            content += `📊 你的命局财星不明显，财富需要通过努力获取\n`;
            content += `• 建议：专注技能提升，以能力换取财富\n`;
            content += `• 不宜投机，稳扎稳打更适合你\n\n`;
        }

        content += `💡 开运小贴士：多与从事你适合行业的人交流，贵人就在身边~`;

        return content;
    },

    /**
     * 健康养生建议
     */
    getHealthAdvice(dayMasterElement, elements) {
        const elementHealth = {
            '木': {
                organ: '肝胆、眼睛、筋骨',
                weak: '容易肝气郁结、眼睛疲劳、筋骨酸痛',
                advice: '多吃绿色蔬菜，保持心情舒畅，避免熬夜，多做舒展运动'
            },
            '火': {
                organ: '心脏、小肠、血液',
                weak: '容易心火旺盛、失眠多梦、血压问题',
                advice: '保持心态平和，避免情绪激动，少吃辛辣，多喝水'
            },
            '土': {
                organ: '脾胃、肌肉、口腔',
                weak: '容易消化不良、食欲不振、肌肉松弛',
                advice: '规律饮食，少吃生冷，多运动强健脾胃'
            },
            '金': {
                organ: '肺部、大肠、皮肤',
                weak: '容易呼吸道问题、皮肤敏感、便秘',
                advice: '多呼吸新鲜空气，保持皮肤清洁，多吃润肺食物'
            },
            '水': {
                organ: '肾脏、膀胱、骨骼',
                weak: '容易肾虚疲劳、腰膝酸软、泌尿问题',
                advice: '避免过度劳累，保持充足睡眠，多吃黑色食物补肾'
            }
        };

        const health = elementHealth[dayMasterElement];

        let content = `【你的健康关注点】🏥\n\n`;
        content += `🔍 日主五行属「${dayMasterElement}」\n\n`;
        content += `📍 关联器官：${health.organ}\n\n`;
        content += `⚠️ 容易出现：${health.weak}\n\n`;
        content += `💊 养生建议：${health.advice}\n\n`;

        // 根据五行缺失给出额外建议
        const missingElements = Object.entries(elements)
            .filter(([el, count]) => count === 0)
            .map(([el]) => el);

        if (missingElements.length > 0) {
            content += `\n【五行补充养生】🌿\n\n`;
            missingElements.forEach(el => {
                const elHealth = elementHealth[el];
                content += `缺${el} → 注意${elHealth.organ}的保养，${elHealth.advice}\n\n`;
            });
        }

        content += `\n【四季养生小贴士】🍂\n\n`;
        content += `• 春季（木旺）：养肝护眼，多吃青菜\n`;
        content += `• 夏季（火旺）：养心安神，避暑降温\n`;
        content += `• 长夏/换季（土旺）：健脾和胃，规律饮食\n`;
        content += `• 秋季（金旺）：润肺防燥，多吃白色食物\n`;
        content += `• 冬季（水旺）：养肾保暖，早睡晚起`;

        return content;
    },

    /**
     * 生成猫咪语气小总结
     */
    generateCatSummary(result) {
        const dayMaster = result.dayMaster;
        const element = result.dayMasterElement;
        const strength = result.dayMasterStrength.level;
        const zodiac = result.zodiac;

        // 随机选择猫咪表情和语气词
        const catFaces = ['(=^･ω･^=)', '(=´∇｀=)', '(=ＴェＴ=)', '(=^-ω-^=)', 'ฅ^•ﻌ•^ฅ', '(^・ω・^)', '₍˄·͈༝·͈˄₎'];
        const catEndings = ['喵~', '喵喵~', '喵呜~', '～喵', '喵！', '喵喵喵~'];

        const randomFace = catFaces[Math.floor(Math.random() * catFaces.length)];
        const randomEnding = catEndings[Math.floor(Math.random() * catEndings.length)];

        let summary = `${randomFace}\n\n`;
        summary += `好啦好啦，本喵已经帮你看完八字啦${randomEnding}\n\n`;

        summary += `🐾 **本喵的总结：**\n\n`;

        // 日主性格总结
        const elementTraits = {
            '木': '你是一棵温柔又坚强的小树苗',
            '火': '你是一团热情又温暖的小火苗',
            '土': '你是一座踏实又可靠的小山丘',
            '金': '你是一块闪闪发光的小宝石',
            '水': '你是一条灵动又聪明的小溪流'
        };

        summary += `🌟 ${elementTraits[element]}呢${randomEnding}\n\n`;

        // 命格强弱建议
        if (strength === '身强') {
            summary += `💪 你的能量满满的，就像本喵吃饱了小鱼干一样精力充沛${randomEnding} 记得把多余的能量用在正确的地方哦，不然会像本喵半夜跑酷一样精力过剩${randomEnding}\n\n`;
        } else if (strength === '身弱') {
            summary += `🌱 你需要多多休息和补充能量，就像本喵需要晒太阳充电一样${randomEnding} 多找贵人帮忙，不要什么事情都自己扛${randomEnding}\n\n`;
        } else {
            summary += `☯️ 你的命格很平衡呢，本喵羡慕${randomEnding} 保持现在的状态就很好，顺其自然就是最好的安排${randomEnding}\n\n`;
        }

        // 生肖祝福
        summary += `🐾 作为一只${zodiac}${zodiac}的小可爱，本喵觉得你很有魅力${randomEnding}\n\n`;

        // 随机鼓励语
        const encouragements = [
            `记住，命运掌握在自己手里，本喵相信你一定可以的${randomEnding}`,
            `不管八字怎么说，努力的人运气都不会太差${randomEnding}`,
            `本喵已经帮你算好了，剩下的就靠你自己啦，加油${randomEnding}`,
            `无论遇到什么困难，本喵都会在这里陪你${randomEnding}`,
            `今天的运势分析就到这里，记得每天都要开开心心的哦${randomEnding}`
        ];

        summary += `✨ ${encouragements[Math.floor(Math.random() * encouragements.length)]}\n\n`;

        summary += `🐱 喵喵提示：以上分析仅供娱乐参考，不作为婚姻、投资等重大决策依据哦～八字命理是一门古老的学问，本喵是根据倪师的《天纪》理论来分析的。命运是可以改变的，你的选择和努力才是关键${randomEnding}\n\n`;

        summary += `${randomFace} 下次再来找本喵玩哦～撒花✿✿ヽ(°▽°)ノ✿`;

        return summary;
    },

    /**
     * 获取生肖emoji
     */
    getZodiacEmoji(zodiac) {
        const emojis = {
            '鼠': '🐭', '牛': '🐮', '虎': '🐯', '兔': '🐰',
            '龙': '🐲', '蛇': '🐍', '马': '🐴', '羊': '🐑',
            '猴': '🐵', '鸡': '🐔', '狗': '🐕', '猪': '🐷'
        };
        return emojis[zodiac] || '';
    },

    /**
     * 获取生肖信息 - 详细版本
     */
    getZodiacInfo(zodiac) {
        const info = {
            '鼠': `🌟 性格特点：机智灵活，反应敏捷，善于把握机会。天生具有敏锐的洞察力，能在复杂环境中找到出路。

💼 事业运势：财运较好，适合从事金融、贸易、科技等需要灵活应变的行业。创业能力强，但要注意不要过于投机。

💕 感情特点：在感情中热情主动，但有时过于精明计较。建议多一些浪漫和感性，少一些算计。

🍀 开运建议：佩戴金属饰品有助运势，多与属龙、属猴的人合作会有好运。`,

            '牛': `🌟 性格特点：踏实稳重，意志坚定，做事有始有终。不喜欢投机取巧，相信一分耕耘一分收获。

💼 事业运势：适合需要耐心和毅力的工作，如农业、建筑、金融投资等。晚年运势好，年轻时的辛苦会有回报。

💕 感情特点：对感情忠诚专一，但表达方式比较含蓄。建议多主动表达爱意，不要让对方猜心思。

🍀 开运建议：多穿红色系服装提升活力，与属蛇、属鸡的人合作会有助运。`,

            '虎': `🌟 性格特点：勇敢自信，有领导才能，天生具有王者风范。敢于冒险，不惧挑战，是团队中的核心人物。

💼 事业运势：适合管理、创业、军警等需要魄力的工作。事业心强，但要注意不要太过冲动，多听取他人意见。

💕 感情特点：在感情中比较强势，喜欢主导一切。建议学会尊重伴侣，给对方空间。

🍀 开运建议：佩戴木质饰品有助平衡能量，与属马、属狗的人合作会带来好运。`,

            '兔': `🌟 性格特点：温和善良，谨慎细心，处事周到。不喜欢冲突，善于调和矛盾，人缘极好。

💼 事业运势：适合艺术、文化、外交、服务业等需要细腻沟通的工作。凭借好人缘，容易得到贵人相助。

💕 感情特点：对感情细腻敏感，重视家庭和谐。但有时过于敏感容易多想，建议多一些信任。

🍀 开运建议：家中摆放绿色植物有助运势，与属羊、属猪的人合作会更顺利。`,

            '龙': `🌟 性格特点：气质非凡，有远大志向，天生自带主角光环。不安于现状，总想要做出一番大事业。

💼 事业运势：贵人运旺，适合领导岗位或创业。天生有感染力，容易获得他人的支持和追随。

💕 感情特点：对感情认真但要求高，寻找能与自己匹配的伴侣。建议放下身段，真诚对待每一段感情。

🍀 开运建议：佩戴金银饰品增强气场，与属鼠、属猴的人合作会有意想不到的收获。`,

            '蛇': `🌟 性格特点：聪明灵敏，深谋远虑，有智慧。外表冷静从容，内心计划周详，不打无准备之仗。

💼 事业运势：适合科研、金融、策划等需要深度思考的工作。善于发现机会，往往能抓住关键时机。

💕 感情特点：对感情专一但表达含蓄，有时显得神秘莫测。建议多一些主动和坦诚的沟通。

🍀 开运建议：佩戴玉石饰品有助开运，与属牛、属鸡的人合作会更加顺利。`,

            '马': `🌟 性格特点：热情奔放，喜欢自由，行动力超强。不喜欢被束缚，天生的社交达人，朋友遍天下。

💼 事业运势：适合销售、旅游、传媒等需要活力和社交的工作。适合需要经常外出、接触新事物的岗位。

💕 感情特点：在感情中热情似火，但有时过于追求新鲜感。建议学会安定下来，珍惜眼前人。

🍀 开运建议：多穿红色系衣服增强活力，与属虎、属狗的人合作会有好运相伴。`,

            '羊': `🌟 性格特点：温柔善良，有艺术天赋，重感情。敏感细腻，有丰富的想象力，对美有独特的追求。

💼 事业运势：适合艺术、设计、教育、服务业等需要细腻感受的工作。在宽容理解的环境中更容易发挥。

💕 感情特点：对感情真挚投入，渴望被呵护和理解。建议增强独立性，不要过于依赖他人。

🍀 开运建议：家中养些小宠物有助提升运势，与属兔、属猪的人合作会更加和谐。`,

            '猴': `🌟 性格特点：聪明伶俐，多才多艺，变通能力超强。点子多，创意无限，是团队中的智囊。

💼 事业运势：适合科技、创意、演艺等需要灵活创新的工作。但要注意专注，不要三心二意。

💕 感情特点：在感情中活泼有趣，但有时过于善变。建议学会安定踏实，给对方更多安全感。

🍀 开运建议：佩戴水晶饰品有助开运，与属鼠、属龙的人合作会碰撞出精彩火花。`,

            '鸡': `🌟 性格特点：勤劳认真，有责任心，注重外表和细节。追求完美，做事一丝不苟，是可靠的合作伙伴。

💼 事业运势：适合财务、法律、媒体等需要精细和责任心的工作。事业上容易获得认可，但要注意人际关系。

💕 感情特点：对感情认真负责，但有时过于挑剔。建议学会包容对方的小缺点。

🍀 开运建议：多穿金色或白色衣服提升运势，与属牛、属蛇的人合作会相互成就。`,

            '狗': `🌟 性格特点：忠诚正直，有正义感，值得信赖。重视朋友和家人，是大家公认的"老好人"。

💼 事业运势：适合法律、公益、服务业等需要正义感和责任心的工作。在团队中是可靠的中坚力量。

💕 感情特点：对感情忠诚专一，会全心守护所爱的人。但有时过于固执，建议适当变通。

🍀 开运建议：多进行户外活动接触大自然，与属虎、属马的人合作会非常默契。`,

            '猪': `🌟 性格特点：诚实善良，乐观豁达，有福气。不喜欢计较，待人真诚，是让人感到舒适的存在。

💼 事业运势：适合餐饮、娱乐、服务业等需要亲和力的工作。财运较好，往往能在意想不到的地方获得收益。

💕 感情特点：对感情很有包容心，会为家人付出很多。但要注意不要被小人利用你的善良。

🍀 开运建议：家中保持整洁有助招财，与属兔、属羊的人合作会非常愉快。`
        };
        return info[zodiac] || '';
    },

    /**
     * 渲染结果到页面
     */
    renderResult(result) {
        const interpretations = this.generateInterpretation(result);
        const pillars = result.pillars;

        let html = `
            <div class="bazi-pillars">
                <div class="pillar">
                    <div class="pillar-label">年柱</div>
                    <div class="pillar-stem">${pillars.year.stem}</div>
                    <div class="pillar-branch">${pillars.year.branch}</div>
                </div>
                <div class="pillar">
                    <div class="pillar-label">月柱</div>
                    <div class="pillar-stem">${pillars.month.stem}</div>
                    <div class="pillar-branch">${pillars.month.branch}</div>
                </div>
                <div class="pillar">
                    <div class="pillar-label">日柱</div>
                    <div class="pillar-stem">${pillars.day.stem}</div>
                    <div class="pillar-branch">${pillars.day.branch}</div>
                </div>
                <div class="pillar">
                    <div class="pillar-label">时柱</div>
                    <div class="pillar-stem">${pillars.hour.stem}</div>
                    <div class="pillar-branch">${pillars.hour.branch}</div>
                </div>
            </div>
            
            <div class="wuxing-chart">
                <div class="wuxing-item">
                    <div class="wuxing-symbol wood">木</div>
                    <div class="wuxing-count">${result.elements['木']}个</div>
                </div>
                <div class="wuxing-item">
                    <div class="wuxing-symbol fire">火</div>
                    <div class="wuxing-count">${result.elements['火']}个</div>
                </div>
                <div class="wuxing-item">
                    <div class="wuxing-symbol earth">土</div>
                    <div class="wuxing-count">${result.elements['土']}个</div>
                </div>
                <div class="wuxing-item">
                    <div class="wuxing-symbol metal">金</div>
                    <div class="wuxing-count">${result.elements['金']}个</div>
                </div>
                <div class="wuxing-item">
                    <div class="wuxing-symbol water">水</div>
                    <div class="wuxing-count">${result.elements['水']}个</div>
                </div>
            </div>
        `;

        interpretations.forEach(interp => {
            html += `
                <div class="analysis-card">
                    <h4>${interp.title}</h4>
                    <p>${interp.content}</p>
                </div>
            `;
        });

        // 阶段3新增：大运表
        if (result.daYun) {
            html += this.renderDaYunTable(result.daYun);
        }

        // 添加点赞分享按钮
        if (typeof ShareUtils !== 'undefined') {
            html += ShareUtils.createActionButtons('bazi');
        }

        return html;
    },

    /**
     * 阶段3新增：渲染大运表
     */
    renderDaYunTable(daYunInfo) {
        if (!daYunInfo || !daYunInfo.daYunList) return '';

        const { direction, qiYun, daYunList, currentDaYun } = daYunInfo;

        let html = `
            <div class="analysis-card dayun-section">
                <h4>🔮 大运推演</h4>
                
                <div class="qiyun-info">
                    <p><strong>起运信息：</strong>${qiYun.explanation}</p>
                    <p><strong>大运方向：</strong>${direction.explanation}</p>
                    <p class="rule-ref" style="font-size: 0.8rem; color: #888;">📚 规则来源：${direction.ruleRef}, ${qiYun.ruleRef}</p>
                </div>

                <div class="dayun-timeline" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
        `;

        daYunList.forEach((dy, index) => {
            const isCurrent = currentDaYun && dy.step === currentDaYun.step;
            html += `
                <div class="dayun-item" style="
                    flex: 0 0 calc(20% - 10px);
                    min-width: 80px;
                    padding: 10px;
                    border-radius: 8px;
                    text-align: center;
                    background: ${isCurrent ? 'linear-gradient(135deg, #ff6b6b, #feca57)' : '#f8f9fa'};
                    color: ${isCurrent ? 'white' : 'inherit'};
                    border: ${isCurrent ? '2px solid #ff6b6b' : '1px solid #ddd'};
                ">
                    <div style="font-size: 0.75rem; color: ${isCurrent ? 'rgba(255,255,255,0.8)' : '#888'};">第${dy.step}步</div>
                    <div style="font-size: 1.2rem; font-weight: bold; margin: 5px 0;">${dy.pillar}</div>
                    <div style="font-size: 0.8rem; color: ${isCurrent ? 'rgba(255,255,255,0.9)' : '#666'};">${dy.tenGod}</div>
                    <div style="font-size: 0.7rem; margin-top: 5px;">${dy.ageRange}</div>
                    ${isCurrent ? '<div style="font-size: 0.7rem; margin-top: 3px;">← 当前</div>' : ''}
                </div>
            `;
        });

        html += `
                </div>
                
                <p class="disclaimer-note" style="font-size: 0.85rem; color: #888; margin-top: 12px;">
                    ⚠️ 大运分析基于传统命理理论，仅供参考，不作为重大决策依据
                </p>
            </div>
        `;

        return html;
    }
};

window.BaZi = BaZi;

