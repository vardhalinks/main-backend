// backend/src/middleware/apiKeyAuth.js
export const apiKeyProtect = (req, res, next) => {
  const keyHeader = req.headers["x-api-key"] || req.headers["x-api_key"];
  const keyQuery = req.query?.api_key;
  const provided = keyHeader || keyQuery;
  const expected = process.env.LANDING_API_KEY || "";

  if (!expected) {
    // If no key configured, reject to avoid accidental public exposure
    return res.status(403).json({ message: "Server not configured for API key access" });
  }

  if (!provided || provided !== expected) {
    return res.status(401).json({ message: "Invalid API key" });
  }

  next();
};
