// js/ballot.js
(async function () {
  const voterRoll = sessionStorage.getItem('ev_voter_roll');
  if (!voterRoll) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('voterInfo').textContent = 'Authorized Voter: ' + voterRoll;
  
  const listEl = document.getElementById('ballotList');
  const confirmBtn = document.getElementById('confirmBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const statusBox = document.getElementById('statusBox');
  
  let selectedCandidateId = null;

  const { data: settings, error: setError } = await _supabase
    .from('settings').select('status').eq('id', 1).single();

  if (setError || settings.status !== 'open') {
    listEl.innerHTML = '<div class="status-box warn" style="display:block;">The election is not currently open for voting. Please contact the admin.</div>';
    return;
  }

  const { data: candidates, error: candError } = await _supabase
    .from('users').select('*').eq('role', 'candidate').eq('status', 'approved');

  if (candError || !candidates || candidates.length === 0) {
    listEl.innerHTML = '<div class="status-box warn" style="display:block;">No approved candidates available yet.</div>';
    return;
  }

  listEl.innerHTML = candidates.map(c => `
    <div class="ballot-item" data-id="${c.id}">
      <div class="ballot-radio"></div>
      <div class="ballot-info">
        <h3>${esc(c.name)}</h3>
        <p>Candidate ID: ${esc(c.roll_no)}</p>
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('.ballot-item').forEach(item => {
    item.addEventListener('click', function() {
      listEl.querySelectorAll('.ballot-item').forEach(el => el.classList.remove('selected'));
      this.classList.add('selected');
      selectedCandidateId = this.getAttribute('data-id');
      confirmBtn.disabled = false;
    });
  });

  confirmBtn.addEventListener('click', async function() {
    if (!selectedCandidateId) return;

    // Custom Confirm Modal
    const isSure = await showConfirm("Are you sure you want to cast your vote? This action is final and cannot be undone.", "Confirm Vote");
    if (!isSure) return;

    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Casting Vote...';

    const { error: voteError } = await _supabase
      .from('votes').insert([{ voter_roll_no: voterRoll, candidate_id: selectedCandidateId }]);

    if (voteError) {
      statusBox.textContent = 'Error casting vote: ' + voteError.message;
      statusBox.className = 'status-box error';
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm & Cast Vote';
      return;
    }

    sessionStorage.removeItem('ev_voter_roll');
    sessionStorage.removeItem('ev_voter_name');
    window.location.href = 'thankyou.html';
  });

  cancelBtn.addEventListener('click', function() {
    sessionStorage.removeItem('ev_voter_roll');
    sessionStorage.removeItem('ev_voter_name');
    window.location.href = 'login.html';
  });
})();