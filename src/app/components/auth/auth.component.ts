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

  // Signup
  signupName     = '';
  signupEmail    = '';
  signupPassword = '';
  signupError    = '';

  constructor(private auth: AuthService, private router: Router) {}

  doLogin(): void {
    this.loginError = '';
    const err = this.auth.login(this.loginEmail, this.loginPassword);
    if (err) { this.loginError = err; return; }
    this.router.navigate(['/history']);
  }

  doSignup(): void {
    this.signupError = '';
    const err = this.auth.signup(this.signupName, this.signupEmail, this.signupPassword);
    if (err) { this.signupError = err; return; }
    this.router.navigate(['/history']);
  }

  switchMode(m: 'login' | 'signup'): void {
    this.mode = m;
    this.loginError = '';
    this.signupError = '';
  }
}
