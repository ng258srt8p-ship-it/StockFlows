async function main() {
  const { installGlobals } = await import('@remix-run/node');
  installGlobals();
  
  const { createRequestHandler } = await import('@remix-run/node');
  const build = await import('./build/server/index.js');
  
  const server = await import('http');
  
  const httpServer = server.default.createServer(async (req, res) => {
    try {
      const handler = createRequestHandler({ build: build.default || build });
      return handler(req, res);
    } catch (error) {
      console.error(error);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });
  
  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
