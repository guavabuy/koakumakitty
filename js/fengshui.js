/**
 * 风水分析模块 - 基于倪海厦《地脉道》理论
 * 八宅风水 + 命卦计算
 * 
 * 重要口径说明：
 * - 命卦计算使用命理年（立春换年）
 */

import { NiShiRules } from './core/nishi_rules.js';
import ChineseCalendar from './core/calendar.js';

const FengShui = {
    // 八卦名称
    guaNames: {
        1: '坎', 2: '坤', 3: '震', 4: '巽',

        5: '中', 6: '乾', 7: '兑', 8: '艮', 9: '离'
    },

    // 八卦五行
    guaElements: {
        '坎': '水', '坤': '土', '震': '木', '巽': '木',
        '乾': '金', '兑': '金', '艮': '土', '离': '火'
    },

    // 八卦方位
    guaDirections: {
        '坎': '北', '坤': '西南', '震': '东', '巽': '东南',
        '乾': '西北', '兑': '西', '艮': '东北', '离': '南'
    },

    // 东四命卦
    eastLifeGuas: ['坎', '离', '震', '巽'],

    // 西四命卦
    westLifeGuas: ['乾', '坤', '艮', '兑'],

    // 八宅吉凶方位表 - 每个命卦对应的八个方位吉凶
    // 四吉：生气、天医、延年、伏位
    // 四凶：绝命、五鬼、六煞、祸害
    baZhaiTable: {
        '坎': { // 坎命
            '北': { type: '伏位', luck: 'good', level: 4 },
            '南': { type: '延年', luck: 'good', level: 2 },
            '东': { type: '天医', luck: 'good', level: 3 },
            '西': { type: '祸害', luck: 'bad', level: 4 },
            '东北': { type: '五鬼', luck: 'bad', level: 2 },
            '东南': { type: '生气', luck: 'good', level: 1 },
            '西南': { type: '绝命', luck: 'bad', level: 1 },
            '西北': { type: '六煞', luck: 'bad', level: 3 }
        },
        '离': { // 离命
            '南': { type: '伏位', luck: 'good', level: 4 },
            '北': { type: '延年', luck: 'good', level: 2 },
            '东': { type: '生气', luck: 'good', level: 1 },
            '西': { type: '六煞', luck: 'bad', level: 3 },
            '东北': { type: '绝命', luck: 'bad', level: 1 },
            '东南': { type: '天医', luck: 'good', level: 3 },
            '西南': { type: '五鬼', luck: 'bad', level: 2 },
            '西北': { type: '祸害', luck: 'bad', level: 4 }
        },
        '震': { // 震命
            '东': { type: '伏位', luck: 'good', level: 4 },
            '西': { type: '绝命', luck: 'bad', level: 1 },
            '南': { type: '生气', luck: 'good', level: 1 },
            '北': { type: '天医', luck: 'good', level: 3 },
            '东北': { type: '六煞', luck: 'bad', level: 3 },
            '东南': { type: '延年', luck: 'good', level: 2 },
            '西南': { type: '祸害', luck: 'bad', level: 4 },
            '西北': { type: '五鬼', luck: 'bad', level: 2 }
        },
        '巽': { // 巽命
            '东南': { type: '伏位', luck: 'good', level: 4 },
            '西北': { type: '绝命', luck: 'bad', level: 1 },
            '南': { type: '天医', luck: 'good', level: 3 },
            '北': { type: '生气', luck: 'good', level: 1 },
            '东': { type: '延年', luck: 'good', level: 2 },
            '西': { type: '五鬼', luck: 'bad', level: 2 },
            '东北': { type: '祸害', luck: 'bad', level: 4 },
            '西南': { type: '六煞', luck: 'bad', level: 3 }
        },
        '乾': { // 乾命
            '西北': { type: '伏位', luck: 'good', level: 4 },
            '东南': { type: '绝命', luck: 'bad', level: 1 },
            '西': { type: '延年', luck: 'good', level: 2 },
            '东': { type: '五鬼', luck: 'bad', level: 2 },
            '西南': { type: '生气', luck: 'good', level: 1 },
            '东北': { type: '天医', luck: 'good', level: 3 },
            '南': { type: '六煞', luck: 'bad', level: 3 },
            '北': { type: '祸害', luck: 'bad', level: 4 }
        },
        '坤': { // 坤命
            '西南': { type: '伏位', luck: 'good', level: 4 },
            '东北': { type: '延年', luck: 'good', level: 2 },
            '西': { type: '生气', luck: 'good', level: 1 },
            '东': { type: '祸害', luck: 'bad', level: 4 },
            '西北': { type: '天医', luck: 'good', level: 3 },
            '东南': { type: '五鬼', luck: 'bad', level: 2 },
            '南': { type: '绝命', luck: 'bad', level: 1 },
            '北': { type: '六煞', luck: 'bad', level: 3 }
        },
        '艮': { // 艮命
            '东北': { type: '伏位', luck: 'good', level: 4 },
            '西南': { type: '延年', luck: 'good', level: 2 },
            '西北': { type: '生气', luck: 'good', level: 1 },
            '东南': { type: '祸害', luck: 'bad', level: 4 },
            '西': { type: '天医', luck: 'good', level: 3 },
            '东': { type: '六煞', luck: 'bad', level: 3 },
            '南': { type: '五鬼', luck: 'bad', level: 2 },
            '北': { type: '绝命', luck: 'bad', level: 1 }
        },
        '兑': { // 兑命
            '西': { type: '伏位', luck: 'good', level: 4 },
            '东': { type: '绝命', luck: 'bad', level: 1 },
            '西北': { type: '延年', luck: 'good', level: 2 },
            '东南': { type: '六煞', luck: 'bad', level: 3 },
            '西南': { type: '天医', luck: 'good', level: 3 },
            '东北': { type: '生气', luck: 'good', level: 1 },
            '南': { type: '祸害', luck: 'bad', level: 4 },
            '北': { type: '五鬼', luck: 'bad', level: 2 }
        }
    },

    // 吉凶方位详解
    positionMeanings: {
        '生气': {
            meaning: '贪狼星，五行属木',
            description: '生气是八宅中的第一大吉星，主旺丁旺财、生机勃勃。此方位能带来活力、创造力和事业发展的机会。',
            suitable: '适合作为：大门、主卧室、客厅、办公室',
            effects: '🌟 有利于：事业发展、财运提升、身体健康、人丁兴旺',
            advice: '尽量将重要的房间安排在此方位，可催旺整体运势。'
        },
        '天医': {
            meaning: '巨门星，五行属土',
            description: '天医是八宅中的第二大吉星，主健康长寿、贵人相助。此方位有利于身心健康和人际关系。',
            suitable: '适合作为：卧室、厨房、餐厅',
            effects: '💊 有利于：身体健康、疾病康复、贵人运、偏财运',
            advice: '体弱多病者可将卧室设在此方位，有助于恢复健康。'
        },
        '延年': {
            meaning: '武曲星，五行属金',
            description: '延年是八宅中的第三大吉星，主感情和谐、婚姻美满。此方位有利于人际关系和感情运势。',
            suitable: '适合作为：主卧室、婚房',
            effects: '💕 有利于：婚姻和谐、感情稳定、长寿健康、人缘运',
            advice: '单身者可将卧室设在此方位，有助于找到合适的伴侣。'
        },
        '伏位': {
            meaning: '左辅星，五行属木',
            description: '伏位是八宅中的第四吉星，主平稳安定、小吉小利。此方位代表稳定和守成。',
            suitable: '适合作为：卧室、书房',
            effects: '☯️ 有利于：稳定发展、内心平静、学业进步',
            advice: '性格急躁者可将卧室设在此方位，有助于心态平和。'
        },
        '绝命': {
            meaning: '破军星，五行属金',
            description: '绝命是八宅中的第一大凶星，主破财损丁、意外灾祸。此方位容易招致各种不顺。',
            suitable: '⚠️ 不宜作为：大门、卧室、厨房',
            effects: '❌ 可能导致：破财、疾病、意外、官非口舌',
            advice: '此方位可用作卫生间、储藏室，或摆放五行化解物品。',
            remedy: '化解方法：可放置铜器、金属物品或六帝钱来泄耗凶气。'
        },
        '五鬼': {
            meaning: '廉贞星，五行属火',
            description: '五鬼是八宅中的第二大凶星，主火灾盗贼、口舌是非。此方位容易招惹小人和意外。',
            suitable: '⚠️ 不宜作为：大门、卧室、厨房（特别忌火）',
            effects: '❌ 可能导致：火灾、盗贼、小人暗算、精神不安',
            advice: '此方位可用作卫生间，以水克火来化解凶气。',
            remedy: '化解方法：可放置水养植物或鱼缸来化解火煞。'
        },
        '六煞': {
            meaning: '文曲星，五行属水',
            description: '六煞是八宅中的第三凶星，主桃花劫、感情纠纷。此方位容易引发感情问题。',
            suitable: '⚠️ 不宜作为：主卧室、办公室',
            effects: '❌ 可能导致：烂桃花、婚姻不和、精神压力、失眠',
            advice: '此方位可用作客房或书房，避免长期居住。',
            remedy: '化解方法：可在此方位摆放粉色水晶或和合符来化解。'
        },
        '祸害': {
            meaning: '禄存星，五行属土',
            description: '祸害是八宅中的第四凶星，主口舌是非、小病小灾。此方位影响相对较轻。',
            suitable: '⚠️ 不宜作为：大门、主卧室',
            effects: '❌ 可能导致：口舌纠纷、小疾病、工作不顺、心情烦躁',
            advice: '此方位可用作储藏室或次卧，影响较小。',
            remedy: '化解方法：可摆放绿色植物来化解土煞。'
        }
    },

    // 命卦详解
    guaPersonality: {
        '坎': {
            element: '水',
            direction: '北',
            lifeType: '东四命',
            personality: '坎卦之人如水，性格聪明机智，善于变通，适应能力强。外表冷静，内心丰富，有深度思考的能力。',
            career: '适合从事：科研、咨询、贸易、物流、IT、文化传媒等与"流通"相关的行业。',
            wealth: '财运方面善于发现商机，适合投资理财，但要避免过于冒险。',
            health: '注意肾脏、泌尿系统和耳朵的健康，多喝水，避免过度劳累。',
            relationship: '感情上比较内敛，建议多主动表达，避免让对方猜测心思。'
        },
        '坤': {
            element: '土',
            direction: '西南',
            lifeType: '西四命',
            personality: '坤卦之人如大地，性格厚道包容，有母性般的慈爱，重视家庭，为人踏实可靠。',
            career: '适合从事：房地产、农业、教育、人事、服务业等与"培育"相关的行业。',
            wealth: '财运稳健，适合长期投资和积累，不宜投机。',
            health: '注意脾胃消化系统，饮食要规律，避免过度操劳。',
            relationship: '感情上付出很多，是很好的家庭支柱，但要注意自己的需求。'
        },
        '震': {
            element: '木',
            direction: '东',
            lifeType: '东四命',
            personality: '震卦之人如雷，性格积极主动，有冲劲和魄力，敢为人先，是天生的领导者。',
            career: '适合从事：创业、管理、运动、军警、销售等需要魄力和行动力的行业。',
            wealth: '财运起伏较大，适合主动开拓，创业成功几率高。',
            health: '注意肝胆和筋骨的健康，多运动但避免过度劳累。',
            relationship: '感情上热情主动，但有时过于急躁，需要学会耐心倾听。'
        },
        '巽': {
            element: '木',
            direction: '东南',
            lifeType: '东四命',
            personality: '巽卦之人如风，性格温和谦逊，善于沟通协调，人缘极好，处事圆融。',
            career: '适合从事：贸易、外交、公关、设计、教育等需要沟通和创意的行业。',
            wealth: '财运较好，多有贵人相助，适合与人合作经营。',
            health: '注意呼吸系统和神经系统，保持心情舒畅。',
            relationship: '感情上善解人意，是很好的伴侣，但有时过于优柔寡断。'
        },
        '乾': {
            element: '金',
            direction: '西北',
            lifeType: '西四命',
            personality: '乾卦之人如天，性格刚健自强，有领导气质，做事有原则，责任心强。',
            career: '适合从事：政府、金融、法律、高管等需要权威和决策力的行业。',
            wealth: '财运亨通，多有贵人扶持，适合大格局的投资。',
            health: '注意头部、肺部和骨骼的健康，避免过度劳心。',
            relationship: '感情上比较强势，需要学会适当柔软和妥协。'
        },
        '兑': {
            element: '金',
            direction: '西',
            lifeType: '西四命',
            personality: '兑卦之人如泽，性格开朗喜悦，善于表达，口才好，社交能力强。',
            career: '适合从事：演艺、销售、培训、餐饮、娱乐等需要表达和社交的行业。',
            wealth: '财运活跃，多有偏财运，但要注意守财。',
            health: '注意口腔、咽喉和皮肤的健康，少吃辛辣刺激。',
            relationship: '感情上很有魅力，桃花运旺，但要注意专一。'
        },
        '艮': {
            element: '土',
            direction: '东北',
            lifeType: '西四命',
            personality: '艮卦之人如山，性格稳重踏实，意志坚定，做事有始有终，值得信赖。',
            career: '适合从事：科研、技术、建筑、收藏、文化等需要专注和积累的行业。',
            wealth: '财运稳定，适合长期积累，晚年富足。',
            health: '注意手指、关节和脊椎的健康，多运动保持灵活。',
            relationship: '感情上比较慢热，但一旦认定就非常专一忠诚。'
        },
        '离': {
            element: '火',
            direction: '南',
            lifeType: '东四命',
            personality: '离卦之人如火，性格热情开朗，有感染力，创意丰富，追求美好事物。',
            career: '适合从事：艺术、设计、传媒、能源、美容等与"光明"相关的行业。',
            wealth: '财运起伏，多有名气财，适合发挥创意才能。',
            health: '注意心脏、眼睛和血液循环的健康，避免过度兴奋。',
            relationship: '感情上热情似火，但有时来得快去得也快，需要学会持久。'
        }
    },

    // 坐向名称转换
    orientationMap: {
        '坐北朝南': { sitting: '北', facing: '南', sittingGua: '坎', facingGua: '离' },
        '坐南朝北': { sitting: '南', facing: '北', sittingGua: '离', facingGua: '坎' },
        '坐东朝西': { sitting: '东', facing: '西', sittingGua: '震', facingGua: '兑' },
        '坐西朝东': { sitting: '西', facing: '东', sittingGua: '兑', facingGua: '震' },
        '坐东北朝西南': { sitting: '东北', facing: '西南', sittingGua: '艮', facingGua: '坤' },
        '坐西南朝东北': { sitting: '西南', facing: '东北', sittingGua: '坤', facingGua: '艮' },
        '坐东南朝西北': { sitting: '东南', facing: '西北', sittingGua: '巽', facingGua: '乾' },
        '坐西北朝东南': { sitting: '西北', facing: '东南', sittingGua: '乾', facingGua: '巽' }
    },

    /**
     * 计算命卦
     * 使用命理年（立春换年）
     * @param {number} mingLiYear - 命理年份（立春换年后的年份）
     * @param {string} gender - 性别 'male' 或 'female'
     * @returns {object} 命卦信息
     */
    calculateMingGua(mingLiYear, gender) {
        const lastTwoDigits = mingLiYear % 100;
        let guaNumber;

        if (gender === 'male') {
            // 男命：(100 - 年份后两位) ÷ 9 取余数
            guaNumber = (100 - lastTwoDigits) % 9;
            if (guaNumber === 0) guaNumber = 9;
            // 5变坤
            if (guaNumber === 5) guaNumber = 2;
        } else {
            // 女命：(年份后两位 - 4) ÷ 9 取余数
            guaNumber = (lastTwoDigits - 4) % 9;
            if (guaNumber <= 0) guaNumber += 9;
            // 5变艮
            if (guaNumber === 5) guaNumber = 8;
        }

        const guaName = this.guaNames[guaNumber];
        const isEastLife = this.eastLifeGuas.includes(guaName);

        return {
            number: guaNumber,
            name: guaName,
            lifeType: isEastLife ? '东四命' : '西四命',
            element: this.guaElements[guaName],
            direction: this.guaDirections[guaName],
            personality: this.guaPersonality[guaName]
        };
    },
    
    /**
     * 根据出生日期计算命卦（自动使用命理年）
     * @param {Date|string} birthDate - 出生日期
     * @param {string} gender - 性别
     * @returns {object} 命卦信息
     */
    calculateMingGuaFromDate(birthDate, gender) {
        const date = new Date(birthDate);
        const mingLiYear = ChineseCalendar.getMingLiYear(date);
        return this.calculateMingGua(mingLiYear, gender);
    },

    /**
     * 获取八方位吉凶
     */
    getDirectionsAnalysis(mingGua) {
        const table = this.baZhaiTable[mingGua.name];
        const directions = [];

        for (let dir in table) {
            const info = table[dir];
            directions.push({
                direction: dir,
                type: info.type,
                luck: info.luck,
                level: info.level,
                details: this.positionMeanings[info.type]
            });
        }

        // 按吉凶和等级排序
        directions.sort((a, b) => {
            if (a.luck !== b.luck) {
                return a.luck === 'good' ? -1 : 1;
            }
            return a.level - b.level;
        });

        return directions;
    },

    /**
     * 分析房屋与命卦的配合
     */
    analyzeHouseCompatibility(mingGua, orientation) {
        const orientationInfo = this.orientationMap[orientation];
        if (!orientationInfo) return null;

        const facingDirection = orientationInfo.facing;
        const sittingDirection = orientationInfo.sitting;

        // 获取大门朝向的吉凶
        const table = this.baZhaiTable[mingGua.name];
        const facingInfo = table[facingDirection];
        const sittingInfo = table[sittingDirection];

        // 判断宅命是否相配
        const isEastLifeGua = this.eastLifeGuas.includes(mingGua.name);
        const isEastHouse = ['坎', '离', '震', '巽'].includes(orientationInfo.sittingGua);
        const isCompatible = isEastLifeGua === isEastHouse;

        return {
            orientation: orientation,
            facing: facingDirection,
            sitting: sittingDirection,
            facingGua: orientationInfo.facingGua,
            sittingGua: orientationInfo.sittingGua,
            facingLuck: facingInfo,
            sittingLuck: sittingInfo,
            isCompatible: isCompatible,
            houseType: isEastHouse ? '东四宅' : '西四宅',
            compatibility: isCompatible ?
                '宅命相配，整体运势较好！' :
                '宅命不配，建议通过布局调整来化解。'
        };
    },

    /**
     * 生成房间布局建议
     */
    generateRoomAdvice(mingGua, directionsAnalysis) {
        const goodDirs = directionsAnalysis.filter(d => d.luck === 'good');
        const badDirs = directionsAnalysis.filter(d => d.luck === 'bad');

        // 找最佳方位
        const shengQi = directionsAnalysis.find(d => d.type === '生气');
        const tianYi = directionsAnalysis.find(d => d.type === '天医');
        const yanNian = directionsAnalysis.find(d => d.type === '延年');
        const fuWei = directionsAnalysis.find(d => d.type === '伏位');
        const jueMing = directionsAnalysis.find(d => d.type === '绝命');
        const wuGui = directionsAnalysis.find(d => d.type === '五鬼');

        return {
            masterBedroom: {
                title: '🛏️ 主卧室',
                bestDirection: yanNian?.direction || shengQi?.direction,
                reason: `最佳位置在${yanNian?.direction || shengQi?.direction}方（${yanNian ? '延年位，利感情和谐' : '生气位，利财运健康'}）`,
                alternative: tianYi?.direction ? `次选${tianYi.direction}方（天医位，利健康）` : ''
            },
            study: {
                title: '📚 书房/办公室',
                bestDirection: fuWei?.direction || tianYi?.direction,
                reason: `最佳位置在${fuWei?.direction || tianYi?.direction}方（${fuWei ? '伏位，利学业和静心' : '天医位，利思考'}）`,
                alternative: shengQi?.direction ? `次选${shengQi.direction}方（生气位，利事业）` : ''
            },
            kitchen: {
                title: '🍳 厨房',
                bestDirection: tianYi?.direction,
                reason: `最佳位置在${tianYi?.direction}方（天医位，有利于家人健康）`,
                note: '厨房五行属火，避免放在凶位，特别是五鬼位'
            },
            bathroom: {
                title: '🚿 卫生间',
                bestDirection: jueMing?.direction || wuGui?.direction,
                reason: `适合位置在${jueMing?.direction || wuGui?.direction}方（凶位放卫生间可泄凶气）`,
                note: '卫生间是排污之所，放在凶位可压制煞气'
            },
            livingRoom: {
                title: '🛋️ 客厅',
                bestDirection: shengQi?.direction,
                reason: `最佳位置在${shengQi?.direction}方（生气位，招财旺运）`,
                alternative: yanNian?.direction ? `次选${yanNian.direction}方（延年位，利人缘）` : ''
            },
            entrance: {
                title: '🚪 大门',
                bestDirection: shengQi?.direction || yanNian?.direction,
                reason: `大门宜开在吉方，最佳为${shengQi?.direction}方（生气位）或${yanNian?.direction}方（延年位）`,
                warning: `避免开在${jueMing?.direction}方（绝命位）和${wuGui?.direction}方（五鬼位）`
            }
        };
    },

    /**
     * 完整分析
     * @param {number} mingLiYear - 命理年份（应使用立春换年后的年份）
     * @param {string} gender - 性别
     * @param {string} orientation - 房屋朝向
     */
    analyze(mingLiYear, gender, orientation) {
        const mingGua = this.calculateMingGua(mingLiYear, gender);
        const directionsAnalysis = this.getDirectionsAnalysis(mingGua);
        const houseAnalysis = this.analyzeHouseCompatibility(mingGua, orientation);
        const roomAdvice = this.generateRoomAdvice(mingGua, directionsAnalysis);

        return {
            mingGua,
            directionsAnalysis,
            houseAnalysis,
            roomAdvice,
            year: mingLiYear,
            gender: gender === 'male' ? '男' : '女'
        };
    },
    
    /**
     * 从出生日期完整分析（自动使用命理年）
     * @param {Date|string} birthDate - 出生日期
     * @param {string} gender - 性别
     * @param {string} orientation - 房屋朝向
     */
    analyzeFromDate(birthDate, gender, orientation) {
        const date = new Date(birthDate);
        const mingLiYear = ChineseCalendar.getMingLiYear(date);
        return this.analyze(mingLiYear, gender, orientation);
    },

    /**
     * [NiShi Standard] 标准化风水计算接口
     */
    analyzeStandard(year, gender, orientation) {
        // 1. 获取基础计算结果
        const result = this.analyze(year, gender, orientation);

        // 2. 映射到标准结论
        const isCompatible = result.houseAnalysis ? result.houseAnalysis.isCompatible : true;

        return NiShiRules.createResult({
            source: 'DiMai', // 风水属于地脉道
            pattern: {
                name: `${result.mingGua.name}命`,
                symbol: this.getGuaSymbol(result.mingGua.name),
                attributes: result.mingGua
            },
            calculation: {
                score: isCompatible ? 88 : 60,
                balance: isCompatible ? '宅命相配' : '宅命不配',
                energy: { '吉方': 4, '凶方': 4 }
            },
            verdict: {
                level: isCompatible ? '吉' : '平',
                stars: isCompatible ? 4 : 3,
                summary: result.houseAnalysis ? result.houseAnalysis.compatibility : '命卦分析完成'
            },
            guidance: {
                // 地脉道：布局核心建议
                adjustment: `床头宜朝${result.roomAdvice.masterBedroom.bestDirection}，书桌宜朝${result.roomAdvice.study.bestDirection}`,
                // 人间道：居住心态
                action: '顺应环境磁场，保持室内明亮整洁。',
                // 天机道：时间
                timing: '择良辰吉日进行布局调整效果更佳。'
            }
        });
    },

    /**
     * 户型图分析 - 基于命卦方位提供详细布局建议
     */
    analyzeFloorplan(directionsAnalysis, roomAdvice) {
        // 获取吉凶方位
        const goodDirs = directionsAnalysis.filter(d => d.luck === 'good');
        const badDirs = directionsAnalysis.filter(d => d.luck === 'bad');

        // 找到各类型方位用于建议
        const shengQi = directionsAnalysis.find(d => d.type === '生气');
        const tianYi = directionsAnalysis.find(d => d.type === '天医');
        const yanNian = directionsAnalysis.find(d => d.type === '延年');
        const fuWei = directionsAnalysis.find(d => d.type === '伏位');
        const jueMing = directionsAnalysis.find(d => d.type === '绝命');
        const wuGui = directionsAnalysis.find(d => d.type === '五鬼');
        const liuSha = directionsAnalysis.find(d => d.type === '六煞');
        const huoHai = directionsAnalysis.find(d => d.type === '祸害');

        // 生成详细的户型分析报告
        const analysis = {
            summary: this.generateFloorplanSummary(goodDirs, badDirs),
            rooms: [
                {
                    name: '客厅',
                    icon: '🛋️',
                    idealDirection: shengQi?.direction || '生气方',
                    analysis: `客厅是家中气场汇聚之处，最宜设在${shengQi?.direction || '生气'}方位。`,
                    goodTips: [
                        `✅ 客厅位于${shengQi?.direction}方（生气位）最佳，可增旺财运和贵人运`,
                        `✅ 次选${yanNian?.direction}方（延年位），利于家庭和谐`
                    ],
                    badTips: [
                        `❌ 避免客厅位于${jueMing?.direction}方（绝命位）`,
                        `❌ 若在凶位，可通过放置大叶绿植或水族箱化解`
                    ],
                    suggestion: '在客厅的吉方位摆放沙发主座，避开凶方位放置重要家具。'
                },
                {
                    name: '主卧室',
                    icon: '🛏️',
                    idealDirection: yanNian?.direction || '延年方',
                    analysis: `主卧室影响夫妻感情和健康，最宜设在${yanNian?.direction || '延年'}方位。`,
                    goodTips: [
                        `✅ 位于${yanNian?.direction}方（延年位）最佳，利感情和谐、婚姻美满`,
                        `✅ 位于${tianYi?.direction}方（天医位）也很好，利健康长寿`
                    ],
                    badTips: [
                        `❌ 避免位于${liuSha?.direction}方（六煞位），易引发感情问题`,
                        `❌ 避免位于${wuGui?.direction}方（五鬼位），影响睡眠质量`
                    ],
                    suggestion: '床头宜朝向吉方，脚不要对门。如果卧室在凶位，可在床头放置粉晶或五帝钱化解。'
                },
                {
                    name: '厨房',
                    icon: '🍳',
                    idealDirection: tianYi?.direction || '天医方',
                    analysis: `厨房主管一家之健康和财禄，宜设在${tianYi?.direction || '天医'}方位。`,
                    goodTips: [
                        `✅ 位于${tianYi?.direction}方（天医位）最佳，有利家人健康`,
                        `✅ 厨房属火，放在吉位可为家中增添阳气`
                    ],
                    badTips: [
                        `❌ 绝对避免位于${wuGui?.direction}方（五鬼位），五鬼属火会加重火煞`,
                        `❌ 避免厨房位于房屋正中央（穿心煞）`
                    ],
                    suggestion: '灶台最好背靠实墙，避免悬空。炉灶不宜正对水槽（水火相冲）。'
                },
                {
                    name: '卫生间',
                    icon: '🚿',
                    idealDirection: jueMing?.direction || '凶方',
                    analysis: `卫生间属污秽之地，宜设在凶位以泄凶气。`,
                    goodTips: [
                        `✅ 位于${jueMing?.direction}方（绝命位）最佳，以凶制凶`,
                        `✅ 位于${wuGui?.direction}方（五鬼位）也可，水克火可泄凶`
                    ],
                    badTips: [
                        `❌ 避免位于${shengQi?.direction}方（生气位），会压制好运`,
                        `❌ 避免卫生间门正对大门或卧室门`
                    ],
                    suggestion: '卫生间门常关，可放置绿植吸收湿气。若卫生间在吉位，可在门口挂风水帘化解。'
                },
                {
                    name: '书房/办公室',
                    icon: '📚',
                    idealDirection: fuWei?.direction || '伏位方',
                    analysis: `书房主管学业和事业，宜设在${fuWei?.direction || '伏位'}方位利于静心读书。`,
                    goodTips: [
                        `✅ 位于${fuWei?.direction}方（伏位）最佳，利学业和思考`,
                        `✅ 位于${tianYi?.direction}方（天医位）也好，头脑清明`
                    ],
                    badTips: [
                        `❌ 避免位于${huoHai?.direction}方（祸害位），易心烦意乱`,
                        `❌ 书桌背后需有实墙（有靠山），忌背门而坐`
                    ],
                    suggestion: '书桌面向门口或窗户，采光良好。可在书桌上放置文昌塔或四支毛笔增强文昌运。'
                },
                {
                    name: '大门/玄关',
                    icon: '🚪',
                    idealDirection: shengQi?.direction || '吉方',
                    analysis: `大门是纳气之口，朝向吉方可引入吉气。`,
                    goodTips: [
                        `✅ 门开在${shengQi?.direction}方（生气位）最旺财运`,
                        `✅ 门开在${yanNian?.direction}方（延年位）利人缘和感情`
                    ],
                    badTips: [
                        `❌ 门开在${jueMing?.direction}方（绝命位）易破财招灾`,
                        `❌ 大门不宜正对楼梯、电梯或长廊（直冲）`
                    ],
                    suggestion: '玄关宜设置隔断或屏风，避免穿堂风。可在玄关放置吉祥物或绿植改善气场。'
                }
            ],
            generalTips: [
                '💡 如果某房间已在凶位且无法更换，可通过放置化解物品来改善',
                '💡 保持房屋整洁明亮，流通的空气和充足的光线是好风水的基础',
                '💡 根据户型实际情况，优先确保主卧室和客厅在吉位',
                '💡 在无法改变房间位置时，可调整家具摆放方向来趋吉避凶'
            ]
        };

        return analysis;
    },

    /**
     * 生成户型总结
     */
    generateFloorplanSummary(goodDirs, badDirs) {
        const bestDir = goodDirs.length > 0 ? goodDirs[0] : null;
        const worstDir = badDirs.length > 0 ? badDirs[0] : null;

        let summary = '🐱 Kitty看过你的户型啦~\n\n';

        if (bestDir) {
            summary += `✨ 最旺方位是「${bestDir.direction}方」（${bestDir.type}），可以把客厅或主卧放这里~\n`;
        }

        if (worstDir) {
            summary += `⚠️ 最要注意的是「${worstDir.direction}方」（${worstDir.type}），适合放卫生间或储藏室~\n`;
        }

        summary += '\n下面是每个房间的详细分析，快看看你家布局对不对~';

        return summary;
    },

    /**
     * 渲染结果
     */
    renderResult(result) {
        const { mingGua, directionsAnalysis, houseAnalysis, roomAdvice } = result;
        
        // 检测语言
        const isEn = typeof I18n !== 'undefined' && I18n.isEnglish();
        const isJa = typeof I18n !== 'undefined' && I18n.isJapanese();
        
        // 命系翻译
        const lifeTypeEn = mingGua.lifeType === '东四命' ? 'East Group' : 'West Group';
        const lifeTypeJa = mingGua.lifeType === '东四命' ? '東四命' : '西四命';

        let html = '';

        // 命卦信息
        html += `
            <div class="analysis-card fengshui-card">
                <h4>🔮 ${isJa ? `あなたの命卦：${mingGua.name}卦（${lifeTypeJa}）` : isEn ? `Your Ming Gua: ${mingGua.name} Gua (${lifeTypeEn})` : `你的命卦：${mingGua.name}卦（${mingGua.lifeType}）`}</h4>
                <div class="mingua-info">
                    <div class="mingua-symbol">${this.getGuaSymbol(mingGua.name)}</div>
                    <div class="mingua-details">
                        <p><strong>${isJa ? '五行属性：' : isEn ? 'Element:' : '五行属性：'}</strong>${mingGua.element}</p>
                        <p><strong>${isJa ? '本命方位：' : isEn ? 'Direction:' : '本命方位：'}</strong>${mingGua.direction}</p>
                        <p><strong>${isJa ? '命系分類：' : isEn ? 'Group:' : '命系分类：'}</strong>${isJa ? lifeTypeJa : isEn ? lifeTypeEn : mingGua.lifeType}</p>
                    </div>
                </div>
            </div>
        `;

        // 命卦性格详解
        html += `
            <div class="analysis-card">
                <h4>📖 ${isJa ? `${mingGua.name}卦の性格詳解` : isEn ? `${mingGua.name} Gua Personality` : `${mingGua.name}卦性格详解`}</h4>
                <p>${mingGua.personality.personality}</p>
                <p><strong>💼 ${isJa ? '仕事アドバイス：' : isEn ? 'Career:' : '事业建议：'}</strong>${mingGua.personality.career}</p>
                <p><strong>💰 ${isJa ? '金運ヒント：' : isEn ? 'Wealth:' : '财运提示：'}</strong>${mingGua.personality.wealth}</p>
                <p><strong>❤️ ${isJa ? '恋愛アドバイス：' : isEn ? 'Love:' : '感情建议：'}</strong>${mingGua.personality.relationship}</p>
                <p><strong>🏥 ${isJa ? '健康注意：' : isEn ? 'Health:' : '健康注意：'}</strong>${mingGua.personality.health}</p>
            </div>
        `;

        // 房屋分析
        if (houseAnalysis) {
            html += `
                <div class="analysis-card ${houseAnalysis.isCompatible ? 'compatible' : 'incompatible'}">
                    <h4>🏠 房屋与命卦配合分析</h4>
                    <p><strong>房屋坐向：</strong>${houseAnalysis.orientation}</p>
                    <p><strong>坐山：</strong>${houseAnalysis.sitting}（${houseAnalysis.sittingGua}卦）</p>
                    <p><strong>朝向：</strong>${houseAnalysis.facing}（${houseAnalysis.facingGua}卦）</p>
                    <p><strong>房屋类型：</strong>${houseAnalysis.houseType}</p>
                    <p><strong>配合度：</strong>${houseAnalysis.isCompatible ? '✅ 宅命相配' : '⚠️ 宅命不配'}</p>
                    <p class="compatibility-note">${houseAnalysis.compatibility}</p>
                    ${!houseAnalysis.isCompatible ? `
                        <div class="remedy-box">
                            <strong>🔧 化解建议：</strong>
                            <ul>
                                <li>将主卧室设在吉方位</li>
                                <li>大门处可放置与命卦相生的五行物品</li>
                                <li>凶方位可用卫生间或储藏室来压制</li>
                                <li>在凶位摆放化解物品（详见各方位建议）</li>
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        // 八方位吉凶图
        html += `
            <div class="analysis-card">
                <h4>🧭 八方位吉凶分布</h4>
                <p style="text-align:center;color:#aaa;font-size:0.9em;">（绿色为吉方，红色为凶方）</p>
                <div class="bagua-grid">
                    ${this.renderBaguaGrid(directionsAnalysis)}
                </div>
            </div>
        `;

        // 四吉方位详解
        html += `<div class="analysis-card"><h4>✨ 四吉方位详解</h4>`;
        directionsAnalysis.filter(d => d.luck === 'good').forEach(d => {
            html += `
                <div class="direction-item good">
                    <div class="direction-header">
                        <span class="direction-name">${d.direction}方</span>
                        <span class="direction-type">${d.type}</span>
                    </div>
                    <p>${d.details.description}</p>
                    <p><strong>${d.details.suitable}</strong></p>
                    <p>${d.details.effects}</p>
                </div>
            `;
        });
        html += `</div>`;

        // 四凶方位详解
        html += `<div class="analysis-card"><h4>⚠️ 四凶方位详解</h4>`;
        directionsAnalysis.filter(d => d.luck === 'bad').forEach(d => {
            html += `
                <div class="direction-item bad">
                    <div class="direction-header">
                        <span class="direction-name">${d.direction}方</span>
                        <span class="direction-type">${d.type}</span>
                    </div>
                    <p>${d.details.description}</p>
                    <p><strong>${d.details.suitable}</strong></p>
                    <p>${d.details.effects}</p>
                    <p class="remedy">${d.details.remedy || ''}</p>
                </div>
            `;
        });
        html += `</div>`;

        // 房间布局建议 - 只在没有上传户型图时显示（上传户型图后会有更详细的分析）
        if (!result.floorplanAnalysis) {
            html += `<div class="analysis-card"><h4>🏡 房间布局建议</h4>`;
            for (let room in roomAdvice) {
                const advice = roomAdvice[room];
                html += `
                    <div class="room-advice">
                        <h5>${advice.title}</h5>
                        <p><strong>最佳方位：</strong>${advice.bestDirection}方</p>
                        <p>${advice.reason}</p>
                        ${advice.alternative ? `<p class="alternative">${advice.alternative}</p>` : ''}
                        ${advice.note ? `<p class="note">💡 ${advice.note}</p>` : ''}
                        ${advice.warning ? `<p class="warning">⚠️ ${advice.warning}</p>` : ''}
                    </div>
                `;
            }
            html += `</div>`;
        }

        // 如果有户型图分析，显示详细分析
        if (result.floorplanAnalysis) {
            html += `
                <div class="floorplan-analysis">
                    <h4>📐 户型图详细分析</h4>
                    ${result.floorplanImage ? `<img src="${result.floorplanImage}" alt="户型图" class="floorplan-uploaded-img">` : ''}
                    <p style="white-space: pre-line; margin-bottom: 1rem;">${result.floorplanAnalysis.summary}</p>
            `;

            // 每个房间的详细分析
            result.floorplanAnalysis.rooms.forEach(room => {
                html += `
                    <div class="room-item">
                        <h5>${room.icon} ${room.name}（理想方位：${room.idealDirection}）</h5>
                        <p>${room.analysis}</p>
                        <div class="good-tip">
                            ${room.goodTips.map(tip => `<p>${tip}</p>`).join('')}
                        </div>
                        <div class="bad-tip">
                            ${room.badTips.map(tip => `<p>${tip}</p>`).join('')}
                        </div>
                        <div class="suggestion">
                            💡 ${room.suggestion}
                        </div>
                    </div>
                `;
            });

            // 通用提示
            html += `
                <div style="margin-top: 1rem; padding: 1rem; background: #fff; border-radius: 12px;">
                    <h5 style="color: #A78BFA; margin-bottom: 0.5rem;">🐱 Kitty的温馨小贴士</h5>
                    <ul style="margin: 0; padding-left: 1.5rem;">
                        ${result.floorplanAnalysis.generalTips.map(tip => `<li style="margin-bottom: 0.25rem;">${tip}</li>`).join('')}
                    </ul>
                </div>
            </div>`;
        }

        // 温馨提示
        html += `
            <div class="analysis-card">
                <h4>📝 ${isJa ? 'ワンポイントアドバイス' : isEn ? 'Tips' : '温馨提示'}</h4>
                <p>${isJa ? '風水は補助的な学問で、住環境を調和させることが目的よ。いい風水は運を後押しするけど、一番大事なのは自分の努力とポジティブな姿勢よ！' : isEn ? 'Feng Shui is a supplementary study aimed at creating harmonious living environments. Good Feng Shui enhances fortune, but personal effort and positive attitude matter most!' : '风水是一门辅助性的学问，旨在让居住环境更加和谐舒适。好风水可以锦上添花，但最重要的还是个人的努力和积极的心态！'}</p>
                <p>${isJa ? '今の間取りを完全に変えられなくても、こんな方法で改善できるわよ：' : isEn ? 'If you cannot fully adjust your current layout, try these improvements:' : '如果现有房屋布局无法完全按照建议调整，可以通过以下方式改善：'}</p>
                <ul>
                    <li>${isJa ? '吉方位に重要な家具（ベッド、デスク、ソファなど）を置く' : isEn ? 'Place important furniture (bed, desk, sofa) in auspicious positions' : '在吉位摆放重要家具（床、书桌、沙发等）'}</li>
                    <li>${isJa ? '凶方位には化解アイテムを置くか、滞在時間を減らす' : isEn ? 'Use remedy items in unfavorable areas or reduce time spent there' : '在凶位使用化解物品或减少停留时间'}</li>
                    <li>${isJa ? '家を清潔で明るく保てば、気の流れもスムーズになるわ' : isEn ? 'Keep your home clean and bright for smooth energy flow' : '保持房屋整洁明亮，气场自然顺畅'}</li>
                    <li>${isJa ? '吉方位で過ごす時間を増やして、ポジティブなエネルギーを受け取って' : isEn ? 'Spend more time in auspicious directions to absorb positive energy' : '多在吉方位活动，接收正能量'}</li>
                </ul>
            </div>
        `;

        // 添加点赞分享按钮
        if (typeof ShareUtils !== 'undefined') {
            html += ShareUtils.createActionButtons('fengshui');
        }

        return html;
    },

    /**
     * 获取卦象符号
     */
    getGuaSymbol(guaName) {
        const symbols = {
            '乾': '☰', '坤': '☷', '震': '☳', '巽': '☴',
            '坎': '☵', '离': '☲', '艮': '☶', '兑': '☱'
        };
        return symbols[guaName] || '';
    },

    /**
     * 渲染八卦方位图
     */
    renderBaguaGrid(directionsAnalysis) {
        const positions = {
            '东南': 'se', '南': 's', '西南': 'sw',
            '东': 'e', '西': 'w',
            '东北': 'ne', '北': 'n', '西北': 'nw'
        };

        let gridHtml = '<div class="bagua-container">';

        // 按九宫格位置排列
        const order = ['东南', '南', '西南', '东', null, '西', '东北', '北', '西北'];

        order.forEach((dir, index) => {
            if (dir === null) {
                gridHtml += `<div class="bagua-cell center">中宫</div>`;
            } else {
                const info = directionsAnalysis.find(d => d.direction === dir);
                const luckClass = info?.luck === 'good' ? 'good' : 'bad';
                gridHtml += `
                    <div class="bagua-cell ${luckClass}">
                        <div class="cell-direction">${dir}</div>
                        <div class="cell-type">${info?.type || ''}</div>
                    </div>
                `;
            }
        });

        gridHtml += '</div>';
        return gridHtml;
    }
};

window.FengShui = FengShui;

