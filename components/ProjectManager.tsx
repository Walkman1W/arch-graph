import React, { useState, useRef, useEffect } from 'react';
import { Project, ProjectFormData } from '../types';
import { useProjects } from '../hooks/useProjects';

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject?: (project: Project) => void;
  currentProjectId?: string | null;
}

type ViewMode = 'list' | 'add' | 'edit';

const ProjectManager: React.FC<ProjectManagerProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  currentProjectId,
}) => {
  const { projects, isLoaded, addProject, updateProject, deleteProject } = useProjects();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    speckleUrl: '',
    description: '',
  });
  const [formError, setFormError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭弹窗和菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuOpen(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ESC 键关闭弹窗
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (viewMode !== 'list') {
          setViewMode('list');
          setEditingProject(null);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, viewMode]);

  // 重置表单
  const resetForm = () => {
    setFormData({ name: '', speckleUrl: '', description: '' });
    setFormError('');
    setEditingProject(null);
  };

  // 打开添加模式
  const openAddMode = () => {
    resetForm();
    setViewMode('add');
  };

  // 打开编辑模式
  const openEditMode = (project: Project, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingProject(project);
    setFormData({
      name: project.name,
      speckleUrl: project.speckleUrl,
      description: project.description || '',
    });
    setViewMode('edit');
    setActionMenuOpen(null);
  };

  // 返回列表
  const backToList = () => {
    setViewMode('list');
    resetForm();
  };

  // 验证表单
  const validateForm = (): boolean => {
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('请输入项目名称');
      return false;
    }

    if (!formData.speckleUrl.trim()) {
      setFormError('请输入 Speckle 项目链接');
      return false;
    }

    if (!formData.speckleUrl.includes('speckle.systems')) {
      setFormError('请输入有效的 Speckle 链接（需包含 speckle.systems）');
      return false;
    }

    return true;
  };

  // 处理添加提交
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    addProject(formData);
    backToList();
  };

  // 处理编辑提交
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !editingProject) return;

    updateProject(editingProject.id, formData);
    backToList();
  };

  // 处理选择项目
  const handleSelectProject = (project: Project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
    onClose();
  };

  // 处理删除
  const handleDelete = (projectId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowDeleteConfirm(projectId);
    setActionMenuOpen(null);
  };

  // 确认删除
  const confirmDelete = (projectId: string) => {
    deleteProject(projectId);
    setShowDeleteConfirm(null);
  };

  // 切换操作菜单
  const toggleActionMenu = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionMenuOpen(actionMenuOpen === projectId ? null : projectId);
  };

  // 设置当前项目（仅切换，不关闭弹窗）
  const handleSetCurrent = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectProject) {
      onSelectProject(project);
    }
    setActionMenuOpen(null);
  };

  if (!isOpen || !isLoaded) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

      {/* 弹窗内容 */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            {viewMode !== 'list' && (
              <button
                onClick={backToList}
                className="p-2 hover:bg-slate-200 rounded-lg transition-colors mr-1"
                title="返回列表"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {viewMode === 'list' && '项目管理'}
                {viewMode === 'add' && '添加新项目'}
                {viewMode === 'edit' && '编辑项目'}
              </h2>
              <p className="text-sm text-slate-500">
                {viewMode === 'list' && '管理您的 Speckle 建筑项目'}
                {viewMode === 'add' && '创建一个新的 Speckle 项目连接'}
                {viewMode === 'edit' && `修改 "${editingProject?.name}" 的信息`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'list' && (
              <button
                onClick={openAddMode}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加项目
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              title="关闭"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 添加/编辑表单 */}
        {(viewMode === 'add' || viewMode === 'edit') && (
          <div className="px-6 py-6 bg-slate-50 border-b border-slate-200">
            <form onSubmit={viewMode === 'add' ? handleAddSubmit : handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    项目名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：总部大楼项目"
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Speckle 链接 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.speckleUrl}
                    onChange={(e) => setFormData({ ...formData, speckleUrl: e.target.value })}
                    placeholder="https://app.speckle.systems/projects/..."
                    className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">项目描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="输入项目描述（可选）"
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>
              {formError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formError}
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={backToList}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  {viewMode === 'add' ? '创建项目' : '保存修改'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 项目列表 */}
        {viewMode === 'list' && (
          <div className="flex-1 overflow-y-auto p-6">
            {projects.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-2">暂无项目</h3>
                <p className="text-sm text-slate-500 mb-5">点击右上角添加按钮创建您的第一个项目</p>
                <button
                  onClick={openAddMode}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  立即添加
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project) => {
                  const isCurrent = currentProjectId === project.id;
                  return (
                    <div
                      key={project.id}
                      onClick={() => handleSelectProject(project)}
                      className={`group relative bg-white border-2 rounded-xl overflow-hidden transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-blue-500 shadow-lg ring-2 ring-blue-100'
                          : 'border-slate-200 hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      {/* 当前项目标识 */}
                      {isCurrent && (
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full shadow-md">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          当前项目
                        </div>
                      )}

                      {/* 操作菜单按钮 */}
                      <div className="absolute top-3 right-3 z-10" ref={actionMenuOpen === project.id ? menuRef : undefined}>
                        <button
                          onClick={(e) => toggleActionMenu(project.id, e)}
                          className="p-2 bg-white/90 hover:bg-white text-slate-600 hover:text-slate-800 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>

                        {/* 操作菜单下拉 */}
                        {actionMenuOpen === project.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 animate-in fade-in zoom-in-95 duration-100">
                            {!isCurrent && (
                              <button
                                onClick={(e) => handleSetCurrent(project, e)}
                                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                设为当前
                              </button>
                            )}
                            <button
                              onClick={(e) => openEditMode(project, e)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              编辑
                            </button>
                            <div className="h-px bg-slate-200 my-1" />
                            <button
                              onClick={(e) => handleDelete(project.id, e)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              删除
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 缩略图 */}
                      <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                        {project.thumbnailUrl ? (
                          <img
                            src={project.thumbnailUrl}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        )}
                        {/* 悬浮遮罩 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* 信息 */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-slate-800 text-sm truncate flex-1" title={project.name}>
                            {project.name}
                          </h3>
                        </div>
                        {project.description && (
                          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2" title={project.description}>
                            {project.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-slate-400">
                            {new Date(project.createdAt).toLocaleDateString('zh-CN')}
                          </p>
                          {isCurrent && (
                            <span className="text-xs text-blue-600 font-medium">正在使用</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 底部 */}
        {viewMode === 'list' && projects.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
            <p className="text-xs text-slate-500 text-center">
              共 {projects.length} 个项目
              {currentProjectId && ` · 当前项目: ${projects.find(p => p.id === currentProjectId)?.name || '未知'}`}
            </p>
          </div>
        )}
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800">确认删除</h3>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              确定要删除项目 "{projects.find(p => p.id === showDeleteConfirm)?.name}" 吗？此操作无法撤销。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
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

export default ProjectManager;
