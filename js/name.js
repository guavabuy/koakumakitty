/**
 * 姓名分析模块 - 五格剖象法
 */


import { NiShiRules } from './core/nishi_rules.js';

const NameAnalysis = {

    // 常用汉字笔画
    strokeData: {
        '王': 4, '李': 7, '张': 11, '刘': 15, '陈': 16, '杨': 13, '赵': 14, '黄': 12,
        '周': 8, '吴': 7, '徐': 10, '孙': 10, '马': 10, '朱': 6, '胡': 11, '郭': 15,
        '林': 8, '何': 7, '高': 10, '梁': 11, '郑': 19, '罗': 20, '宋': 7, '谢': 17,
        '唐': 10, '韩': 17, '冯': 12, '于': 3, '董': 15, '萧': 18, '程': 12, '曹': 11,
        '明': 8, '伟': 11, '芳': 10, '娜': 10, '秀': 7, '英': 11, '敏': 11, '静': 16,
        '丽': 19, '强': 12, '磊': 15, '军': 9, '洋': 10, '勇': 9, '艳': 24, '杰': 12,
        '华': 14, '飞': 9, '玲': 10, '平': 5, '斌': 12, '萍': 14, '鑫': 24, '鹏': 19,
        '辉': 15, '浩': 11, '梅': 11, '刚': 10, '建': 9, '国': 11, '云': 12, '洁': 16,
        '红': 9, '波': 9, '俊': 9, '海': 11, '琴': 13, '婷': 12, '燕': 16, '霞': 17,
        '玉': 5, '春': 9, '雪': 11, '晓': 16, '雷': 13, '峰': 10, '宏': 7, '志': 7,
        '新': 13, '良': 7, '亮': 9, '东': 8, '光': 6, '成': 7, '中': 4, '正': 5,
        '安': 6, '德': 15, '文': 4, '武': 8, '天': 4, '心': 4, '思': 9, '美': 9,
        '子': 3, '轩': 10, '涵': 12, '航': 10, '晨': 11, '铭': 14, '皓': 12, '嘉': 14,
        '一': 1, '二': 2, '三': 3, '四': 5, '五': 4, '六': 4, '七': 2, '八': 2, '九': 2
    },

    // 数理吉凶（1-81）
    numberLuck: {
        1: { luck: 'good', meaning: '太极之数，万物开泰，利禄亨通' },
        3: { luck: 'good', meaning: '三才之数，天地人和，繁荣昌隆' },
        5: { luck: 'good', meaning: '五行俱权，循环相生，圆通畅达' },
        6: { luck: 'good', meaning: '六爻之数，天赋美德，吉祥安泰' },
        7: { luck: 'good', meaning: '七政之数，吉星照耀，天赋之力' },
        8: { luck: 'good', meaning: '八卦之数，坚毅刚勇，功成名就' },
        11: { luck: 'good', meaning: '旱苗逢雨，繁荣昌盛，挽回家运' },
        13: { luck: 'good', meaning: '春日牡丹，才艺多能，智谋奇略' },
        15: { luck: 'good', meaning: '福寿圆满，兴家聚财，温和雅量' },
        16: { luck: 'good', meaning: '厚重载德，安富尊荣，财官双美' },
        21: { luck: 'good', meaning: '明月中天，独立权威，繁荣富贵' },
        23: { luck: 'good', meaning: '旭日东升，权威旺盛，壮丽壮观' },
        24: { luck: 'good', meaning: '掘藏得金，金钱丰盈，白手成家' },
        31: { luck: 'good', meaning: '春日花开，博得名利，统领众人' },
        32: { luck: 'good', meaning: '侥幸多望，贵人得助，财帛如意' },
        33: { luck: 'good', meaning: '旭日升天，家门隆昌，功名显达' },
        35: { luck: 'good', meaning: '高楼望月，智达通畅，文昌技艺' },
        37: { luck: 'good', meaning: '权威显达，独立活动，天赋幸福' },
        41: { luck: 'good', meaning: '纯阳独秀，德高望重，名利双收' },
        45: { luck: 'good', meaning: '顺风显达，大展鸿图，新生泰和' },
        47: { luck: 'good', meaning: '点石成金，万事如意，祯祥吉庆' },
        48: { luck: 'good', meaning: '智谋兼备，德量荣达，威望成师' },
        52: { luck: 'good', meaning: '卓识达眼，先见之明，成功必至' },
        2: { luck: 'bad', meaning: '两仪之数，进退保守，志望难达' },
        4: { luck: 'bad', meaning: '四象之数，万事慎重，不具营谋' },
        9: { luck: 'bad', meaning: '大成之数，或成或败，难以把握' },
        10: { luck: 'bad', meaning: '终结之数，万事终局，不可上进' },
        12: { luck: 'bad', meaning: '掘井无泉，意志薄弱，企图不力' },
        14: { luck: 'bad', meaning: '破兆之数，孤独遭难，谋事不达' },
        19: { luck: 'bad', meaning: '多难之数，常陷逆境，辛苦重来' },
        20: { luck: 'bad', meaning: '屋下藏金，灾难重重，进退维谷' },
        22: { luck: 'bad', meaning: '秋草逢霜，孤独凋零，百事不如意' },
        34: { luck: 'bad', meaning: '破家之数，灾祸至极，见识不详' },
        36: { luck: 'bad', meaning: '波澜之数，一身孤苦，风浪不息' }
    },

    getStrokeCount(char) {
        return this.strokeData[char] || 10;
    },

    calculateWuge(name) {
        const chars = name.split('');
        const strokes = chars.map(c => this.getStrokeCount(c));
        let tianGe, renGe, diGe, waiGe, zongGe;

        if (chars.length === 2) {
            tianGe = strokes[0] + 1;
            renGe = strokes[0] + strokes[1];
            diGe = strokes[1] + 1;
            waiGe = 2;
            zongGe = strokes[0] + strokes[1];
        } else if (chars.length >= 3) {
            tianGe = strokes[0] + 1;
            renGe = strokes[0] + strokes[1];
            diGe = strokes[1] + strokes[2];
            waiGe = strokes[0] + strokes[2] + 1;
            zongGe = strokes.reduce((a, b) => a + b, 0);
        }

        const normalize = n => n > 81 ? ((n - 1) % 80) + 1 : n;
        return {
            chars, strokes, tianGe: normalize(tianGe), renGe: normalize(renGe),
            diGe: normalize(diGe), waiGe: normalize(waiGe), zongGe: normalize(zongGe)
        };
    },

    getLuck(number) {
        return this.numberLuck[number] || { luck: 'neutral', meaning: '数理平常，中庸之道' };
    },

    analyze(name) {
        if (!name || name.length < 2) return { error: '请输入有效的中文姓名' };
        const wuge = this.calculateWuge(name);
        return {
            name, wuge,
            luck: {
                tian: this.getLuck(wuge.tianGe),
                ren: this.getLuck(wuge.renGe),
                di: this.getLuck(wuge.diGe),
                wai: this.getLuck(wuge.waiGe),
                zong: this.getLuck(wuge.zongGe)
            }
        };
    },

    /**
     * [NiShi Standard] 标准化姓名分析接口
     */
    analyzeStandard(name) {
        // 1. 获取基础计算结果
        const result = this.analyze(name);
        if (result.error) return null;

        // 2. 映射到标准结论
        const { wuge, luck } = result;
        const goodCount = [luck.tian, luck.ren, luck.di, luck.wai, luck.zong].filter(l => l.luck === 'good').length;

        let level = '平';
        let stars = 3;
        if (goodCount >= 4) { level = '大吉'; stars = 5; }
        else if (goodCount >= 2) { level = '吉'; stars = 4; }
        else if (goodCount === 0) { level = '凶'; stars = 2; }

        return NiShiRules.createResult({
            source: 'RenJian', // 姓名属于人间道（决策/辅助）
            pattern: {
                name: `${name} (${wuge.zongGe}画)`,
                symbol: '📝',
                attributes: wuge
            },
            calculation: {
                score: 60 + (goodCount * 8),
                balance: '无', // 姓名学暂不强调平衡，重数理吉凶
                energy: { '吉格': goodCount, '凶格': 5 - goodCount }
            },
            verdict: {
                level: level,
                stars: stars,
                summary: `总格${wuge.zongGe}，${luck.zong.meaning}。`
            },
            guidance: {
                // 人间道：
                action: `人格${wuge.renGe}：${luck.ren.meaning}，宜发挥优势，修身养性。`,
                // 天机道：
                timing: '姓名伴随一生，改名或许能改运，但心态更重要。',
                // 地脉道：
                adjustment: '书写名字时，笔画宜清晰饱满，象征运势通达。'
            }
        });
    },

    renderResult(result) {
        if (result.error) return `<div class="analysis-card"><p>${result.error}</p></div>`;
        const { wuge, luck } = result;
        
        // 检测语言
        const isEn = typeof I18n !== 'undefined' && I18n.isEnglish();
        const isJa = typeof I18n !== 'undefined' && I18n.isJapanese();
        
        const getLuckClass = l => l.luck === 'good' ? 'good' : l.luck === 'bad' ? 'bad' : 'neutral';
        const getLuckText = l => {
            if (isJa) return l.luck === 'good' ? '吉' : l.luck === 'bad' ? '凶' : '平';
            if (isEn) return l.luck === 'good' ? 'Good' : l.luck === 'bad' ? 'Bad' : 'Neutral';
            return l.luck === 'good' ? '吉' : l.luck === 'bad' ? '凶' : '平';
        };
        
        const strokeUnit = isJa ? '画' : isEn ? ' strokes' : '画';

        let html = '<div class="name-display"><div class="name-chars">';
        wuge.chars.forEach((c, i) => {
            html += `<div class="name-char">${c}<span class="stroke-count">${wuge.strokes[i]}${strokeUnit}</span></div>`;
        });
        html += '</div></div>';

        // 五格说明
        html += `<div class="analysis-card">
            <h4>📚 ${isJa ? '五格剖象法とは？' : isEn ? 'What is Wu Ge (Five Grids) Analysis?' : '什么是五格剖象法？'}</h4>
            <p>${isJa ? '五格剖象法は漢字の画数で姓名の吉凶を分析する方法だよ。「天格・人格・地格・外格・総格」の五つの角度から名前のエネルギーを読み解くの～' : isEn ? 'Wu Ge Analysis uses Chinese character stroke counts to analyze name fortune. It reads name energy through five dimensions: 天格 (Tian Ge), 人格 (Ren Ge), 地格 (Di Ge), 外格 (Wai Ge), and 总格 (Zong Ge).' : '五格剖象法是根据汉字笔画数来分析姓名吉凶的方法。通过"天格、人格、地格、外格、总格"五个维度来解读姓名的能量。'}</p>
        </div>`;

        const gn = isJa ? { tian: '天格', ren: '人格', di: '地格', wai: '外格', zong: '総格' } 
                 : { tian: '天格', ren: '人格', di: '地格', wai: '外格', zong: '总格' };
        html += `<div class="wuge-grid">
            <div class="wuge-item"><div class="wuge-name">${gn.tian}</div><div class="wuge-number">${wuge.tianGe}</div><span class="wuge-luck ${getLuckClass(luck.tian)}">${getLuckText(luck.tian)}</span></div>
            <div class="wuge-item"><div class="wuge-name">${gn.ren}</div><div class="wuge-number">${wuge.renGe}</div><span class="wuge-luck ${getLuckClass(luck.ren)}">${getLuckText(luck.ren)}</span></div>
            <div class="wuge-item"><div class="wuge-name">${gn.di}</div><div class="wuge-number">${wuge.diGe}</div><span class="wuge-luck ${getLuckClass(luck.di)}">${getLuckText(luck.di)}</span></div>
            <div class="wuge-item"><div class="wuge-name">${gn.wai}</div><div class="wuge-number">${wuge.waiGe}</div><span class="wuge-luck ${getLuckClass(luck.wai)}">${getLuckText(luck.wai)}</span></div>
            <div class="wuge-item"><div class="wuge-name">${gn.zong}</div><div class="wuge-number">${wuge.zongGe}</div><span class="wuge-luck ${getLuckClass(luck.zong)}">${getLuckText(luck.zong)}</span></div>
        </div>`;

        // 详细的五格解释
        const numLabel = isJa ? '数理' : isEn ? 'Number' : '数理';
        html += `<div class="analysis-card">
            <h4>👤 ${isJa ? '人格分析（主運）' : isEn ? '人格 (Ren Ge) - Main Fortune' : '人格分析（主运）'} - ${numLabel}${wuge.renGe}</h4>
            <p><strong>${isJa ? '人格とは？' : isEn ? 'What is 人格?' : '什么是人格？'}</strong> ${isJa ? '人格は姓名で最も重要な数で、あなたの主な性格と人生の方向性を表すの、まさに「人生のメインテーマ」よ～' : isEn ? '人格 is the most important number in name analysis, representing your main personality and life direction.' : '人格是姓名中最重要的格数，代表你的主要性格和一生的运势走向，就像你的"人生主旋律"。'}</p>
            <p><strong>${isJa ? 'あなたの人格：' : isEn ? 'Your 人格:' : '你的人格：'}</strong> ${luck.ren.meaning}</p>
            <p>💡 ${luck.ren.luck === 'good' ? (isJa ? 'とても良い人格数理よ！仕事運と人間関係にプラスだわ～' : isEn ? 'This is a very good number, beneficial for career and relationships!' : '这是一个很好的人格数理，有利于事业发展和人际关系！') : luck.ren.luck === 'bad' ? (isJa ? 'ちょっと大変かもしれないけど、努力で乗り越えられるわ。運命は自分で決めるものよ！' : isEn ? 'This number may bring some challenges, but effort can overcome them. Remember, destiny is in your hands!' : '这个人格数理可能会带来一些挑战，但通过努力可以克服。记住，命运掌握在自己手中！') : (isJa ? '中性的な人格数理よ、安定した発展は個人の努力次第ね～' : isEn ? 'This is a neutral number. Steady development depends on personal effort.' : '这是一个中性的人格数理，平稳发展，关键看个人努力。')}</p>
        </div>`;

        html += `<div class="analysis-card">
            <h4>🎯 ${isJa ? '総格分析（後運）' : isEn ? '总格 (Zong Ge) - Later Fortune' : '总格分析（后运）'} - ${numLabel}${wuge.zongGe}</h4>
            <p><strong>${isJa ? '総格とは？' : isEn ? 'What is 总格?' : '什么是总格？'}</strong> ${isJa ? '総格は後半生の運勢を表すの、特に48歳以降の人生と、一生の総合的な成果を象徴してるよ～' : isEn ? '总格 represents your fortune in later life, especially after age 48, and symbolizes overall life achievements.' : '总格代表你的后半生运势，尤其是48岁以后的人生走向，也象征你一生的总体成就。'}</p>
            <p><strong>${isJa ? 'あなたの総格：' : isEn ? 'Your 总格:' : '你的总格：'}</strong> ${luck.zong.meaning}</p>
            <p>💡 ${luck.zong.luck === 'good' ? (isJa ? '後運吉祥！若い頃の努力が晩年に実を結ぶわよ～' : isEn ? 'Auspicious later fortune! Your early efforts will pay off in later years!' : '后运吉祥，晚年会比较顺遂，年轻时的努力会在后期得到回报！') : luck.zong.luck === 'bad' ? (isJa ? '後運に波があるかも、早めに老後の計画を立てておいてね～' : isEn ? 'Later fortune may have fluctuations. Plan early for your later years.' : '后运可能有些起伏，建议提早规划，为晚年做好准备。') : (isJa ? '後運は安定してるわ、自然に任せればOK～' : isEn ? 'Stable later fortune. Let things develop naturally.' : '后运平稳，顺其自然发展即可。')}</p>
        </div>`;

        html += `<div class="analysis-card">
            <h4>🌱 ${isJa ? '地格分析（前運）' : isEn ? '地格 (Di Ge) - Early Fortune' : '地格分析（前运）'} - ${numLabel}${wuge.diGe}</h4>
            <p><strong>${isJa ? '地格とは？' : isEn ? 'What is 地格?' : '什么是地格？'}</strong> ${isJa ? '地格は前半生の運勢（36歳まで）を表すの、学業、初期キャリア、恋愛の基礎を含むわよ～' : isEn ? '地格 represents your fortune in early life (before 36), including education, early career, and relationship foundations.' : '地格代表你的前半生运势（36岁前），包括学业、早期事业和感情基础。'}</p>
            <p><strong>${isJa ? 'あなたの地格：' : isEn ? 'Your 地格:' : '你的地格：'}</strong> ${luck.di.meaning}</p>
        </div>`;

        html += `<div class="analysis-card">
            <h4>🤝 ${isJa ? '外格分析（副運）' : isEn ? '外格 (Wai Ge) - Social Fortune' : '外格分析（副运）'} - ${numLabel}${wuge.waiGe}</h4>
            <p><strong>${isJa ? '外格とは？' : isEn ? 'What is 外格?' : '什么是外格？'}</strong> ${isJa ? '外格は人間関係と社会環境を表すの、他人から見たあなたと社交運を反映してるわよ～' : isEn ? '外格 represents your social relationships and environment, reflecting how others see you and your social fortune.' : '外格代表你的人际关系和社会环境，反映别人眼中的你以及你的社交运势。'}</p>
            <p><strong>${isJa ? 'あなたの外格：' : isEn ? 'Your 外格:' : '你的外格：'}</strong> ${luck.wai.meaning}</p>
        </div>`;

        html += `<div class="analysis-card">
            <h4>🏠 ${isJa ? '天格分析（祖運）' : isEn ? '天格 (Tian Ge) - Ancestral Fortune' : '天格分析（祖运）'} - ${numLabel}${wuge.tianGe}</h4>
            <p><strong>${isJa ? '天格とは？' : isEn ? 'What is 天格?' : '什么是天格？'}</strong> ${isJa ? '天格はご先祖様から受け継いだ運勢で、家庭環境と先天的条件に関係してるの。直接運命には影響しないけど、スタートラインに間接的に影響するわ～' : isEn ? '天格 represents the fortune passed down from ancestors, related to family background and innate conditions.' : '天格代表祖先留给你的运势，与你的家族背景和先天条件有关。通常不直接影响命运，但会间接影响你的起点。'}</p>
            <p><strong>${isJa ? 'あなたの天格：' : isEn ? 'Your 天格:' : '你的天格：'}</strong> ${luck.tian.meaning}</p>
            <p>💡 ${isJa ? '天格は姓で決まるから変えられないの、あまり気にしなくていいわよ～' : isEn ? '天格 is determined by surname and cannot be changed, so don\'t worry too much about it.' : '天格是由姓氏决定的，无法改变，因此不必过于在意。'}</p>
        </div>`;

        // 综合建议
        const goodCount = [luck.tian, luck.ren, luck.di, luck.wai, luck.zong].filter(l => l.luck === 'good').length;
        const badCount = [luck.tian, luck.ren, luck.di, luck.wai, luck.zong].filter(l => l.luck === 'bad').length;

        let overallAdvice = '';
        if (goodCount >= 4) {
            overallAdvice = isJa 
                ? `🎉 おめでとう！あなたの姓名五格はとても吉（${goodCount}個の吉格）よ！運勢を後押ししてくれるいい名前だわ～`
                : isEn 
                ? `🎉 Congratulations! Your name's Wu Ge is very auspicious (${goodCount} good grids). This is a great name that brings smooth fortune and aids life development.`
                : `🎉 恭喜！您的姓名五格整体非常吉利（${goodCount}个吉格），是一个很好的名字！这个名字能为您带来顺遂的运势，助力人生发展。`;
        } else if (goodCount >= 2) {
            overallAdvice = isJa
                ? `✨ あなたの姓名五格には${goodCount}個の吉格があるわ、全体的に悪くないわよ。努力が必要な部分もあるけど、運勢は上向きよ～`
                : isEn
                ? `✨ Your name has ${goodCount} good grids, overall quite nice. Some areas need extra effort, but the overall trend is positive.`
                : `✨ 您的姓名五格中有${goodCount}个吉格，整体还不错。有些方面需要自己多加努力，但总体运势是正向的。`;
        } else if (badCount >= 3) {
            overallAdvice = isJa
                ? `💪 注意が必要な格数が${badCount}個あるけど、心配しないで！姓名は参考程度、選択と努力が運命を決めるのよ。ポジティブでいれば何でも可能！`
                : isEn
                ? `💪 Your name has ${badCount} grids that need attention. But remember, names are just reference. Your choices and efforts truly determine destiny. Stay positive, anything is possible!`
                : `💪 您的姓名五格中有${badCount}个需要注意的格数。不过请记住，姓名只是参考，真正决定命运的是你的选择和努力。保持积极心态，一切皆有可能！`;
        } else {
            overallAdvice = isJa
                ? `☯️ あなたの姓名五格は中性的で、特に目立った吉凶はないわ。つまり人生は自分次第！努力と選択が未来を決めるのよ～`
                : isEn
                ? `☯️ Your name's Wu Ge is relatively neutral, with no particularly outstanding good or bad omens. This means your life is in your own hands - effort and choices will determine your future.`
                : `☯️ 您的姓名五格比较中性，没有特别突出的吉凶。这意味着你的人生掌握在自己手中，努力和选择会决定你的未来走向。`;
        }

        html += `<div class="analysis-card">
            <h4>📋 ${isJa ? '総合評価' : isEn ? 'Overall Evaluation' : '综合评价'}</h4>
            <p>${overallAdvice}</p>
            <p>${isJa ? '⚠️ 姓名学は人生の参考程度よ。運命を完全に決めるものじゃないの。心構え・努力・選択が人生のカギよ！' : isEn ? '⚠️ Note: Name analysis is just one dimension of life reference. It cannot fully determine destiny. Mindset, effort, and choices are the keys to life!' : '⚠️ 温馨提示：姓名学只是人生的一个参考维度，不能完全决定命运。心态、努力、选择才是人生的关键！'}</p>
        </div>`;

        // 添加点赞分享按钮
        if (typeof ShareUtils !== 'undefined') {
            html += ShareUtils.createActionButtons('name');
        }

        return html;
    }
};

window.NameAnalysis = NameAnalysis;

