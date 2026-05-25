import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/**
 * UpdateBanner — shows a non-intrusive banner when a new PWA version is ready.
 * User taps to apply the update at their convenience — never mid-billing.
 */
export function UpdateBanner() {
  const [show, setShow] = useState(false)

  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 60 seconds in background
      if (r) setInterval(() => r.update(), 60_000)
    },
  })

  useEffect(() => {
    if (needRefresh) setShow(true)
  }, [needRefresh])

  if (!show) return null

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4 pt-2">
      <div className="bg-primary-600 text-white rounded-xl px-4 py-3 flex items-center justify-between shadow-lifted">
        <div className="flex items-center gap-2 text-sm">
          <RefreshCw size={16} />
          <span>Update available</span>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => updateServiceWorker(true)}
          className="text-ink text-xs py-1 px-3"
        >
          Refresh
        </Button>
      </div>
    </div>
  )
}
