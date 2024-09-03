const signupForm = document.getElementById('form-signup');
if (signupForm) {
  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    console.log(name, email, password, passwordConfirm);

    try {
      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify that we're sending JSON
        },
        body: JSON.stringify({ name, email, password, passwordConfirm }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert('account created successfuly');
        location.assign('/profile');
      } else {
        alert('something went wrong');
      }

      console.log(response);
    } catch (err) {
      console.log(err);
    }
  });
}

// Login Form
const loginForm = document.getElementById('form-login');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify that we're sending JSON
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        alert('logged in successfuly');
        location.assign('/profile');
      } else {
        alert('something went wrong');
      }

      console.log(response);
    } catch (err) {
      console.log(err);
    }
  });
}
