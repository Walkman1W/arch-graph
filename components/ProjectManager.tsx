import React, { useState, useEffect } from 'react';
import { Project, ProjectFormData, ProjectState } from '@/types';
import { projectService } from '@/services/projectService';
import { speckleUtils } from '@/utils/speckleUtils';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectsChange: () => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  isOpen,
  onClose,
  onProjectsChange,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const loadProjects = () => {
    const projectState = projectService.loadProjects();
    setProjects(projectState.projects);
  };

  const getProjectState = (): ProjectState => {
    return {
      projects,
      activeProjectId: projects.find(p => p.isActive)?.id || null,
    };
  };

  const handleAddClick = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleFormSubmit = (data: ProjectFormData) => {
    const thumbnailUrl = speckleUtils.getThumbnailUrl(data.speckleUrl);
    
    if (editingProject) {
      const updatedProject = projectService.updateProject(editingProject, data, thumbnailUrl);
      const newState = projectService.updateProjectInState(getProjectState(), updatedProject);
      setProjects(newState.projects);
    } else {
      const newProject = projectService.createProject(data, thumbnailUrl);
      const newState = projectService.addProject(getProjectState(), newProject);
      setProjects(newState.projects);
    }
    
    setShowForm(false);
    setEditingProject(null);
    onProjectsChange();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  const handleDeleteClick = (projectId: string) => {
    setDeleteConfirm(projectId);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      const newState = projectService.deleteProject(getProjectState(), deleteConfirm);
      setProjects(newState.projects);
      setDeleteConfirm(null);
      onProjectsChange();
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleActivateProject = (projectId: string) => {
    const newState = projectService.setActiveProject(getProjectState(), projectId);
    setProjects(newState.projects);
    onProjectsChange();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800">项目管理</h2>
              <span className="bg-slate-100 text-slate-600 text-sm px-2 py-0.5 rounded-full">
                {projects.length} 个项目
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddClick}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加项目
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无项目</h3>
                <p className="text-slate-500 mb-4">点击右上角的"添加项目"按钮开始添加</p>
                <button
                  onClick={handleAddClick}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  添加第一个项目
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onActivate={handleActivateProject}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <ProjectForm
          project={editingProject}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">确认删除</h3>
            </div>
            <p className="text-slate-600 mb-6">
              确定要删除这个项目吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectManager;
