/**
 * BIM Agent - 基于 A2A 协议的 BIM 查询 Agent
 * 
 * 这是一个实际案例，展示如何将 Arch-Graph 的 BIM 能力暴露为 A2A Agent
 * 其他 Agent 可以通过 A2A 协议调用此 Agent 进行建筑信息查询
 */

import { A2AServer, TaskContext, TaskYieldUpdate, InMemoryTaskStore } from './A2AServer';
import type { AgentCard, Message } from './types';

// ============ BIM Agent Card 定义 ============

export const BIM_AGENT_CARD: AgentCard = {
  name: 'Arch-Graph BIM Agent',
  description: '建筑信息模型(BIM)智能查询助手，支持空间分析、路径规划、管线穿越分析等功能',
  url: 'http://localhost:41241',
  version: '1.0.0',
  capabilities: {
    streaming: true,
    pushNotifications: false,
    stateTransitionHistory: true,
  },
  skills: [
    {
      id: 'spatial-query',
      name: '空间查询',
      description: '查询建筑空间信息，如楼层、房间、面积等',
      tags: ['bim', 'space', 'query'],
      examples: [
        '查询3楼所有房间',
        '显示建筑的空间分布',
        '哪些房间面积大于50平米',
      ],
    },
    {
      id: 'path-planning',
      name: '路径规划',
      description: '计算建筑内两点之间的最优路径',
      tags: ['bim', 'path', 'navigation'],
      examples: [
        '从大厅到会议室的路径',
        '规划从A区到B区的最短路线',
      ],
    },
    {
      id: 'pipe-analysis',
      name: '管线分析',
      description: '分析管道、风管、电缆的穿越关系',
      tags: ['bim', 'mep', 'pipe'],
      examples: [
        '分析穿过3楼的所有管道',
        '查询消防管道的路径',
      ],
    },
    {
      id: 'element-query',
      name: '构件查询',
      description: '查询建筑构件信息，如门窗、墙体等',
      tags: ['bim', 'element', 'component'],
      examples: [
        '查询所有防火门',
        '显示承重墙的位置',
      ],
    },
  ],
  defaultInputModes: ['text'],
  defaultOutputModes: ['text', 'data'],
  provider: {
    organization: 'Arch-Graph',
    url: 'https://arch-graph.example.com',
  },
};

// ============ BIM 查询处理逻辑 ============

interface BIMQueryResult {
  type: 'spatial' | 'path' | 'pipe' | 'element';
  data: unknown;
  cypher?: string;
}

/**
 * 解析用户查询意图
 */
function parseQueryIntent(text: string): { skill: string; params: Record<string, string> } {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('路径') || lowerText.includes('导航') || lowerText.includes('怎么走')) {
    return { skill: 'path-planning', params: { query: text } };
  }
  
  if (lowerText.includes('管道') || lowerText.includes('管线') || lowerText.includes('风管') || lowerText.includes('电缆')) {
    return { skill: 'pipe-analysis', params: { query: text } };
  }
  
  if (lowerText.includes('空间') || lowerText.includes('房间') || lowerText.includes('楼层') || lowerText.includes('面积')) {
    return { skill: 'spatial-query', params: { query: text } };
  }
  
  return { skill: 'element-query', params: { query: text } };
}

/**
 * 模拟 BIM 查询执行 (实际项目中会调用 Neo4j)
 */
async function executeBIMQuery(skill: string, params: Record<string, string>): Promise<BIMQueryResult> {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 500));
  
  switch (skill) {
    case 'spatial-query':
      return {
        type: 'spatial',
        cypher: `MATCH (l:Level)-[:CONTAINS]->(s:Space) WHERE l.name CONTAINS '3' RETURN s`,
        data: {
          spaces: [
            { id: 'space-301', name: '会议室A', area: 45.5, level: '3F' },
            { id: 'space-302', name: '办公区', area: 120.0, level: '3F' },
            { id: 'space-303', name: '茶水间', area: 15.0, level: '3F' },
          ],
          totalCount: 3,
          totalArea: 180.5,
        },
      };
      
    case 'path-planning':
      return {
        type: 'path',
        cypher: `MATCH path = shortestPath((a:Space {name:'大厅'})-[:CONNECTED_TO*]-(b:Space {name:'会议室'})) RETURN path`,
        data: {
          path: ['大厅', '走廊A', '电梯厅', '走廊B', '会议室A'],
          distance: 45.2,
          estimatedTime: '2分钟',
        },
      };
      
    case 'pipe-analysis':
      return {
        type: 'pipe',
        cypher: `MATCH (p:Pipe)-[:PASSES_THROUGH]->(s:Space) WHERE s.level = '3F' RETURN p, s`,
        data: {
          pipes: [
            { id: 'pipe-001', type: '给水管', diameter: 50, spaces: ['会议室A', '茶水间'] },
            { id: 'pipe-002', type: '消防管', diameter: 100, spaces: ['走廊A', '走廊B', '办公区'] },
          ],
          totalLength: 85.3,
        },
      };
      
    default:
      return {
        type: 'element',
        cypher: `MATCH (e:Element) WHERE e.category = 'Door' RETURN e LIMIT 10`,
        data: {
          elements: [
            { id: 'door-001', name: '防火门-A', category: 'Door', fireRating: '甲级' },
            { id: 'door-002', name: '普通门-B', category: 'Door', fireRating: null },
          ],
          totalCount: 2,
        },
      };
  }
}

