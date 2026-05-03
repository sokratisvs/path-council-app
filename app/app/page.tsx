import { AppNavbar } from '@/components/app/app-navbar'
import { CompassApp } from '@/components/compass-app'

export default function AppPage() {
  return (
    <div className="flex flex-col min-h-screen bg-base">
      <AppNavbar />
      <CompassApp />
    </div>
  )
}
