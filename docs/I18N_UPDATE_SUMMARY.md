# 国际化和界面修复更新说明

## 更新日期
2024年（当前）

## 修复的问题

### 1. ✅ 界面四边裁切问题
**问题描述**：iframe 嵌入的 3D 模型查看器四边被裁切

**解决方案**：
- 移除了 SpeckleViewer 的 `overflow-hidden` 和 `rounded-xl` 样式
- 添加了 `style={{ border: 'none', display: 'block' }}` 确保 iframe 完整显示
- 调整了容器样式，确保内容不被裁切

**修改文件**：
- `components/SpeckleViewer.tsx`

### 2. ✅ 完整的中英文国际化支持

#### 2.1 ControlPanel（对话面板）国际化
**新增翻译项**：
- 标题："AI Commander" / "AI 指挥官"
- 驱动信息："Powered by Gemini 2.5" / "由 Gemini 2.5 驱动"
- 构件计数："Elements" / "构件"
- 输入提示："Ask AI to filter..." / "询问 AI 进行过滤..."
- 麦克风提示："Toggle Microphone" / "切换麦克风"
- AI 工具标签："AI Tools:" / "AI 工具："
- 快捷按钮：
  - "Analyze Structure" / "分析结构"
  - "MEP Check" / "机电检查"
- 欢迎消息：完整的中英文欢迎语
- 操作反馈："Selected" / "已选择"、"I've applied the filter" / "我已应用过滤器"

**修改文件**：
- `components/ControlPanel.tsx`
- `contexts/I18nContext.tsx`

#### 2.2 LLM 提示词国际化
**功能**：
- `parseBIMQuery` 函数现在接受 `language` 参数
- 根据语言选择不同的系统提示词
- 中文提示词：完整的中文指令和示例
- 英文提示词：保持原有的英文指令

**中文提示词特点**：
- 使用中文术语（柱子、梁、楼板、混凝土等）
- 中文示例场景
- 中文按钮标签建议
- 中文推理和反馈

**修改文件**：
- `services/geminiService.ts`

#### 2.3 语音识别语言切换
**功能**：
- 根据当前界面语言自动切换语音识别语言
- 中文界面：`zh-CN`
- 英文界面：`en-US`

**修改文件**：
- `components/ControlPanel.tsx`

#### 2.4 App 主界面国际化
**翻译项**：
- 面板标题："3D Model Viewer" / "3D 模型查看器"
- 图谱标题："Graph Visualization" / "图谱可视化"
- 可见性标签："Visibility" / "可见性"
- 构件标签："Elements" / "构件"
- 命令标签："Command" / "命令"
- 占位符文本：图谱未实现提示

**修改文件**：
- `App.tsx`

## 新增翻译键值对

### 控制面板相关
```typescript
'control.title': 'AI Commander' / 'AI 指挥官'
'control.poweredBy': 'Powered by Gemini 2.5' / '由 Gemini 2.5 驱动'
'control.elements': 'Elements' / '构件'
'control.inputPlaceholder': 'Ask AI to filter...' / '询问 AI 进行过滤...'
'control.microphoneTitle': 'Toggle Microphone' / '切换麦克风'
'control.aiTools': 'AI Tools:' / 'AI 工具：'
'control.analyzeStructure': 'Analyze Structure' / '分析结构'
'control.mepCheck': 'MEP Check' / '机电检查'
'control.greeting': '欢迎消息'
'control.selected': 'Selected' / '已选择'
'control.applied': 'I\'ve applied the filter' / '我已应用过滤器'
'control.processing': 'Processing...' / '处理中...'
```

### AI 提示词相关
```typescript
'ai.analyzeStructural': 'Analyze structural elements' / '分析结构构件'
'ai.showMechanical': 'Show Mechanical and HVAC systems' / '显示机电和暖通系统'
```

## 技术实现细节

### 1. 语言上下文传递
- ControlPanel 通过 `useI18n()` 获取当前语言
- 调用 `parseBIMQuery(text, language)` 时传递语言参数
- LLM 根据语言返回对应语言的响应

### 2. 动态内容翻译
- 初始欢迎消息根据语言动态生成
- 建议按钮标签根据语言显示
- 错误消息根据语言显示

### 3. 实时语言切换
- 切换语言后，所有静态文本立即更新
- 新的对话会使用新语言的 LLM 提示词
- 历史消息保持原语言（符合对话逻辑）

## 用户体验改进

### 中文用户
- 完整的中文界面
- 中文语音识别
- LLM 用中文理解和回复
- 中文按钮和建议

### 英文用户
- 完整的英文界面
- 英文语音识别
- LLM 用英文理解和回复
- 英文按钮和建议

## 测试建议

1. **语言切换测试**
   - 切换到中文，发送中文命令
   - 切换到英文，发送英文命令
   - 验证 LLM 响应语言正确

2. **语音识别测试**
   - 中文模式下说中文
   - 英文模式下说英文
   - 验证识别准确性

3. **界面显示测试**
   - 检查所有文本是否正确翻译
   - 检查 3D 模型是否完整显示（无裁切）
   - 检查按钮和标签是否对齐

## 后续优化建议

1. **更多语言支持**
   - 可以添加日语、韩语等
   - 扩展 `Language` 类型

2. **专业术语库**
   - 建立 BIM 专业术语中英对照表
   - 确保翻译的专业性和准确性

3. **上下文记忆**
   - LLM 记住之前的对话语言
   - 自动适应用户的语言偏好
