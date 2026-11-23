/**
 * UMS menu permission names supported by the Lead Data application.
 * Matching is case/separator insensitive and also accepts an application prefix,
 * for example `Lead_Data_Module_Customer_Master_VIEW`.
 */
export const SALES_MENU_PERMISSIONS = {
  customerMaster: [
    'LEAD_VALIDATION_CUSTOMER_MASTER_VIEW',
    'Lead_Data_Module_Customer_Master_VIEW',
    'Sales_Data_Customer_Master_VIEW',
    'Customer_Master_VIEW',
    'Masters_Customer_VIEW',
  ],
  leadRegister: [
    'LEAD_VALIDATION_VIEW_LEADS_VIEW',
    'Lead_Data_Module_Lead_Register_VIEW',
    'Sales_Lead_Register_VIEW',
    'Lead_Register_VIEW',
    'Sales_View_Leads_VIEW',
    'View_Leads_VIEW',
  ],
  uploadLeads: [
    'LEAD_VALIDATION_UPLOAD_LEADS_VIEW',
    'LEAD_VALIDATION_IMPORT_LEADS_VIEW',
    'Lead_Data_Module_Upload_Leads_VIEW',
    'Sales_Upload_Leads_VIEW',
    'Upload_Leads_VIEW',
    'Sales_Import_Leads_VIEW',
    'Import_Leads_VIEW',
  ],
  companyLookup: [
    // Keep COMAPNY because this is the permission spelling currently configured in UMS.
    'LEAD_VALIDATION_SEARCH_COMAPNY_VIEW',
    'LEAD_VALIDATION_SEARCH_COMPANY_VIEW',
    'Lead_Data_Module_Company_Lookup_VIEW',
    'Sales_Company_Lookup_VIEW',
    'Company_Lookup_VIEW',
    'Sales_Find_Leads_VIEW',
    'Find_Leads_VIEW',
    'Quick_Module_Verification_VIEW',
  ],
} as const;

export const SALES_ROUTE_ACCESS = [
  { path: '/customer-master', permissions: SALES_MENU_PERMISSIONS.customerMaster },
  { path: '/sales/view', permissions: SALES_MENU_PERMISSIONS.leadRegister },
  { path: '/sales/import', permissions: SALES_MENU_PERMISSIONS.uploadLeads },
  { path: '/sales/find', permissions: SALES_MENU_PERMISSIONS.companyLookup },
] as const;
