import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HistoryService } from '../../services/history.service';
import { HistoryRecord } from '../../models/qms.models';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  allItems: HistoryRecord[] = [];
  filtered: HistoryRecord[] = [];
  searchTerm = '';
  userName   = '';
  loading    = false;
  errorMsg   = '';

  constructor(
    public auth: AuthService,
    private histSvc: HistoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.currentUser;
    if (!user) { this.router.navigate(['/login']); return; }
    this.userName = user.name;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.histSvc.getAll().subscribe({
      next: (data) => {
        // Sort newest first (highest id first)
        this.allItems = data.sort((a, b) => b.id - a.id);
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMsg = 'Could not load history. Make sure you are logged in.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    if (!this.searchTerm.trim()) {
      this.filtered = [...this.allItems];
      return;
    }
    const q = this.searchTerm.toLowerCase();
    this.filtered = this.allItems.filter(i =>
      i.operation?.toLowerCase().includes(q) ||
      i.result?.toLowerCase().includes(q)
    );
  }

  getBadgeClass(op: string): string {
    const map: Record<string, string> = {
      'ADD':      'badge-add',
      'CONVERT':  'badge-convert',
      'SUBTRACT': 'badge-subtract',
      'MULTIPLY': 'badge-multiply',
      'DIVIDE':   'badge-divide',
      'COMPARE':  'badge-compare',
    };
    return map[op?.toUpperCase()] || 'badge-convert';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  goHome(): void { this.router.navigate(['/']); }
}
