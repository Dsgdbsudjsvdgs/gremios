// ============================================================================
// 🔄 SISTEMA DE ATUALIZAÇÃO - Grêmio Estudantil
// ============================================================================

const UPDATE_CONFIG = {
  VERSION_URL: 'https://raw.githubusercontent.com/Dsgdbsudjsvdgs/gremios/main/app-version.json',
  APK_DOWNLOAD_URL: 'https://github.com/Dsgdbsudjsvdgs/gremios/releases/latest/download/app-debug.apk',
  CURRENT_VERSION: '2.1.0',
  CURRENT_BUILD: 4
};

async function checkForUpdates() {
  const statusEl = document.getElementById('update-status');
  const btnEl = document.getElementById('update-btn');
  const versionEl = document.getElementById('version-display');
  const installedEl = document.getElementById('installed-version');

  const verText = `v${UPDATE_CONFIG.CURRENT_VERSION} (${UPDATE_CONFIG.CURRENT_BUILD})`;
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

    if (remote.build > UPDATE_CONFIG.CURRENT_BUILD) {
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

console.log('✅ Update module loaded');
