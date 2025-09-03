/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "api-docs",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    // Public Admin Panel - CloudFront distribution
    const adminSite = new sst.aws.StaticSite("AdminPanel", {
      build: {
        command: "node scripts/prepare-deploy.js",
        output: "public-admin"
      },
      // Sin dominio personalizado - usa el subdominio CloudFront automático
      environment: {
        VITE_STAGE: $app.stage,
      }
    });

    // Public Front Catalog - CloudFront distribution  
    const frontSite = new sst.aws.StaticSite("FrontCatalog", {
      build: {
        command: "node scripts/prepare-deploy.js", 
        output: "public-front"
      },
      // Sin dominio personalizado - usa el subdominio CloudFront automático
      environment: {
        VITE_STAGE: $app.stage,
      }
    });

    // Documentation Renderer - CloudFront distribution
    const docsSite = new sst.aws.StaticSite("DocsRenderer", {
      build: {
        command: "node scripts/prepare-deploy.js",
        output: "docs"
      },
      // Sin dominio personalizado - usa el subdominio CloudFront automático
      environment: {
        VITE_STAGE: $app.stage,
      }
    });

    // API Backend (Optional - if you want to deploy the Express server too)
    // const api = new sst.aws.Function("ApiBackend", {
    //   handler: "server/index.js",
    //   runtime: "nodejs20.x",
    //   url: true,
    //   // Sin dominio personalizado - usa el subdominio Function URL automático
    //   environment: {
    //     NODE_ENV: $app.stage === "production" ? "production" : "development",
    //   }
    // });

    return {
      adminUrl: adminSite.url,
      frontUrl: frontSite.url,
      docsUrl: docsSite.url,
      // apiUrl: api?.url,
    };
  },
});