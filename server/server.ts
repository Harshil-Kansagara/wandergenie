import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import { app, seedDatabase } from "./app";
import { type Request, type Response, type NextFunction } from "express";

(async () => {
  await seedDatabase();

  const server = createServer(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
