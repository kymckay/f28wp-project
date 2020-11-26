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
      const forms = document.getElementById('userForms');

      forms.style.display = 'none';

      // Store that user is logged in for game stats (login persists until tab closed)
      sessionStorage.loggedIn = res.user;

      const logout = document.getElementById('logout');
      const a = document.createElement('a');

      a.addEventListener('click', (event) => {
        // No longer logged in
        delete sessionStorage.loggedIn;

        // Hide the logout option
        logout.innerHTML = '';
        logout.style.display = '';

        // Re-show the forms
        forms.style.display = '';

        event.preventDefault();
      });
      a.innerHTML = 'Click here to logout.';

      logout.innerHTML = `Logged in as "${res.user}". `;
      logout.append(a);
      logout.style.display = 'block';
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
});
