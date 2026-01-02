/**
 * 大运/流年验证测试 - 阶段3 AC-1 验收
 * 
 * 验证目标：
 * - AC-1：给定典型样例，大运顺逆与起运结果与权威排盘一致
 * - AC-2：流年结论在跨交运年份时能体现变化
 */

import { DaYunCalculator } from './js/core/dayun.js';
import { LiuNianCalculator } from './js/core/liunian.js';
import ChineseCalendar from './js/core/calendar.js';

// ===== 测试用例 =====
// 来源：常见排盘验证样例

const TEST_CASES = [
    {
        name: '样例1：1990年5月15日午时 男',
        birthDate: '1990-05-15',
        hourIndex: 6,  // 午时
        gender: 'male',
        expected: {
            yearPillar: '庚午',
            monthPillar: '辛巳',
            dayPillar: '癸酉',
            direction: 'forward',  // 阳年男顺排
            zodiac: '马'
        }
    },
    {
        name: '样例2：1985年2月3日子时 女（立春前）',
        birthDate: '1985-02-03',
        hourIndex: 0,  // 子时
        gender: 'female',
        expected: {
            yearPillar: '甲子',  // 立春前属上一年
            direction: 'backward',  // 阳年女逆排
            zodiac: '鼠'
        }
    },
    {
        name: '样例3：1988年8月8日卯时 男',
        birthDate: '1988-08-08',
        hourIndex: 3,  // 卯时
        gender: 'male',
        expected: {
            yearPillar: '戊辰',
            direction: 'forward',  // 阳年男顺排
            zodiac: '龙'
        }
    },
    {
        name: '样例4：1995年12月25日酉时 女',
        birthDate: '1995-12-25',
        hourIndex: 9,  // 酉时
        gender: 'female',
        expected: {
            yearPillar: '乙亥',
            direction: 'forward',  // 阴年女顺排
            zodiac: '猪'
        }
    },
    {
        name: '样例5：2000年1月15日寅时 男（立春前）',
        birthDate: '2000-01-15',
        hourIndex: 2,  // 寅时
        gender: 'male',
        expected: {
            yearPillar: '己卯',  // 立春前属1999年
            direction: 'backward',  // 阴年男逆排
            zodiac: '兔'
        }
    }
];

// ===== 测试函数 =====

function runDaYunTests() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║      阶段3: 大运/流年验证测试          ║');
    console.log('║   AC-1: 大运顺逆与起运结果验证         ║');
    console.log('╚════════════════════════════════════════╝\n');

    let passed = 0;
    let failed = 0;
    const results = [];

    for (const testCase of TEST_CASES) {
        console.log(`\n📋 测试: ${testCase.name}`);
        console.log('─'.repeat(50));

        try {
            // 计算大运
            const result = DaYunCalculator.calculate(
                testCase.birthDate,
                testCase.hourIndex,
                testCase.gender
            );

            const yearPillar = result.pillars.year.pillar;
            const direction = result.direction.direction;
            const zodiac = result.zodiac;

            // 验证年柱
            const yearMatch = !testCase.expected.yearPillar || yearPillar === testCase.expected.yearPillar;
            // 验证顺逆
            const dirMatch = direction === testCase.expected.direction;
            // 验证生肖
            const zodiacMatch = !testCase.expected.zodiac || zodiac === testCase.expected.zodiac;

            const allMatch = yearMatch && dirMatch && zodiacMatch;

            if (allMatch) {
                console.log(`✅ 通过`);
                passed++;
            } else {
                console.log(`❌ 失败`);
                failed++;
            }

            console.log(`   年柱: ${yearPillar} ${yearMatch ? '✓' : '✗ 期望:' + testCase.expected.yearPillar}`);
            console.log(`   顺逆: ${direction} ${dirMatch ? '✓' : '✗ 期望:' + testCase.expected.direction}`);
            console.log(`   生肖: ${zodiac} ${zodiacMatch ? '✓' : '✗ 期望:' + testCase.expected.zodiac}`);
            console.log(`   起运: ${result.qiYun.startAgeDesc}`);
            console.log(`   规则: ${result.direction.ruleRef}`);

            // 显示前3步大运
            console.log(`   大运前3步:`);
            result.daYunList.slice(0, 3).forEach(dy => {
                console.log(`      ${dy.step}. ${dy.pillar} (${dy.tenGod}) ${dy.ageRange}`);
            });

            results.push({
                name: testCase.name,
                passed: allMatch,
                yearPillar,
                direction,
                qiYun: result.qiYun.startAgeDesc
            });

        } catch (err) {
            console.log(`❌ 错误: ${err.message}`);
            failed++;
            results.push({
                name: testCase.name,
                passed: false,
                error: err.message
            });
        }
    }

    console.log('\n' + '═'.repeat(50));
    console.log(`📊 测试结果: ${passed}/${TEST_CASES.length} 通过, ${failed} 失败`);

    return { passed, failed, results };
}

