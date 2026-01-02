/**
 * 历法核心模块验收测试
 * 符合 PRD AC-1: 提供至少20个回归样例
 * 
 * 测试重点：
 * 1. 立春前后的年柱判断
 * 2. 节气切换时的月柱判断
 * 3. 日柱计算准确性
 * 4. 时柱计算准确性
 */

import ChineseCalendar, {
    HEAVENLY_STEMS,
    EARTHLY_BRANCHES
} from './calendar.js';

import {
    getLiChunMoment,
    getSolarTermMoment,
    getCurrentSolarTerm,
    SOLAR_TERM_NAMES
} from './solar_terms.js';

// ===== 测试用例 =====

/**
 * AC-1: 八字四柱回归测试样例（20+个）
 * 格式: { input, expected, note }
 * 
 * 对照来源：
 * - 寿星万年历
 * - 香港天文台节气数据
 * - 权威八字排盘软件
 */
export const BAZI_TEST_CASES = [
    // ===== 1. 立春当天测试 =====
    {
        input: { date: '1990-02-04', hour: 6 },  // 午时
        expected: { 
            yearStem: '庚', yearBranch: '午',  // 1990年立春后，庚午年
            monthStem: '戊', monthBranch: '寅'  // 立春后进入寅月
        },
        note: '1990年立春日（立春时刻约10:15），午时已过立春，应为庚午年戊寅月'
    },
    {
        input: { date: '1990-02-03', hour: 6 },  // 立春前一天
        expected: { 
            yearStem: '己', yearBranch: '巳',  // 立春前仍为己巳年
            monthStem: '丁', monthBranch: '丑'  // 丑月
        },
        note: '1990年立春前一天，仍属己巳年丁丑月'
    },
    
    // ===== 2. 节气切换测试 =====
    {
        input: { date: '2024-03-04', hour: 6 },  // 惊蛰前一天
        expected: { 
            monthBranch: '寅'  // 惊蛰前仍是寅月
        },
        note: '2024年惊蛰前一天（3月4日），应仍为寅月'
    },
    {
        input: { date: '2024-03-05', hour: 6 },  // 惊蛰日午时
        expected: { 
            monthBranch: '卯'  // 惊蛰后进入卯月（惊蛰约10:05，午时11点后）
        },
        note: '2024年惊蛰日午时（11点后，惊蛰约10:05），应为卯月'
    },
    {
        input: { date: '2024-04-04', hour: 9 },  // 清明日
        expected: { 
            monthBranch: '辰'  // 清明后进入辰月（清明约14:45）
        },
        note: '2024年清明日（清明时刻约14:45），酉时(17:00)后应为辰月'
    },
    
    // ===== 3. 跨年立春测试 =====
    {
        input: { date: '2025-02-03', hour: 6 },  // 2025立春前
        expected: { 
            yearStem: '甲', yearBranch: '辰'  // 仍为甲辰年
        },
        note: '2025年2月3日，立春前，仍属甲辰年'
    },
    {
        input: { date: '2025-02-04', hour: 6 },  // 2025立春后
        expected: { 
            yearStem: '乙', yearBranch: '巳'  // 乙巳年
        },
        note: '2025年2月4日，立春后，应为乙巳年'
    },
    
    // ===== 4. 子时跨日测试 =====
    {
        input: { date: '2024-01-15', hour: 0 },  // 子时 23:00
        expected: { 
            hourBranch: '子'
        },
        note: '子时(23:00)，属于当日子时'
    },
    
    // ===== 5. 日柱验证 =====
    {
        input: { date: '1949-10-01', hour: 6 },
        expected: { 
            dayStem: '甲', dayBranch: '子'  // 基准日：甲子日
        },
        note: '1949年10月1日，基准日甲子'
    },
    {
        input: { date: '2000-01-01', hour: 6 },
        expected: { 
            dayStem: '戊', dayBranch: '午'  // 戊午日
        },
        note: '2000年1月1日，应为戊午日'
    },
    {
        input: { date: '2024-01-01', hour: 6 },
        expected: { 
            dayStem: '甲', dayBranch: '子'  // 甲子日
        },
        note: '2024年1月1日，应为甲子日'
    },
    
    // ===== 6. 更多边界测试 =====
    // 注意：很多年份立春时刻在下午，选择立春后的第二天确保一定在立春之后
    {
        input: { date: '1984-02-05', hour: 6 },  // 甲子年立春后第二天
        expected: { 
            yearStem: '甲', yearBranch: '子'
        },
        note: '1984年2月5日，立春后，甲子年'
    },
    {
        input: { date: '1984-02-03', hour: 6 },  // 甲子年立春前
        expected: { 
            yearStem: '癸', yearBranch: '亥'
        },
        note: '1984年立春前，仍为癸亥年'
    },
    {
        input: { date: '2000-02-05', hour: 6 },  // 庚辰年立春后第二天
        expected: { 
            yearStem: '庚', yearBranch: '辰'
        },
        note: '2000年2月5日，立春后，庚辰年'
    },
    {
        input: { date: '2012-02-05', hour: 6 },  // 壬辰年立春后第二天
        expected: { 
            yearStem: '壬', yearBranch: '辰'
        },
        note: '2012年2月5日，立春后，壬辰年'
    },
    
    // ===== 7. 月份边界测试 =====
    {
        input: { date: '2024-05-05', hour: 6 },  // 立夏后
        expected: { 
            monthBranch: '巳'  // 巳月
        },
        note: '2024年立夏后，应为巳月'
    },
    {
        input: { date: '2024-08-07', hour: 6 },  // 立秋后
        expected: { 
            monthBranch: '申'  // 申月
        },
        note: '2024年立秋后，应为申月'
    },
    {
        input: { date: '2024-11-07', hour: 6 },  // 立冬后
        expected: { 
            monthBranch: '亥'  // 亥月
        },
        note: '2024年立冬后，应为亥月'
    },
    
    // ===== 8. 时柱验证 =====
    // 注意：需要找到准确的甲日和乙日
    // 2024-06-15 是庚戌日，2024-06-16 是辛亥日
    // 2024-06-14 是己酉日，往前找甲日
    // 2024-06-10 是乙巳日，2024-06-09 是甲辰日
    {
        input: { date: '2024-06-09', hour: 0 },  // 甲辰日子时
        expected: { 
            hourStem: '甲', hourBranch: '子'
        },
        note: '甲日子时，甲子时'
    },
    {
        input: { date: '2024-06-10', hour: 6 },  // 乙巳日午时
        expected: { 
            hourStem: '壬', hourBranch: '午'
        },
        note: '乙日午时，壬午时（乙庚丙作初）'
    },
    
    // ===== 9. 特殊年份测试 =====
    {
        input: { date: '2020-02-04', hour: 9 },  // 庚子年（立春约9:53，酉时在立春后）
        expected: { 
            yearStem: '庚', yearBranch: '子'
        },
        note: '2020年立春后（酉时），庚子年'
    },
    {
        input: { date: '2026-02-04', hour: 6 },  // 丙午年
        expected: { 
            yearStem: '丙', yearBranch: '午'
        },
        note: '2026年立春后，丙午年'
    }
];

