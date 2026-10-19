import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Agentic Documentation Contract', () => {
  const docsDir = path.resolve(__dirname, '../src/content/docs');

  it('contains the foundational visual-aesthetic.md document', () => {
    const filePath = path.join(docsDir, 'visual-aesthetic.md');
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('title: "Visual Aesthetic & Interface Design Reference"');
    expect(content).toContain('category: "design"');
    expect(content).toContain('agentRulesSummary:');
  });

  it('enforces foundational design rules in agentRulesSummary', () => {
    const filePath = path.join(docsDir, 'visual-aesthetic.md');
    const content = fs.readFileSync(filePath, 'utf-8');

    // Rule checks
    expect(content).toContain('Mother Color');
    expect(content).toContain('70% Shadow');
    expect(content).toContain('Glaze');
    expect(content).toContain('NMM');
  });

  it('validates theme token consistency in global.css', () => {
    const cssPath = path.resolve(__dirname, '../src/styles/global.css');
    expect(fs.existsSync(cssPath)).toBe(true);

    const css = fs.readFileSync(cssPath, 'utf-8');
    // Ensure all three themes are declared
    expect(css).toContain(':root');
    expect(css).toContain('[data-theme="creamy-matcha"]');
    expect(css).toContain('[data-theme="cyberpunk-osl"]');
    // Ensure the Mother Color principle is declared
    expect(css).toContain('--mother-color');
  });
});
