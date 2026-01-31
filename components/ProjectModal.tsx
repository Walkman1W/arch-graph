import React, { useState, useEffect } from 'react';
import { Project, ProjectModalState, ProjectFormData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ProjectModalProps {
  modalState: ProjectModalState;
  projects: Project[];
  onClose: () => void;
  onAddProject: (formData: ProjectFormData) => void;
  onDeleteProject: (projectId: string) => void;
  onSelectProject: (projectId: string) => void;
  onSwitchMode: (mode: 'view' | 'add') => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({
  modalState,
  projects,
  onClose,
  onAddProject,
  onDeleteProject,
  onSelectProject,
  onSwitchMode,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    speckleUrl: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});

  useEffect(() => {
    if (modalState.mode === 'add') {
      setFormData({ name: '', speckleUrl: '', description: '' });
      setErrors({});
    }
  }, [modalState.mode]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('error.name_required');
    }

    if (!formData.speckleUrl.trim()) {
      newErrors.speckleUrl = t('error.url_required');
    } else if (!formData.speckleUrl.includes('speckle.systems')) {
      newErrors.speckleUrl = t('error.invalid_url');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onAddProject(formData);
      setFormData({ name: '', speckleUrl: '', description: '' });
      setErrors({});
    }
  };

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!modalState.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {modalState.mode === 'add' ? t('modal.add_project') : t('modal.manage_projects')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {modalState.mode === 'add' ? t('modal.add_description') : t('modal.manage_description')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {modalState.mode === 'view' ? (
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📁</div>
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">{t('modal.no_projects')}</h3>
                  <p className="text-slate-500 mb-6">{t('modal.add_first_project')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                        project.isActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <div className="text-4xl">🏗️</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-slate-800 truncate">{project.name}</h3>
                            {project.isActive && (
                              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full flex-shrink-0">
                                {t('modal.current')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 truncate">{project.speckleUrl}</p>
                          {project.description && (
                            <p className="text-sm text-slate-600 mt-2 line-clamp-2">{project.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            {!project.isActive && (
                              <button
                                onClick={() => onSelectProject(project.id)}
                                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                {t('modal.switch_project')}
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteProject(project.id)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition-colors"
                            >
                              {t('modal.delete')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('modal.project_name')} <span className="text-red-500">{t('modal.required')}</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder={t('modal.enter_name')}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('modal.speckle_url')} <span className="text-red-500">{t('modal.required')}</span>
                </label>
                <input
                  type="url"
                  value={formData.speckleUrl}
                  onChange={e => handleInputChange('speckleUrl', e.target.value)}
                  placeholder={t('modal.enter_url')}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.speckleUrl ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.speckleUrl && <p className="text-red-500 text-sm mt-1">{errors.speckleUrl}</p>}
                <p className="text-xs text-slate-500 mt-1">
                  {t('modal.enter_url')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t('modal.description')} <span className="text-slate-400">{t('modal.optional')}</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder={t('modal.enter_description')}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('modal.add_button')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ name: '', speckleUrl: '', description: '' });
                    setErrors({});
                  }}
                  className="px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                >
                  {t('modal.reset_button')}
                </button>
              </div>
            </form>
          )}
        </div>

        {modalState.mode === 'view' && (
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                setFormData({ name: '', speckleUrl: '', description: '' });
                setErrors({});
                onSwitchMode('add');
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('modal.add_project')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectModal;
