# 🐱 KOAKUMA KITTY / Kitty坏坏算命屋

[![Live Demo](https://img.shields.io/badge/Live-kuakumakitty.com-ff69b4)](https://kuakumakitty.com)
[![GitHub](https://img.shields.io/badge/GitHub-badkitty-blue)](https://github.com/guavabuy/badkitty)

> ✨ 师承倪师，逢运帮助有缘喵~ ✨

一个纯静态的中国传统命理/易占小站（Y2K 猫咪风），核心口径参考倪海厦《天纪》《人间道》《地脉道》等思路实现：八字排盘、流年/运势、择日、合婚、风水、面相与摇卦等。

## 🌟 在线功能

- **🐴 2026 丙午年运势**：输入生日（可选时辰/性别/姓名），生成 2026 流年分析。
- **🌙 今日运势**：按生日（可选时辰/性别/姓名）生成当日综合运势，并给出幸运提示。
- **🔮 八字命盘**：四柱排盘（年/月/日/时）+ 结构化解读（十神/五行等）。
- **💌 名字解密**：姓名笔画与结构化分析（偏传统“三才五格”等口径）。
- **🎱 摇一摇占卜**：模拟摇卦并输出卦象解读。
- **🏠 阳宅风水分析**：按出生信息与房屋坐向给出方位建议；支持可选上传户型图做更细的布局提示。
- **💑 姻缘配对**：双方姓名 + 出生信息的匹配分析与评分。
- **👀 面相分析**：支持拍照/上传，基于 `face-api.js` 做人脸检测并输出面相向的解读提示。
- **📅 良辰吉日**：给定事项（表白/结婚/搬家/打麻将等）与计划日期，输出择日报告。

> 说明：所有计算均在浏览器端完成；项目本身不需要后端即可运行。

## 🛠️ 技术栈

- **前端**：HTML5 + CSS3 + JavaScript（无框架）
- **模块化**：ES Modules（部分脚本使用 `type="module"`）
- **历法/节气核心**：`js/core/`（口径文档见 `docs/calendar_spec.md`）
- **分享能力**：Canvas + `html2canvas` + `qrcodejs`
- **面部识别**：`face-api.js`（CDN）
- **数据分析**：Google Analytics 4（如不需要可移除相关脚本）

## 📁 项目结构

```
.
├── index.html                  # 静态站点入口
├── css/
│   └── styles.css              # 全站样式（Y2K 猫咪风）
├── js/
│   ├── main.js                 # 页面交互与模块初始化（tab 切换/表单提交等）
│   ├── daily.js                # 今日运势
│   ├── yearly2026.js           # 2026 丙午年运势
│   ├── bazi.js                 # 八字命盘
│   ├── name.js                 # 名字解密
│   ├── yijing.js               # 摇一摇占卜
│   ├── fengshui.js             # 阳宅风水
│   ├── marriage.js             # 姻缘配对
│   ├── facereading.js          # 面相分析（调用 face-api）
│   ├── auspicious.js           # 良辰吉日（择日）
│   ├── share.js                # 分享图生成（Canvas/html2canvas/QR）
│   ├── tracker.js              # 埋点/使用统计（GA 事件封装）
│   ├── datepicker.js           # 日期选择辅助
│   ├── verify_dayun.js         # 口径验证/对照脚本（开发用）
│   ├── verify_rules.js         # 口径验证/对照脚本（开发用）
│   └── core/                   # 历法与规则核心
│       ├── calendar.js
│       ├── solar_terms.js
│       ├── dayun.js
│       ├── liunian.js
│       ├── nishi_rules.js
│       └── calendar_test.js
├── images/                     # 前端图片资源（运行必需）
│   ├── favicon.png
│   ├── kitty-icon.jpg
│   ├── kitty-logo.png
│   ├── background.jpg
│   └── doja/                   # 分享背景素材
├── docs/                       # 设计/架构/口径文档
│   ├── calendar_spec.md
│   ├── nishi_rules_spec.md
│   ├── architecture_diagram.md
│   └── y2k_cat_design_system.md
├── robots.txt
└── sitemap.xml
```

## 🚀 快速开始

### 本地运行（推荐）

> 由于使用了 ES Module（`type="module"`），请用本地 HTTP 服务打开，不要直接双击 `index.html`（`file://` 下会被浏览器拦截导入）。

```bash
# 进入项目目录
cd KuokamaKitty

# Python（推荐）
python3 -m http.server 8080

# 或 Node（无交互）
npx --yes serve .
```

打开 `http://localhost:8080`。

### 部署

本项目为纯静态站点，可部署到任意静态托管：

- GitHub Pages
- Vercel / Netlify
- Cloudflare Pages

## 📚 文档索引

- `docs/calendar_spec.md`：历法/节气/四柱口径（立春换年、节气定月、时区策略等）
- `docs/nishi_rules_spec.md`：规则口径说明（开发用）
- `docs/architecture_diagram.md`：整体结构与模块关系
- `docs/y2k_cat_design_system.md`：视觉与组件风格规范

## 🐾 关于倪师（致敬）

倪海厦（1953-2012），台湾著名中医师、命理学家。本站为学习/致敬向作品，部分理论与表达参考其讲解与著作思路整理实现。

## 📄 免责声明

✧ 本站内容仅供娱乐与学习参考，不作为婚姻、投资、求职等重大人生决策依据 ✧  
所有分析结果均为算法推演与文本模板生成，不构成任何专业建议。重要决策请自行审慎评估或咨询专业人士。

## 💖 贡献

欢迎提 Issue / PR。建议在提交前先说明：你想优化的是**哪一个模块**（如 `daily` / `bazi` / `js/core` 口径等），以及期望的输入输出示例，方便快速对齐。

---

Made with 💕 by [Guava Guy](https://guavaguy.xyz)  
🐱 豆荚猫也是猫，喵 🐱
