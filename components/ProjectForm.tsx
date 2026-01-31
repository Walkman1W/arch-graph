import React, { useState, useEffect } from 'react';
import { Project, ProjectFormData } from '@/types';
import { speckleUtils } from '@/utils/speckleUtils';

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: ProjectFormData, thumbnailUrl?: string) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    speckleUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        speckleUrl: project.speckleUrl,
      });
    }
  }, [project]);

  const validateSpeckleUrl = async (url: string): Promise<boolean> => {
    if (!url.trim()) {
      return false;
    }
    return speckleUtils.validateSpeckleUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsValidating(true);

    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入项目名称';
    }

    if (!formData.speckleUrl.trim()) {
      newErrors.speckleUrl = '请输入 Speckle 链接';
    } else {
      const isValid = await validateSpeckleUrl(formData.speckleUrl);
      if (!isValid) {
        newErrors.speckleUrl = '请输入有效的 Speckle 链接格式 (https://speckle.xyz/streams/xxx)';
      }
    }

    setIsValidating(false);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const normalizedUrl = speckleUtils.normalizeUrl(formData.speckleUrl);
    const thumbnailUrl = speckleUtils.getThumbnailUrl(normalizedUrl);

    onSubmit(
      {
        name: formData.name.trim(),
        description: formData.description.trim(),
        speckleUrl: normalizedUrl,
      },
      thumbnailUrl
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {project ? '编辑项目' : '添加项目'}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              项目名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入项目名称"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.name
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                  : 'border-slate-300 focus:ring-blue-200 focus:border-blue-400'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              项目描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入项目描述（可选）"
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Speckle 链接 <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.speckleUrl}
              onChange={(e) => setFormData({ ...formData, speckleUrl: e.target.value })}
              placeholder="https://speckle.xyz/streams/xxx"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                errors.speckleUrl
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                  : 'border-slate-300 focus:ring-blue-200 focus:border-blue-400'
              }`}
            />
            {errors.speckleUrl && (
              <p className="mt-1 text-sm text-red-500">{errors.speckleUrl}</p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              支持 speckle.xyz 或 speckle.systems 链接
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isValidating}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isValidating ? '验证中...' : project ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
