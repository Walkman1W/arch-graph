# 项目管理和语言切换功能指南

## 功能概述

Arch-Graph 现在支持多项目管理和中英文界面切换功能。

## 项目管理

### 添加新项目

1. 点击顶部导航栏左侧的项目选择器（显示当前项目名称）
2. 在下拉菜单底部点击"添加项目"按钮
3. 在弹出的对话框中输入：
   - **项目名称**：为项目起一个有意义的名称
   - **模型嵌入链接**：粘贴完整的 iframe 标签或直接粘贴 src URL

### 支持的链接格式

#### 方式 1：完整的 iframe 标签
```html
<iframe title="Speckle" src="https://app.speckle.systems/projects/8094b71f79/models/c0404b2173?embedToken=9f765d23ee7a1951e1243388ea012db2c0b5b45e73#embed=%7B%22isEnabled%22%3Atrue%7D" width="600" height="400" frameborder="0"></iframe>
```

#### 方式 2：直接粘贴 src URL
```
https://app.speckle.systems/projects/8094b71f79/models/c0404b2173?embedToken=9f765d23ee7a1951e1243388ea012db2c0b5b45e73#embed=%7B%22isEnabled%22%3Atrue%7D
```

系统会自动从 iframe 标签中提取 src URL，避免嵌套问题。

### 切换项目

1. 点击项目选择器
2. 从列表中选择要查看的项目
3. 3D 模型查看器会自动加载新项目的模型

### 删除项目

1. 点击项目选择器打开列表
2. 鼠标悬停在要删除的项目上
3. 点击右侧出现的删除按钮（垃圾桶图标）
4. 确认删除

**注意**：系统至少保留一个项目，无法删除最后一个项目。

## 语言切换

### 切换界面语言

1. 在顶部导航栏右上角，用户头像左侧找到语言切换按钮
2. 点击按钮在中文（中）和英文（EN）之间切换
3. 界面所有文本会立即更新为选择的语言

### 支持的语言

- **中文**：默认语言，适合中文用户
- **English**：英文界面，适合国际用户

## 数据持久化

- 所有项目数据保存在浏览器的 localStorage 中
- 语言偏好也会被记住
- 下次打开应用时会自动恢复上次的设置
- 无需后端服务器或数据库

## 技术实现

### 项目管理
- **Context**: `ProjectContext.tsx` 管理项目状态
- **组件**: `ProjectSelector.tsx` 提供 UI 交互
- **URL 提取**: 自动从 iframe 标签中提取 src 属性

### 国际化
- **Context**: `I18nContext.tsx` 管理语言状态和翻译
- **组件**: `LanguageSwitcher.tsx` 提供语言切换按钮
- **翻译**: 所有文本集中在 `I18nContext.tsx` 中管理

## 品牌更新

应用已从 "SmartBIM" 更名为 **"Arch-Graph"**：
- Logo 图标：渐变蓝紫色 "A"
- 品牌名称：Arch**Graph**（Graph 部分为蓝色）
- 所有 "Speckle" 相关文字已改为更通用的描述
