import { Translation } from './types';

const zhTranslations: Translation = {
 header: {
 projects: '项目',
 analytics: '分析',
 reports: '报告',
 user: '建筑师 Doe',
 language: 'English',
 },
 projectModal: {
 title: {
 view: '项目管理',
 add: '添加新项目',
 },
 subtitle: {
 view: '管理您的 BIM 项目',
 add: '添加一个新的 Speckle 项目',
 },
 empty: {
 title: '暂无项目',
 description: '点击右上角的 + 按钮添加您的第一个项目',
 },
 current: '当前',
 switchProject: '切换到此项目',
 delete: '删除',
 form: {
 name: {
 label: '项目名称',
 placeholder: '例如：办公楼 BIM 模型',
 error: '项目名称不能为空',
 },
 speckleUrl: {
 label: 'Speckle Embed URL',
 placeholder: 'https://app.speckle.systems/projects/...',
 error: 'Speckle URL 不能为空',
 invalid: '请输入有效的 Speckle URL',
 hint: '请从 Speckle 项目页面复制 embed URL',
 },
 description: {
 label: '项目描述',
 placeholder: '简要描述这个项目...',
 },
 optional: '(可选)',
 required: '*',
 add: '添加项目',
 reset: '重置',
 addNew: '添加新项目',
 },
 },
 controlPanel: {
 title: 'AI 指挥官',
 poweredBy: '由 Gemini 2.5 提供支持',
 assistant: '您好！我是您的 BIM 助手。请描述您想看到的内容，我会为您生成筛选控件。',
 inputPlaceholder: '请让 AI 进行筛选（例如：\"显示梁\"）...',
 aiTools: 'AI 工具：',
 analyzeStructure: '分析结构',
 mepCheck: '机电检查',
 elements: '元素',
 },
 modelViewer: {
 title: '3D 模型查看器',
 visibility: '可见性',
 elements: '元素',
 },
 graphViewer: {
 title: '图谱可视化',
 description: 'Cytoscape.js 图谱将在任务 6 中实现',
 },
 paneHeader: {
 maximize: '最大化',
 minimize: '最小化',
 restore: '恢复',
 },
};

export default zhTranslations;
