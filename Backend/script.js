// Login form handling
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginButton = document.querySelector('.login-button');
    
    // Disable button during submission
    loginButton.disabled = true;
    loginButton.textContent = 'Signing in...';
    
    // Simulate login process (replace with actual API call)
    setTimeout(() => {
        // Here you would typically make an API call to authenticate
        console.log('Login attempt:', { username, password });
        
        // Reset button state
        loginButton.disabled = false;
        loginButton.textContent = 'Sign In';
        
        // Redirect to dashboard after successful login
        if (username && password) {
            window.location.href = 'dashboard.html';
        } else {
            alert('Please enter both username and password');
        }
    }, 1000);
});

// Add focus animations
const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});
