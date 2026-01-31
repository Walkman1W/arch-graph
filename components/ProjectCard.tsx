import React from 'react';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onActivate: (projectId: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, onActivate }) => {
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div
      className={`relative bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 hover:shadow-lg ${
        project.isActive
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {project.isActive && (
        <div className="absolute top-2 left-2 z-10 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
          当前项目
        </div>
      )}
      
      <div className="aspect-video bg-slate-100 relative overflow-hidden">
        <img
          src={project.thumbnailUrl}
          alt={project.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="225" viewBox="0 0 400 225"%3E%3Crect fill="%23e2e8f0" width="400" height="225"/%3E%3Ctext fill="%2394a3b8" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Preview%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-slate-800 text-lg truncate mb-1">
          {project.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3 min-h-[40px]">
          {project.description || '暂无描述'}
        </p>
        <p className="text-xs text-slate-400 mb-3">
          创建于 {formatDate(project.createdAt)}
        </p>
        
        <div className="flex items-center gap-2">
          {!project.isActive && (
            <button
              onClick={() => onActivate(project.id)}
              className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
            >
              激活
            </button>
          )}
          <button
            onClick={() => onEdit(project)}
            className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
          >
            编辑
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="bg-red-50 hover:bg-red-100 text-red-500 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
