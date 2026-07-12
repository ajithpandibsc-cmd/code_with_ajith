let app;
let startupError = null;

async function getApp() {
  if (app) return app;
  if (startupError) throw startupError;
  try {
    const module = await import('../backend/server.js');
    app = module.default;
    return app;
  } catch (err) {
    startupError = err;
    throw err;
  }
}

export default async function handler(req, res) {
  try {
    const expressApp = await getApp();
    return expressApp(req, res);
  } catch (err) {
    console.error('Initialization error:', err);
    res.status(500).json({
      error: "Failed to initialize backend server",
      message: err.message,
      stack: err.stack
    });
  }
}

