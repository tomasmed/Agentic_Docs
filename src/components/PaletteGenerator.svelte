<script lang="ts">
  interface Preset {
    name: string;
    description: string;
    motherColor: string;
    specular: string;
    accentSecondary: string;
    basecoat: string;
  }

  const presets: Preset[] = [
    {
      name: 'Charm Bubblegum',
      description: 'Cool plum-charcoal canvas with warm advancing pastel pink.',
      motherColor: '#1a1625',
      specular: '#ff75b5',
      accentSecondary: '#ff9e64',
      basecoat: '#e2e0ec'
    },
    {
      name: 'Mocha Taro',
      description: 'Roasted espresso-indigo with lavender milk & taro keycaps.',
      motherColor: '#1e1e2e',
      specular: '#cba6f7',
      accentSecondary: '#fab387',
      basecoat: '#cdd6f4'
    },
    {
      name: 'Ceremonial Matcha',
      description: 'River-stone slate with steamed oat & creamy matcha green.',
      motherColor: '#1e2326',
      specular: '#a7c080',
      accentSecondary: '#e67e80',
      basecoat: '#d3c6aa'
    },
    {
      name: 'Cyberpunk Neon',
      description: 'Wet asphalt petrol with white-hot core & electric cyan arc.',
      motherColor: '#070a12',
      specular: '#00f0ff',
      accentSecondary: '#fcee0a',
      basecoat: '#d8fcff'
    },
    {
      name: 'Grimdark Industrial',
      description: 'Desaturated warm slate with antique brass & olive shadows.',
      motherColor: '#262925',
      specular: '#dbbc7f',
      accentSecondary: '#e57c6b',
      basecoat: '#dcd5c7'
    }
  ];

  let selectedPresetIndex = $state(0);
  let customMotherColor = $state(presets[0].motherColor);
  let customSpecular = $state(presets[0].specular);
  let customSecondary = $state(presets[0].accentSecondary);
  let customBasecoat = $state(presets[0].basecoat);
  let exportMode = $state<'tailwind' | 'lipgloss'>('tailwind');
  let copied = $state(false);

  function applyPreset(index: number) {
    selectedPresetIndex = index;
    const p = presets[index];
    customMotherColor = p.motherColor;
    customSpecular = p.specular;
    customSecondary = p.accentSecondary;
    customBasecoat = p.basecoat;
  }

  // Adjust brightness of a hex color (helper for glaze value stepping)
  function adjustBrightness(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, Math.max(0, (num >> 16) + amt));
    const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
    const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }

  // Derived 4-step glaze values
  let abyss = $derived(customMotherColor);
  let surface = $derived(adjustBrightness(customMotherColor, 5));
  let mutedBorder = $derived(adjustBrightness(customMotherColor, 12));
  let topCatchLight = $derived(adjustBrightness(customMotherColor, 22));

  function getExportCode() {
    if (exportMode === 'tailwind') {
      return `/* 70/20/10 Miniature Painter Ramp */
:root {
  --canvas-abyss:     ${abyss};       /* 70% Receding Shadow (Mother Color) */
  --surface-glaze:    ${surface};     /* +4-6% Value Step (Elevated Card) */
  --border-muted:     ${mutedBorder}; /* Muted Structure (Unfocused Border) */
  --border-specular:  ${topCatchLight};/* NMM Overhead Zenithal Catch-Light */
  --text-basecoat:    ${customBasecoat};/* 20% Midtone Readability */
  --osl-focal-glow:   ${customSpecular};/* 10% Focal Pop (Active Element) */
  --accent-secondary: ${customSecondary};
}`;
    } else {
      return `// Go / Lip Gloss Theme Struct
type Palette struct {
    Abyss       lipgloss.Color // ${abyss} (70% Canvas)
    Surface     lipgloss.Color // ${surface} (+5% Glaze)
    MutedBorder lipgloss.Color // ${mutedBorder} (Structure)
    Specular    lipgloss.Color // ${topCatchLight} (NMM Edge)
    Basecoat    lipgloss.Color // ${customBasecoat} (20% Text)
    OSLFocal    lipgloss.Color // ${customSpecular} (10% Glow)
}

var CurrentTheme = Palette{
    Abyss:       lipgloss.Color("${abyss}"),
    Surface:     lipgloss.Color("${surface}"),
    MutedBorder: lipgloss.Color("${mutedBorder}"),
    Specular:    lipgloss.Color("${topCatchLight}"),
    Basecoat:    lipgloss.Color("${customBasecoat}"),
    OSLFocal:    lipgloss.Color("${customSpecular}"),
}`;
    }
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(getExportCode());
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (e) {
      console.error(e);
    }
  }
</script>

