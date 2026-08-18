import { Routes } from '@angular/router';
import { CustomerMaster } from './customer-master';
import { SalesImport } from './sales-import';
import { SalesView } from './sales-view';
import { SalesExport } from './sales-export';
import { SalesFind } from './sales-find';

export const routes: Routes = [
  {path:'customer-master',component:CustomerMaster,title:'Customer Master'},
  {path:'sales/import',component:SalesImport,title:'Sales · Import Data'},
  {path:'sales/view',component:SalesView,title:'Sales · View Leads'},
  {path:'sales/export',component:SalesExport,title:'Sales · Export Data'},
  {path:'sales/find',component:SalesFind,title:'Sales · Find & Verify'},
  {path:'sales',pathMatch:'full',redirectTo:'sales/view'},
  {path:'',pathMatch:'full',redirectTo:'customer-master'},
  {path:'**',redirectTo:'customer-master'}
];
