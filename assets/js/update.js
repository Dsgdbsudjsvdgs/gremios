// ============================================================================
// 🔄 SISTEMA DE ATUALIZAÇÃO - Grêmio Conecta Jovem
// A versão local é lida do app-version.json automaticamente — sem hardcode
// ============================================================================

const UPDATE_CONFIG = {
  VERSION_URL: 'https://raw.githubusercontent.com/Dsgdbsudjsvdgs/gremios/main/app-version.json',
  APK_DOWNLOAD_URL: 'https://github.com/Dsgdbsudjsvdgs/gremios/releases/latest/download/app-debug.apk',
  // Fallback caso não consiga ler o arquivo local
  _localVersion: null,
  _localBuild: null
};

// Lê a versão local do app-version.json (que tá embutido no APK)
async function getLocalVersion() {
  if (UPDATE_CONFIG._localVersion) return { version: UPDATE_CONFIG._localVersion, build: UPDATE_CONFIG._localBuild };

  // Opcao A (estilo Capacitor): versao injetada via <script src="app-version.js">
  // — funciona em file:// (WebView do APK), sem fetch. Gerada junto do app-version.json.
  if (window.APP_VERSION && window.APP_VERSION.version) {
    UPDATE_CONFIG._localVersion = window.APP_VERSION.version;
    UPDATE_CONFIG._localBuild = window.APP_VERSION.build;
    return window.APP_VERSION;
  }

  try {
    // Tenta carregar o app-version.json local (mesmo diretório do site)
    const basePath = window.location.pathname.includes('/pages/') ? '../' : '';
    const res = await fetch(basePath + 'app-version.json?t=' + Date.now());
    if (res.ok) {
      const local = await res.json();
      UPDATE_CONFIG._localVersion = local.version;
      UPDATE_CONFIG._localBuild = local.build;
      return local;
    }
  } catch (e) {}

  // Fallback — espelha app-version.json; atualizar JUNTO em cada release
  // (fetch local falha no WebView do APK porque o site carrega via file://)
  return { version: '2.7.1', build: 15 };
}

async function checkForUpdates() {
  const statusEl = document.getElementById('update-status');
  const btnEl = document.getElementById('update-btn');
  const versionEl = document.getElementById('version-display');
  const installedEl = document.getElementById('installed-version');

  // Pega versão local automaticamente
  const local = await getLocalVersion();
  const verText = `v${local.version} (${local.build})`;
  if (versionEl) versionEl.textContent = verText;
  if (installedEl) installedEl.textContent = verText;

  if (statusEl) {
    statusEl.textContent = 'Verificando...';
    statusEl.style.color = '#00E5FF';
  }

  try {
    const response = await fetch(UPDATE_CONFIG.VERSION_URL + '?t=' + Date.now());
    if (!response.ok) throw new Error('Erro ao verificar');

    const remote = await response.json();

    if (remote.build > local.build) {
      if (statusEl) {
        statusEl.textContent = `🆕 Nova versão: v${remote.version} (${remote.build})`;
        statusEl.style.color = '#4CAF50';
      }
      if (btnEl) {
        btnEl.style.display = 'inline-block';
        btnEl.onclick = () => {
          window.open(UPDATE_CONFIG.APK_DOWNLOAD_URL, '_blank');
        };
      }
      const logEl = document.getElementById('changelog');
      if (logEl && remote.changelog) {
        logEl.innerHTML = remote.changelog.map(c => `<li>${c}</li>`).join('');
        logEl.parentElement.style.display = 'block';
      }
    } else {
      if (statusEl) {
        statusEl.textContent = '✅ App atualizado';
        statusEl.style.color = '#4CAF50';
      }
      if (btnEl) btnEl.style.display = 'none';
    }
  } catch (e) {
    if (statusEl) {
      statusEl.textContent = '⚠️ Sem conexão — verifique mais tarde';
      statusEl.style.color = '#FF6B6B';
    }
  }
}

console.log('✅ Update module loaded (auto-detect version)');
