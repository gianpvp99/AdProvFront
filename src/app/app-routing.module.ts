import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guards';

const routes: Routes = [  
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('app/main/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'estadisticas',
    loadChildren: () => import('app/main/estadisticas/estadisticas.module').then(m => m.EstadisticasModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'seguridad',
    loadChildren: () => import('app/main/seguridad/seguridad.module').then(m => m.SeguridadModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'pages',
    loadChildren: () => import('app/main/pages/pages.module').then(m => m.PagesModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('app/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '**',
    redirectTo: '/pages/miscellaneous/error' //Error 404 - Page not found
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{ useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
