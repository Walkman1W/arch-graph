/**
 * A2A Protocol Module - Google Agent2Agent 协议实现
 * 
 * 导出所有 A2A 相关的类型、服务端和客户端
 */

// 类型定义
export * from './types';

// 服务端
export { A2AServer, InMemoryTaskStore } from './A2AServer';
export type { TaskContext, TaskYieldUpdate, TaskHandler, A2AServerOptions } from './A2AServer';

// 客户端
export { A2AClient } from './A2AClient';

// BIM Agent 实现
export { 
  BIM_AGENT_CARD, 
  bimAgentHandler, 
  createBIMAgentServer 
} from './BIMAgent';
