import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Basic route for testing
app.get('/', (req, res) => {
  res.render('index', { title: 'Simple Test Project' });
});

// Health check endpoint - intentionally broken
app.get('/health', (req, res) => {
  // Intentional error: undefined variable
  res.json({ status: healthStatus, timestamp: new Date().toISOString() });
});

// Broken API endpoint
app.get('/api/users', (req, res) => {
  // Intentional error: missing error handling
  const users = getUserData();
  res.json(users);
});

// Function that doesn't exist
function getUserData() {
  // This function is never defined
  return nonExistentFunction();
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});