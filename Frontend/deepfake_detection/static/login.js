document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.querySelector('i').classList.toggle('fa-eye');
        togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.querySelector('input[name="remember"]').checked;

        try {
            // UPDATED: Use relative path for Flask
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store the token if remember me is checked
                if (remember) {
                    localStorage.setItem('token', data.token);
                } else {
                    sessionStorage.setItem('token', data.token);
                }

                // Store user info
                localStorage.setItem('user', JSON.stringify(data.user));

                // UPDATED: Redirect to Flask's home route instead of index.html
                window.location.href = '/';
            } else {
                showError(data.error || 'Login failed');
            }
        } catch (error) {
            showError('Network error. Please try again.');
        }
    });

    // Error message display
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;

        // Remove any existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Insert error message after the form
        loginForm.insertAdjacentElement('afterend', errorDiv);

        // Remove error message after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Handle "Enter" key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            loginForm.querySelector('button[type="submit"]').click();
        }
    });
});