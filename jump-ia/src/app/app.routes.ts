import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent) },
  {
    path: 'agent',
    loadComponent: () => import('./pages/agent/agent').then((m) => m.AgentComponent),
  },
];
