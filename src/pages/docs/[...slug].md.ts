import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const docs = await getCollection('docs');
  return docs.map((entry) => ({
    params: { slug: entry.id.replace(/\.md$/, '') },
    props: { entry },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { entry } = props as { entry: any };
  
  // Return pristine Markdown with frontmatter for LLMs
  const frontmatter = [
    '---',
    `title: "${entry.data.title}"`,
    `description: "${entry.data.description}"`,
    `category: "${entry.data.category}"`,
    `tags: [${entry.data.tags.map((t: string) => `"${t}"`).join(', ')}]`,
    entry.data.agentRulesSummary ? `agentRules: "${entry.data.agentRulesSummary}"` : null,
    '---',
    '',
    entry.body || ''
  ].filter(line => line !== null).join('\n');

  return new Response(frontmatter, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Agentic-Format': 'raw-markdown',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
