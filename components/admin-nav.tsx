"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: string
}

interface AdminNavProps {
  adminUser: AdminUser
}

export function AdminNav({ adminUser }: AdminNavProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-xl font-bold text-blue-600">
              {"ระบบจัดการทัวร์"}
            </Link>

            <div className="hidden md:flex space-x-6">
              <Link href="/admin" className="text-sm font-medium hover:text-blue-600">
                {"แดชบอร์ด"}
              </Link>
              <Link href="/admin/tours" className="text-sm font-medium hover:text-blue-600">
                {"จัดการทัวร์"}
              </Link>
              <Link href="/admin/bookings" className="text-sm font-medium hover:text-blue-600">
                {"จัดการการจอง"}
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/" target="_blank">
              <Button variant="outline" size="sm">
                {"ดูเว็บไซต์"}
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {adminUser.full_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline">{adminUser.full_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut}>{"ออกจากระบบ"}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
