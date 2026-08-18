import { Routes } from '@angular/router';
import { CustomerMaster } from './customer-master';
import { LeadManagement } from './lead-management';

export const routes: Routes = [
  {path:'customer-master',component:CustomerMaster,title:'Customer Master'},
  {path:'sales/lead-data',component:LeadManagement,title:'Sales · Lead Data Management'},
  {path:'',pathMatch:'full',redirectTo:'customer-master'},
  {path:'**',redirectTo:'customer-master'}
];
