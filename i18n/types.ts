export type Language = 'en' | 'zh';

export interface Translation {
  header: {
    projects: string;
    analytics: string;
    reports: string;
    user: string;
    language: string;
  };
  projectModal: {
    title: {
      view: string;
      add: string;
    };
    subtitle: {
      view: string;
      add: string;
    };
    empty: {
      title: string;
      description: string;
    };
    current: string;
    switchProject: string;
    delete: string;
    form: {
      name: {
        label: string;
        placeholder: string;
        error: string;
      };
      speckleUrl: {
        label: string;
        placeholder: string;
        error: string;
        invalid: string;
        hint: string;
      };
      description: {
        label: string;
        placeholder: string;
      };
      optional: string;
      required: string;
      add: string;
      reset: string;
      addNew: string;
    };
  };
  controlPanel: {
    title: string;
    poweredBy: string;
    assistant: string;
    inputPlaceholder: string;
    aiTools: string;
    analyzeStructure: string;
    mepCheck: string;
    elements: string;
  };
  modelViewer: {
    title: string;
    visibility: string;
    elements: string;
  };
  graphViewer: {
    title: string;
    description: string;
  };
  paneHeader: {
    maximize: string;
    minimize: string;
    restore: string;
  };
};

export interface I18nContextType {
  language: Language;
  translations: Translation;
  switchLanguage: () => void;
}
