// js/utils.js
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// --- Custom Themed Modal System ---
function createModal(type, title, message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'custom-modal-overlay';
    
    let buttonsHTML = '';
    if (type === 'alert') {
      buttonsHTML = `<button class="btn primary" id="modal-ok">OK</button>`;
    } else {
      buttonsHTML = `
        <button class="btn secondary" id="modal-cancel">Cancel</button>
        <button class="btn primary" id="modal-ok">Confirm</button>
      `;
    }

    overlay.innerHTML = `
      <div class="custom-modal">
        <div class="custom-modal-header">
          <h3>${esc(title)}</h3>
        </div>
        <div class="custom-modal-body">
          ${esc(message).replace(/\n/g, '<br>')}
        </div>
        <div class="custom-modal-footer">
          ${buttonsHTML}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    
    // Trigger animation
    setTimeout(() => overlay.classList.add('show'), 10);

    const closeModal = (result) => {
      overlay.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(overlay);
        resolve(result);
      }, 200);
    };

    document.getElementById('modal-ok').addEventListener('click', () => closeModal(true));
    
    if (type === 'confirm') {
      document.getElementById('modal-cancel').addEventListener('click', () => closeModal(false));
    }
  });
}

// Global functions to replace default alert/confirm
async function showAlert(message, title = 'Notice') {
  await createModal('alert', title, message);
}

async function showConfirm(message, title = 'Confirm Action') {
  return await createModal('confirm', title, message);
}