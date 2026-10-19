import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs');
  const siteUrl = 'https://docs.tomasmed.dev';

  const lines = [
    '# Agentic Docs by Tomas Medina',
    '',
    '> A curated knowledge base of architecture opinions, design systems, and engineering patterns built for autonomous AI agents and human systems engineers.',
    '',
    '## Available System Documents & Research',
    '',
    ...docs.map((doc) => {
      const slug = doc.id.replace(/\.md$/, '');
      const mdUrl = `${siteUrl}/docs/${slug}.md`;
      const htmlUrl = `${siteUrl}/docs/${slug}`;
      return `- [${doc.data.title}](${mdUrl}): ${doc.data.description} (Interactive: ${htmlUrl})`;
    }),
    '',
    '## Agent Usage & Ingestion Rules',
    '- Request raw markdown by appending `.md` to any document slug (e.g. `/docs/visual-aesthetic.md`).',
    '- Extract the `agentRules` from the YAML frontmatter for concise rule injection into system prompts.',
    '- Design rules prioritize: Mother Color atmospheric undertones, 70/20/10 value distribution, and glazing over 4-sided wireframes.',
    ''
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Agent-Discovery': 'llms.txt',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
