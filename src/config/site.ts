import { brandConfig } from "./brand";

export const siteConfig = {
  name: brandConfig.name,
  description:
    "An open-source Next.js starter for blogs and content platforms, with Tiptap, AI-assisted writing, image generation and MCP workflows.",
  githubUrl: process.env.NEXT_PUBLIC_GITHUB_URL || null,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
};
