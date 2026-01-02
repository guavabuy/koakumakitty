
import { NiShiRules } from './js/core/nishi_rules.js';
// Mock necessary globals or imports if modules depend on them (not needed for this specific check if well isolated)

// We need to access the modified modules. 
// Since they are likely currently attached to window or exported as globals in the original app structure,
// but we added imports/exports in our modification. 
// Assuming the user environment runs standard ES modules or we can test this in a node-like way if we adjust.
// For browser console testing, we can just load the page. 
// For this script, I'll simulate a basic test runner that checks the structure.

// Note: To run this in the actual environment, we might need to load the files in HTML.
// But checking the file content structure via tools is also valid.



window.NiShiVerification = {
    results: [],

    check(moduleName, objectName, method, args) {
        console.group(`Testing ${moduleName}...`);
        try {
            const obj = window[objectName];
            if (!obj) throw new Error(`Global object '${objectName}' not found. module not loaded?`);
            if (typeof obj[method] !== 'function') throw new Error(`Method '${method}' not found on ${objectName}`);

            console.log(`Calling ${objectName}.${method}()...`);
            const result = obj[method](...args);

            this.validateResult(moduleName, result);
            this.results.push({ module: moduleName, status: 'PASS' });
            console.log(`%c[PASS] ${moduleName}`, 'color: green; font-weight: bold;');
        } catch (e) {
            console.error(`FAILED: ${e.message}`);
            console.error(e);
            this.results.push({ module: moduleName, status: 'FAIL', error: e.message });
            console.log(`%c[FAIL] ${moduleName}`, 'color: red; font-weight: bold;');
        }
        console.groupEnd();
    },

    validateResult(module, result) {
        if (!result) throw new Error("Result is null/undefined");
        if (!result.source) throw new Error("Missing 'source' field");
        if (!['TianJi', 'DiMai', 'RenJian'].includes(result.source)) throw new Error(`Invalid source: ${result.source}`);

        if (!result.pattern) throw new Error("Missing 'pattern' field");
        if (!result.calculation) throw new Error("Missing 'calculation' field");
        if (!result.verdict) throw new Error("Missing 'verdict' field");
        if (!result.guidance) throw new Error("Missing 'guidance' field");
        if (!result.verdict.level) throw new Error("Missing verdict.level");
    },

    async runAll() {
        console.clear();
        console.log("🚀 Starting Ni Shi Unified Logic Verification...");
        this.results = [];

        this.check('Daily', 'DailyFortune', 'calculateStandard', [new Date(), {}]);
        this.check('BaZi', 'BaZi', 'calculateStandard', [new Date(), 0, 'male']);
        this.check('FengShui', 'FengShui', 'analyzeStandard', [1990, 'male', '坐北朝南']);
        this.check('YiJing', 'YiJing', 'divineStandard', ['测试问题']);
        this.check('Name', 'NameAnalysis', 'analyzeStandard', ['倪海厦']);

        // Use proper date objects for Marriage
        const p1 = { name: '张三', date: new Date('1990-01-01'), hour: 0, gender: 'male' };
        const p2 = { name: '李四', date: new Date('1992-05-20'), hour: 0, gender: 'female' };
        this.check('Marriage', 'Marriage', 'analyzeStandard', [p1, p2]);

        if (window.BaZi) {
            const mockBazi = window.BaZi.calculate(new Date(), 0, 'male');
            // Use valid activity key '结婚'
            this.check('Auspicious', 'AuspiciousDay', 'analyzeDateStandard', [new Date(), '结婚', mockBazi]);
        }

        this.check('Yearly2026', 'Yearly2026', 'calculateStandard', [new Date(), { gender: 'male' }]);

        if (window.FaceReading && window.FaceReading.analyzeStandard) {
            this.results.push({ module: 'FaceReading', status: 'PASS', note: 'Methods exist' });
        } else {
            this.results.push({ module: 'FaceReading', status: 'FAIL', error: 'Missing' });
        }

        console.table(this.results);
        return this.results;
    }
};

// Auto-run if loaded in browser
// window.NiShiVerification.runAll();

console.log("Starting NiShi Rules Verification...");

const verifyStructure = (result, moduleName) => {
    console.group(`Verifying ${moduleName}...`);

    // Check Top Level Keys
    const requiredKeys = ['source', 'pattern', 'calculation', 'verdict', 'guidance'];
    const missingKeys = requiredKeys.filter(k => !(k in result));

    if (missingKeys.length > 0) {
        console.error(`❌ Missing keys in ${moduleName}:`, missingKeys);
    } else {
        console.log("✅ Top level structure OK");
    }

    // Check Verdict
    if (result.verdict && result.verdict.level && result.verdict.summary) {
        console.log(`✅ Verdict: [${result.verdict.level}] ${result.verdict.summary}`);
    } else {
        console.error("❌ Malformed verdict");
    }

    // Check Guidance
    if (result.guidance && (result.guidance.action || result.guidance.adjustment)) {
        console.log(`✅ Guidance present: ${result.guidance.action || result.guidance.adjustment}`);
    } else {
        console.warn("⚠️ Guidance might be empty or malformed");
    }

    console.groupEnd();
};

// Simulation of standard calls (Pseudo-code as we can't really run DOM dependent code like face-api here effortlessly)
console.log("To verify fully, ensure the following call patterns work in browser console:");
console.log(" Daily:      DailyFortune.calculateStandard(new Date(), {})");
console.log(" BaZi:       BaZi.calculateStandard(new Date(), 0, 'male')");
console.log(" FengShui:   FengShui.analyzeStandard(1990, 'male', '坐北朝南')");
console.log(" YiJing:     YiJing.divineStandard('My Question')");
console.log(" Face:       FaceReading.analyzeStandard(mockDetectionData)");
console.log(" Name:       NameAnalysis.analyzeStandard('张三')");
console.log(" Marriage:   Marriage.analyzeStandard({name:'张三', date: new Date(), ...}, {name:'李四', date: new Date(), ...})");
console.log(" Auspicious: AuspiciousDay.analyzeDateStandard(new Date(), '结婚', userBazi)");
console.log(" Yearly2026: Yearly2026.calculateStandard(new Date(), {gender:'male'})");


// We can't easily import the modules here because they are files on disk and might have dependencies.
// The best verification is to inspect the code or ask the user to check console.
// However, I will output this logic for the user to potentially use.