// ============ BIM Agent Task Handler ============

/**
 * BIM Agent 的任务处理器
 * 这是 A2A 协议的核心：定义 Agent 如何处理任务
 */
export async function* bimAgentHandler(
  context: TaskContext
): AsyncGenerator<TaskYieldUpdate> {
  const { task } = context;
  
  // 获取用户消息
  const userMessage = task.history?.find(m => m.role === 'user');
  const userText = userMessage?.parts
    .filter((p): p is { text: string } => 'text' in p)
    .map(p => p.text)
    .join(' ') || '';

  if (!userText) {
    yield {
      state: 'failed',
      message: {
        role: 'agent',
        parts: [{ text: '未收到有效的查询内容' }],
      },
    };
    return;
  }

  // 1. 开始处理
  yield {
    state: 'working',
    message: {
      role: 'agent',
      parts: [{ text: '正在分析您的 BIM 查询...' }],
    },
  };

  // 检查是否被取消
  if (context.isCancelled()) {
    yield { state: 'canceled' };
    return;
  }

  // 2. 解析查询意图
  const { skill, params } = parseQueryIntent(userText);
  
  yield {
    state: 'working',
    message: {
      role: 'agent',
      parts: [{ text: `识别到查询类型: ${skill}，正在执行查询...` }],
    },
  };

  // 3. 执行 BIM 查询
  try {
    const result = await executeBIMQuery(skill, params);

    // 4. 输出 Cypher 查询作为 artifact
    if (result.cypher) {
      yield {
        name: 'cypher-query.txt',
        description: '生成的 Cypher 查询语句',
        parts: [{ text: result.cypher }],
      };
    }

    // 5. 输出查询结果作为 artifact
    yield {
      name: 'query-result.json',
      description: 'BIM 查询结果数据',
      parts: [{
        type: 'data',
        data: result.data as Record<string, unknown>,
      }],
    };

    // 6. 生成自然语言回复
    const summary = generateSummary(result);
    
    yield {
      state: 'completed',
      message: {
        role: 'agent',
        parts: [{ text: summary }],
      },
    };

  } catch (error) {
    yield {
      state: 'failed',
      message: {
        role: 'agent',
        parts: [{ 
          text: `查询执行失败: ${error instanceof Error ? error.message : '未知错误'}` 
        }],
      },
    };
  }
}

/**
 * 生成查询结果的自然语言摘要
 */
function generateSummary(result: BIMQueryResult): string {
  const data = result.data as Record<string, unknown>;
  
  switch (result.type) {
    case 'spatial': {
      const spaces = data.spaces as Array<{ name: string; area: number }>;
      return `查询到 ${spaces.length} 个空间，总面积 ${data.totalArea} 平方米。包括：${spaces.map(s => `${s.name}(${s.area}㎡)`).join('、')}。`;
    }
    case 'path': {
      const path = data.path as string[];
      return `已规划路径，途经 ${path.length} 个节点：${path.join(' → ')}。总距离 ${data.distance} 米，预计用时 ${data.estimatedTime}。`;
    }
    case 'pipe': {
      const pipes = data.pipes as Array<{ type: string; diameter: number }>;
      return `分析到 ${pipes.length} 条管线，总长度 ${data.totalLength} 米。包括：${pipes.map(p => `${p.type}(DN${p.diameter})`).join('、')}。`;
    }
    default: {
      const elements = data.elements as Array<{ name: string }>;
      return `查询到 ${data.totalCount} 个构件。包括：${elements.map(e => e.name).join('、')}。`;
    }
  }
}

// ============ 创建 BIM Agent Server ============

export function createBIMAgentServer(): A2AServer {
  return new A2AServer(bimAgentHandler, {
    agentCard: BIM_AGENT_CARD,
    taskStore: new InMemoryTaskStore(),
    port: 41241,
  });
}
