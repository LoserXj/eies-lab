// 光伏主题的六幕（约 65 秒一轮）。改节奏、改文案改这里。step 对应 core/timeline.js 的 LOOP_STEPS。
export const ACTS = [
	{ key: 'env', dur: 9, step: null, title: { en: 'Energy Environment', zh: '物理能源环境' } },
	{ key: 'perceive', dur: 15, step: 'perceive', title: { en: 'Active Perception', zh: '主动感知' } },
	{ key: 'model', dur: 9, step: 'model', title: { en: 'World Model', zh: '世界模型' } },
	{ key: 'rollout', dur: 11, step: 'decide', title: { en: 'Rollout & Planning', zh: '推演与决策' } },
	{ key: 'act', dur: 11, step: 'act', title: { en: 'Embodied Action', zh: '具身行动' } },
	{ key: 'feedback', dur: 10, step: 'feedback', title: { en: 'Feedback & Learning', zh: '反馈与学习' } },
];
