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
    // S3 Bucket for JSON specifications
    const specsBucket = new sst.aws.Bucket("SpecsBucket", {
      public: true
    });

    // API Backend - Lambda Function (must be first to get URL)
    const api = new sst.aws.Function("ApiBackend", {
      handler: "server/lambda-full.handler",
      runtime: "nodejs20.x",
      url: {
        cors: {
          allowCredentials: false,
          allowHeaders: ["content-type", "authorization"],
          allowMethods: ["*"],
          allowOrigins: ["https://d36kjm8ifn5guz.cloudfront.net", "https://d3bj2prxa2zkqr.cloudfront.net"],
          exposeHeaders: ["*"],
          maxAge: "86400 seconds"
        }
      },
      timeout: "30 seconds",
      memory: "512 MB",
      // Sin dominio personalizado - usa el subdominio Function URL automático
      environment: {
        NODE_ENV: $app.stage === "production" ? "production" : "development",
        DB_TYPE: "mongodb",
        MONGODB_URI: "mongodb+srv://angelmartinez:oawm3eMJ3QiM4VUE@cluster0.h3axpfx.mongodb.net/api-docs",
        PORT: "3000",
        UPLOAD_DIR: "uploads",
        MAX_FILE_SIZE: "5242880",
        ALLOWED_EXTENSIONS: ".json,.yaml,.yml",
        SPECS_BUCKET: specsBucket.name
      },
      permissions: [
        {
          actions: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"],
          resources: [$interpolate`${specsBucket.arn}/*`]
        }
      ]
    });

    // Public Admin Panel - CloudFront distribution
    const adminSite = new sst.aws.StaticSite("AdminPanel", {
      build: {
        command: "node scripts/prepare-deploy.js",
        output: "public-admin"
      },
      // Sin dominio personalizado - usa el subdominio CloudFront automático
      environment: {
        VITE_STAGE: $app.stage,
        API_URL: api.url
      },
      invalidation: {
        paths: ["/*"],
        wait: true
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
        API_URL: api.url
      },
      invalidation: {
        paths: ["/*"],
        wait: true
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
        API_URL: api.url
      },
      invalidation: {
        paths: ["/*"],
        wait: true
      }
    });

    return {
      adminUrl: adminSite.url,
      frontUrl: frontSite.url,
      docsUrl: docsSite.url,
      apiUrl: api.url,
      specsBucketName: specsBucket.name,
    };
  },
});