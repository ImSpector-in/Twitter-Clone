'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportUserData } from '@/lib/actions/settings'

export default function DataExport() {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const data = await exportUserData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quotora-data-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">Download your data</p>
        <p className="text-muted-foreground text-sm">Export your tweets, likes, and follows as JSON.</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
        <Download className="h-4 w-4 mr-1" aria-hidden="true" />
        {loading ? 'Exporting...' : 'Export'}
      </Button>
    </div>
  )
}
