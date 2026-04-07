import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HistoryService } from '../../services/history.service';
import { HistoryRecord } from '../../models/qms.models';
import { CATEGORIES } from '../../models/units.data';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  allItems: HistoryRecord[] = [];
  filtered: HistoryRecord[] = [];
  searchTerm = '';
  filterCat  = '';
  userName   = '';

  categoryKeys = Object.keys(CATEGORIES);
  categories   = CATEGORIES;

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
    this.allItems = this.histSvc.getAll();
    this.applyFilters();
  }

  applyFilters(): void {
    let items = [...this.allItems];
    if (this.filterCat) items = items.filter(i => i.category === this.filterCat);
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      items = items.filter(i =>
        i.expression?.toLowerCase().includes(q) ||
        i.result?.toLowerCase().includes(q) ||
        i.op?.toLowerCase().includes(q) ||
        i.category?.toLowerCase().includes(q)
      );
    }
    this.filtered = items;
  }

  clearHistory(): void {
    if (confirm('Clear all history? This cannot be undone.')) {
      this.histSvc.clear();
      this.load();
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  goHome(): void { this.router.navigate(['/']); }

  timeStr(ts: number): string {
    return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  catIcon(cat: string): string {
    return CATEGORIES[cat]?.icon || '';
  }
}
