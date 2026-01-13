import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Basic route
app.get('/', (req, res) => {
  res.render('index', {
    title: 'BlackMamba Framework',
    message: 'Node.js HTMX Web App Framework with Agent System'
  });
});

// Agent system info route
app.get('/agents', (req, res) => {
  res.json({
    framework: 'BlackMamba',
    version: '1.0.0',
    agents: {
      master: 'Development workflow orchestration',
      development: 'Core business logic implementation',
      htmx: 'HTMX fragment and component development',
      database: 'Prisma schema and repository operations',
      testing: 'Unit, fragment, and E2E test generation'
    },
    patterns: [
      'Framework-agnostic core business logic',
      'Feature-based modular architecture',
      'HTMX-first server-rendered UI',
      'Repository pattern with dependency injection',
      'Comprehensive testing strategy'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    framework: 'BlackMamba'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 BlackMamba server running on http://localhost:${PORT}`);
  console.log(`📊 Agent system available at http://localhost:${PORT}/agents`);
  console.log(`❤️  Health check at http://localhost:${PORT}/health`);
});