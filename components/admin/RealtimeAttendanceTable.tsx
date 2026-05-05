'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatJakarta } from "@/lib/utils/date"

interface AttendanceTableProps {
  officeId: string
  initialData: any[]
  fromDate?: string
  toDate?: string
  employeeId?: string
}

export function RealtimeAttendanceTable({ officeId, initialData, fromDate, toDate, employeeId }: AttendanceTableProps) {
  const [attendance, setAttendance] = useState(initialData)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('attendance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `office_id=eq.${officeId}`,
        },
        async (payload) => {
          // Instead of trying to patch the local state which lacks profile data,
          // it's easier to just re-fetch the latest data for the current view
          // or we can just prepend the new record if we fetch its profile
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
             const { data: newRecord } = await supabase
              .from('attendance')
              .select(`
                *,
                profiles (full_name, email)
              `)
              .eq('id', payload.new.id)
              .single()

            if (newRecord) {
              setAttendance(prev => {
                const index = prev.findIndex(r => r.id === newRecord.id)
                if (index >= 0) {
                  const updated = [...prev]
                  updated[index] = newRecord
                  return updated
                }
                return [newRecord, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              })
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [officeId, supabase])

  // Update when initialData changes (e.g. filters applied)
  useEffect(() => {
    setAttendance(initialData)
  }, [initialData])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Clock In</TableHead>
            <TableHead>Clock Out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Telat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendance?.map((record: any) => (
            <TableRow key={record.id}>
              <TableCell>{new Date(record.date).toLocaleDateString('id-ID')}</TableCell>
              <TableCell>{record.profiles?.full_name}</TableCell>
              <TableCell>
                {record.clock_in_at ? formatJakarta(record.clock_in_at, 'HH:mm') : '-'}
              </TableCell>
              <TableCell>
                {record.clock_out_at ? formatJakarta(record.clock_out_at, 'HH:mm') : '-'}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs ${
                  record.status === 'on_time' ? 'bg-green-100 text-green-800' :
                  record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                  record.status === 'absent' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100'
                }`}>
                  {record.status === 'on_time' ? 'Tepat Waktu' :
                   record.status === 'late' ? 'Terlambat' :
                   record.status === 'absent' ? 'Tidak Hadir' : record.status}
                </span>
              </TableCell>
              <TableCell>{record.minutes_late > 0 ? `${record.minutes_late}m` : '-'}</TableCell>
            </TableRow>
          ))}
          {attendance?.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                Tidak ada data absensi
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
