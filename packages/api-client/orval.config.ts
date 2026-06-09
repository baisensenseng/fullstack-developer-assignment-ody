import { defineConfig } from 'orval';

export default defineConfig({
  odyApi: {
    input: '../../services/backend/openapi.json',
    output: {
      target: './src/generated/ody-api.ts',
      client: 'react-query',
      httpClient: 'fetch',
      override: {
        mutator: {
          path: './src/mutator.ts',
          name: 'apiFetch'
        }
      }
    }
  }
});
