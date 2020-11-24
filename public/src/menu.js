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
      const tt = event.target.getElementsByClassName('tooltip')[0];

      // Event fires when over the tooltip itself
      if (tt) {
        tt.style.bottom = `${window.innerHeight - event.y}px`;
        tt.style.left = `${event.x}px`;
      }
    });
  }
});

// Form submission AJAX
window.addEventListener('load', () => {
  const login = document.getElementById('login');
  const register = document.getElementById('register');

  login.addEventListener('submit', (event) => {
    const user = encodeURIComponent(
      document.getElementById('loginUser').value
    );
    const pword = encodeURIComponent(
      document.getElementById('loginPword').value
    );

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {

    };

    xhttp.open('POST', '/login', true);
    xhttp.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

    xhttp.send(`user=${user}&pword=${pword}`);

    event.preventDefault();
  });

  register.addEventListener('submit', (event) => {
    const user = encodeURIComponent(
      document.getElementById('regUser').value
    );
    const pword = encodeURIComponent(
      document.getElementById('regPword').value
    );

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {

    };

    xhttp.open('POST', '/register', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhttp.send(`user=${user}&pword=${pword}`);

    event.preventDefault();
  });
});
