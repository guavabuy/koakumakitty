/**
 * 观相模块 - 基于倪海厦《人间道》面相理论
 * 使用 face-api.js 进行面部特征检测
 */


import { NiShiRules } from './core/nishi_rules.js';

const FaceReading = {

    // 模型是否已加载
    modelsLoaded: false,

    // 模型 CDN 路径
    MODEL_URL: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model',

    /**
     * 初始化 face-api.js 模型
     */
    init: async function () {
        if (this.modelsLoaded) return true;

        try {
            // 加载必要的模型
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(this.MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(this.MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(this.MODEL_URL)
            ]);
            this.modelsLoaded = true;
            console.log('Face-api models loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load face-api models:', error);
            return false;
        }
    },

    /**
     * 检测面部并获取特征点
     */
    detectFace: async function (imageElement) {
        if (!this.modelsLoaded) {
            await this.init();
        }

        const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.5
        });

        const detection = await faceapi
            .detectSingleFace(imageElement, options)
            .withFaceLandmarks()
            .withFaceExpressions();

        return detection;
    },

    /**
     * 基于《人间道》规则分析面部特征
     */
    analyze: function (detection) {
        if (!detection) {
            return null;
        }

        const landmarks = detection.landmarks;
        const expressions = detection.expressions;
        const box = detection.detection.box;

        // 获取关键点
        const positions = landmarks.positions;

        // 计算面部比例
        const faceWidth = box.width;
        const faceHeight = box.height;
        const faceRatio = faceHeight / faceWidth;

        // 额头分析（根据眉毛位置估算）
        const leftEyebrow = landmarks.getLeftEyeBrow();
        const rightEyebrow = landmarks.getRightEyeBrow();
        const eyebrowY = (leftEyebrow[2].y + rightEyebrow[2].y) / 2;
        const foreheadRatio = (eyebrowY - box.y) / faceHeight;

        // 眼睛分析
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const leftEyeWidth = Math.abs(leftEye[3].x - leftEye[0].x);
        const rightEyeWidth = Math.abs(rightEye[3].x - rightEye[0].x);
        const eyeDistance = Math.abs(rightEye[0].x - leftEye[3].x);
        const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2;
        const eyeDistanceRatio = eyeDistance / avgEyeWidth;

        // 鼻子分析
        const nose = landmarks.getNose();
        const noseLength = nose[6].y - nose[0].y;
        const noseWidth = Math.abs(nose[4].x - nose[8].x);
        const noseRatio = noseLength / noseWidth;

        // 嘴巴分析
        const mouth = landmarks.getMouth();
        const mouthWidth = Math.abs(mouth[6].x - mouth[0].x);
        const mouthHeight = Math.abs(mouth[9].y - mouth[3].y);
        const mouthRatio = mouthWidth / mouthHeight;

        // 下巴分析
        const jawOutline = landmarks.getJawOutline();
        const chinY = jawOutline[8].y;
        const chinRatio = (chinY - nose[6].y) / faceHeight;

        // 生成分析结果
        const analysis = {
            faceShape: this.analyzeFaceShape(faceRatio),
            forehead: this.analyzeForehead(foreheadRatio),
            eyebrows: this.analyzeEyebrows(leftEyebrow, rightEyebrow),
            eyes: this.analyzeEyes(eyeDistanceRatio, avgEyeWidth / faceWidth),
            nose: this.analyzeNose(noseRatio, noseWidth / faceWidth),
            mouth: this.analyzeMouth(mouthRatio, mouthWidth / faceWidth),
            chin: this.analyzeChin(chinRatio),
            expression: this.analyzeExpression(expressions),
            overall: this.generateOverall(faceRatio, foreheadRatio)
        };

        return analysis;
    },

    /**
     * [NiShi Standard] 标准化面相分析接口
     */
    analyzeStandard: function (detection) {
        // 1. 获取基础计算结果
        const result = this.analyze(detection);
        if (!result) return null;

        // 2. 映射到标准结论
        const score = result.overall.average;
        const verdictInfo = NiShiRules.TianJi.evaluateScore(score);

        return NiShiRules.createResult({
            source: 'RenJian', // 面相属于人间道（观察）
            pattern: {
                name: `${result.faceShape.type}`,
                symbol: '👁️',
                attributes: result
            },
            calculation: {
                score: score,
                balance: '无', // 面相重在“气色”与“形神”
                energy: result.overall.scores
            },
            verdict: {
                level: verdictInfo.level,
                stars: verdictInfo.stars,
                summary: result.overall.description
            },
            guidance: {
                // 人间道：修身
                action: result.overall.advice,
                // 天机道：流年
                timing: '相随心转，当下即是改变的开始。',
                // 地脉道：
                adjustment: `面部${result.nose.type}，注意生活环境的${result.nose.type.includes('大') ? '聚财' : '整洁'}布局。`
            }
        });
    },

    /**
     * 脸型分析 - 《人间道》
     */
    analyzeFaceShape: function (ratio) {
        if (ratio > 1.4) {
            return {
                type: '长脸',
                description: '面长者多思虑，性格稳重，做事有条理。',
                interpretation: '《人间道》云：面长者主贵，多有才学，但须防过于执着。'
            };
        } else if (ratio < 1.1) {
            return {
                type: '圆脸',
                description: '面圆者性格温和，人缘好，福气厚重。',
                interpretation: '《人间道》云：圆脸主福，心地善良，晚年多福禄。'
            };
        } else if (ratio >= 1.1 && ratio <= 1.25) {
            return {
                type: '方脸',
                description: '面方者意志坚定，有魄力，适合做领导。',
                interpretation: '《人间道》云：面方者主权，做事果断，有领袖之风。'
            };
        } else {
            return {
                type: '标准脸型',
                description: '面型适中，性格较为平衡。',
                interpretation: '《人间道》云：面型中正者，为人处世较为圆融。'
            };
        }
    },

    /**
     * 额头分析 - 《人间道》
     */
    analyzeForehead: function (ratio) {
        if (ratio > 0.35) {
            return {
                type: '高额',
                description: '额头饱满高耸，主智慧与贵气。',
                interpretation: '《人间道》云：额高而圆者，主少年得志，智慧过人，宜从事脑力工作。'
            };
        } else if (ratio < 0.25) {
            return {
                type: '低额',
                description: '额头较窄，主早年辛苦，但晚运亨通。',
                interpretation: '《人间道》云：额窄者早年多劳，但勤奋踏实，中年后渐入佳境。'
            };
        } else {
            return {
                type: '中等额头',
                description: '额头适中，运势平稳。',
                interpretation: '《人间道》云：额头中正者，一生平顺，无大起大落。'
            };
        }
    },

    /**
     * 眉毛分析
     */
    analyzeEyebrows: function (leftBrow, rightBrow) {
        // 计算眉毛的弧度和长度
        const leftLength = Math.abs(leftBrow[4].x - leftBrow[0].x);
        const rightLength = Math.abs(rightBrow[4].x - rightBrow[0].x);
        const avgLength = (leftLength + rightLength) / 2;

        // 眉毛高度差（判断眉形）
        const leftHeight = Math.abs(leftBrow[2].y - leftBrow[0].y);
        const rightHeight = Math.abs(rightBrow[2].y - rightBrow[0].y);
        const avgHeight = (leftHeight + rightHeight) / 2;

        const browRatio = avgHeight / avgLength;

        if (browRatio > 0.15) {
            return {
                type: '浓眉',
                description: '眉毛浓密，主气势强，性格刚毅。',
                interpretation: '《人间道》云：眉浓者气盛，做事有魄力，但须注意脾气。'
            };
        } else if (browRatio < 0.08) {
            return {
                type: '淡眉',
                description: '眉毛清淡，主心善良，性格温和。',
                interpretation: '《人间道》云：眉淡者心善，与人为善，贵人运佳。'
            };
        } else {
            return {
                type: '适中眉形',
                description: '眉形适中，性格较为平衡。',
                interpretation: '《人间道》云：眉形中正者，为人处世较为圆融和谐。'
            };
        }
    },

    /**
     * 眼睛分析
     */
    analyzeEyes: function (distanceRatio, sizeRatio) {
        let result = {
            type: '',
            description: '',
            interpretation: ''
        };

        if (sizeRatio > 0.12) {
            result.type = '大眼';
            result.description = '眼睛大而有神，主聪慧、敏感、有艺术天赋。';
            result.interpretation = '《人间道》云：目大有神者主聪慧，善于观察，有艺术细胞。';
        } else if (sizeRatio < 0.08) {
            result.type = '小眼';
            result.description = '眼睛精明有神，主谨慎、精明、善于理财。';
            result.interpretation = '《人间道》云：目小而精者主谨慎，善于积蓄，财运稳健。';
        } else {
            result.type = '适中眼型';
            result.description = '眼睛大小适中，性格较为平衡。';
            result.interpretation = '《人间道》云：目型中正者，观察力与决断力兼备。';
        }

        // 眼距分析
        if (distanceRatio > 1.2) {
            result.description += ' 眼距较宽，心胸开阔，为人大度。';
            result.interpretation += ' 眼距宽者心宽，不拘小节。';
        } else if (distanceRatio < 0.8) {
            result.description += ' 眼距较近，观察力强，注重细节。';
            result.interpretation += ' 眼距近者心细，善于洞察。';
        }

        return result;
    },

    /**
     * 鼻子分析
     */
    analyzeNose: function (lengthRatio, widthRatio) {
        let result = {
            type: '',
            description: '',
            interpretation: ''
        };

        if (widthRatio > 0.25) {
            result.type = '鼻大有势';
            result.description = '鼻子宽大有势，主财运亨通，中年发达。';
            result.interpretation = '《人间道》云：鼻大有势者主财，中年后财运渐旺，宜积累资产。';
        } else if (widthRatio < 0.18) {
            result.type = '鼻子秀气';
            result.description = '鼻子秀气挺拔，主才华横溢，适合文艺工作。';
            result.interpretation = '《人间道》云：鼻秀者多才，适合从事文艺或技术工作。';
        } else {
            result.type = '鼻型适中';
            result.description = '鼻子大小适中，财运平稳。';
            result.interpretation = '《人间道》云：鼻型中正者，财运平稳，不愁衣食。';
        }

        if (lengthRatio > 1.5) {
            result.description += ' 鼻子较长，性格坚毅，有主见。';
        }

        return result;
    },

    /**
     * 嘴巴分析
     */
    analyzeMouth: function (widthRatio, sizeRatio) {
        let result = {
            type: '',
            description: '',
            interpretation: ''
        };

        if (sizeRatio > 0.35) {
            result.type = '大嘴';
            result.description = '嘴巴宽大，主热情开朗，善于交际。';
            result.interpretation = '《人间道》云：口大者食禄丰，性格豪爽，朋友多。';
        } else if (sizeRatio < 0.25) {
            result.type = '小嘴';
            result.description = '嘴巴小巧，主谨慎内敛，做事细心。';
            result.interpretation = '《人间道》云：口小者谨慎，言语有度，不轻易表态。';
        } else {
            result.type = '嘴型适中';
            result.description = '嘴巴大小适中，性格较为平衡。';
            result.interpretation = '《人间道》云：口型中正者，能言善辩而不失分寸。';
        }

        // 嘴唇厚薄（通过比例推测）
        if (widthRatio < 4) {
            result.description += ' 嘴唇较厚，重情重义。';
            result.interpretation += ' 唇厚者重情，对感情认真负责。';
        } else if (widthRatio > 6) {
            result.description += ' 嘴唇较薄，理性务实。';
            result.interpretation += ' 唇薄者理性，决策果断。';
        }

        return result;
    },

    /**
     * 下巴分析
     */
    analyzeChin: function (ratio) {
        if (ratio > 0.25) {
            return {
                type: '下巴丰满',
                description: '下巴圆润饱满，主晚年福气，子女运佳。',
                interpretation: '《人间道》云：下巴圆满者，晚年福禄双全，子女孝顺。'
            };
        } else if (ratio < 0.15) {
            return {
                type: '下巴尖削',
                description: '下巴较尖，主思维敏捷，但须注意晚年健康。',
                interpretation: '《人间道》云：下巴尖者思维快，但晚年宜注意养生。'
            };
        } else {
            return {
                type: '下巴适中',
                description: '下巴大小适中，晚运平稳。',
                interpretation: '《人间道》云：下巴中正者，一生运势平稳。'
            };
        }
    },

    /**
     * 表情分析
     */
    analyzeExpression: function (expressions) {
        const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
        const dominant = sorted[0];

        const expressionMap = {
            neutral: { name: '平静', desc: '神态安详，心境平和，是修养良好的表现。' },
            happy: { name: '喜悦', desc: '面带笑容，运势正旺，近期有喜事。' },
            sad: { name: '忧虑', desc: '面有愁容，近期可能有心事，宜放宽心态。' },
            angry: { name: '刚毅', desc: '神态坚定，意志力强，但须注意控制情绪。' },
            fearful: { name: '谨慎', desc: '神态谨慎，做事小心，有防备之心。' },
            disgusted: { name: '不满', desc: '神态中透露不满，宜调整心态，以和为贵。' },
            surprised: { name: '惊讶', desc: '神态中透露好奇，对新事物有探索欲望。' }
        };

        const expr = expressionMap[dominant[0]] || { name: '平静', desc: '神态自然。' };

        return {
            type: expr.name,
            confidence: Math.round(dominant[1] * 100),
            description: expr.desc,
            interpretation: `当前神态：${expr.name}（${Math.round(dominant[1] * 100)}%）`
        };
    },

    /**
     * 生成总体评价
     */
    generateOverall: function (faceRatio, foreheadRatio) {
        const scores = {
            wisdom: Math.min(100, Math.round(foreheadRatio * 250)),
            fortune: Math.min(100, Math.round(faceRatio * 60)),
            personality: Math.round(50 + Math.random() * 30),
            career: Math.round(60 + Math.random() * 25),
            relationship: Math.round(55 + Math.random() * 30)
        };

        const avgScore = Math.round(
            (scores.wisdom + scores.fortune + scores.personality +
                scores.career + scores.relationship) / 5
        );

        let overallDesc = '';
        if (avgScore >= 80) {
            overallDesc = '面相上佳，天资聪颖，运势亨通。一生多有贵人相助，事业与感情皆顺遂。';
        } else if (avgScore >= 65) {
            overallDesc = '面相良好，性格平和，运势稳健。虽无大富大贵，但一生平安顺遂，衣食无忧。';
        } else if (avgScore >= 50) {
            overallDesc = '面相中等，需靠后天努力。多行善事，广结善缘，运势自会好转。';
        } else {
            overallDesc = '面相需多加注意，宜修身养性，广积善德。相由心生，心善则相善。';
        }

        return {
            scores: scores,
            average: avgScore,
            description: overallDesc,
            advice: '《人间道》云：相由心生，心正则相正。无论面相如何，修心养性、广积善德才是改运之本。'
        };
    },

    /**
     * 渲染分析结果
     */
    renderResult: function (analysis) {
        if (!analysis) {
            return `
                <div class="analysis-card face-reading-error">
                    <h3>😿 哎呀，没有检测到人脸呢~</h3>
                    <p>请确保：</p>
                    <ul>
                        <li>📸 照片中有清晰的正面人脸</li>
                        <li>💡 光线充足，面部没有被遮挡</li>
                        <li>🖼️ 图片大小适中（建议 500KB 以内）</li>
                    </ul>
                    <p>换一张照片再试试吧~ 喵~</p>
                </div>
            `;
        }

        const { faceShape, forehead, eyebrows, eyes, nose, mouth, chin, expression, overall } = analysis;

        return `
            <div class="analysis-card face-reading-result">
                <h3>🔮 Kitty的面相分析 🔮</h3>
                
                <div class="face-score-section">
                    <div class="overall-score">
                        <span class="score-number">${overall.average}</span>
                        <span class="score-label">综合评分</span>
                    </div>
                    <div class="score-bars">
                        <div class="score-item">
                            <span>智慧</span>
                            <div class="bar"><div class="fill" style="width:${overall.scores.wisdom}%"></div></div>
                            <span>${overall.scores.wisdom}</span>
                        </div>
                        <div class="score-item">
                            <span>福气</span>
                            <div class="bar"><div class="fill" style="width:${overall.scores.fortune}%"></div></div>
                            <span>${overall.scores.fortune}</span>
                        </div>
                        <div class="score-item">
                            <span>性格</span>
                            <div class="bar"><div class="fill" style="width:${overall.scores.personality}%"></div></div>
                            <span>${overall.scores.personality}</span>
                        </div>
                        <div class="score-item">
                            <span>事业</span>
                            <div class="bar"><div class="fill" style="width:${overall.scores.career}%"></div></div>
                            <span>${overall.scores.career}</span>
                        </div>
                        <div class="score-item">
                            <span>感情</span>
                            <div class="bar"><div class="fill" style="width:${overall.scores.relationship}%"></div></div>
                            <span>${overall.scores.relationship}</span>
                        </div>
                    </div>
                </div>
                
                <div class="face-overall">
                    <p><strong>📜 总评：</strong>${overall.description}</p>
                    <p class="advice">💡 ${overall.advice}</p>
                </div>
            </div>

            <div class="analysis-card">
                <h4>😺 当前神态</h4>
                <p><strong>${expression.type}</strong> (${expression.confidence}%)</p>
                <p>${expression.description}</p>
            </div>

            <div class="analysis-card">
                <h4>👤 脸型分析</h4>
                <p><strong>${faceShape.type}</strong></p>
                <p>${faceShape.description}</p>
                <p class="interpretation">${faceShape.interpretation}</p>
            </div>

            <div class="analysis-card">
                <h4>🌟 额头（天庭）</h4>
                <p><strong>${forehead.type}</strong></p>
                <p>${forehead.description}</p>
                <p class="interpretation">${forehead.interpretation}</p>
            </div>

            <div class="analysis-card">
                <h4>🌙 眉毛</h4>
                <p><strong>${eyebrows.type}</strong></p>
                <p>${eyebrows.description}</p>
                <p class="interpretation">${eyebrows.interpretation}</p>
            </div>

            <div class="analysis-card">
                <h4>👁️ 眼睛</h4>
                <p><strong>${eyes.type}</strong></p>
                <p>${eyes.description}</p>
                <p class="interpretation">${eyes.interpretation}</p>
            </div>

            <div class="analysis-card">
                <h4>👃 鼻子（财帛宫）</h4>
                <p><strong>${nose.type}</strong></p>
                <p>${nose.description}</p>
                <p class="interpretation">${nose.interpretation}</p>
            </div>

            <div class="analysis-card">
                <h4>👄 嘴巴</h4>
                <p><strong>${mouth.type}</strong></p>
                <p>${mouth.description}</p>
                <p class="interpretation">${mouth.interpretation}</p>
            </div>

            <div class="analysis-card">
                <h4>😊 下巴（地阁）</h4>
                <p><strong>${chin.type}</strong></p>
                <p>${chin.description}</p>
                <p class="interpretation">${chin.interpretation}</p>
            </div>

            <div class="analysis-card kitty-summary">
                <h4>🐱 Kitty有话说</h4>
                <p>喵~ 这只是根据面相学的初步分析哦！</p>
                <p>记住，<strong>相由心生</strong>，你的心态和行为才是决定命运的关键！</p>
                <p>多做善事，保持乐观，好运自然来喵~ ✨</p>
                <p class="disclaimer-note" style="margin-top: 12px; font-size: 0.85rem; color: #888;">
                    ⚠️ 面相分析仅供娱乐参考，不作为婚姻、求职等重大决策依据
                </p>
            </div>

            ${typeof ShareUtils !== 'undefined' ? ShareUtils.createActionButtons('facereading') : ''}
        `;
    }
};

// 导出模块
if (typeof window !== 'undefined') {
    window.FaceReading = FaceReading;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FaceReading;
}
