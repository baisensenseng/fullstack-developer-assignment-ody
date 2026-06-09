import { writeFile } from 'node:fs/promises';
import { createApp } from '../app';

const app = createApp();
const document = app.getOpenAPIDocument({
  openapi: '3.0.0',
  info: {
    title: 'Ody Restaurant Operations API',
    version: '0.1.0'
  }
});

await writeFile(new URL('../../openapi.json', import.meta.url), `${JSON.stringify(document, null, 2)}\n`);
