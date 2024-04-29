import { join } from 'path';
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifyStatic from '@fastify/static';
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyCors from '@fastify/cors';
 

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {
  // Add any additional options here
}

const options: AppOptions = {
  // ...other options
};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Register CORS middleware to fix CORS error
  fastify.register(fastifyCors, {
    origin: true, // Add localtunnel URL and reflect the request origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allow these HTTP methods
  });


 
  const swaggerOptions = {
    swagger: {
        info: {
            title: "BB AI talks",
            description: "Talk with our AI agents",
            version: "1.0.0",
        },
        host: "localhost:3000", // Added port 3000 here
        schemes: ["http", "https"],
        consumes: ["application/json", "multipart/form-data"],
        produces: ["application/json"],
        tags: [{ name: "Default", description: "Default" }],
    },
  };

  const swaggerUiOptions = {
    routePrefix: "/docs",
    exposeRoute: true,
  };

  await fastify.register(import('@fastify/rate-limit'), {
    max: 30,
    timeWindow: '1 minute',
  });

  // Register Swagger and Swagger UI
  fastify.register(fastifySwagger, swaggerOptions);
  fastify.register(fastifySwaggerUi, swaggerUiOptions);
  
  // Serve Swagger UI static files
  fastify.register(fastifyStatic, {
    root: join(__dirname, 'public'),
    prefix: '/public/', // optional: default '/'
  });

  fastify.setErrorHandler(function (error, request, reply) {
    if (error.statusCode === 429) {
      reply.code(429)
      error.message = 'maybe it is time to chill and relax, or you are making too many requests to our API'
      error.code = 'TOO_MANY_REQUESTS'
    }
    reply.send(error)
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application

  // Register AutoLoad for plugins
  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  });
 
 // This loads all plugins defined in routes
  // define your routes in one of these
  await fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  });

};

export default  app;
export { app, options };
