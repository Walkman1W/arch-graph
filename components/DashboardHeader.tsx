import React, { useState } from 'react';
import { Project, ProjectModalState } from '../types';

const DashboardHeader: React.FC = () => {
  // Mock projects data with active project
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'active',
      name: '当前活动项目',
      speckleUrl: 'https://speckle.xyz/streams/active-project-123',
      thumbnailUrl: 'https://picsum.photos/seed/active/300/200',
      createdAt: new Date('2024-01-25'),
      updatedAt: new Date('2024-01-25'),
      description: '当前正在编辑的项目'
    },
    {
      id: '1',
      name: '商业综合体项目',
      speckleUrl: 'https://speckle.xyz/streams/a1b2c3d4e5',
      thumbnailUrl: 'https://picsum.photos/seed/project1/300/200',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      description: '5A级商业综合体BIM模型'
    },
    {
      id: '2',
      name: '医院扩建工程',
      speckleUrl: 'https://speckle.xyz/streams/f6g7h8i9j0',
      thumbnailUrl: 'https://picsum.photos/seed/project2/300/200',
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18'),
      description: '三甲医院新建住院楼'
    },
    {
      id: '3',
      name: '地铁站设计',
      speckleUrl: 'https://speckle.xyz/streams/k1l2m3n4o5',
      thumbnailUrl: 'https://picsum.photos/seed/project3/300/200',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-15'),
      description: '城市轨道交通BIM模型'
    }
  ]);

  const [activeProjectId, setActiveProjectId] = useState<string>('active');

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个项目吗？')) {
      setProjects(prev => prev.filter(project => project.id !== projectId));
      if (activeProjectId === projectId) {
        setActiveProjectId(projects.find(p => p.id !== projectId)?.id || '');
      }
    }
  };

  const handleSetActiveProject = (projectId: string) => {
    setActiveProjectId(projectId);
    closeProjectModal();
  };

  const [projectModal, setProjectModal] = useState<ProjectModalState>({
    isOpen: false,
    isAdding: false,
    newProjectUrl: '',
    newProjectName: ''
  });

  const openProjectModal = () => {
    setProjectModal(prev => ({ ...prev, isOpen: true }));
  };

  const closeProjectModal = () => {
    setProjectModal({
      isOpen: false,
      isAdding: false,
      newProjectUrl: '',
      newProjectName: ''
    });
  };

  const toggleAddProject = () => {
    setProjectModal(prev => ({
      ...prev,
      isAdding: !prev.isAdding,
      newProjectUrl: '',
      newProjectName: ''
    }));
  };

  const handleAddProject = () => {
    if (!projectModal.newProjectUrl.trim() || !projectModal.newProjectName.trim()) {
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: projectModal.newProjectName,
      speckleUrl: projectModal.newProjectUrl,
      thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/300/200`,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: ''
    };

    setProjects(prev => [newProject, ...prev]);
    closeProjectModal();
  };

  const handleSelectProject = (project: Project) => {
    console.log('Selected project:', project);
    handleSetActiveProject(project.id);
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 justify-between flex-shrink-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">
          B
        </div>
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Smart<span className="text-blue-600">BIM</span></h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <span 
            className="hover:text-blue-600 cursor-pointer transition-colors relative"
            onClick={openProjectModal}
          >
            Projects
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
          </span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Analytics</span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Reports</span>
        </div>
        {/* Mobile project button */}
        <button
          className="md:hidden w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors"
          onClick={openProjectModal}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
          <img 
            src="https://picsum.photos/32/32" 
            alt="User" 
            className="w-8 h-8 rounded-full border border-slate-200"
          />
          <span className="hidden md:block text-sm font-semibold text-slate-700">Architect Doe</span>
        </div>
      </div>

      {/* Project Modal */}
      {projectModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                {projectModal.isAdding ? '添加新项目' : '我的项目'}
              </h2>
              <button
                onClick={closeProjectModal}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              {/* Add Project Form */}
              {projectModal.isAdding && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      项目名称
                    </label>
                    <input
                      type="text"
                      value={projectModal.newProjectName}
                      onChange={(e) => setProjectModal(prev => ({ ...prev, newProjectName: e.target.value }))}
                      placeholder="输入项目名称"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Speckle 项目链接
                    </label>
                    <input
                      type="url"
                      value={projectModal.newProjectUrl}
                      onChange={(e) => setProjectModal(prev => ({ ...prev, newProjectUrl: e.target.value }))}
                      placeholder="https://speckle.xyz/streams/..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={toggleAddProject}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleAddProject}
                      disabled={!projectModal.newProjectUrl.trim() || !projectModal.newProjectName.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      添加项目
                    </button>
                  </div>
                </div>
              )}

              {/* Projects List */}
              {!projectModal.isAdding && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => handleSelectProject(project)}
                      className={`border rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer group ${
                        activeProjectId === project.id
                          ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {/* Active Badge */}
                      {activeProjectId === project.id && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                            Active
                          </span>
                        </div>
                      )}
                      
                      <div className="aspect-video bg-slate-100 relative overflow-hidden">
                        <img
                          src={project.thumbnailUrl || 'https://picsum.photos/seed/default/300/200'}
                          alt={project.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 justify-between">
                          <span className="text-white text-xs font-medium">
                            {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
                          </span>
                          {project.id !== 'active' && (
                            <button
                              onClick={(e) => handleDeleteProject(project.id, e)}
                              className="w-6 h-6 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-colors"
                              title="删除项目"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-slate-800 truncate">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-slate-500 mt-1 truncate">
                            {project.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3.5 h-3.5">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>Speckle</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!projectModal.isAdding && (
              <div className="p-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={toggleAddProject}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">添加项目</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;
