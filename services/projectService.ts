import { SpeckleProject } from '../types';

// Mock data for demonstration
const mockProjects: SpeckleProject[] = [
  {
    id: 'proj-1',
    name: '办公楼 A 栋',
    description: '15层商业办公楼，包含办公空间和会议设施',
    speckleUrl: 'https://app.speckle.systems/projects/0876633ea1/models/1e05934141',
    thumbnailUrl: 'https://picsum.photos/seed/office-a/300/200.jpg',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-20'),
    isActive: true
  },
  {
    id: 'proj-2',
    name: '住宅区 B 区',
    description: '高层住宅小区，包含3栋住宅楼和配套设施',
    speckleUrl: 'https://app.speckle.systems/projects/0876633ea2/models/1e05934142',
    thumbnailUrl: 'https://picsum.photos/seed/residential-b/300/200.jpg',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-03-05'),
    isActive: true
  },
  {
    id: 'proj-3',
    name: '购物中心 C 座',
    description: '大型购物中心，包含零售店铺和餐饮区域',
    speckleUrl: 'https://app.speckle.systems/projects/0876633ea3/models/1e05934143',
    thumbnailUrl: 'https://picsum.photos/seed/shopping-c/300/200.jpg',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-15'),
    isActive: false
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 获取所有项目列表
 */
export const getProjects = async (): Promise<SpeckleProject[]> => {
  await delay(500); // 模拟网络延迟
  return [...mockProjects];
};

/**
 * 根据 ID 获取单个项目
 */
export const getProjectById = async (id: string): Promise<SpeckleProject | null> => {
  await delay(300);
  return mockProjects.find(project => project.id === id) || null;
};

/**
 * 添加新项目
 */
export const addProject = async (projectData: Omit<SpeckleProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<SpeckleProject> => {
  await delay(800);
  
  const newProject: SpeckleProject = {
    ...projectData,
    id: `proj-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  mockProjects.push(newProject);
  return newProject;
};

/**
 * 更新项目信息
 */
export const updateProject = async (id: string, updates: Partial<SpeckleProject>): Promise<SpeckleProject | null> => {
  await delay(600);
  
  const projectIndex = mockProjects.findIndex(project => project.id === id);
  if (projectIndex === -1) return null;
  
  mockProjects[projectIndex] = {
    ...mockProjects[projectIndex],
    ...updates,
    updatedAt: new Date()
  };
  
  return mockProjects[projectIndex];
};

/**
 * 删除项目
 */
export const deleteProject = async (id: string): Promise<boolean> => {
  await delay(400);
  
  const projectIndex = mockProjects.findIndex(project => project.id === id);
  if (projectIndex === -1) return false;
  
  mockProjects.splice(projectIndex, 1);
  return true;
};

/**
 * 切换项目激活状态
 */
export const toggleProjectActive = async (id: string): Promise<SpeckleProject | null> => {
  await delay(300);
  
  const project = mockProjects.find(project => project.id === id);
  if (!project) return null;
  
  project.isActive = !project.isActive;
  project.updatedAt = new Date();
  
  return project;
};