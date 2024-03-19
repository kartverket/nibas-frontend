import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      const environment = process.env.NODE_ENV || 'local';
      switch (environment) {
        case 'local':
          config.baseUrl = 'http://localhost:3000';
          break;
        case 'dev':
          config.baseUrl = 'https://nibas.dev.skip.statkart.no';
          break;
        default:
          throw new Error(`Unknown environment: ${environment}`);
      }
      return config;
    },
  },
});
