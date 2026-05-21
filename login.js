'use strict';

function toggleLoginPanel(showExaminer) {
  const container = document.getElementById('login-slide-container');
  if (showExaminer) {
    container.classList.add('show-examiner');
    document.getElementById('a-username').value = '';
    document.getElementById('a-password').value = '';
    document.getElementById('a-error').textContent = '';
  } else {
    container.classList.remove('show-examiner');
    document.getElementById('s-username').value = '';
    document.getElementById('s-password').value = '';
    document.getElementById('s-error').textContent = '';
  }
}

function doLogin(role) {
  const isAdmin  = role === 'admin';
  const username = document.getElementById(isAdmin ? 'a-username' : 's-username').value.trim();
  const password = document.getElementById(isAdmin ? 'a-password' : 's-password').value;
  const errEl    = document.getElementById(isAdmin ? 'a-error' : 's-error');

  if (!username || !password) {
    errEl.textContent = 'Please enter username and password.';
    return;
  }
  errEl.textContent = '';

  // Default users — baad mein Azure API se replace hoga
  const defaultStudents = [{ id: 's1', username: 'student1', password: 'student123', name: 'Arjun Kumar', role: 'student' }];
  const defaultAdmins   = [{ id: 'a1', username: 'admin',    password: 'admin123',   name: 'Admin',       role: 'admin'   }];

  if (isAdmin) {
    const admin = defaultAdmins.find(a => a.username === username && a.password === password);
    if (!admin) { errEl.textContent = 'Invalid credentials.'; return; }
    sessionStorage.setItem('ege_user', JSON.stringify(admin));
    window.location.href = '../../admin/dashboard/admin-dashboard.html';
  } else {
    const student = defaultStudents.find(s => s.username === username && s.password === password);
    if (!student) { errEl.textContent = 'Invalid credentials.'; return; }
    sessionStorage.setItem('ege_user', JSON.stringify(student));
    window.location.href = '../dashboard/dashboard.html';
  }
}