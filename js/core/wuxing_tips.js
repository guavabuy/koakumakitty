/**
 * 五行小贴士库 (Wuxing Tips Library)
 * 基于人设：20岁美国亚裔女大学生 Kitty
 * - 数学专业，所以算命算得准（"相信数据"）
 * - 喜欢 Y2K 风格
 * - 常常幻想自己是一只猫咪（偶尔"喵~"）
 * - 语气：学术精准 + 俏皮可爱
 */

export const WuxingTips = {
    '火': {
        clothing: ['红色帽子', '红色围巾', '酒红色大衣', '粉色毛衣', '红色发圈'],
        food: ['热拿铁加大杯', '麻辣香锅', '番茄炒蛋', '红糖水', '辣火锅'],
        activity: ['晒太阳15分钟', '做瑜伽', '去南边活动', '热身运动', '泡温泉'],
        items: ['红色手机壳', '红色发圈', '红色袜子', '红色耳机', '暖色系眼镜'],
        crazy: [
            '分手选在火旺日，干脆利落不拖泥带水',
            '表白穿红色，成功率+20%，数据不骗人~',
            '重要演讲前吃顿辣的，气场瞬间拉满',
            '面试官前点杯热美式，保持战斗力'
        ],
        kittyComment: {
            zh: '火气不足就像CPU降频，得加点热量才能满血运行~',
            en: 'Low fire is like CPU throttling - gotta add some heat to run at full speed~',
            ja: '火が足りないとCPUがスロットリングするみたい、熱を入れないとフルパワー出ないよ～'
        }
    },
    '水': {
        clothing: ['黑色帽子', '深蓝色外套', '银色首饰', '海军蓝围巾', '黑色运动裤'],
        food: ['冰美式加大杯', '海鲜', '黑芝麻糊', '多喝水', '椰子水', '蓝莓'],
        activity: ['泡澡', '游泳', '去北边活动', '靠近水边', '听白噪音', '冥想'],
        items: ['黑色耳机', '深蓝色包', '银色手表', '黑色雨伞', '蓝色水杯'],
        crazy: [
            '打麻将坐北边，水旺财运旺，这是有数据支撑的~',
            '谈判前喝杯冰水冷静一下，成功率+15%',
            '分手后去海边走走，水能带走负能量',
            '重要决定前洗个澡，灵感来得更快'
        ],
        kittyComment: {
            zh: '缺水就像内存不足，多喝水才能多线程运行~',
            en: 'Low water is like low RAM - drink more to enable multitasking~',
            ja: '水不足はメモリ不足みたい、水をたくさん飲んでマルチタスクを有効にして～'
        }
    },
    '木': {
        clothing: ['绿色系衣服', '棉麻面料', '植物图案', '森林绿围巾', '翠绿色帽子'],
        food: ['绿色蔬菜沙拉', '青苹果', '绿茶', '抹茶拿铁', '青菜豆腐', '黄瓜'],
        activity: ['逛公园', '拥抱树木', '户外运动', '去东边活动', '种植物', '早起'],
        items: ['绿植', '木质手串', '绿色手机壳', '竹制餐具', '木质书签'],
        crazy: [
            '吵架前先去公园走一圈，木能疏肝解郁',
            '面试带盆绿萝在包里（开玩笑啦，但戴绿色是认真的）',
            'deadline前抱抱树，据统计能降低焦虑23%',
            '早起看日出，木旺肝好脾气好'
        ],
        kittyComment: {
            zh: '缺木就像代码缺了主函数，得补上才能跑起来~',
            en: 'Low wood is like code without a main function - gotta add it to run~',
            ja: '木が足りないとメイン関数がないコードみたい、追加しないと動かないよ～'
        }
    },
    '金': {
        clothing: ['白色系', '金色配饰', '银色首饰', '米白色衬衫', '香槟色裙子'],
        food: ['白萝卜', '梨', '银耳汤', '白色食物', '杏仁', '百合'],
        activity: ['去西边活动', '整理房间', '做决策', '断舍离', '听金属乐'],
        items: ['金属手表', '银色耳环', '白色手机壳', '金属钥匙扣', '不锈钢保温杯'],
        crazy: [
            '重要决定选在金旺日，决断力+30%',
            '签合同戴金属首饰，气场更强',
            '换工作前先整理房间，金主清理旧能量',
            '考试前戴银饰，头脑更清晰'
        ],
        kittyComment: {
            zh: '缺金就像算法没优化，效率上不去~',
            en: 'Low metal is like unoptimized code - efficiency stays low~',
            ja: '金が足りないと最適化されてないアルゴリズムみたい、効率上がらないよ～'
        }
    },
    '土': {
        clothing: ['黄色系', '棕色系', '米色', '卡其色外套', '大地色系'],
        food: ['小米粥', '南瓜', '红薯', '黄色食物', '土豆', '玉米'],
        activity: ['待在室内', '做计划', '整理东西', '居家休息', '做饭'],
        items: ['黄色便签', '陶瓷杯', '棕色皮包', '陶土花盆', '木质收纳盒'],
        crazy: [
            '搬家选土旺日更稳，数据显示成功率+25%',
            '存钱前先吃顿地瓜，土生金嘛~',
            '重要考试前在家复习，土主稳定',
            '创业前先把家里整理干净，土旺根基稳'
        ],
        kittyComment: {
            zh: '缺土就像服务器没有稳定的基础设施，随时可能崩~',
            en: 'Low earth is like a server without stable infrastructure - might crash anytime~',
            ja: '土が足りないと安定したインフラのないサーバーみたい、いつでもクラッシュするかも～'
        }
    }
};

