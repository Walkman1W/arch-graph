import { Project, ProjectFormData, ProjectState } from '@/types';

const STORAGE_KEY = 'smartbim_projects';

const generateId = (): string => {
  return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const projectService = {
  loadProjects: (): ProjectState => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data) as ProjectState;
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load projects from localStorage:', error);
    }
    return { projects: [], activeProjectId: null };
  },

  saveProjects: (state: ProjectState): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save projects to localStorage:', error);
    }
  },

  createProject: (formData: ProjectFormData, thumbnailUrl?: string): Project => {
    const now = Date.now();
    return {
      id: generateId(),
      name: formData.name,
      description: formData.description,
      speckleUrl: formData.speckleUrl,
      thumbnailUrl,
      createdAt: now,
      updatedAt: now,
      isActive: false,
    };
  },

  updateProject: (project: Project, formData: ProjectFormData, thumbnailUrl?: string): Project => {
    return {
      ...project,
      name: formData.name,
      description: formData.description,
      speckleUrl: formData.speckleUrl,
      thumbnailUrl: thumbnailUrl ?? project.thumbnailUrl,
      updatedAt: Date.now(),
    };
  },

  addProject: (state: ProjectState, project: Project): ProjectState => {
    const newProjects = [...state.projects, project];
    const newState: ProjectState = {
      projects: newProjects,
      activeProjectId: state.activeProjectId || (newProjects.length === 1 ? project.id : null),
    };
    project.isActive = newState.activeProjectId === project.id;
    projectService.saveProjects(newState);
    return newState;
  },

  updateProjectInState: (state: ProjectState, updatedProject: Project): ProjectState => {
    const newProjects = state.projects.map(p =>
      p.id === updatedProject.id ? updatedProject : p
    );
    const newState: ProjectState = {
      ...state,
      projects: newProjects,
    };
    projectService.saveProjects(newState);
    return newState;
  },

  deleteProject: (state: ProjectState, projectId: string): ProjectState => {
    const newProjects = state.projects.filter(p => p.id !== projectId);
    let newActiveProjectId = state.activeProjectId;
    
    if (state.activeProjectId === projectId) {
      newActiveProjectId = newProjects.length > 0 ? newProjects[0].id : null;
    }
    
    const newProjectsWithActive = newProjects.map(p => ({
      ...p,
      isActive: p.id === newActiveProjectId,
    }));
    
    const newState: ProjectState = {
      projects: newProjectsWithActive,
      activeProjectId: newActiveProjectId,
    };
    projectService.saveProjects(newState);
    return newState;
  },

  setActiveProject: (state: ProjectState, projectId: string): ProjectState => {
    const newProjects = state.projects.map(p => ({
      ...p,
      isActive: p.id === projectId,
    }));
    
    const newState: ProjectState = {
      projects: newProjects,
      activeProjectId: projectId,
    };
    projectService.saveProjects(newState);
    return newState;
  },

  getActiveProject: (state: ProjectState): Project | null => {
    if (!state.activeProjectId) return null;
    return state.projects.find(p => p.id === state.activeProjectId) || null;
  },

  getProjectById: (state: ProjectState, projectId: string): Project | undefined => {
    return state.projects.find(p => p.id === projectId);
  },
};
