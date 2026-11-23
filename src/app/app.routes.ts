import { Routes } from '@angular/router';
import { CustomerMaster } from './customer-master';
import { SalesImport } from './sales-import';
import { SalesView } from './sales-view';
import { SalesFind } from './sales-find';
import { AccessDenied } from './access-denied';
import { permissionGuard } from './permission.guard';
import { SALES_MENU_PERMISSIONS } from './sales-permissions';

export const routes: Routes = [
  {
    path: 'customer-master',
    component: CustomerMaster,
    canActivate: [permissionGuard],
    data: { permissions: SALES_MENU_PERMISSIONS.customerMaster },
    title: 'Customer Master',
  },
  {
    path: 'sales/import',
    component: SalesImport,
    canActivate: [permissionGuard],
    data: { permissions: SALES_MENU_PERMISSIONS.uploadLeads },
    title: 'Upload Leads',
  },
  {
    path: 'sales/view',
    component: SalesView,
    canActivate: [permissionGuard],
    data: { permissions: SALES_MENU_PERMISSIONS.leadRegister },
    title: 'Lead Register',
  },
  { path: 'sales/export', pathMatch: 'full', redirectTo: 'sales/view' },
  {
    path: 'sales/find',
    component: SalesFind,
    canActivate: [permissionGuard],
    data: { permissions: SALES_MENU_PERMISSIONS.companyLookup },
    title: 'Company Lookup',
  },
  { path: 'access-denied', component: AccessDenied, title: 'Access Restricted' },
  { path: 'sales', pathMatch: 'full', redirectTo: 'sales/view' },
  { path: '', pathMatch: 'full', redirectTo: 'customer-master' },
  { path: '**', redirectTo: 'customer-master' },
];