/**
 * 根据用户五行缺失生成小贴士
 * @param {string} lackingElement - 缺失的五行
 * @param {string} lang - 语言 ('zh' | 'en' | 'ja')
 * @returns {Object} 包含各类建议的对象
 */
export function generateWuxingTip(lackingElement, lang = 'zh') {
    const tips = WuxingTips[lackingElement];
    if (!tips) return null;

    // 随机选择一个建议
    const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    return {
        element: lackingElement,
        clothing: randomPick(tips.clothing),
        food: randomPick(tips.food),
        activity: randomPick(tips.activity),
        item: randomPick(tips.items),
        crazyTip: randomPick(tips.crazy),
        kittyComment: tips.kittyComment[lang] || tips.kittyComment.zh
    };
}

/**
 * 根据今日五行生成建议
 * @param {string} todayElement - 今日五行（旺）
 * @param {string} userElement - 用户日主五行
 * @param {string} lang - 语言
 * @returns {Object} 今日建议
 */
export function generateDailyTip(todayElement, userElement, lang = 'zh') {
    // 五行生克关系
    const generates = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
    const controls = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };

    // 找出用户需要补充的五行
    let needElement;
    let reason;

    if (controls[todayElement] === userElement) {
        // 今日克我，需要补充生我的五行（印）
        const generatedBy = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };
        needElement = generatedBy[userElement];
        reason = {
            zh: `今天${todayElement}克你的${userElement}，需要补${needElement}来化解~`,
            en: `Today's ${todayElement} clashes with your ${userElement}, add ${needElement} to harmonize~`,
            ja: `今日の${todayElement}があなたの${userElement}を克してる、${needElement}で中和して～`
        };
    } else if (generates[userElement] === todayElement) {
        // 我生今日五行（泄气），需要补充同类或印
        needElement = userElement;
        reason = {
            zh: `今天你的${userElement}生${todayElement}，精力外泄，补${needElement}充能~`,
            en: `Your ${userElement} feeds today's ${todayElement}, energy drains - recharge with ${needElement}~`,
            ja: `あなたの${userElement}が今日の${todayElement}を生む、エネルギー漏れ、${needElement}で充電～`
        };
    } else if (controls[userElement] === todayElement) {
        // 我克今日五行，消耗体力
        const generatedBy = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };
        needElement = generatedBy[userElement];
        reason = {
            zh: `今天你的${userElement}克${todayElement}，消耗大，补${needElement}支援~`,
            en: `Your ${userElement} controls today's ${todayElement}, draining - support with ${needElement}~`,
            ja: `あなたの${userElement}が今日の${todayElement}を克す、消耗大、${needElement}でサポート～`
        };
    } else if (generates[todayElement] === userElement) {
        // 今日生我，好日子，稍微补一下同类
        needElement = todayElement;
        reason = {
            zh: `今天${todayElement}生你的${userElement}，顺风顺水，补点${needElement}更旺~`,
            en: `Today's ${todayElement} supports your ${userElement}, smooth sailing - add ${needElement} for boost~`,
            ja: `今日の${todayElement}があなたの${userElement}を生む、順調、${needElement}でもっとアップ～`
        };
    } else {
        // 同类或其他
        needElement = userElement;
        reason = {
            zh: `今天${todayElement}与你的${userElement}气场相近，补${needElement}更稳~`,
            en: `Today's ${todayElement} aligns with your ${userElement}, add ${needElement} for stability~`,
            ja: `今日の${todayElement}とあなたの${userElement}は相性良い、${needElement}で安定～`
        };
    }

    const tip = generateWuxingTip(needElement, lang);

    return {
        needElement,
        reason: reason[lang] || reason.zh,
        ...tip
    };
}

