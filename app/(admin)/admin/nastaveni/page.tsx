import { SettingsForm } from './settings-form'
import { ClosedDaysManager } from '@/components/admin/closed-days-manager'
import { getSiteSettings } from '@/app/actions/settings'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings()
  
  return (
    <div className="space-y-6">
      <SettingsForm initialSettings={settings} />
      <ClosedDaysManager />
    </div>
  )
}
