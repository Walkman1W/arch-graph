import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Project {
  id: string;
  name: string;
  embedUrl: string;
  createdAt: number;
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  addProject: (name: string, embedUrl: string) => void;
  deleteProject: (id: string) => void;
  switchProject: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const DEFAULT_PROJECT: Project = {
  id: 'default',
  name: 'Default Project',
  embedUrl: 'https://app.speckle.systems/projects/0876633ea1/models/1e05934141?embedToken=3d3c2e0ab4878e7d01b16a1608e78e03848887eed4#embed=%7B%22isEnabled%22%3Atrue%7D',
  createdAt: Date.now(),
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : [DEFAULT_PROJECT];
      } catch {
        return [DEFAULT_PROJECT];
      }
    }
    return [DEFAULT_PROJECT];
  });

  const [currentProject, setCurrentProject] = useState<Project | null>(() => {
    const savedId = localStorage.getItem('currentProjectId');
    if (savedId) {
      const saved = localStorage.getItem('projects');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const found = parsed.find((p: Project) => p.id === savedId);
          return found || projects[0];
        } catch {
          return projects[0];
        }
      }
    }
    return projects[0];
  });

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (currentProject) {
      localStorage.setItem('currentProjectId', currentProject.id);
    }
  }, [currentProject]);

  const addProject = (name: string, embedUrl: string) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name,
      embedUrl,
      createdAt: Date.now(),
    };
    setProjects(prev => [...prev, newProject]);
    setCurrentProject(newProject);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== id);
      // Ensure at least one project exists
      return filtered.length > 0 ? filtered : [DEFAULT_PROJECT];
    });
    
    if (currentProject?.id === id) {
      setCurrentProject(projects.find(p => p.id !== id) || DEFAULT_PROJECT);
    }
  };

  const switchProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setCurrentProject(project);
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, currentProject, addProject, deleteProject, switchProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};