/**
 * 生成2026年度五行补给清单
 * @param {string} userElement - 用户日主五行
 * @param {string} lang - 语言
 * @returns {Object} 年度补给建议
 */
export function generate2026YearlyTips(userElement, lang = 'zh') {
    // 2026丙午年 = 火×2 = 火力值爆表
    const flowYearElement = '火';

    // 五行生克
    const controls = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
    const generatedBy = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };

    let mainNeed, secondNeed;
    let yearAdvice;

    if (controls[flowYearElement] === userElement) {
        // 火克金：需要大量补水（水克火，保护金）
        mainNeed = '水';
        secondNeed = '土';
        yearAdvice = {
            zh: '2026火年克你的金，得加个"散热器"（水）才能稳定运行~',
            en: '2026 Fire clashes with your Metal - add a "cooler" (Water) to run stable~',
            ja: '2026年の火があなたの金を克す、「冷却ファン」（水）追加で安定運行～'
        };
    } else if (generatedBy[flowYearElement] === userElement) {
        // 木生火：木命被泄气
        mainNeed = '水';
        secondNeed = '木';
        yearAdvice = {
            zh: '2026火年消耗你的木，像CPU一直在高负载，得补水降温~',
            en: '2026 Fire drains your Wood - like CPU on high load, add Water to cool down~',
            ja: '2026年の火があなたの木を消耗、CPUが高負荷みたい、水で冷やして～'
        };
    } else if (userElement === flowYearElement) {
        // 火命遇火年
        mainNeed = '水';
        secondNeed = '土';
        yearAdvice = {
            zh: '2026火年+你的火命=火力过载！必须补水防止系统崩溃~',
            en: '2026 Fire + your Fire = overload! Must add Water to prevent system crash~',
            ja: '2026年の火+あなたの火=過負荷！水を追加してシステムクラッシュ防止～'
        };
    } else if (controls[userElement] === flowYearElement) {
        // 水克火：用户占优势
        mainNeed = userElement;
        secondNeed = '金';
        yearAdvice = {
            zh: '2026你的水克流年火，掌控力强，保持水量就能稳操胜券~',
            en: '2026 your Water controls the Fire - stay hydrated for full control~',
            ja: '2026年あなたの水が火を克す、コントロール力強い、水分キープで勝利確定～'
        };
    } else {
        // 土命：火生土
        mainNeed = '金';
        secondNeed = '水';
        yearAdvice = {
            zh: '2026火生你的土，运势不错，适当补金水可以更上一层楼~',
            en: '2026 Fire feeds your Earth - fortune looks good, add Metal/Water to level up~',
            ja: '2026年の火があなたの土を生む、運勢良い、金水追加でレベルアップ～'
        };
    }

    const mainTips = WuxingTips[mainNeed];
    const secondTips = WuxingTips[secondNeed];

    return {
        flowYear: '2026丙午年',
        flowElement: flowYearElement,
        userElement,
        yearAdvice: yearAdvice[lang] || yearAdvice.zh,
        mainNeed: {
            element: mainNeed,
            yearlyClothing: mainTips.clothing.slice(0, 3),
            yearlyFood: mainTips.food.slice(0, 3),
            yearlyItems: mainTips.items.slice(0, 3)
        },
        secondNeed: {
            element: secondNeed,
            yearlyClothing: secondTips.clothing.slice(0, 2),
            yearlyFood: secondTips.food.slice(0, 2)
        },
        crazyTips: [
            ...mainTips.crazy.slice(0, 2),
            ...secondTips.crazy.slice(0, 1)
        ]
    };
}

/**
 * Kitty 人设语气生成器
 * @param {string} type - 消息类型
 * @param {Object} data - 数据
 * @param {string} lang - 语言
 * @returns {string} Kitty风格的文案
 */
