import { Toaster } from '@/ui/sonner'
import { ReactNode } from 'react'
import { ModeToggle } from './mode-toggle'
import { Link } from 'react-router-dom'

function Layout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <>
      <main className="flex h-screen max-h-screen min-w-96 flex-col bg-background">
        <div className="flex h-7 px-2 flex-row border-b border-border bg-background text-sm font-light items-center justify-between">
          <div className="flex flex-row">
            <Link
              to={'/'}
              className="text-foreground flex items-center gap-1 rounded-sm border-border px-2 py-1 text-left hover:bg-accent"
            >
              Home
            </Link>
            <Link
              to={'/manage-menu'}
              className="text-foreground flex items-center gap-1 rounded-sm border-border px-2 py-1 text-left hover:bg-accent"
            >
              Manage menu
            </Link>
            <Link
              to={'/reports'}
              className="text-foreground rounded-sm border-border px-2 py-1 text-center hover:bg-accent"
            >
              Reports
            </Link>
            <Link
              to={'/expenses'}
              className="text-foreground rounded-sm border-border px-2 py-1 text-center hover:bg-accent"
            >
              Expenses
            </Link>
          </div>
          <ModeToggle />
        </div>
        {children}
      </main>
      <Toaster />
    </>
  )
}

export default Layout
