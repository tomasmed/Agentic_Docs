<script lang="ts">
  let currentTheme = $state('creamy-mocha');

  function setTheme(theme: string) {
    currentTheme = theme;
    if (typeof document !== 'undefined') {
      if (theme === 'creamy-mocha') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
      localStorage.setItem('agentic_theme', theme);
    }
  }

  // Initialize from storage or default
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('agentic_theme');
    if (saved) {
      setTheme(saved);
    }
  }
</script>

<div class="inline-flex items-center gap-1.5 p-1 bg-[var(--surface-card)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono">
  <button
    type="button"
    class="px-2 py-1 rounded transition-colors {currentTheme === 'creamy-mocha' ? 'bg-[var(--accent-primary)] text-[var(--canvas-bg)] font-semibold shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
    onclick={() => setTheme('creamy-mocha')}
    title="Archetype A: Mocha (Warm Espresso & Taro)"
  >
    ☕ Mocha
  </button>

  <button
    type="button"
    class="px-2 py-1 rounded transition-colors {currentTheme === 'creamy-matcha' ? 'bg-[var(--accent-primary)] text-[var(--canvas-bg)] font-semibold shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
    onclick={() => setTheme('creamy-matcha')}
    title="Archetype A: Matcha (Ceremonial Green & Moss)"
  >
    🍵 Matcha
  </button>

  <button
    type="button"
    class="px-2 py-1 rounded transition-colors {currentTheme === 'cyberpunk-osl' ? 'bg-[var(--accent-primary)] text-[var(--canvas-bg)] font-semibold shadow-xs' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
    onclick={() => setTheme('cyberpunk-osl')}
    title="Archetype B: Cyberpunk OSL (Neon Plasma & Wet Asphalt)"
  >
    ⚡ OSL
  </button>
</div>
