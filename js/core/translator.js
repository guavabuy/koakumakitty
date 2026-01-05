/**
 * 统一翻译模块
 * 整合所有翻译函数，支持中/英/日三语
 */

import {
    TEN_GODS_EN,
    TEN_GODS_JA,
    ZODIAC_EN,
    ZODIAC_JA,
    ELEMENT_EN,
    ELEMENT_JA
} from './constants.js';

// ===== 语言检测 =====

/**
 * 获取当前语言
 * @returns {'zh' | 'en' | 'ja'}
 */
export function getCurrentLang() {
    if (typeof I18n !== 'undefined') {
        if (I18n.isEnglish()) return 'en';
        if (I18n.isJapanese()) return 'ja';
    }
    return 'zh';
}

export function isEnglish() {
    return getCurrentLang() === 'en';
}

export function isJapanese() {
    return getCurrentLang() === 'ja';
}

// ===== 十神翻译 =====

const TEN_GODS_MEANING_EN = {
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

const TEN_GODS_MEANING_JA = {
    '比肩': '競争と協力が共存～粘り強さが大事だよ！',
    '劫财': '財運が揺れるかも…出費に気をつけて～',
    '食神': '創造力爆発！アーティスティックな才能が輝く～',
    '伤官': '鋭いウィットが出る…言葉には気をつけてね～',
    '偏印': 'アクティブな思考～研究向きだよ！',
    '正印': '学業や仕事で貴人のサポートあり～',
    '偏官': 'プレッシャーが来る…ストレスをモチベに変えて！',
    '正官': 'キャリア順調に上昇～昇進のチャンスあり！',
    '偏财': '思わぬ財運あり！投資は賢くね～',
    '正财': '安定収入～お金が入ってくるよ！'
};

export function translateTenGod(godName, lang = getCurrentLang()) {
    if (lang === 'en') return TEN_GODS_EN[godName] || godName;
    if (lang === 'ja') return TEN_GODS_JA[godName] || godName;
    return godName;
}

export function translateTenGodMeaning(godName, lang = getCurrentLang()) {
    if (lang === 'en') return TEN_GODS_MEANING_EN[godName] || '';
    if (lang === 'ja') return TEN_GODS_MEANING_JA[godName] || '';
    return '';
}

// ===== 生肖翻译 =====

export function translateZodiac(zodiac, lang = getCurrentLang()) {
    if (lang === 'en') return ZODIAC_EN[zodiac] || zodiac;
    if (lang === 'ja') return ZODIAC_JA[zodiac] || zodiac;
    return zodiac;
}

// ===== 五行翻译 =====

export function translateElement(element, lang = getCurrentLang()) {
    if (lang === 'en') return ELEMENT_EN[element] || element;
    if (lang === 'ja') return ELEMENT_JA[element] || element;
    return element;
}

// ===== 太岁关系翻译 =====

const TAISUI_RELATION_EN = {
    '冲太岁': 'Clash with Tai Sui',
    '害太岁': 'Harm with Tai Sui',
    '三合贵人': 'Triple Harmony - Benefactor',
    '相破': 'Break',
    '平稳': 'Neutral',
    '六合吉': 'Six Harmony - Auspicious',
    '本命年': 'Birth Year (Ben Ming Nian)'
};

const TAISUI_RELATION_JA = {
    '冲太岁': '太歳と衝突',
    '害太岁': '太歳と害',
    '三合贵人': '三合（貴人あり）',
    '相破': '破',
    '平稳': '平穏',
    '六合吉': '六合吉',
    '本命年': '本命年'
};

const TAISUI_DESC_EN = {
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

const TAISUI_DESC_JA = {
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

export function translateTaiSuiRelation(taiSui, lang = getCurrentLang()) {
    if (lang === 'en') {
        return {
            relation: TAISUI_RELATION_EN[taiSui.relation] || taiSui.relation,
            desc: TAISUI_DESC_EN[taiSui.desc] || taiSui.desc
        };
    }
    if (lang === 'ja') {
        return {
            relation: TAISUI_RELATION_JA[taiSui.relation] || taiSui.relation,
            desc: TAISUI_DESC_JA[taiSui.desc] || taiSui.desc
        };
    }
    return taiSui;
}

// ===== 运势建议翻译 =====

const ADVICE_TRANSLATIONS = {
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

const LUCKY_TIPS_EN = {
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

export function translateAdvice(advice, lang = getCurrentLang()) {
    if (lang === 'en') {
        return ADVICE_TRANSLATIONS[advice] || advice;
    }
    // TODO: Add Japanese translations
    return advice;
}

export function translateAdvices(advices, lang = getCurrentLang()) {
    return advices.map(a => translateAdvice(a, lang)).join('<br>');
}

export function translateLuckyTip(tip, lang = getCurrentLang()) {
    if (lang === 'en') {
        return LUCKY_TIPS_EN[tip] || tip;
    }
    return tip;
}

export function translateLuckyTips(tips, lang = getCurrentLang()) {
    return tips.map(t => translateLuckyTip(t, lang)).join('<br>');
}

// ===== 解读标题翻译 =====

const INTERP_TITLES = {
    en: {
        '🎯 日主分析': '🎯 Day Master Analysis',
        '⚖️ 五行平衡': '⚖️ Five Elements Balance',
        '💡 开运建议': '💡 Lucky Tips',
        '✨ 八字格局': '✨ BaZi Pattern',
        '🔮 十神分析': '🔮 Ten Gods Analysis'
    },
    ja: {
        '🎯 日主分析': '🎯 日主分析',
        '⚖️ 五行平衡': '⚖️ 五行バランス',
        '💡 开运建议': '💡 開運アドバイス',
        '✨ 八字格局': '✨ 八字格局',
        '🔮 十神分析': '🔮 十神分析'
    }
};

export function translateInterpTitle(title, lang = getCurrentLang()) {
    if (lang === 'en') return INTERP_TITLES.en[title] || title;
    if (lang === 'ja') return INTERP_TITLES.ja[title] || title;
    return title;
}

// ===== 日主解读翻译 =====

const DAY_MASTER_CONTENT = {
    en: {
        '甲木日主，如参天大树': 'Day Master 甲 Wood - Like a towering tree',
        '乙木日主，如花草藤蔓': 'Day Master 乙 Wood - Like flowers and vines',
        '丙火日主，如太阳光芒': 'Day Master 丙 Fire - Like the blazing sun',
        '丁火日主，如灯烛微光': 'Day Master 丁 Fire - Like candlelight',
        '戊土日主，如高山厚土': 'Day Master 戊 Earth - Like mountains and plains',
        '己土日主，如田园沃土': 'Day Master 己 Earth - Like fertile farmland',
        '庚金日主，如刀剑锐利': 'Day Master 庚 Metal - Like sharp blades',
        '辛金日主，如珠玉珍贵': 'Day Master 辛 Metal - Like precious gems',
        '壬水日主，如江河奔涌': 'Day Master 壬 Water - Like rushing rivers',
        '癸水日主，如雨露滋润': 'Day Master 癸 Water - Like gentle rain',
        '性格正直、有领导力': 'Upright character, leadership qualities',
        '性格温柔、适应力强': 'Gentle nature, highly adaptable',
        '性格开朗、热情大方': 'Cheerful, warm and generous',
        '性格细腻、有艺术天分': 'Delicate nature, artistic talents',
        '性格稳重、诚实守信': 'Steady character, honest and trustworthy',
        '性格温和、勤劳朴实': 'Gentle nature, hardworking and practical',
        '性格刚毅、果断有力': 'Strong-willed, decisive and powerful',
        '性格细腻、高雅有品': 'Refined nature, elegant taste',
        '性格豁达、思维活跃': 'Open-minded, active thinker',
        '性格聪慧、心思细密': 'Intelligent, meticulous mind'
    },
    ja: {
        '甲木日主，如参天大树': '甲木日主～大木のようにどっしり！',
        '乙木日主，如花草藤蔓': '乙木日主～花や草のようにしなやか！',
        '丙火日主，如太阳光芒': '丙火日主～太陽のように輝く！',
        '丁火日主，如灯烛微光': '丁火日主～ロウソクのように優しい光！',
        '戊土日主，如高山厚土': '戊土日主～山のように頼もしい！',
        '己土日主，如田园沃土': '己土日主～肥沃な大地のよう！',
        '庚金日主，如刀剑锐利': '庚金日主～刀のように鋭い！',
        '辛金日主，如珠玉珍贵': '辛金日主～宝石のように貴重！',
        '壬水日主，如江河奔涌': '壬水日主～大河のように勢いがある！',
        '癸水日主，如雨露滋润': '癸水日主～雨露のように潤いを与える！'
    }
};

const ELEMENT_ANALYSIS = {
    en: {
        '木多：思维活跃': 'Wood abundant: Active thinking',
        '木少：需增加灵活性': 'Wood lacking: Need more flexibility',
        '火多：热情洋溢': 'Fire abundant: Full of passion',
        '火少：需增加动力': 'Fire lacking: Need more motivation',
        '土多：稳重踏实': 'Earth abundant: Steady and grounded',
        '土少：需增加稳定性': 'Earth lacking: Need more stability',
        '金多：果断有力': 'Metal abundant: Decisive and strong',
        '金少：需增加决断力': 'Metal lacking: Need more decisiveness',
        '水多：聪慧灵动': 'Water abundant: Smart and agile',
        '水少：需增加智慧': 'Water lacking: Need more wisdom',
        '五行平衡，运势和谐': 'Five elements balanced, fortune harmonious'
    }
};

export function translateInterpContent(content, lang = getCurrentLang()) {
    if (lang === 'zh') return content;

    const translations = lang === 'en'
        ? { ...DAY_MASTER_CONTENT.en, ...ELEMENT_ANALYSIS.en }
        : DAY_MASTER_CONTENT.ja || {};

    let result = content;
    for (const [zh, translated] of Object.entries(translations)) {
        result = result.replace(zh, translated);
    }
    return result;
}

// ===== 大运信息翻译 =====

const DAYUN_INFO = {
    en: {
        '顺排': 'Forward',
        '逆排': 'Backward',
        '阳年男命': 'Yang year male',
        '阴年女命': 'Yin year female',
        '阳年女命': 'Yang year female',
        '阴年男命': 'Yin year male',
        '岁起运': ' years old starts luck cycle'
    },
    ja: {
        '顺排': '順行',
        '逆排': '逆行',
        '阳年男命': '陽年男命',
        '阴年女命': '陰年女命',
        '阳年女命': '陽年女命',
        '阴年男命': '陰年男命',
        '岁起运': '歳から大運開始'
    }
};

export function translateDaYunInfo(text, lang = getCurrentLang()) {
    if (lang === 'zh') return text;

    const translations = lang === 'en' ? DAYUN_INFO.en : DAYUN_INFO.ja;
    let result = text;
    for (const [zh, translated] of Object.entries(translations)) {
        result = result.replace(zh, translated);
    }
    return result;
}

// ===== 通用 UI 文本 =====

const UI_TEXT = {
    en: {
        '年柱': 'Year',
        '月柱': 'Month',
        '日柱': 'Day',
        '时柱': 'Hour',
        '个': '',
        '起运信息：': 'Start Age:',
        '大运方向：': 'Direction:',
        '规则来源：': 'Source:',
        '当前': 'Now',
        '第': 'Cycle ',
        '步': '',
        '运': ''
    },
    ja: {
        '年柱': '年柱',
        '月柱': '月柱',
        '日柱': '日柱',
        '时柱': '時柱',
        '个': '個',
        '起运信息：': '起運情報：',
        '大运方向：': '大運方向：',
        '规则来源：': '規則出典：',
        '当前': '現在',
        '第': '第',
        '步': '運',
        '运': ''
    }
};

export function translateUI(text, lang = getCurrentLang()) {
    if (lang === 'zh') return text;
    const translations = lang === 'en' ? UI_TEXT.en : UI_TEXT.ja;
    return translations[text] || text;
}

// ===== 默认导出 =====

export default {
    getCurrentLang,
    isEnglish,
    isJapanese,
    translateTenGod,
    translateTenGodMeaning,
    translateZodiac,
    translateElement,
    translateTaiSuiRelation,
    translateAdvice,
    translateAdvices,
    translateLuckyTip,
    translateLuckyTips,
    translateInterpTitle,
    translateInterpContent,
    translateDaYunInfo,
    translateUI
};
