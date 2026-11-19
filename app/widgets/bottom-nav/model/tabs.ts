export type TabKey = 'overview' | 'report' | 'dangers'

export interface Tab {
  key: TabKey
  label: string
}

export const TABS: Tab[] = [
  { key: 'overview', label: 'Обзор' },
  { key: 'report', label: 'Репорт' },
  { key: 'dangers', label: 'Опасности' },
]