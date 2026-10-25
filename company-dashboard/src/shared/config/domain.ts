export type DomainConfig = {
  appName: string
  appTagline: string
  recordSingular: string
  recordPlural: string
  categorySingular: string
  categoryPlural: string
  modelSingular: string
  modelPlural: string
  groupSingular: string
  groupPlural: string
  personSingular: string
  personPlural: string
  identifierLabel: string
  acquisitionDateLabel: string
  statusLabels: Record<string, string>
}

export const domainConfig: DomainConfig = {
  appName: import.meta.env.VITE_APP_NAME ?? 'Operations Workspace',
  appTagline: import.meta.env.VITE_APP_TAGLINE ?? 'Manage the records and resources that matter to your organization.',
  recordSingular: import.meta.env.VITE_RECORD_LABEL ?? 'Record',
  recordPlural: import.meta.env.VITE_RECORD_LABEL_PLURAL ?? 'Records',
  categorySingular: import.meta.env.VITE_CATEGORY_LABEL ?? 'Category',
  categoryPlural: import.meta.env.VITE_CATEGORY_LABEL_PLURAL ?? 'Categories',
  modelSingular: import.meta.env.VITE_MODEL_LABEL ?? 'Variant',
  modelPlural: import.meta.env.VITE_MODEL_LABEL_PLURAL ?? 'Variants',
  groupSingular: import.meta.env.VITE_GROUP_LABEL ?? 'Group',
  groupPlural: import.meta.env.VITE_GROUP_LABEL_PLURAL ?? 'Groups',
  personSingular: import.meta.env.VITE_PERSON_LABEL ?? 'Person',
  personPlural: import.meta.env.VITE_PERSON_LABEL_PLURAL ?? 'People',
  identifierLabel: import.meta.env.VITE_RECORD_IDENTIFIER_LABEL ?? 'Reference',
  acquisitionDateLabel: import.meta.env.VITE_ACQUISITION_DATE_LABEL ?? 'Acquisition date',
  statusLabels: {
    available: import.meta.env.VITE_STATUS_AVAILABLE_LABEL ?? 'Available',
    assigned: import.meta.env.VITE_STATUS_ASSIGNED_LABEL ?? 'Assigned',
    maintenance: import.meta.env.VITE_STATUS_MAINTENANCE_LABEL ?? 'In service',
    retired: import.meta.env.VITE_STATUS_RETIRED_LABEL ?? 'Archived',
  },
}
