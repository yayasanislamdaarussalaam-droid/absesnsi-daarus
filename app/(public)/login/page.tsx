import { Suspense } from "react"
import LoginPageClient from "./LoginPageClient"

interface LoginPageProps {
  searchParams: {
    office?: string
    error?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={null}>
      <LoginPageClient office={searchParams.office} errorMsg={searchParams.error} />
    </Suspense>
  )
}
