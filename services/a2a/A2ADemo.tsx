/**
 * A2A Demo Component - 演示 A2A 协议的实际使用
 * 
 * 这个组件展示如何在 React 应用中使用 A2A Client 调用 Agent
 */

import React, { useState, useCallback } from 'react';
import { A2AClient } from './A2AClient';
import type { AgentCard, Task, TaskUpdateEvent } from './types';

interface A2ADemoProps {
  agentUrl?: string;
}

export const A2ADemo: React.FC<A2ADemoProps> = ({ 
  agentUrl = 'http://localhost:41241' 
}) => {
  const [agentCard, setAgentCard] = useState<AgentCard | null>(null);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [artifacts, setArtifacts] = useState<Array<{ name: string; content: string }>>([]);

  const client = new A2AClient(agentUrl);

  // 发现 Agent
  const discoverAgent = useCallback(async () => {
    try {
      const card = await client.getAgentCard();
      setAgentCard(card);
      setMessages(prev => [...prev, {
        role: 'system',
        content: `✅ 已连接到 Agent: ${card.name}\n描述: ${card.description}\n技能: ${card.skills.map(s => s.name).join(', ')}`,
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'error',
        content: `❌ 连接失败: ${error instanceof Error ? error.message : '未知错误'}`,
      }]);
    }
  }, [agentUrl]);

  // 发送查询 (流式)
  const sendQuery = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: query }]);
    setArtifacts([]);

    const taskId = crypto.randomUUID();

    try {
      const stream = client.sendTaskSubscribe({
        id: taskId,
        message: {
          role: 'user',
          parts: [{ text: query }],
        },
      });

      for await (const event of stream) {
        if ('status' in event) {
          // 状态更新
          const statusText = event.status.message?.parts
            .filter((p): p is { text: string } => 'text' in p)
            .map(p => p.text)
            .join(' ') || '';

          if (statusText) {
            setMessages(prev => [...prev, {
              role: 'agent',
              content: `[${event.status.state}] ${statusText}`,
            }]);
          }
        } else if ('artifact' in event) {
          // Artifact 更新
          const artifactContent = event.artifact.parts
            .map(p => {
              if ('text' in p) return p.text;
              if ('data' in p) return JSON.stringify(p.data, null, 2);
              return '';
            })
            .join('\n');

          setArtifacts(prev => [...prev, {
            name: event.artifact.name || `artifact-${event.artifact.index}`,
            content: artifactContent,
          }]);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'error',
        content: `❌ 查询失败: ${error instanceof Error ? error.message : '未知错误'}`,
      }]);
    } finally {
      setIsLoading(false);
      setQuery('');
    }
  }, [query]);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white p-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
        <div>
          <h2 className="text-lg font-semibold">A2A Protocol Demo</h2>
          <p className="text-sm text-slate-400">
            {agentCard ? `已连接: ${agentCard.name}` : '未连接'}
          </p>
        </div>
        <button
          onClick={discoverAgent}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-colors"
        >
          发现 Agent
        </button>
      </div>

      {/* Agent Skills */}
      {agentCard && (
        <div className="mb-4 p-3 bg-slate-800 rounded-lg">
          <h3 className="text-sm font-medium mb-2">可用技能:</h3>
          <div className="flex flex-wrap gap-2">
            {agentCard.skills.map(skill => (
              <span
                key={skill.id}
                className="px-2 py-1 bg-slate-700 rounded text-xs"
                title={skill.description}
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-600 ml-8'
                : msg.role === 'error'
                ? 'bg-red-600/50'
                : msg.role === 'system'
                ? 'bg-green-600/30'
                : 'bg-slate-700 mr-8'
            }`}
          >
            <div className="text-xs text-slate-300 mb-1">
              {msg.role === 'user' ? '你' : msg.role === 'agent' ? 'Agent' : msg.role}
            </div>
            <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            处理中...
          </div>
        )}
      </div>

      {/* Artifacts */}
      {artifacts.length > 0 && (
        <div className="mb-4 p-3 bg-slate-800 rounded-lg">
          <h3 className="text-sm font-medium mb-2">产出物 (Artifacts):</h3>
          <div className="space-y-2">
            {artifacts.map((artifact, idx) => (
              <details key={idx} className="bg-slate-700 rounded p-2">
                <summary className="cursor-pointer text-sm">{artifact.name}</summary>
                <pre className="mt-2 text-xs overflow-x-auto p-2 bg-slate-900 rounded">
                  {artifact.content}
                </pre>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !isLoading && sendQuery()}
          placeholder="输入 BIM 查询，如：查询3楼所有房间"
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
          disabled={isLoading || !agentCard}
        />
        <button
          onClick={sendQuery}
          disabled={isLoading || !agentCard || !query.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          发送
        </button>
      </div>
    </div>
  );
};

export default A2ADemo;
