/**
 * @file swagger.js
 * @description Configuración de OpenAPI 3.0 para HEROback.
 * Genera el spec a partir de comentarios JSDoc en las rutas.
 */
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'HEROback API',
            version: '1.0.0',
            description:
                'API REST de la plataforma HEROback (Express + Sequelize + PostgreSQL).',
        },
        servers: [{ url: 'http://localhost:3000', description: 'Desarrollo local' }],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: { error: { type: 'string' } },
                },
                Hero: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer'
                        },
                        api_id: {
                            type: 'integer',
                            nullable: true
                        },
                        name: {
                            type: 'string'
                        },
                        image_url: {
                            type: 'string',
                            nullable: true
                        }
                        ,
                        publisher: {
                            type: 'string',
                            nullable: true
                        },
                        alignment: {
                            type: 'string',
                            enum: ['good', 'bad', 'neutral', 'unknown']
                        },
                        intelligence: {
                            type: 'integer'
                        },
                        strength: {
                            type: 'integer'
                        },
                        speed: {
                            type: 'integer'
                        },
                        durability: {
                            type: 'integer'
                        },
                        power: {
                            type: 'integer'
                        },
                        combat: {
                            type: 'integer'
                        },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: [path.join(__dirname, '../routes/*.js')],
});

export { swaggerUi, swaggerSpec };
