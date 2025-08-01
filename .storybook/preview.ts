import type { Preview } from '@storybook/web-components';
import { html } from 'lit';

// Import Shoelace theme and components
import '@shoelace-style/shoelace/dist/themes/light.css';
import '@shoelace-style/shoelace/dist/themes/dark.css';

// Import your app styles
import '../src/frontend/styles/index.scss';
import '../src/frontend/styles/shoelace-theme.scss';

// Mock Electron APIs
const mockElectronAPI = {
  send: (channel: string, data: any) => console.log('Mock send:', channel, data),
  receive: (channel: string, func: Function) => console.log('Mock receive:', channel),
  invoke: (channel: string, ...args: any[]) => Promise.resolve('mock-response')
};

// Expose mocked APIs globally
(window as any).Session = {
  create: () => Promise.resolve('mock-session-id'),
  list: () => Promise.resolve([]),
  focus: () => Promise.resolve(),
  send: (sessionId: string, command: string) => Promise.resolve(),
  disconnect: (sessionId: string) => Promise.resolve(),
  connect: (name: string, port: number) => Promise.resolve('mock-session-id'),
};

(window as any).App = {
  getVersion: () => Promise.resolve('0.0.3-storybook'),
  quit: () => console.log('Mock quit'),
  minimize: () => console.log('Mock minimize'),
  maximize: () => console.log('Mock maximize'),
  close: () => console.log('Mock close'),
};

(window as any).Settings = {
  get: (key: string) => Promise.resolve(null),
  set: (key: string, value: any) => Promise.resolve(),
  getAll: () => Promise.resolve({}),
};

// Set up Shoelace base path
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
setBasePath('/node_modules/@shoelace-style/shoelace/dist/');

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      extractComponentDescription: (component, { notes }) => {
        if (notes) {
          return typeof notes === 'string' ? notes : notes.markdown || notes.text;
        }
        return null;
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#1a1a1a',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
      ],
    },
  },
  
  decorators: [
    (story) => html`
      <div class="storybook-wrapper" style="padding: 1rem; font-family: var(--sl-font-sans);">
        ${story()}
      </div>
    `,
  ],
};

export default preview;