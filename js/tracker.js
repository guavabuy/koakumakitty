/**
 * 用户行为追踪模块
 * 记录：入口来源、功能使用、用户输入、停留时间
 */

// 说明：旧“后台/追踪系统”已移除，这里保留一个前端兼容层，避免其它脚本引用 Tracker 时报错。
// 如需重新搭建后台，可直接替换本文件为新追踪 SDK。
const Tracker = {
    init() { },
    logFeatureUsage() { },
    getRecords() { return []; },
    clearRecords() { }
};
