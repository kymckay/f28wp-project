/*
  File: Contains code to update the main menu

  - AJAX code for login/registration
  - Code for our name hover tooltips

  Author(s): Kyle
*/

// Tooltips for our initials
window.addEventListener('load', () => {
  const tiles = document.getElementsByClassName('tile');

  for (let i = 0; i < tiles.length; i++) {
    tiles[i].addEventListener('mouseover', (event) => {
      const tt = event.target.getElementsByTagName('details')[0];

      // Event fires when over the tooltip itself
      if (tt) {
        tt.style.bottom = `${window.innerHeight - event.y}px`;
        tt.style.left = `${event.x}px`;
      }
    });
  }
});

function showForms(show) {
  const forms = document.getElementById('userForms');

  if (show) {
    // Revert to CSS defined
    forms.style.display = '';
  } else {
    forms.style.display = 'none';
  }
}

function showLoggedIn(show) {
  const logout = document.getElementById('logout');

  if (show) {
    const a = document.createElement('a');
    a.innerHTML = 'Click here to logout.';

    a.addEventListener('click', (event) => {
      // No longer logged in
      delete sessionStorage.loggedIn;

      showLoggedIn(false);
      showForms(true);

      event.preventDefault();
    });

    logout.innerHTML = `Logged in as "${sessionStorage.loggedIn}". `;
    logout.append(a);
    logout.style.display = 'block';
  } else {
    logout.innerHTML = '';
    logout.style.display = 'none';
  }
}

function handleResponse() {
  // Successful request
  if (this.readyState === 4 && this.status === 200) {
    const res = JSON.parse(this.responseText);

    const msg = document.getElementById('formMsg');
    if (res.msg) {
      msg.innerHTML = res.msg;
      msg.style.display = 'block';
    } else {
      msg.style.display = '';
    }

    // Hide forms once logged in
    if (res.user) {
      // Store that user is logged in for game stats (login persists until tab closed)
      sessionStorage.loggedIn = res.user;

      showForms(false);
      showLoggedIn(true);
    }
  }
}

// Form submission AJAX
window.addEventListener('load', () => {
  const login = document.getElementById('login');
  const register = document.getElementById('register');

  // Login handling
  login.addEventListener('submit', (event) => {
    const user = encodeURIComponent(
      document.getElementById('loginUser').value
    );
    const pword = encodeURIComponent(
      document.getElementById('loginPword').value
    );

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = handleResponse;

    xhttp.open('POST', '/login', true);
    xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhttp.send(`user=${user}&pass=${pword}`);

    event.preventDefault();
  });

  // Registration handling
  register.addEventListener('submit', (event) => {
    const user = encodeURIComponent(
      document.getElementById('regUser').value
    );
    const pword = encodeURIComponent(
      document.getElementById('regPword').value
    );

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = handleResponse;

    xhttp.open('POST', '/register', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhttp.send(`user=${user}&pass=${pword}`);

    event.preventDefault();
  });

  // If already logged in
  if (sessionStorage.loggedIn) {
    showForms(false);
    showLoggedIn(true);
  }
});
