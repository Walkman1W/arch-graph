import { Translation } from './types';

const enTranslations: Translation = {
 header: {
 projects: 'Projects',
 analytics: 'Analytics',
 reports: 'Reports',
 user: 'Architect Doe',
 language: '中文',
 },
 projectModal: {
 title: {
 view: 'Project Management',
 add: 'Add New Project',
 },
 subtitle: {
 view: 'Manage your BIM projects',
 add: 'Add a new Speckle project',
 },
 empty: {
 title: 'No projects yet',
 description: 'Click the + button in the top-right corner to add your first project',
 },
 current: 'Current',
 switchProject: 'Switch to this project',
 delete: 'Delete',
 form: {
 name: {
 label: 'Project Name',
 placeholder: 'e.g., Office Building BIM Model',
 error: 'Project name cannot be empty',
 },
 speckleUrl: {
 label: 'Speckle Embed URL',
 placeholder: 'https://app.speckle.systems/projects/...',
 error: 'Speckle URL cannot be empty',
 invalid: 'Please enter a valid Speckle URL',
 hint: 'Please copy the embed URL from your Speckle project page',
 },
 description: {
 label: 'Project Description',
 placeholder: 'Briefly describe this project...',
 },
 optional: '(Optional)',
 required: '*',
 add: 'Add Project',
 reset: 'Reset',
 addNew: 'Add New Project',
 },
 },
 controlPanel: {
 title: 'AI Commander',
 poweredBy: 'Powered by Gemini 2.5',
 assistant: 'Hello! I am your BIM Assistant. Describe what you want to see, and I will generate controls for you.',
 inputPlaceholder: 'Ask AI to filter (e.g. \'Show beams\')...',
 aiTools: 'AI Tools:',
 analyzeStructure: 'Analyze Structure',
 mepCheck: 'MEP Check',
 elements: 'Elements',
 },
 modelViewer: {
 title: '3D Model Viewer',
 visibility: 'Visibility',
 elements: 'Elements',
 },
 graphViewer: {
 title: 'Graph Visualization',
 description: 'Cytoscape.js graph will be implemented in Task 6',
 },
 paneHeader: {
 maximize: 'Maximize',
 minimize: 'Minimize',
 restore: 'Restore',
 },
};

export default enTranslations;
