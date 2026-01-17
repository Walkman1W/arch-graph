import React, { useState } from 'react';

interface Project {
  id: string;
  name: string;
  speckleUrl: string;
  thumbnailUrl: string;
  lastAccessed: Date;
}

interface DashboardHeaderProps {
  currentSpeckleUrl: string;
  onUrlChange: (url: string) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentSpeckleUrl, onUrlChange }) => {
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProjectUrl, setNewProjectUrl] = useState('');
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Central Station Revit Model',
      speckleUrl: 'https://speckle.xyz/streams/123456',
      thumbnailUrl: 'https://picsum.photos/seed/project1/300/200',
      lastAccessed: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Office Building IFC',
      speckleUrl: 'https://speckle.xyz/streams/789012',
      thumbnailUrl: 'https://picsum.photos/seed/project2/300/200',
      lastAccessed: new Date('2024-01-14')
    }
  ]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    projects.find(p => p.speckleUrl === currentSpeckleUrl)?.id || null
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectUrl.trim()) return;
    
    const newProject: Project = {
      id: Date.now().toString(),
      name: `Project ${projects.length + 1}`,
      speckleUrl: newProjectUrl,
      thumbnailUrl: `https://picsum.photos/seed/${Date.now()}/300/200`,
      lastAccessed: new Date()
    };
    
    setProjects(prev => [newProject, ...prev]);
    onUrlChange(newProject.speckleUrl);
    setActiveProjectId(newProject.id);
    setNewProjectUrl('');
    setShowAddForm(false);
  };

  const handleProjectClick = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      onUrlChange(project.speckleUrl);
      setActiveProjectId(projectId);
    }
    setShowProjectModal(false);
  };

  const handleDeleteProject = (projectId: string) => {
    const projectToDelete = projects.find(p => p.id === projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    
    if (activeProjectId === projectId) {
      const remainingProjects = projects.filter(p => p.id !== projectId);
      if (remainingProjects.length > 0) {
        const newActive = remainingProjects[0];
        onUrlChange(newActive.speckleUrl);
        setActiveProjectId(newActive.id);
      } else {
        setActiveProjectId(null);
      }
    } else if (projectToDelete?.speckleUrl === currentSpeckleUrl) {
      const remainingProjects = projects.filter(p => p.id !== projectId);
      if (remainingProjects.length > 0) {
        const newActive = remainingProjects[0];
        onUrlChange(newActive.speckleUrl);
        setActiveProjectId(newActive.id);
      }
    }
    setShowDeleteConfirm(null);
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
            onClick={() => setShowProjectModal(true)}
          >
            Projects
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
              {projects.length}
            </span>
          </span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Analytics</span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Reports</span>
        </div>
        <div className="w-px h-6 bg-slate-200 hidden md:block"></div>
        <button 
          onClick={() => setShowProjectModal(true)}
          className="md:hidden flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
          <img 
            src="https://picsum.photos/32/32" 
            alt="User" 
            className="w-8 h-8 rounded-full border border-slate-200"
          />
          <span className="hidden md:block text-sm font-semibold text-slate-700">Architect Doe</span>
        </div>
      </div>

      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">My Projects</h2>
              <button 
                onClick={() => setShowProjectModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!showAddForm ? (
              <>
                <div className="flex-1 overflow-y-auto p-6">
                  {projects.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <p className="text-lg font-medium">No projects yet</p>
                      <p className="text-sm mt-1">Add your first Speckle project to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map((project) => (
                        <div 
                          key={project.id}
                          onClick={() => handleProjectClick(project.id)}
                          className={`group relative rounded-xl overflow-hidden border-2 hover:shadow-lg transition-all cursor-pointer ${
                            activeProjectId === project.id 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          <div className="aspect-video bg-slate-100 overflow-hidden relative">
                            <img 
                              src={project.thumbnailUrl} 
                              alt={project.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {activeProjectId === project.id && (
                              <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                Active
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-slate-800 truncate">{project.name}</h3>
                            <p className="text-sm text-slate-500 mt-1 truncate">{project.speckleUrl}</p>
                            <p className="text-xs text-slate-400 mt-2">
                              Last accessed: {project.lastAccessed.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="relative">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteConfirm(showDeleteConfirm === project.id ? null : project.id);
                                }}
                                className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-lg shadow-md transition-all"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              {showDeleteConfirm === project.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteProject(project.id);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    Delete Project
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowDeleteConfirm(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-slate-200 bg-slate-50">
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Project
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex-1 p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Speckle Project</h3>
                  <form onSubmit={handleAddProject}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Speckle Stream URL
                        </label>
                        <input
                          type="url"
                          value={newProjectUrl}
                          onChange={(e) => setNewProjectUrl(e.target.value)}
                          placeholder="https://speckle.xyz/streams/..."
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Tip:</strong> You can find your Speckle Stream URL in the Speckle web app. It typically looks like:
                          <code className="block mt-2 p-2 bg-white rounded text-xs text-blue-600 break-all">
                            https://speckle.xyz/streams/abc123...
                          </code>
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex gap-3">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewProjectUrl('');
                    }}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddProject}
                    disabled={!newProjectUrl.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
                  >
                    Add Project
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;
