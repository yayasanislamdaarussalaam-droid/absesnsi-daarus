'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createEmployee } from "@/lib/actions/admin-employees"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface NewEmployeeFormProps {
  officeId: string
}

export function NewEmployeeForm({ officeId }: NewEmployeeFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await createEmployee(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Karyawan berhasil ditambahkan")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="office_id" value={officeId} />
      <div>
        <Label htmlFor="full_name">Nama Lengkap</Label>
        <Input id="full_name" name="full_name" required disabled={isLoading} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required disabled={isLoading} />
      </div>
      <div>
        <Label htmlFor="phone">Telepon</Label>
        <Input id="phone" name="phone" disabled={isLoading} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required minLength={6} disabled={isLoading} />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select name="role" defaultValue="employee" disabled={isLoading}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employee">Karyawan</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan"
          )}
        </Button>
        <Button variant="outline" asChild disabled={isLoading}>
          <Link href="/admin/employees">Batal</Link>
        </Button>
      </div>
    </form>
  )
}
