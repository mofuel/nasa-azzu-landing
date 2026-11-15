import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {baseURL: 'http://127.0.0.1:5198', screenshot: 'only-on-failure'},
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5198 --strictPort',
    url: 'http://127.0.0.1:5198',
    reuseExistingServer: true
  },
  projects: [
    {name: 'desktop', use: {...devices['Desktop Chrome'], viewport: {width: 1440, height: 900}}},
    {name: 'mobile', use: {...devices['Pixel 7']}}
  ]
});


