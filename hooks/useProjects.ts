import { useState, useEffect, useCallback } from 'react';
import { Project, ProjectFormData } from '../types';

const STORAGE_KEY = 'arch_graph_projects';

// 默认示例项目
const defaultProjects: Project[] = [
  {
    id: 'default-1',
    name: '示例建筑项目',
    speckleUrl: 'https://app.speckle.systems/projects/0876633ea1/models/1e05934141',
    thumbnailUrl: 'https://picsum.photos/seed/building1/300/200',
    description: '默认示例项目，展示建筑模型',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载项目
  useEffect(() => {
    const loadProjects = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Project[];
          setProjects(parsed);
        } else {
          // 首次使用，设置默认项目
          setProjects(defaultProjects);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProjects));
        }
      } catch (error) {
        console.error('Failed to load projects from localStorage:', error);
        setProjects(defaultProjects);
      }
      setIsLoaded(true);
    };

    loadProjects();
  }, []);

  // 保存到 localStorage
  const saveProjects = useCallback((newProjects: Project[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
      setProjects(newProjects);
    } catch (error) {
      console.error('Failed to save projects to localStorage:', error);
    }
  }, []);

  // 添加项目
  const addProject = useCallback((formData: ProjectFormData) => {
    const now = Date.now();
    const newProject: Project = {
      id: `proj-${now}`,
      name: formData.name,
      speckleUrl: formData.speckleUrl,
      description: formData.description,
      thumbnailUrl: `https://picsum.photos/seed/${now}/300/200`,
      createdAt: now,
      updatedAt: now,
    };

    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    return newProject;
  }, [projects, saveProjects]);

  // 删除项目
  const deleteProject = useCallback((id: string) => {
    const updatedProjects = projects.filter(p => p.id !== id);
    saveProjects(updatedProjects);
  }, [projects, saveProjects]);

  // 更新项目
  const updateProject = useCallback((id: string, updates: Partial<ProjectFormData>) => {
    const updatedProjects = projects.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...updates,
          updatedAt: Date.now(),
        };
      }
      return p;
    });
    saveProjects(updatedProjects);
  }, [projects, saveProjects]);

  // 获取项目
  const getProject = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  // 设置当前活动项目
  const setActiveProject = useCallback((id: string) => {
    localStorage.setItem('arch_graph_active_project', id);
  }, []);

  // 获取当前活动项目
  const getActiveProject = useCallback(() => {
    const activeId = localStorage.getItem('arch_graph_active_project');
    if (activeId) {
      return projects.find(p => p.id === activeId) || projects[0] || null;
    }
    return projects[0] || null;
  }, [projects]);

  return {
    projects,
    isLoaded,
    addProject,
    deleteProject,
    updateProject,
    getProject,
    setActiveProject,
    getActiveProject,
  };
};