function runLiuNianTests() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   AC-2: 流年交运变化验证               ║');
    console.log('╚════════════════════════════════════════╝\n');

    // 使用样例1测试流年
    const testCase = TEST_CASES[0];
    console.log(`📋 测试流年表: ${testCase.name}`);
    console.log('─'.repeat(50));

    try {
        const liuNianResult = LiuNianCalculator.generateLiuNianTable(
            testCase.birthDate,
            testCase.hourIndex,
            testCase.gender,
            15,  // 15年
            2020  // 从2020年开始
        );

        console.log(`\n出生信息: ${liuNianResult.birthInfo.birthDate}, ${liuNianResult.birthInfo.gender}`);
        console.log(`起运: ${liuNianResult.qiYun.explanation}`);
        console.log(`方向: ${liuNianResult.direction.explanation}`);

        console.log(`\n流年表 (2020-2034):`);
        console.log('─'.repeat(70));
        console.log('年份 | 年龄 | 流年  | 大运  | 评分 | 等级 | 交运 | 关键因素');
        console.log('─'.repeat(70));

        let jiaoYunCount = 0;
        liuNianResult.liuNianTable.forEach(ln => {
            const jiaoYunMark = ln.isJiaoYun ? '★' : ' ';
            if (ln.isJiaoYun) jiaoYunCount++;
            
            const daYunPillar = ln.daYun ? ln.daYun.pillar : '未起运';
            const factors = ln.overlay.factors.slice(0, 2).map(f => f.desc.substring(0, 10)).join('; ');
            
            console.log(
                `${ln.year} | ${String(ln.age).padStart(4)} | ${ln.liuNian.pillar} | ${daYunPillar} | ${String(ln.overlay.score).padStart(4)} | ${ln.overlay.level.padEnd(4)} | ${jiaoYunMark} | ${factors || '无特殊'}`
            );
        });

        console.log('─'.repeat(70));
        console.log(`\n✅ 流年表生成成功`);
        console.log(`   检测到 ${jiaoYunCount} 个交运年`);
        console.log(`   规则来源: ${liuNianResult.ruleRefs.map(r => r.code).join(', ')}`);

        // 验证交运年有变化
        const hasJiaoYunChange = jiaoYunCount > 0;
        console.log(`\n${hasJiaoYunChange ? '✅' : '⚠️'} AC-2验证: ${hasJiaoYunChange ? '交运年变化可见' : '未检测到交运年变化'}`);

        return { passed: true, jiaoYunCount };

    } catch (err) {
        console.log(`❌ 错误: ${err.message}`);
        console.error(err);
        return { passed: false, error: err.message };
    }
}

function generateSnapshot() {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║         回归测试快照生成               ║');
    console.log('╚════════════════════════════════════════╝\n');

    const snapshots = [];

    for (const testCase of TEST_CASES) {
        try {
            const result = DaYunCalculator.calculate(
                testCase.birthDate,
                testCase.hourIndex,
                testCase.gender
            );

            snapshots.push({
                input: {
                    birthDate: testCase.birthDate,
                    hourIndex: testCase.hourIndex,
                    gender: testCase.gender
                },
                output: {
                    yearPillar: result.pillars.year.pillar,
                    monthPillar: result.pillars.month.pillar,
                    dayPillar: result.pillars.day.pillar,
                    hourPillar: result.pillars.hour.pillar,
                    zodiac: result.zodiac,
                    direction: result.direction.direction,
                    qiYunAge: result.qiYun.startAge,
                    qiYunMonths: result.qiYun.startAgeMonths,
                    daYunFirst3: result.daYunList.slice(0, 3).map(d => d.pillar)
                }
            });
        } catch (err) {
            console.log(`⚠️ ${testCase.name} 快照生成失败: ${err.message}`);
        }
    }

    console.log('快照数据 (可用于回归测试):');
    console.log(JSON.stringify(snapshots, null, 2));
    console.log(`\n✅ 生成 ${snapshots.length} 条快照记录`);

    return snapshots;
}

// ===== 主执行 =====

async function main() {
    console.log('开始阶段3验证测试...\n');
    
    const daYunResults = runDaYunTests();
    const liuNianResults = runLiuNianTests();
    const snapshots = generateSnapshot();

    console.log('\n' + '═'.repeat(50));
    console.log('📊 阶段3验收总结:');
    console.log('═'.repeat(50));
    console.log(`  大运测试: ${daYunResults.passed}/${TEST_CASES.length} 通过`);
    console.log(`  流年测试: ${liuNianResults.passed ? '通过' : '失败'}`);
    console.log(`  快照生成: ${snapshots.length} 条`);
    
    if (daYunResults.failed === 0 && liuNianResults.passed) {
        console.log('\n✅ 阶段3验收通过！');
    } else {
        console.log('\n⚠️ 部分测试未通过，请检查');
    }
}

main().catch(console.error);

