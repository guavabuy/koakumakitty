# 倪师统一逻辑架构图 (Ni Shi Unified Logic Architecture)

This diagram illustrates how the nine functional modules integrate with the core `NiShiRules` engine to produce a standardized `NiShiResult`.

```mermaid
graph TD
    %% Core Engine
    Core[("☯️ NiShiRules (Core)<br/>js/core/nishi_rules.js")]
    style Core fill:#ff9900,stroke:#333,stroke-width:4px,color:white

    %% Standard Result Interface
    Result[("📄 NiShiResult (Interface)<br/>Standard Output")]
    style Result fill:#4CAF50,stroke:#333,stroke-width:2px,color:white

    %% The Three Daos
    TianJi(☁️ 天机道 Tian Ji<br/>Time & Fate)
    DiMai(🏔️ 地脉道 Di Mai<br/>Space & Env)
    RenJian(👥 人间道 Ren Jian<br/>Action & Relation)

    style TianJi fill:#87CEEB,stroke:#333
    style DiMai fill:#8FBC8F,stroke:#333
    style RenJian fill:#FFB6C1,stroke:#333

    %% Connect Core to Daos
    Core --> TianJi
    Core --> DiMai
    Core --> RenJian

    %% Modules - Tian Ji
    TianJi --> Daily[📅 DailyFortune<br/>daily.js]
    TianJi --> BaZi[🔮 BaZi<br/>bazi.js]
    TianJi --> Yearly[🐴 Yearly2026<br/>yearly2026.js]
    TianJi --> Auspicious[🗓️ Auspicious<br/>auspicious.js]

    %% Modules - Di Mai
    DiMai --> FengShui[🏠 FengShui<br/>fengshui.js]

    %% Modules - Ren Jian
    RenJian --> YiJing[☯️ YiJing<br/>yijing.js]
    RenJian --> Face[👁️ FaceReading<br/>facereading.js]
    RenJian --> Name[📝 NameAnalysis<br/>name.js]
    RenJian --> Marriage[💞 Marriage<br/>marriage.js]

    %% Flow to Result
    Daily -.->|calculateStandard| Result
    BaZi -.->|calculateStandard| Result
    Yearly -.->|calculateStandard| Result
    Auspicious -.->|analyzeDateStandard| Result
    
    FengShui -.->|analyzeStandard| Result
    
    YiJing -.->|divineStandard| Result
    Face -.->|analyzeStandard| Result
    Name -.->|analyzeStandard| Result
    Marriage -.->|analyzeStandard| Result

    %% Legend or Notes
    subgraph Legend [Standardized Data Flow]
        direction TB
        L1[Module Input] --> L2[Unified Logic Processing]
        L2 --> L3[Standard Verdict & Guidance]
    end
```

## 数据流详解

1.  **Input (输入)**: 用户输入生辰、照片、姓名或其他参数。
2.  **Module Processing (模块处理)**: 各 `js/*.js` 模块执行具体的传统算法（如排盘、卦象生成）。
3.  **Standardization (标准化)**: 调用 `NiShiRules.createResult()` 将原生数据映射为统一格式。
4.  **Output (输出)**: 前端统一接收 `NiShiResult` 对象，包含：
    *   `source`: 来源（天/地/人）
    *   `pattern`: 象（视觉/现象）
    *   `calculation`: 数（能量/得分）
    *   `verdict`: 意（吉凶/结论）
    *   `guidance`: 道（行动建议）
