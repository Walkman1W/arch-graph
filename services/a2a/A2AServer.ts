/**
 * A2A Server - 实现 Agent2Agent 协议的服务端
 * 
 * 这个示例展示如何将 Arch-Graph 的 BIM 查询能力暴露为 A2A Agent
 */

import type {
  AgentCard,
  Task,
  TaskState,
  TaskSendParams,
  TaskQueryParams,
  TaskCancelParams,
  Message,
  Artifact,
  JSONRPCMessage,
  JSONRPCError,
  TaskStatusUpdateEvent,
  TaskArtifactUpdateEvent,
  A2AErrorCodes,
} from './types';

// ============ Task Handler 类型 ============

export interface TaskContext {
  task: Task;
  isCancelled: () => boolean;
}

export type TaskYieldUpdate = 
  | { state: TaskState; message?: Message }
  | Artifact;

export type TaskHandler = (
  context: TaskContext
) => AsyncGenerator<TaskYieldUpdate>;

// ============ Task Store ============

export class InMemoryTaskStore {
  private tasks: Map<string, Task> = new Map();

  async get(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  async set(task: Task): Promise<void> {
    this.tasks.set(task.id, task);
  }

  async delete(id: string): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async list(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
}

// ============ A2A Server ============

export interface A2AServerOptions {
  agentCard: AgentCard;
  taskStore?: InMemoryTaskStore;
  port?: number;
}

export class A2AServer {
  private agentCard: AgentCard;
  private taskStore: InMemoryTaskStore;
  private taskHandler: TaskHandler;
  private cancelledTasks: Set<string> = new Set();
  private port: number;

  constructor(handler: TaskHandler, options: A2AServerOptions) {
    this.taskHandler = handler;
    this.agentCard = options.agentCard;
    this.taskStore = options.taskStore || new InMemoryTaskStore();
    this.port = options.port || 41241;
  }

  /**
   * 获取 Agent Card - 用于 Agent 发现
   */
  getAgentCard(): AgentCard {
    return this.agentCard;
  }

  /**
   * 处理 JSON-RPC 请求
   */
  async handleRequest(request: JSONRPCMessage): Promise<JSONRPCMessage> {
    const { id, method, params } = request;

    try {
      let result: unknown;

      switch (method) {
        case 'tasks/send':
          result = await this.handleTaskSend(params as TaskSendParams);
          break;
        case 'tasks/get':
          result = await this.handleTaskGet(params as TaskQueryParams);
          break;
        case 'tasks/cancel':
          result = await this.handleTaskCancel(params as TaskCancelParams);
          break;
        default:
          return this.errorResponse(id, -32601, `Method not found: ${method}`);
      }

      return {
        jsonrpc: '2.0',
        id,
        result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal error';
      return this.errorResponse(id, -32603, message);
    }
  }

  /**
   * 处理流式请求 (SSE)
   */
  async *handleStreamRequest(
    request: JSONRPCMessage
  ): AsyncGenerator<TaskStatusUpdateEvent | TaskArtifactUpdateEvent> {
    const { method, params } = request;

    if (method !== 'tasks/sendSubscribe') {
      throw new Error(`Streaming not supported for method: ${method}`);
    }

    const taskParams = params as TaskSendParams;
    const task = await this.createTask(taskParams);

    const context: TaskContext = {
      task,
      isCancelled: () => this.cancelledTasks.has(task.id),
    };

    let artifactIndex = 0;

    for await (const update of this.taskHandler(context)) {
      if ('state' in update) {
        // Status update
        task.status = {
          state: update.state,
          message: update.message,
          timestamp: new Date().toISOString(),
        };
        await this.taskStore.set(task);

        const isFinal = ['completed', 'failed', 'canceled'].includes(update.state);
        
        yield {
          id: task.id,
          status: task.status,
          final: isFinal,
        };

        if (isFinal) break;
      } else {
        // Artifact update
        const artifact: Artifact = {
          ...update,
          index: artifactIndex++,
        };
        
        if (!task.artifacts) task.artifacts = [];
        task.artifacts.push(artifact);
        await this.taskStore.set(task);

        yield {
          id: task.id,
          artifact,
        };
      }
    }
  }

  // ============ Private Methods ============

  private async createTask(params: TaskSendParams): Promise<Task> {
    const task: Task = {
      id: params.id,
      sessionId: params.sessionId,
      status: {
        state: 'submitted',
        timestamp: new Date().toISOString(),
      },
      history: [params.message],
      metadata: params.metadata,
    };

    await this.taskStore.set(task);
    return task;
  }

  private async handleTaskSend(params: TaskSendParams): Promise<Task> {
    const task = await this.createTask(params);
    
    // 非流式模式：运行完整的 handler
    const context: TaskContext = {
      task,
      isCancelled: () => this.cancelledTasks.has(task.id),
    };

    for await (const update of this.taskHandler(context)) {
      if ('state' in update) {
        task.status = {
          state: update.state,
          message: update.message,
          timestamp: new Date().toISOString(),
        };
      } else {
        if (!task.artifacts) task.artifacts = [];
        task.artifacts.push(update);
      }
    }

    await this.taskStore.set(task);
    return task;
  }

  private async handleTaskGet(params: TaskQueryParams): Promise<Task | null> {
    return this.taskStore.get(params.id);
  }

  private async handleTaskCancel(params: TaskCancelParams): Promise<Task | null> {
    const task = await this.taskStore.get(params.id);
    if (!task) return null;

    this.cancelledTasks.add(params.id);
    task.status = {
      state: 'canceled',
      timestamp: new Date().toISOString(),
    };
    await this.taskStore.set(task);
    return task;
  }

  private errorResponse(
    id: string | number | null | undefined,
    code: number,
    message: string
  ): JSONRPCMessage {
    return {
      jsonrpc: '2.0',
      id: id ?? null,
      error: { code, message },
    };
  }
}
