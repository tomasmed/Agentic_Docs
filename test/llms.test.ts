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

  it('verifies aesthetic images exist in public/images/aesthetic', () => {
    const imgDir = path.resolve(__dirname, '../public/images/aesthetic');
    expect(fs.existsSync(imgDir)).toBe(true);
    expect(fs.existsSync(path.join(imgDir, 'miniatures-osl.png'))).toBe(true);
    expect(fs.existsSync(path.join(imgDir, 'neovim-catppuccin.png'))).toBe(true);
    expect(fs.existsSync(path.join(imgDir, 'pbt-keycaps.png'))).toBe(true);
  });

  it('verifies PaletteGenerator component exists', () => {
    const componentPath = path.resolve(__dirname, '../src/components/PaletteGenerator.svelte');
    expect(fs.existsSync(componentPath)).toBe(true);
  });

  it('contains the ci-code-reviewer.md document with agents category and rules', () => {
    const filePath = path.join(docsDir, 'ci-code-reviewer.md');
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('category: "agents"');
    expect(content).toContain('agentRulesSummary:');
    expect(content).toContain('Fail-open stance');
    expect(content).toContain('JlightCalendar');
    expect(content).toContain('gemini/gemini-3.8-flash');
  });
});
