import { Routes } from '@angular/router';

import { Dashboard } from './dashboard/dashboard';

import { Candidates } from './pages/candidates/candidates';

import { AddCandidate } from './pages/add-candidate/add-candidate';

import { Jobs } from './pages/jobs/jobs';

import { Interviews } from './pages/interviews/interviews';

import { Analytics } from './pages/analytics/analytics';

import { Settings } from './pages/settings/settings';


export const routes: Routes = [

  {
    path: '',
    component: Dashboard,
  },

  {
    path: 'candidates',
    component: Candidates,
  },

  {
    path: 'add-candidate',
    component: AddCandidate,
  },

  {
    path: 'jobs',
    component: Jobs,
  },

  {
    path: 'interviews',
    component: Interviews,
  },

  {
    path: 'analytics',
    component: Analytics,
  },

  {
    path: 'settings',
    component: Settings,
  },

  {
    path: '**',
    redirectTo: '',
  },

];