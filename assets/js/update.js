// ============================================================================
// 🔄 SISTEMA DE ATUALIZAÇÃO - Grêmio Estudantil
// ============================================================================

const UPDATE_CONFIG = {
  // Arquivo no repo com a versão mais recente
  VERSION_URL: 'https://raw.githubusercontent.com/Dsgdbsudjsvdgs/gremios/main/app-version.json',
  // URL direta do APK no repo releases (ou GitHub Pages)
  APK_URL: 'https://github.com/Dsgdbsudjsvdgs/gremios/releases/download/',
  // Versão atual do app (embutida no build)
  CURRENT_VERSION: '2.0.0',
  CURRENT_BUILD: 3
};

async function checkForUpdates() {
  const statusEl = document.getElementById('update-status');
  const btnEl = document.getElementById('update-btn');
  const versionEl = document.getElementById('version-display');

  if (versionEl) {
    versionEl.textContent = `v${UPDATE_CONFIG.CURRENT_VERSION} (${UPDATE_CONFIG.CURRENT_BUILD})`;
  }

  if (statusEl) statusEl.textContent = 'Verificando...';
  if (statusEl) statusEl.style.color = '#00E5FF';

  try {
    const response = await fetch(UPDATE_CONFIG.VERSION_URL + '?t=' + Date.now());
    if (!response.ok) throw new Error('Erro ao verificar');

    const remote = await response.json();

    if (remote.build > UPDATE_CONFIG.CURRENT_BUILD) {
      // Atualização disponível
      if (statusEl) {
        statusEl.textContent = `Nova versão: v${remote.version} (${remote.build})`;
        statusEl.style.color = '#4CAF50';
      }
      if (btnEl) {
        btnEl.style.display = 'inline-block';
        btnEl.onclick = () => downloadUpdate(remote);
      }

      // Mostrar changelog
      const logEl = document.getElementById('changelog');
      if (logEl && remote.changelog) {
        logEl.innerHTML = remote.changelog.map(c => `<li>${c}</li>`).join('');
        logEl.parentElement.style.display = 'block';
      }
    } else {
      if (statusEl) {
        statusEl.textContent = 'App atualizado ✓';
        statusEl.style.color = '#4CAF50';
      }
      if (btnEl) btnEl.style.display = 'none';
    }
  } catch (e) {
    if (statusEl) {
      statusEl.textContent = 'Sem conexão — verifique mais tarde';
      statusEl.style.color = '#FF6B6B';
    }
  }
}

function downloadUpdate(remote) {
  const url = `${UPDATE_CONFIG.APK_URL}v${remote.version}/gremio-estudantil.apk`;
  // No WebView, abre no navegador pra baixar
  window.open(url, '_blank');
}

console.log('✅ Update module loaded');
