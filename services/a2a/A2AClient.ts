/**
 * A2A Client - 实现 Agent2Agent 协议的客户端
 * 
 * 用于连接和调用其他 A2A Agent
 */

import type {
  AgentCard,
  Task,
  TaskSendParams,
  TaskQueryParams,
  TaskCancelParams,
  JSONRPCMessage,
  TaskStatusUpdateEvent,
  TaskArtifactUpdateEvent,
  TaskUpdateEvent,
} from './types';

export class A2AClient {
  private baseUrl: string;
  private agentCard: AgentCard | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // 移除尾部斜杠
  }

  /**
   * 获取 Agent Card - 发现 Agent 能力
   */
  async getAgentCard(): Promise<AgentCard> {
    if (this.agentCard) return this.agentCard;

    const response = await fetch(`${this.baseUrl}/.well-known/agent.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch agent card: ${response.statusText}`);
    }

    this.agentCard = await response.json();
    return this.agentCard!;
  }

  /**
   * 发送任务 (非流式)
   */
  async sendTask(params: TaskSendParams): Promise<Task | null> {
    const response = await this.rpcCall('tasks/send', params);
    return response.result as Task | null;
  }

  /**
   * 获取任务状态
   */
  async getTask(params: TaskQueryParams): Promise<Task | null> {
    const response = await this.rpcCall('tasks/get', params);
    return response.result as Task | null;
  }

  /**
   * 取消任务
   */
  async cancelTask(params: TaskCancelParams): Promise<Task | null> {
    const response = await this.rpcCall('tasks/cancel', params);
    return response.result as Task | null;
  }

  /**
   * 发送任务并订阅流式更新 (SSE)
   */
  async *sendTaskSubscribe(
    params: TaskSendParams
  ): AsyncGenerator<TaskUpdateEvent> {
    const request: JSONRPCMessage = {
      jsonrpc: '2.0',
      id: crypto.randomUUID(),
      method: 'tasks/sendSubscribe',
      params,
    };

    const response = await fetch(`${this.baseUrl}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const event = JSON.parse(data) as TaskUpdateEvent;
              yield event;

              // 检查是否是最终状态
              if ('status' in event && event.final) {
                return;
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // ============ Private Methods ============

  private async rpcCall(
    method: string,
    params: unknown
  ): Promise<JSONRPCMessage> {
    const request: JSONRPCMessage = {
      jsonrpc: '2.0',
      id: crypto.randomUUID(),
      method,
      params,
    };

    const response = await fetch(`${this.baseUrl}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`RPC Error: ${result.error.message}`);
    }

    return result;
  }
}