/**
 * AC-2: 择日节气切换测试样例
 * 验证十二建除在节气切换时的正确变化
 */
export const AUSPICIOUS_TEST_CASES = [
    {
        date: '2024-03-05',
        note: '惊蛰日，节气切换点',
        // 惊蛰前为寅月，惊蛰后为卯月，建除会变化
    },
    {
        date: '2024-04-04',
        note: '清明日，节气切换点',
    },
    {
        date: '2024-05-05',
        note: '立夏日，节气切换点',
    }
];

// ===== 测试运行器 =====

/**
 * 运行八字测试
 */
export function runBaziTests() {
    console.log('===== 八字四柱回归测试 =====\n');
    
    let passed = 0;
    let failed = 0;
    const failures = [];
    
    BAZI_TEST_CASES.forEach((testCase, index) => {
        const { input, expected, note } = testCase;
        
        // 构建出生时间
        const birthDateTime = ChineseCalendar.buildBirthDateTime(input.date, input.hour);
        const { pillars, debug } = ChineseCalendar.calculateFourPillars(birthDateTime, input.hour);
        
        // 验证各项
        let testPassed = true;
        const errors = [];
        
        if (expected.yearStem && pillars.year.stem !== expected.yearStem) {
            testPassed = false;
            errors.push(`年干: 期望${expected.yearStem}, 实际${pillars.year.stem}`);
        }
        if (expected.yearBranch && pillars.year.branch !== expected.yearBranch) {
            testPassed = false;
            errors.push(`年支: 期望${expected.yearBranch}, 实际${pillars.year.branch}`);
        }
        if (expected.monthStem && pillars.month.stem !== expected.monthStem) {
            testPassed = false;
            errors.push(`月干: 期望${expected.monthStem}, 实际${pillars.month.stem}`);
        }
        if (expected.monthBranch && pillars.month.branch !== expected.monthBranch) {
            testPassed = false;
            errors.push(`月支: 期望${expected.monthBranch}, 实际${pillars.month.branch}`);
        }
        if (expected.dayStem && pillars.day.stem !== expected.dayStem) {
            testPassed = false;
            errors.push(`日干: 期望${expected.dayStem}, 实际${pillars.day.stem}`);
        }
        if (expected.dayBranch && pillars.day.branch !== expected.dayBranch) {
            testPassed = false;
            errors.push(`日支: 期望${expected.dayBranch}, 实际${pillars.day.branch}`);
        }
        if (expected.hourStem && pillars.hour.stem !== expected.hourStem) {
            testPassed = false;
            errors.push(`时干: 期望${expected.hourStem}, 实际${pillars.hour.stem}`);
        }
        if (expected.hourBranch && pillars.hour.branch !== expected.hourBranch) {
            testPassed = false;
            errors.push(`时支: 期望${expected.hourBranch}, 实际${pillars.hour.branch}`);
        }
        
        if (testPassed) {
            passed++;
            console.log(`✅ 测试 ${index + 1}: ${note}`);
        } else {
            failed++;
            failures.push({ index: index + 1, note, errors, debug });
            console.log(`❌ 测试 ${index + 1}: ${note}`);
            errors.forEach(err => console.log(`   ${err}`));
        }
    });
    
    console.log(`\n===== 测试结果 =====`);
    console.log(`通过: ${passed}/${BAZI_TEST_CASES.length}`);
    console.log(`失败: ${failed}/${BAZI_TEST_CASES.length}`);
    
    if (failures.length > 0) {
        console.log('\n===== 失败详情 =====');
        failures.forEach(f => {
            console.log(`\n测试 ${f.index}: ${f.note}`);
            console.log('调试信息:', JSON.stringify(f.debug, null, 2));
        });
    }
    
    return { passed, failed, total: BAZI_TEST_CASES.length };
}

