'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Clock, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type ClosureInfo = {
  id: string
  date: string
  type: 'CLOSED' | 'MODIFIED'
  altOpeningHours: string | object[] | null
  note: string | null
}

type ClosureWithFormatted = ClosureInfo & {
  formattedDate: string
}

export function ClosureNotification() {
  const [upcomingClosures, setUpcomingClosures] = useState<ClosureWithFormatted[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  const formatDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    
    const today = new Date()
    const isToday = date.getFullYear() === today.getFullYear() &&
                   date.getMonth() === today.getMonth() &&
                   date.getDate() === today.getDate()
    
    return isToday 
      ? 'dnes'
      : date.toLocaleDateString('cs-CZ', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  useEffect(() => {
    const fetchUpcomingClosures = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/closed-days')
        const data: ClosureInfo[] = await response.json()
        
        // Získáme dneší datum a +7 dní
        const today = new Date()
        const sevenDaysLater = new Date(today)
        sevenDaysLater.setDate(sevenDaysLater.getDate() + 7)
        
        const todayDateStr = today.getFullYear() + '-' + 
          String(today.getMonth() + 1).padStart(2, '0') + '-' + 
          String(today.getDate()).padStart(2, '0')
        
        const sevenDaysDateStr = sevenDaysLater.getFullYear() + '-' + 
          String(sevenDaysLater.getMonth() + 1).padStart(2, '0') + '-' + 
          String(sevenDaysLater.getDate()).padStart(2, '0')

        // Najdeme všechny zavřené/změněné dny v rozsahu dnes až +7 dní
        const filtered = data
          .filter((day) => day.date >= todayDateStr && day.date <= sevenDaysDateStr)
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((day) => ({
            ...day,
            formattedDate: formatDate(day.date)
          }))

        setUpcomingClosures(filtered)
      } catch (error) {
        console.error('Chyba při načítání informace o zavřeném dni:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUpcomingClosures()
  }, [])

  if (isLoading || upcomingClosures.length === 0 || !isVisible) {
    return null
  }

  return (
    <div className="mx-4 mt-4 space-y-3">
      {upcomingClosures.map((closure) => (
        <div
          key={closure.id}
          className={`border-0 rounded-lg shadow-lg ${
            closure.type === 'CLOSED'
              ? 'bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-600'
          }`}
        >
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              {closure.type === 'CLOSED' ? (
                <AlertCircle className="h-7 w-7 mt-1 text-white flex-shrink-0" />
              ) : (
                <Clock className="h-7 w-7 mt-1 text-white flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg">
                  {closure.type === 'CLOSED' ? 'Pekárna je zavřena' : 'Změněné otevírací doby'} - {closure.formattedDate}
                </h3>
                {closure.type === 'MODIFIED' && (
                  <p className="text-orange-50 mt-2">Máme změněné otevírací doby:</p>
                )}
                {closure.type === 'CLOSED' && closure.note && (
                  <p className="text-red-50 mt-2">{closure.note}</p>
                )}
                {closure.type === 'MODIFIED' && typeof closure.altOpeningHours === 'string' && (
                  <p className="font-semibold text-orange-900 text-base mt-3 bg-white px-4 py-2 rounded-md inline-block">
                    {closure.altOpeningHours}
                  </p>
                )}
                {closure.type === 'MODIFIED' && closure.note && (
                  <p className="text-orange-50 mt-3 text-sm italic">{closure.note}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className={`${
                closure.type === 'CLOSED'
                  ? 'text-white hover:text-red-100'
                  : 'text-white hover:text-orange-100'
              } transition-colors flex-shrink-0 mt-1`}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
