/**
 * 易经占卜模块 - 六十四卦
 */


import { NiShiRules } from './core/nishi_rules.js';

const YiJing = {

    // 八卦基础
    bagua: {
        '111': { name: '乾', symbol: '☰', nature: '天' },
        '000': { name: '坤', symbol: '☷', nature: '地' },
        '100': { name: '震', symbol: '☳', nature: '雷' },
        '010': { name: '坎', symbol: '☵', nature: '水' },
        '001': { name: '艮', symbol: '☶', nature: '山' },
        '011': { name: '巽', symbol: '☴', nature: '风' },
        '101': { name: '离', symbol: '☲', nature: '火' },
        '110': { name: '兑', symbol: '☱', nature: '泽' }
    },

    // 六十四卦（上卦+下卦）
    hexagrams: {
        '111111': { name: '乾', title: '乾为天', meaning: '刚健中正，自强不息', advice: '宜积极进取，但需谨慎，勿过于刚强' },
        '000000': { name: '坤', title: '坤为地', meaning: '厚德载物，顺势而为', advice: '宜顺应环境，厚积薄发，以柔克刚' },
        '010001': { name: '屯', title: '水雷屯', meaning: '万事开头难，需坚持', advice: '创业初期困难重重，宜蓄势待发' },
        '100010': { name: '蒙', title: '山水蒙', meaning: '启蒙开智，虚心求教', advice: '宜向智者学习，不耻下问' },
        '010111': { name: '需', title: '水天需', meaning: '等待时机，静观其变', advice: '时机未到，宜耐心等待' },
        '111010': { name: '讼', title: '天水讼', meaning: '争讼之象，和为贵', advice: '宜和解息争，避免诉讼' },
        '000010': { name: '师', title: '地水师', meaning: '统领众人，组织行动', advice: '宜凝聚人心，团队作战' },
        '010000': { name: '比', title: '水地比', meaning: '亲近比邻，合作共赢', advice: '宜寻求合作，广结善缘' },
        '110111': { name: '小畜', title: '风天小畜', meaning: '蓄积力量，小有成就', advice: '宜积少成多，循序渐进' },
        '111011': { name: '履', title: '天泽履', meaning: '小心谨慎，如履薄冰', advice: '宜谨言慎行，避免冒险' },
        '000111': { name: '泰', title: '地天泰', meaning: '天地交泰，万事亨通', advice: '大吉，诸事顺遂' },
        '111000': { name: '否', title: '天地否', meaning: '天地不交，闭塞不通', advice: '宜韬光养晦，等待转机' },
        '111101': { name: '同人', title: '天火同人', meaning: '志同道合，群策群力', advice: '宜联合同好，共谋大事' },
        '101111': { name: '大有', title: '火天大有', meaning: '丰收之象，大有所获', advice: '吉，事业有成' },
        '000100': { name: '谦', title: '地山谦', meaning: '谦虚谨慎，受益无穷', advice: '宜保持谦逊，必有福报' },
        '001000': { name: '豫', title: '雷地豫', meaning: '安乐和顺，顺势而为', advice: '宜未雨绸缪，居安思危' },
        '011001': { name: '随', title: '泽雷随', meaning: '随机应变，因时制宜', advice: '宜顺应潮流，灵活变通' },
        '100110': { name: '蛊', title: '山风蛊', meaning: '整治蛊惑，拨乱反正', advice: '宜改革创新，除旧布新' },
        '000011': { name: '临', title: '地泽临', meaning: '居高临下，统领全局', advice: '宜把握时机，主动出击' },
        '110000': { name: '观', title: '风地观', meaning: '观察审视，洞察全局', advice: '宜冷静观察，再作决定' },
        '101001': { name: '噬嗑', title: '火雷噬嗑', meaning: '刚柔相济，断案决狱', advice: '宜果断行事，扫除障碍' },
        '100101': { name: '贲', title: '山火贲', meaning: '装饰修养，文质彬彬', advice: '宜注重外表，内外兼修' },
        '100000': { name: '剥', title: '山地剥', meaning: '剥落消退，顺其自然', advice: '宜守成待变，切忌冒进' },
        '000001': { name: '复', title: '地雷复', meaning: '一阳来复，否极泰来', advice: '吉，重新开始' },
        '111001': { name: '无妄', title: '天雷无妄', meaning: '诚实守信，无妄之灾', advice: '宜诚信待人，勿存侥幸' },
        '100111': { name: '大畜', title: '山天大畜', meaning: '大蓄积德，厚积薄发', advice: '宜积蓄力量，蓄势待发' },
        '100001': { name: '颐', title: '山雷颐', meaning: '养生之道，慎言养德', advice: '宜注意饮食，修身养性' },
        '011110': { name: '大过', title: '泽风大过', meaning: '大过之象，独立不惧', advice: '宜独立自强，不随波逐流' },
        '010010': { name: '坎', title: '坎为水', meaning: '险难重重，需有信心', advice: '宜沉着应对，化险为夷' },
        '101101': { name: '离', title: '离为火', meaning: '光明磊落，附丽于物', advice: '宜依附正道，行事光明' },
        '011100': { name: '咸', title: '泽山咸', meaning: '感应交流，心心相印', advice: '利于感情，宜主动表达' },
        '001110': { name: '恒', title: '雷风恒', meaning: '恒久坚持，持之以恒', advice: '宜坚持不懈，必有成效' },
        '111100': { name: '遁', title: '天山遁', meaning: '退避三舍，明哲保身', advice: '宜暂时退让，保存实力' },
        '001111': { name: '大壮', title: '雷天大壮', meaning: '刚强壮盛，适可而止', advice: '宜戒骄戒躁，以防过刚' },
        '101000': { name: '晋', title: '火地晋', meaning: '光明上进，步步高升', advice: '吉，事业上升' },
        '000101': { name: '明夷', title: '地火明夷', meaning: '光明受损，韬光养晦', advice: '宜隐藏锋芒，等待时机' },
        '110101': { name: '家人', title: '风火家人', meaning: '家庭和睦，各安其位', advice: '利于家事，宜修身齐家' },
        '101011': { name: '睽', title: '火泽睽', meaning: '乖离背向，求同存异', advice: '宜化解分歧，寻求一致' },
        '010100': { name: '蹇', title: '水山蹇', meaning: '行动艰难，宜守不宜进', advice: '宜静待时机，不可强求' },
        '001010': { name: '解', title: '雷水解', meaning: '解除困难，雨过天晴', advice: '吉，困难将解' },
        '100011': { name: '损', title: '山泽损', meaning: '损己利人，先损后益', advice: '宜适当付出，终有回报' },
        '110001': { name: '益', title: '风雷益', meaning: '利益增进，好运来临', advice: '大吉，事事有益' },
        '011111': { name: '夬', title: '泽天夬', meaning: '决断果敢，刚决柔', advice: '宜当机立断，不可犹豫' },
        '111110': { name: '姤', title: '天风姤', meaning: '邂逅相遇，把握机缘', advice: '宜随缘，不可强求' },
        '011000': { name: '萃', title: '泽地萃', meaning: '聚集汇合，凝聚力量', advice: '宜团结众人，集思广益' },
        '000110': { name: '升', title: '地风升', meaning: '上升进取，步步高升', advice: '吉，事业上升' },
        '011010': { name: '困', title: '泽水困', meaning: '困顿之象，穷则思变', advice: '宜沉着应对，寻求突破' },
        '010110': { name: '井', title: '水风井', meaning: '井养不穷，取之不尽', advice: '宜勤勤恳恳，默默耕耘' },
        '011101': { name: '革', title: '泽火革', meaning: '革故鼎新，变革创新', advice: '宜改革创新，大胆突破' },
        '101110': { name: '鼎', title: '火风鼎', meaning: '鼎新革故，成就大业', advice: '吉，创业有成' },
        '001001': { name: '震', title: '震为雷', meaning: '震动惊恐，有惊无险', advice: '宜冷静应对，化险为夷' },
        '100100': { name: '艮', title: '艮为山', meaning: '止而不进，适可而止', advice: '宜适时休止，不可强进' },
        '110100': { name: '渐', title: '风山渐', meaning: '循序渐进，步步为营', advice: '宜按部就班，稳扎稳打' },
        '001011': { name: '归妹', title: '雷泽归妹', meaning: '姻缘天定，随遇而安', advice: '宜顺其自然，不可强求' },
        '001101': { name: '丰', title: '雷火丰', meaning: '丰盛充实，盛极必衰', advice: '吉但宜谨慎，居安思危' },
        '101100': { name: '旅', title: '火山旅', meaning: '旅途之象，小心谨慎', advice: '宜谨慎行事，不宜冒险' },
        '110110': { name: '巽', title: '巽为风', meaning: '顺风而行，柔顺服从', advice: '宜顺应环境，以柔克刚' },
        '011011': { name: '兑', title: '兑为泽', meaning: '喜悦和乐，口才出众', advice: '吉，利于交际' },
        '110010': { name: '涣', title: '风水涣', meaning: '涣散离散，宜聚不宜散', advice: '宜凝聚人心，加强团结' },
        '010011': { name: '节', title: '水泽节', meaning: '节制适度，过犹不及', advice: '宜适度节制，量入为出' },
        '110011': { name: '中孚', title: '风泽中孚', meaning: '诚信中正，感化万物', advice: '宜诚信待人，以德服人' },
        '001100': { name: '小过', title: '雷山小过', meaning: '小有过失，无伤大雅', advice: '宜谦虚谨慎，适度行事' },
        '010101': { name: '既济', title: '水火既济', meaning: '功成名就，圆满成功', advice: '吉但宜守成，勿骄傲' },
        '101010': { name: '未济', title: '火水未济', meaning: '尚未完成，继续努力', advice: '宜继续努力，善始善终' }
    },

    /**
     * 生成一爻（0或1）
     */
    generateYao() {
        // 模拟抛三枚铜钱
        let sum = 0;
        for (let i = 0; i < 3; i++) {
            sum += Math.random() > 0.5 ? 3 : 2;
        }
        // 6: 老阴(变)→0, 7: 少阳→1, 8: 少阴→0, 9: 老阳(变)→1
        return sum % 2 === 1 ? '1' : '0';
    },

    /**
     * 生成六爻
     */
    generateHexagram() {
        let lines = '';
        for (let i = 0; i < 6; i++) {
            lines += this.generateYao();
        }
        return lines;
    },

    /**
     * 获取卦象信息
     */
    getHexagramInfo(lines) {
        const hexData = this.hexagrams[lines];
        if (!hexData) {
            // 如果找不到精确匹配，返回默认
            return {
                name: '未知',
                title: '卦象',
                meaning: '此卦需详细分析',
                advice: '宜静观其变，顺其自然'
            };
        }

        // 上卦和下卦
        const upperTrigram = lines.substring(3);
        const lowerTrigram = lines.substring(0, 3);

        return {
            ...hexData,
            lines: lines,
            upper: this.bagua[upperTrigram],
            lower: this.bagua[lowerTrigram]
        };
    },

    /**
     * 进行占卜
     */
    divine(question) {
        const lines = this.generateHexagram();
        const info = this.getHexagramInfo(lines);

        return {
            question: question,
            hexagram: info,
            time: new Date().toLocaleString('zh-CN')
        };
    },

    /**
     * [NiShi Standard] 标准化易经占卜接口
     */
    divineStandard(question) {
        // 1. 获取基础计算结果
        const result = this.divine(question);

        // 2. 简易判断吉凶（根据建议词义或硬编码列表，这里简化处理）
        // 实际可以将吉凶判断逻辑放入 hexagrams 数据中
        const advice = result.hexagram.advice || '';
        let level = '平';
        let stars = 3;
        if (advice.includes('吉') || advice.includes('亨通') || advice.includes('成')) {
            level = '吉';
            stars = 4;
            if (advice.includes('大吉')) {
                level = '大吉';
                stars = 5;
            }
        } else if (advice.includes('凶') || advice.includes('难') || advice.includes('险')) {
            level = '凶';
            stars = 2;
        }

        return NiShiRules.createResult({
            source: 'RenJian', // 易经占卜属于人间道（决策）
            pattern: {
                name: result.hexagram.title,
                symbol: `${result.hexagram.upper?.symbol}${result.hexagram.lower?.symbol}`,
                attributes: result.hexagram
            },
            calculation: {
                score: stars * 20,
                balance: '无', // 易经不讲五行平衡，讲阴阳消长
                energy: { '阳爻': result.hexagram.lines.split('1').length - 1, '阴爻': result.hexagram.lines.split('0').length - 1 }
            },
            verdict: {
                level: level,
                stars: stars,
                summary: result.hexagram.meaning
            },
            guidance: {
                // 人间道：行动建议
                action: result.hexagram.advice,
                // 天机道：时机
                timing: '占卜之事，贵在当下行动。',
                // 地脉道：
                adjustment: `卦象由${result.hexagram.upper?.nature}和${result.hexagram.lower?.nature}组成，留意相关象征事物。`
            }
        });
    },

    /**
     * 渲染卦象线条
     */
    renderLines(lines) {
        let html = '<div class="hexagram-lines">';
        const positions = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

        // 从下到上显示
        for (let i = 5; i >= 0; i--) {
            const isYang = lines[i] === '1';
            html += `<div class="yao-line">
                <span class="yao-position">${positions[i]}</span>
                <div class="yao-symbol">
                    ${isYang ?
                    '<span class="yao-solid"></span>' :
                    '<div class="yao-broken"><span></span><span></span></div>'}
                </div>
            </div>`;
        }
        html += '</div>';
        return html;
    },

    /**
     * 渲染结果
     */
    renderResult(result) {
        const { hexagram } = result;

        let html = `
            <div class="hexagram-display">
                <div class="hexagram-symbol">
                    ${hexagram.upper?.symbol || '☰'}${hexagram.lower?.symbol || '☷'}
                </div>
                <div class="hexagram-name">${hexagram.title || hexagram.name}</div>
            </div>
            ${this.renderLines(hexagram.lines)}
            <div class="analysis-card">
                <h4>卦象含义</h4>
                <p>${hexagram.meaning}</p>
            </div>
            <div class="analysis-card">
                <h4>行事建议</h4>
                <p>${hexagram.advice}</p>
            </div>
            <div class="analysis-card">
                <h4>上卦与下卦</h4>
                <p>上卦：${hexagram.upper?.name || '乾'}（${hexagram.upper?.nature || '天'}）</p>
                <p>下卦：${hexagram.lower?.name || '坤'}（${hexagram.lower?.nature || '地'}）</p>
            </div>
        `;

        // 添加点赞分享按钮
        if (typeof ShareUtils !== 'undefined') {
            html += ShareUtils.createActionButtons('yijing');
        }

        return html;
    }
};

window.YiJing = YiJing;

