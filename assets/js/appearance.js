// ============================================================================
// 🎨 APARÊNCIA — seção do perfil (tema do app)
// Persiste na coluna profiles.theme (JSONB) + localStorage pra aplicação
// instantânea via theme-runtime.js em todas as páginas.
// ============================================================================

const APP_THEME_PRESETS = {
  'conecta': { label: 'CONECTA 2026', primary: '#8f1212', primaryDark: '#380808', bg: '#0a0505', accent: '#c88888', text: '#f6eade' },
  'coral':   { label: 'CORAL LOVABLE', primary: '#e04e2d', primaryDark: '#7a2e18', bg: '#1d1815', accent: '#e08d4e', text: '#f5efe9' },
  'ciano':   { label: 'EDUCA CYAN', primary: '#00E5FF', primaryDark: '#00B2CC', bg: '#000000', accent: '#FFFFFF', text: '#FFFFFF' },
  'roxo':    { label: 'NOTURNO', primary: '#8b5cf6', primaryDark: '#4c1d95', bg: '#0c0a14', accent: '#c4b5fd', text: '#f5f3ff' },
  'verde':   { label: 'MATA', primary: '#10b981', primaryDark: '#065f46', bg: '#06120c', accent: '#a7f3d0', text: '#f0fdf7' },
  'ambar':   { label: 'AMAZÔNIA', primary: '#f59e0b', primaryDark: '#92400e', bg: '#140d04', accent: '#fde68a', text: '#fffbeb' }
};

const APP_THEME_CONTROLS = [
  { key: 'primary',     label: 'Cor principal',    hint: 'Botões, destaques, barra' },
  { key: 'primaryDark', label: 'Cor de profundidade', hint: 'Sombras, gradientes, detalhes' },
  { key: 'bg',          label: 'Fundo do app',      hint: 'Cor de base escura' },
  { key: 'accent',      label: 'Cor de apoio',       hint: 'Detalhes claros e tags' },
  { key: 'text',        label: 'Cor do texto',      hint: 'Texto principal do app' }
];

const THEME_LS_KEY = 'gremio_theme_custom';

async function initAppearanceSection() {
  const user = UTILS.getStorageUser();
  if (!user) return;

  // Estado: banco (user.theme) > localStorage > padrão
  let current = { primary: '#8f1212', primaryDark: '#380808', bg: '#0a0505', accent: '#c88888', text: '#f6eade' };
  let selectedPreset = 'conecta';

  const fromDb = user.theme && typeof user.theme === 'object' ? user.theme : null;
  const fromLs = (() => { try { return JSON.parse(localStorage.getItem(THEME_LS_KEY)); } catch (e) { return null; } })();
  const source = fromDb || fromLs;
  if (source && source.primary) {
    current = { ...current, ...source };
    selectedPreset = source.preset || null;
  }

  const elPresets = document.getElementById('theme-presets');
  const elControls = document.getElementById('theme-controls');
  if (!elPresets || !elControls) return; // seção ausente — página não tem

  function renderPresets() {
    elPresets.innerHTML = Object.entries(APP_THEME_PRESETS).map(([id, p]) => `
      <button type="button" class="theme-preset ${id === selectedPreset ? 'sel' : ''}" data-preset="${id}">
        <span class="sw">
          <i style="background:${p.bg}"></i><i style="background:${p.primary}"></i><i style="background:${p.accent}"></i>
        </span>${p.label}
      </button>`).join('');
    elPresets.querySelectorAll('.theme-preset').forEach(b => {
      b.addEventListener('click', () => pickPreset(b.dataset.preset));
    });
  }

  function renderControls() {
    elControls.innerHTML = APP_THEME_CONTROLS.map(c => `
      <div class="theme-ctrl">
        <label>${c.label}<small>${c.hint}</small></label>
        <span class="tval" id="tval-${c.key}">${current[c.key]}</span>
        <input type="color" id="tin-${c.key}" value="${current[c.key]}">
      </div>`).join('');
    APP_THEME_CONTROLS.forEach(c => {
      document.getElementById('tin-' + c.key).addEventListener('input', (e) => pickCustom(c.key, e.target.value));
    });
  }

  function applyLive() {
    const r = document.documentElement.style;
    r.setProperty('--primary', current.primary);
    r.setProperty('--primary-dark', current.primaryDark);
    r.setProperty('--bg-dark', current.bg);
    r.setProperty('--accent', current.accent);
    r.setProperty('--text-main', current.text);
    r.setProperty('--gradient-main', `linear-gradient(135deg, ${current.primary}, ${current.primaryDark})`);
  }

  function pickPreset(id) {
    const p = APP_THEME_PRESETS[id];
    selectedPreset = id;
    current = { primary: p.primary, primaryDark: p.primaryDark, bg: p.bg, accent: p.accent, text: p.text, preset: id };
    renderPresets(); renderControls(); applyLive();
  }

  function pickCustom(key, val) {
    selectedPreset = null;
    current[key] = val;
    current.preset = null;
    document.getElementById('tval-' + key).textContent = val;
    renderPresets(); applyLive();
  }

  renderPresets();
  renderControls();
  applyLive();

  // ---- Salvar: banco + localStorage ----
  document.getElementById('theme-save').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = 'Salvando...';
    try {
      await UTILS.supabaseUpdate('profiles', user.id, { theme: current });
      localStorage.setItem(THEME_LS_KEY, JSON.stringify(current));
      const updated = { ...UTILS.getStorageUser(), theme: current };
      UTILS.setStorageUser(updated);
      UTILS.showSuccess('Tema salvo e sincronizado!');
    } catch (err) {
      console.error('Erro ao salvar tema:', err);
      UTILS.showError('Erro ao salvar tema: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  });

  // ---- Restaurar: remove dos dois lugares ----
  document.getElementById('theme-reset').addEventListener('click', async () => {
    try {
      await UTILS.supabaseUpdate('profiles', user.id, { theme: null });
      localStorage.removeItem(THEME_LS_KEY);
      UTILS.setStorageUser({ ...UTILS.getStorageUser(), theme: null });
      pickPreset('conecta');
      UTILS.showSuccess('Tema padrão restaurado');
    } catch (err) {
      console.error('Erro ao restaurar tema:', err);
      UTILS.showError('Erro ao restaurar: ' + err.message);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => initAppearanceSection());
