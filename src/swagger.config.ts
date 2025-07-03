import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import * as os from 'os';

export function setupSwagger(app: INestApplication): void {
  const getLocalIP = () => {
    const networkInterfaces = os.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      for (const iface of interfaces) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '192.168.1.100';
  };

  const localIP = getLocalIP();

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription(
      `
      # API Tài liệu Product Workflow
    `,
    )
    .setVersion('1.0.0')
    .setContact(
      'API Support',
      'https://example.com/support',
      'support@example.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('/', 'Current Host (Auto-detect)')
    .addServer('http://localhost:8080', 'Local Development')
    .addServer(`http://${localIP}:8080`, 'Network Access')
    .addServer('https://api.example.com', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
  });

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
      requestInterceptor: `(request) => {
        // Ensure requests use the correct base URL
        const currentHost = window.location.host;
        const currentProtocol = window.location.protocol;
        const baseUrl = currentProtocol + '//' + currentHost;
        
        // If request URL is relative or uses localhost, update it
        if (request.url.includes('localhost') || !request.url.includes('http')) {
          request.url = request.url.replace(/https?:\/\/[^\/]+/, baseUrl);
        }
        
        console.log('Making request to:', request.url);
        return request;
      }`,
    },
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customSiteTitle: 'Workflow API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .scheme-container { margin: 0 0 20px 0; padding: 30px 0; border-bottom: 1px solid #3b4151 }
      .servers select { background-color: #f5f5f5; border: 1px solid #ccc; padding: 5px; }
    `,
  });

  console.log('📚 Swagger documentation is available at:');
  console.log(`   🏠 Local: http://localhost:8080/api/docs`);
  console.log(`   🌐 Network: http://${localIP}:8080/api/docs`);
  console.log(`   ⚡ Auto-detect: Access via current browser URL`);
  console.log(`   📱 Detected local IP: ${localIP}`);
}
