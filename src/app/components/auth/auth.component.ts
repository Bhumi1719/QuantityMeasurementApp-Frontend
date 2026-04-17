import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  mode: 'login' | 'signup' = 'login';

  // Login
  loginEmail    = '';
  loginPassword = '';
  loginError    = '';
  loginLoading  = false;

  // Signup
  signupName     = '';
  signupEmail    = '';
  signupPassword = '';
  signupError    = '';
  signupLoading  = false;

  constructor(private auth: AuthService, private router: Router) {}

  doLogin(): void {
    this.loginError = '';
    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Please fill in all fields.'; return;
    }
    this.loginLoading = true;
    this.auth.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => { this.loginLoading = false; this.router.navigate(['/history']); },
      error: (err) => {
        this.loginLoading = false;
        this.loginError = err.error || 'Login failed. Check credentials.';
      }
    });
  }

  doSignup(): void {
    this.signupError = '';
    if (!this.signupName || !this.signupEmail || !this.signupPassword) {
      this.signupError = 'Please fill in all fields.'; return;
    }
    if (this.signupPassword.length < 6) {
      this.signupError = 'Password must be at least 6 characters.'; return;
    }
    this.signupLoading = true;
    this.auth.signup(this.signupName, this.signupEmail, this.signupPassword).subscribe({
      next: () => { this.signupLoading = false; this.router.navigate(['/history']); },
      error: (err) => {
        this.signupLoading = false;
        this.signupError = err.error || 'Signup failed. Try again.';
      }
    });
  }

  switchMode(m: 'login' | 'signup'): void {
    this.mode = m;
    this.loginError = '';
    this.signupError = '';
  }
}
