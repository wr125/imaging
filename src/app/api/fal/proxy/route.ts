import * as fal from "@fal-ai/serverless-client";

// Configure FAL.ai client with API key
fal.config({
  credentials: process.env.FAL_KEY,
});

export { handler as GET, handler as POST } from "@fal-ai/serverless-proxy/nextjs"; 