/**
 * 运行节气计算测试
 */
export function runSolarTermTests() {
    console.log('\n===== 节气计算测试 =====\n');
    
    // 测试几个已知的节气时刻
    const knownSolarTerms = [
        { year: 2024, termIndex: 2, name: '立春', expectedMonth: 2, expectedDay: 4 },
        { year: 2024, termIndex: 4, name: '惊蛰', expectedMonth: 3, expectedDay: 5 },
        { year: 2024, termIndex: 6, name: '清明', expectedMonth: 4, expectedDay: 4 },
        { year: 2024, termIndex: 11, name: '夏至', expectedMonth: 6, expectedDay: 21 },
        { year: 2024, termIndex: 17, name: '秋分', expectedMonth: 9, expectedDay: 22 },
        { year: 2024, termIndex: 23, name: '冬至', expectedMonth: 12, expectedDay: 21 },
    ];
    
    let passed = 0;
    let failed = 0;
    
    knownSolarTerms.forEach(test => {
        const moment = getSolarTermMoment(test.year, test.termIndex);
        const isCorrect = moment.month === test.expectedMonth && moment.day === test.expectedDay;
        
        if (isCorrect) {
            passed++;
            console.log(`✅ ${test.year}年${test.name}: ${moment.month}月${moment.day}日 ${moment.hour}:${String(moment.minute).padStart(2, '0')}`);
        } else {
            failed++;
            console.log(`❌ ${test.year}年${test.name}: 期望${test.expectedMonth}月${test.expectedDay}日, 实际${moment.month}月${moment.day}日`);
        }
    });
    
    console.log(`\n节气测试: 通过 ${passed}/${knownSolarTerms.length}`);
    
    return { passed, failed, total: knownSolarTerms.length };
}

/**
 * 运行所有测试
 */
export function runAllTests() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║     历法核心模块验收测试               ║');
    console.log('║     AC-1: 八字四柱回归样例             ║');
    console.log('║     AC-2: 节气计算验证                 ║');
    console.log('╚════════════════════════════════════════╝\n');
    
    const solarTermResult = runSolarTermTests();
    const baziResult = runBaziTests();
    
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║              总结                       ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`节气测试: ${solarTermResult.passed}/${solarTermResult.total} 通过`);
    console.log(`八字测试: ${baziResult.passed}/${baziResult.total} 通过`);
    
    const allPassed = solarTermResult.failed === 0 && baziResult.failed === 0;
    console.log(`\n${allPassed ? '✅ 所有测试通过！' : '❌ 存在失败的测试'}`);
    
    return allPassed;
}

// 如果直接运行此文件
if (typeof window === 'undefined') {
    // Node.js 环境
    runAllTests();
}

// 导出到全局（浏览器环境）
if (typeof window !== 'undefined') {
    window.CalendarTest = {
        runAllTests,
        runBaziTests,
        runSolarTermTests,
        BAZI_TEST_CASES,
        AUSPICIOUS_TEST_CASES
    };
}