export function kittySpeak(type, data, lang = 'zh') {
    const templates = {
        // 每日运势开场
        dailyIntro: {
            zh: [
                `按我的计算模型，今天综合评分${data.score}分~`,
                `数据显示，今天的运势指数是${data.score}~`,
                `统计上看，今天综合得分${data.score}，喵~`
            ],
            en: [
                `According to my model, today's overall score is ${data.score}~`,
                `Data shows today's fortune index is ${data.score}~`,
                `Statistically, today scores ${data.score}, meow~`
            ],
            ja: [
                `私の計算モデルによると、今日の総合点は${data.score}点～`,
                `データによると、今日の運勢指数は${data.score}～`,
                `統計的に見ると、今日は${data.score}点、ニャ～`
            ]
        },
        // 五行分析
        wuxingAnalysis: {
            zh: [
                `今天${data.todayElement}旺${data.userElement}弱，得调整一下配置~`,
                `今日数据：${data.todayElement}值爆表，你缺${data.needElement}~`,
                `五行雷达图显示：${data.todayElement}过载，${data.needElement}不足~`
            ],
            en: [
                `Today ${data.todayElement} is high, ${data.userElement} is low - time to reconfigure~`,
                `Today's data: ${data.todayElement} maxed out, you need ${data.needElement}~`,
                `Element radar shows: ${data.todayElement} overload, ${data.needElement} insufficient~`
            ],
            ja: [
                `今日${data.todayElement}が強くて${data.userElement}が弱い、設定調整が必要～`,
                `今日のデータ：${data.todayElement}がMAX、${data.needElement}が必要～`,
                `五行レーダーによると：${data.todayElement}過負荷、${data.needElement}不足～`
            ]
        },
        // 好运势
        goodFortune: {
            zh: [
                `今天数据满格，成功率比平时高${data.percent}%，冲！`,
                `按我的模型，今天适合搞事情，成功率+${data.percent}%~`,
                `统计上看，今天踩雷概率只有${100 - data.percent}%，稳~`
            ],
            en: [
                `Data is maxed today, success rate ${data.percent}% higher than usual - go for it!`,
                `My model says today is great for action, success rate +${data.percent}%~`,
                `Statistically, fail rate is only ${100 - data.percent}% today - solid~`
            ],
            ja: [
                `今日はデータ満タン、成功率がいつもより${data.percent}%高い、行こう！`,
                `私のモデルによると、今日は行動に最適、成功率+${data.percent}%～`,
                `統計的に、今日の失敗率はたった${100 - data.percent}%、安定～`
            ]
        },
        // 差运势
        badFortune: {
            zh: [
                `今天指标偏低，建议静养，刷剧>社交~`,
                `数据显示今天不宜冒险，待机模式最安全~`,
                `按计算，今天踩雷概率较高，低调是optimization~`
            ],
            en: [
                `Metrics are low today, rest mode recommended - Netflix > socializing~`,
                `Data suggests no risks today, standby mode is safest~`,
                `Calculations show higher fail rate today - low profile is the optimization~`
            ],
            ja: [
                `今日は指標低め、静養推奨、ドラマ鑑賞>社交～`,
                `データによると今日はリスク回避、スタンバイモードが安全～`,
                `計算上、今日は失敗率高め、低姿勢がoptimization～`
            ]
        },
        // 年度总结开场
        yearlyIntro: {
            zh: [
                `2026数据分析：丙午年，火×2，火力值爆表~`,
                `按我的年度模型，2026是个高火力年份~`,
                `统计上看，2026丙午年火气指数达到峰值~`
            ],
            en: [
                `2026 Analysis: Fire Horse Year, Fire×2, heat level maxed~`,
                `My yearly model shows 2026 is a high-fire year~`,
                `Statistically, 2026 Fire Horse Year hits peak fire index~`
            ],
            ja: [
                `2026年データ分析：丙午年、火×2、火力値がMAX～`,
                `私の年間モデルによると、2026年は高火力の年～`,
                `統計的に、2026年丙午年は火のエネルギーがピーク～`
            ]
        }
    };

    const langTemplates = templates[type]?.[lang] || templates[type]?.zh || [];
    if (langTemplates.length === 0) return '';

    return langTemplates[Math.floor(Math.random() * langTemplates.length)];
}

// 默认导出
export default {
    WuxingTips,
    generateWuxingTip,
    generateDailyTip,
    generate2026YearlyTips,
    kittySpeak
};
