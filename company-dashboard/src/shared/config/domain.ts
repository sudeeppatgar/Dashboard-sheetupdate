export type DomainConfig = {
  appName: string
  appTagline: string
  recordSingular: string
  recordPlural: string
  categorySingular: string
  categoryPlural: string
  typeSingular: string
  typePlural: string
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
  typeSingular: import.meta.env.VITE_TYPE_LABEL ?? 'Record type',
  typePlural: import.meta.env.VITE_TYPE_LABEL_PLURAL ?? 'Record types',
  groupSingular: import.meta.env.VITE_GROUP_LABEL ?? 'Group',
  groupPlural: import.meta.env.VITE_GROUP_LABEL_PLURAL ?? 'Groups',
  personSingular: import.meta.env.VITE_PERSON_LABEL ?? 'Person',
  personPlural: import.meta.env.VITE_PERSON_LABEL_PLURAL ?? 'People',
  identifierLabel: import.meta.env.VITE_RECORD_IDENTIFIER_LABEL ?? 'Reference',
  acquisitionDateLabel: import.meta.env.VITE_ACQUISITION_DATE_LABEL ?? 'Acquisition date',
  statusLabels: {
    active: import.meta.env.VITE_STATUS_ACTIVE_LABEL ?? 'Active',
    'in-progress': import.meta.env.VITE_STATUS_IN_PROGRESS_LABEL ?? 'In progress',
    completed: import.meta.env.VITE_STATUS_COMPLETED_LABEL ?? 'Completed',
    archived: import.meta.env.VITE_STATUS_ARCHIVED_LABEL ?? 'Archived',
  },
}
