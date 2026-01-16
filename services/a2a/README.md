# A2A Protocol 实现指南

## 什么是 A2A (Agent2Agent) 协议？

A2A 是 Google 于 2025 年 4 月发布的开放协议，旨在让不同厂商、不同框架构建的 AI Agent 能够相互通信和协作。可以把它理解为 **AI Agent 世界的 HTTP 协议**。

## 核心概念

### 1. Agent Card (Agent 名片)
每个 Agent 在 `/.well-known/agent.json` 暴露自己的能力描述：

```json
{
  "name": "Arch-Graph BIM Agent",
  "description": "BIM 智能查询助手",
  "skills": [
    { "id": "spatial-query", "name": "空间查询" },
    { "id": "path-planning", "name": "路径规划" }
  ],
  "capabilities": { "streaming": true }
}
```

### 2. Task (任务)
工作单元，有状态流转：
- `submitted` → `working` → `completed` / `failed` / `canceled`

### 3. Message & Artifact
- **Message**: Agent 之间的对话消息
- **Artifact**: 任务产出物（文件、数据等）

## 协议流程

```
┌─────────────────┐                    ┌─────────────────┐
│  Client Agent   │                    │  Server Agent   │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         │ ─── GET /.well-known/agent.json ───> │  发现 Agent
         │ <────────── Agent Card ───────────── │
         │                                      │
         │ ─────── tasks/send ────────────────> │  发送任务
         │ <────────── Task ─────────────────── │
         │                                      │
         │ ─────── tasks/sendSubscribe ───────> │  流式订阅
         │ <────────── SSE Events ───────────── │
         │                                      │
```

## 文件结构

```
services/a2a/
├── types.ts          # A2A 协议类型定义
├── A2AServer.ts      # 服务端实现
├── A2AClient.ts      # 客户端实现
├── BIMAgent.ts       # BIM Agent 示例
├── A2ADemo.tsx       # React 演示组件
└── index.ts          # 模块导出
```

## 使用示例

### 1. 创建 Agent Server

```typescript
import { A2AServer, InMemoryTaskStore } from './services/a2a';
import type { TaskContext, TaskYieldUpdate, AgentCard } from './services/a2a';

// 定义 Agent Card
const agentCard: AgentCard = {
  name: 'My Agent',
  description: '我的 AI Agent',
  url: 'http://localhost:41241',
  version: '1.0.0',
  capabilities: { streaming: true },
  skills: [
    { id: 'chat', name: '对话', description: '自然语言对话' }
  ],
};

// 定义任务处理器
async function* myHandler(ctx: TaskContext): AsyncGenerator<TaskYieldUpdate> {
  yield { state: 'working', message: { role: 'agent', parts: [{ text: '处理中...' }] } };
  
  // 执行任务逻辑...
  
  yield { state: 'completed', message: { role: 'agent', parts: [{ text: '完成!' }] } };
}

// 创建服务器
const server = new A2AServer(myHandler, { agentCard });
```

### 2. 使用 Client 调用 Agent

```typescript
import { A2AClient } from './services/a2a';

const client = new A2AClient('http://localhost:41241');

// 发现 Agent
const card = await client.getAgentCard();
console.log('Agent:', card.name);

// 发送任务 (非流式)
const task = await client.sendTask({
  id: crypto.randomUUID(),
  message: { role: 'user', parts: [{ text: '查询3楼房间' }] },
});

// 发送任务 (流式)
for await (const event of client.sendTaskSubscribe({
  id: crypto.randomUUID(),
  message: { role: 'user', parts: [{ text: '查询3楼房间' }] },
})) {
  if ('status' in event) {
    console.log('状态:', event.status.state);
  } else {
    console.log('产出物:', event.artifact.name);
  }
}
```

### 3. 在 React 中使用

```tsx
import { A2ADemo } from './services/a2a/A2ADemo';

function App() {
  return <A2ADemo agentUrl="http://localhost:41241" />;
}
```

## BIM Agent 示例

本项目包含一个完整的 BIM Agent 实现，支持：

| 技能 | 描述 | 示例查询 |
|------|------|----------|
| 空间查询 | 查询建筑空间信息 | "查询3楼所有房间" |
| 路径规划 | 计算最优路径 | "从大厅到会议室的路径" |
| 管线分析 | 分析管道穿越关系 | "分析穿过3楼的管道" |
| 构件查询 | 查询建筑构件 | "查询所有防火门" |

## 与 MCP 的关系

| 协议 | 用途 | 类比 |
|------|------|------|
| **MCP** (Model Context Protocol) | 为 Agent 提供工具和上下文 | USB 接口 |
| **A2A** (Agent2Agent) | Agent 之间的通信协作 | HTTP 协议 |

两者互补：MCP 让 Agent 获得能力，A2A 让 Agent 协作。

## 参考资源

- [Google A2A 官方仓库](https://github.com/google/A2A)
- [A2A 协议规范](https://a2aproject.org/)
- [官方 Python SDK](https://github.com/a2aproject/a2a-python)
- [官方 JavaScript SDK](https://github.com/a2aproject/a2a-js)
