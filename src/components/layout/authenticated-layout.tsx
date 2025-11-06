import { Outlet } from '@tanstack/react-router'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <div className="min-h-screen w-full">
      {children ?? <Outlet />}
    </div>
  )
}