<div class="my-8 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 sm:p-6 space-y-6 shadow-xl">
  <!-- Header -->
  <div class="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 flex-wrap gap-3">
    <div>
      <div class="flex items-center gap-2">
        <span class="text-base sm:text-lg">🎨</span>
        <h3 class="font-mono text-sm sm:text-base font-bold text-[var(--text-primary)]">
          The Miniature Painter's Palette Lab
        </h3>
      </div>
      <p class="text-xs text-[var(--text-muted)] mt-1 font-sans">
        Interact with the 70/20/10 value balance, Mother Color undertones, and directional NMM edge physics.
      </p>
    </div>

    <!-- Presets Selector -->
    <div class="flex items-center gap-1.5 flex-wrap">
      {#each presets as preset, i}
        <button
          type="button"
          class="px-2.5 py-1 text-xs font-mono rounded-md border transition-all cursor-pointer {selectedPresetIndex === i ? 'bg-[var(--accent-primary)] text-[var(--canvas-bg)] font-bold border-transparent shadow-xs' : 'border-[var(--border-subtle)] bg-[var(--canvas-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}"
          onclick={() => applyPreset(i)}
        >
          {preset.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Interactive Controls & Live Preview Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    <!-- Controls Column (5 cols) -->
    <div class="lg:col-span-5 space-y-4 font-mono text-xs">
      <div class="space-y-3 p-4 rounded-lg bg-[var(--canvas-bg)] border border-[var(--border-subtle)]">
        <span class="text-[11px] font-bold text-[var(--accent-secondary)] uppercase tracking-wider block">
          1. Atmosphere & Pigments
        </span>

        <div class="flex items-center justify-between">
          <label for="mother-color" class="text-[var(--text-primary)] flex items-center gap-1.5">
            <span class="w-3.5 h-3.5 rounded border border-white/20 inline-block" style="background-color: {customMotherColor}"></span>
            Mother Color (70% Shadow):
          </label>
          <div class="flex items-center gap-2">
            <span class="text-[var(--text-muted)]">{customMotherColor}</span>
            <input
              id="mother-color"
              type="color"
              bind:value={customMotherColor}
              class="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <label for="specular-color" class="text-[var(--text-primary)] flex items-center gap-1.5">
            <span class="w-3.5 h-3.5 rounded border border-white/20 inline-block" style="background-color: {customSpecular}"></span>
            OSL Specular (10% Glow):
          </label>
          <div class="flex items-center gap-2">
            <span class="text-[var(--text-muted)]">{customSpecular}</span>
            <input
              id="specular-color"
              type="color"
              bind:value={customSpecular}
              class="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <label for="basecoat-color" class="text-[var(--text-primary)] flex items-center gap-1.5">
            <span class="w-3.5 h-3.5 rounded border border-white/20 inline-block" style="background-color: {customBasecoat}"></span>
            Basecoat Text (20% Mid):
          </label>
          <div class="flex items-center gap-2">
            <span class="text-[var(--text-muted)]">{customBasecoat}</span>
            <input
              id="basecoat-color"
              type="color"
              bind:value={customBasecoat}
              class="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>
      </div>

      <!-- 4-Step Value Stepping Strip -->
      <div class="p-4 rounded-lg bg-[var(--canvas-bg)] border border-[var(--border-subtle)] space-y-2">
        <span class="text-[11px] font-bold text-[var(--accent-secondary)] uppercase tracking-wider block">
          2. The 4-Step Glaze Ramp
        </span>
        <div class="grid grid-cols-4 gap-1 text-[10px] text-center pt-1 font-mono">
          <div class="p-2 rounded border border-white/10" style="background-color: {abyss}; color: {customBasecoat};">
            <div class="font-bold">Abyss</div>
            <div class="text-[9px] opacity-70">Canvas</div>
          </div>
          <div class="p-2 rounded border border-white/10" style="background-color: {surface}; color: {customBasecoat};">
            <div class="font-bold">Surface</div>
            <div class="text-[9px] opacity-70">+5% Glaze</div>
          </div>
          <div class="p-2 rounded border border-white/10" style="background-color: {mutedBorder}; color: {customBasecoat};">
            <div class="font-bold">Border</div>
            <div class="text-[9px] opacity-70">+12% Step</div>
          </div>
          <div class="p-2 rounded border border-white/10" style="background-color: {customSpecular}; color: {abyss};">
            <div class="font-bold">OSL</div>
            <div class="text-[9px] opacity-90">10% Pop</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Preview Column (7 cols) -->
    <div class="lg:col-span-7 space-y-4">
      <div
        class="rounded-xl p-5 border transition-all duration-300 font-mono text-xs relative overflow-hidden shadow-2xl"
        style="
          background-color: {abyss};
          color: {customBasecoat};
          border-top: 2px solid {topCatchLight};
          border-left: 1px solid {mutedBorder};
          border-right: 1px solid {mutedBorder};
          border-bottom: 2px solid {adjustBrightness(abyss, -5)};
          box-shadow: 0 10px 30px -10px {abyss};
        "
      >
        <!-- Directional OSL Top Lip Spill -->
        <div
          class="absolute top-0 left-0 right-0 h-1"
          style="background: linear-gradient(90deg, transparent, {customSpecular}, transparent);"
        ></div>

        <!-- Simulated Terminal Chrome Header -->
        <div class="flex items-center justify-between border-b pb-3" style="border-color: {mutedBorder}">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" style="background-color: {customSpecular}"></span>
            <span class="font-bold text-xs" style="color: {customBasecoat}">~/agentic/preview.go</span>
          </div>
          <div class="flex items-center gap-2 text-[10px]">
            <span
              class="px-2 py-0.5 rounded font-bold"
              style="background-color: {customSpecular}; color: {abyss}; box-shadow: 0 0 10px {customSpecular}66;"
            >
              10% OSL
            </span>
            <span class="opacity-70" style="color: {customBasecoat}">NORMAL</span>
          </div>
        </div>

        <!-- Simulated Card Content with Glaze surface and NMM catch-light -->
        <div class="mt-4 space-y-3">
          <div
            class="p-3.5 rounded-lg border relative overflow-hidden"
            style="
              background-color: {surface};
              border-top: 1px solid {topCatchLight};
              border-left: 2px solid {customSpecular};
              border-right: 1px solid {mutedBorder};
              border-bottom: 1px solid {abyss};
            "
          >
            <!-- Environmental Light Spill simulation -->
            <div
              class="absolute inset-0 pointer-events-none opacity-10"
              style="background: radial-gradient(circle at top left, {customSpecular}, transparent 70%);"
            ></div>

            <div class="flex items-center justify-between text-[11px] mb-1.5">
              <span class="font-bold uppercase tracking-wider" style="color: {customSpecular}">
                [Directional Zenithal Edge]
              </span>
              <span class="text-[10px] opacity-75" style="color: {customBasecoat}">Active Pane</span>
            </div>
            <p class="font-sans text-xs leading-relaxed" style="color: {customBasecoat}">
              Notice how the top edge catches light while the bottom edge stays recessed. The active border gently glazes the interior without shouting.
            </p>
          </div>

          <!-- Keycap tactile pills -->
          <div class="flex items-center gap-2 pt-1 flex-wrap">
            <span
              class="px-2.5 py-1 rounded text-[11px] font-bold cursor-default"
              style="background-color: {customSecondary}; color: {abyss}; border-bottom: 2px solid {adjustBrightness(customSecondary, -20)};"
            >
              Keycap F1
            </span>
            <span
              class="px-2.5 py-1 rounded text-[11px] font-semibold border cursor-default"
              style="background-color: {surface}; border-color: {mutedBorder}; color: {customBasecoat}; border-bottom: 2px solid {mutedBorder};"
            >
              Status: Ambient
            </span>
            <span class="text-[10px] opacity-60 ml-auto" style="color: {customBasecoat}">
              70% Shadow / 20% Mid / 10% Pop
            </span>
          </div>
        </div>
      </div>

      <!-- Export Bar -->
      <div class="flex items-center justify-between p-3 rounded-lg bg-[var(--canvas-bg)] border border-[var(--border-subtle)] text-xs font-mono">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-2 py-0.5 rounded cursor-pointer {exportMode === 'tailwind' ? 'bg-[var(--surface-hover)] text-[var(--accent-primary)] font-bold' : 'text-[var(--text-muted)]'}"
            onclick={() => (exportMode = 'tailwind')}
          >
            Tailwind CSS
          </button>
          <span>|</span>
          <button
            type="button"
            class="px-2 py-0.5 rounded cursor-pointer {exportMode === 'lipgloss' ? 'bg-[var(--surface-hover)] text-[var(--accent-primary)] font-bold' : 'text-[var(--text-muted)]'}"
            onclick={() => (exportMode = 'lipgloss')}
          >
            Go Lip Gloss
          </button>
        </div>

        <button
          type="button"
          class="px-3 py-1 rounded bg-[var(--surface-card)] border border-[var(--border-focus)] text-[var(--text-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--canvas-bg)] transition-all cursor-pointer font-bold flex items-center gap-1.5"
          onclick={copyToClipboard}
        >
          {copied ? '✓ Copied!' : 'Copy Code Tokens'}
        </button>
      </div>
    </div>
  </div>
</div>
