import React, { useState, useEffect } from 'react';
import { SpeckleProject, ProjectModalState, AddProjectFormState, EditProjectFormState, DeleteConfirmState } from '../types';
import { getProjects, addProject, deleteProject, updateProject } from '../services/projectService';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectSelect: (project: SpeckleProject) => void;
  currentProjectId?: string | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onProjectSelect, currentProjectId }) => {
  const [modalState, setModalState] = useState<ProjectModalState>({
    isOpen: false,
    projects: [],
    isLoading: false,
    error: undefined
  });
  
  const [addFormState, setAddFormState] = useState<AddProjectFormState>({
    isOpen: false,
    name: '',
    speckleUrl: '',
    description: '',
    errors: {}
  });

  const [editFormState, setEditFormState] = useState<EditProjectFormState>({
    isOpen: false,
    projectId: null,
    name: '',
    speckleUrl: '',
    description: '',
    errors: {}
  });

  const [deleteConfirmState, setDeleteConfirmState] = useState<DeleteConfirmState>({
    isOpen: false,
    projectId: null,
    projectName: ''
  });

  // 加载项目列表
  const loadProjects = async () => {
    setModalState(prev => ({ ...prev, isLoading: true, error: undefined }));
    try {
      const projects = await getProjects();
      setModalState(prev => ({ ...prev, projects, isLoading: false }));
    } catch (error) {
      setModalState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: '加载项目失败，请稍后重试' 
      }));
    }
  };

  // 当弹窗打开时加载项目
  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  // 处理添加项目表单提交
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    const errors: Record<string, string> = {};
    if (!addFormState.name.trim()) {
      errors.name = '项目名称不能为空';
    }
    if (!addFormState.speckleUrl.trim()) {
      errors.speckleUrl = 'Speckle 链接不能为空';
    } else if (!addFormState.speckleUrl.includes('speckle.systems')) {
      errors.speckleUrl = '请输入有效的 Speckle 项目链接';
    }
    
    if (Object.keys(errors).length > 0) {
      setAddFormState(prev => ({ ...prev, errors }));
      return;
    }
    
    try {
      const newProject = await addProject({
        name: addFormState.name,
        speckleUrl: addFormState.speckleUrl,
        description: addFormState.description,
        thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/300/200.jpg`,
        isActive: true
      });
      
      // 重置表单并关闭
      setAddFormState({
        isOpen: false,
        name: '',
        speckleUrl: '',
        description: '',
        errors: {}
      });
      
      // 重新加载项目列表
      loadProjects();
    } catch (error) {
      setAddFormState(prev => ({
        ...prev,
        errors: { submit: '添加项目失败，请稍后重试' }
      }));
    }
  };

  // 处理编辑项目
  const handleEditProject = (project: SpeckleProject) => {
    setEditFormState({
      isOpen: true,
      projectId: project.id,
      name: project.name,
      speckleUrl: project.speckleUrl,
      description: project.description || '',
      errors: {}
    });
  };

  // 处理编辑项目表单提交
  const handleEditProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    const errors: Record<string, string> = {};
    if (!editFormState.name.trim()) {
      errors.name = '项目名称不能为空';
    }
    if (!editFormState.speckleUrl.trim()) {
      errors.speckleUrl = 'Speckle 链接不能为空';
    } else if (!editFormState.speckleUrl.includes('speckle.systems')) {
      errors.speckleUrl = '请输入有效的 Speckle 项目链接';
    }
    
    if (Object.keys(errors).length > 0) {
      setEditFormState(prev => ({ ...prev, errors }));
      return;
    }
    
    try {
      await updateProject(editFormState.projectId!, {
        name: editFormState.name,
        speckleUrl: editFormState.speckleUrl,
        description: editFormState.description
      });
      
      // 重置表单并关闭
      setEditFormState({
        isOpen: false,
        projectId: null,
        name: '',
        speckleUrl: '',
        description: '',
        errors: {}
      });
      
      // 重新加载项目列表
      loadProjects();
    } catch (error) {
      setEditFormState(prev => ({
        ...prev,
        errors: { submit: '更新项目失败，请稍后重试' }
      }));
    }
  };

  // 处理删除项目确认
  const handleDeleteProject = (project: SpeckleProject) => {
    setDeleteConfirmState({
      isOpen: true,
      projectId: project.id,
      projectName: project.name
    });
  };

  // 确认删除项目
  const confirmDeleteProject = async () => {
    try {
      await deleteProject(deleteConfirmState.projectId!);
      setDeleteConfirmState({
        isOpen: false,
        projectId: null,
        projectName: ''
      });
      loadProjects();
    } catch (error) {
      alert('删除项目失败，请稍后重试');
    }
  };

  // 如果弹窗未打开，返回 null
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800">项目管理</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAddFormState(prev => ({ ...prev, isOpen: true }))}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="text-lg">+</span>
              <span>添加项目</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* 弹窗内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {modalState.isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-slate-600">加载项目中...</p>
              </div>
            </div>
          ) : modalState.error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-2">⚠️</div>
                <p className="text-slate-600">{modalState.error}</p>
                <button 
                  onClick={loadProjects}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  重试
                </button>
              </div>
            </div>
          ) : modalState.projects.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-slate-400 text-4xl mb-2">📁</div>
                <p className="text-slate-600 mb-4">暂无项目</p>
                <button
                  onClick={() => setAddFormState(prev => ({ ...prev, isOpen: true }))}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  添加第一个项目
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modalState.projects.map(project => (
                <div 
                  key={project.id} 
                  className={`border rounded-lg overflow-hidden transition-all hover:shadow-lg ${
                    currentProjectId === project.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  {/* 项目缩略图 */}
                  <div className="h-40 bg-slate-100 relative">
                    {project.thumbnailUrl ? (
                      <img 
                        src={project.thumbnailUrl} 
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-slate-400 text-4xl">🏗️</div>
                      </div>
                    )}
                    {currentProjectId === project.id && (
                      <div className="absolute top-2 right-2">
                        <span 
                          className="inline-block w-3 h-3 rounded-full bg-blue-500"
                          title="当前项目"
                        ></span>
                      </div>
                    )}
                  </div>
                  
                  {/* 项目信息 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-slate-800 mb-1">{project.name}</h3>
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                      {project.description || '暂无描述'}
                    </p>
                    
                    {/* 操作按钮 */}
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => onProjectSelect(project)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {currentProjectId === project.id ? '当前项目' : '查看项目'}
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditProject(project)}
                          className="text-slate-600 hover:text-slate-800 text-sm"
                          title="编辑项目"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project)}
                          className="text-red-600 hover:text-red-700 text-sm"
                          title="删除项目"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 添加项目弹窗 */}
      {addFormState.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">添加新项目</h3>
            
            <form onSubmit={handleAddProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  项目名称 *
                </label>
                <input
                  type="text"
                  value={addFormState.name}
                  onChange={(e) => setAddFormState(prev => ({ 
                    ...prev, 
                    name: e.target.value,
                    errors: { ...prev.errors, name: undefined }
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    addFormState.errors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="输入项目名称"
                />
                {addFormState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{addFormState.errors.name}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Speckle 链接 *
                </label>
                <input
                  type="url"
                  value={addFormState.speckleUrl}
                  onChange={(e) => setAddFormState(prev => ({ 
                    ...prev, 
                    speckleUrl: e.target.value,
                    errors: { ...prev.errors, speckleUrl: undefined }
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    addFormState.errors.speckleUrl ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="https://app.speckle.systems/projects/..."
                />
                {addFormState.errors.speckleUrl && (
                  <p className="mt-1 text-sm text-red-600">{addFormState.errors.speckleUrl}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  项目描述
                </label>
                <textarea
                  value={addFormState.description}
                  onChange={(e) => setAddFormState(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="输入项目描述（可选）"
                />
              </div>
              
              {addFormState.errors.submit && (
                <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                  {addFormState.errors.submit}
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddFormState({
                    isOpen: false,
                    name: '',
                    speckleUrl: '',
                    description: '',
                    errors: {}
                  })}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  添加项目
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 编辑项目弹窗 */}
      {editFormState.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-4">编辑项目</h3>
            
            <form onSubmit={handleEditProjectSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  项目名称 *
                </label>
                <input
                  type="text"
                  value={editFormState.name}
                  onChange={(e) => setEditFormState(prev => ({ 
                    ...prev, 
                    name: e.target.value,
                    errors: { ...prev.errors, name: undefined }
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    editFormState.errors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="输入项目名称"
                />
                {editFormState.errors.name && (
                  <p className="mt-1 text-sm text-red-600">{editFormState.errors.name}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Speckle 链接 *
                </label>
                <input
                  type="url"
                  value={editFormState.speckleUrl}
                  onChange={(e) => setEditFormState(prev => ({ 
                    ...prev, 
                    speckleUrl: e.target.value,
                    errors: { ...prev.errors, speckleUrl: undefined }
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    editFormState.errors.speckleUrl ? 'border-red-500' : 'border-slate-300'
                  }`}
                  placeholder="https://app.speckle.systems/projects/..."
                />
                {editFormState.errors.speckleUrl && (
                  <p className="mt-1 text-sm text-red-600">{editFormState.errors.speckleUrl}</p>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  项目描述
                </label>
                <textarea
                  value={editFormState.description}
                  onChange={(e) => setEditFormState(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="输入项目描述（可选）"
                />
              </div>
              
              {editFormState.errors.submit && (
                <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                  {editFormState.errors.submit}
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditFormState({
                    isOpen: false,
                    projectId: null,
                    name: '',
                    speckleUrl: '',
                    description: '',
                    errors: {}
                  })}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存更改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {deleteConfirmState.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">确认删除项目</h3>
            <p className="text-slate-600 text-center mb-6">
              确定要删除项目 "<span className="font-semibold">{deleteConfirmState.projectName}</span>" 吗？此操作不可撤销。
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmState({
                  isOpen: false,
                  projectId: null,
                  projectName: ''
                })}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteProject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectModal;