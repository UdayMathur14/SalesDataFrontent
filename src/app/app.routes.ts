import { Routes } from '@angular/router';
import { CustomerMaster } from './customer-master';
import { SalesImport } from './sales-import';
import { SalesView } from './sales-view';
import { SalesFind } from './sales-find';

export const routes: Routes = [
  { path: 'customer-master', component: CustomerMaster, title: 'Customer Master' },
  { path: 'sales/import', component: SalesImport, title: 'Import Center' },
  { path: 'sales/view', component: SalesView, title: 'Lead Register' },
  { path: 'sales/export', pathMatch: 'full', redirectTo: 'sales/view' },
  { path: 'sales/find', component: SalesFind, title: 'Company Lookup' },
  { path: 'sales', pathMatch: 'full', redirectTo: 'sales/view' },
  { path: '', pathMatch: 'full', redirectTo: 'customer-master' },
  { path: '**', redirectTo: 'customer-master' },
];
