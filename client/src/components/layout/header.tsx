
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useMobileSidebar } from "@/hooks/use-mobile-sidebar";
import { Menu, User, LogOut } from "lucide-react";
import { NotificationsDropdown } from "./notifications";

export function Header() {
  const { user, logout } = useAuth();
  const { setOpen } = useMobileSidebar();

  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <header className="bg-gray-900 border-b border-gray-700 shadow-sm">
      <div className="flex items-center justify-between p-4">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden text-gray-300 hover:text-white focus:outline-none"
          onClick={() => setOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </Button>
        
        {/* Page title (mobile only) */}
        <div className="lg:hidden flex items-center">
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
              <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
            </svg>
          </div>
          <h1 className="ml-2 text-lg font-semibold text-white">StarLine</h1>
        </div>
        
        {/* Spacer to push user menu to right */}
        <div className="flex-1"></div>
        
        {/* Header actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationsDropdown />
          
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 p-0 rounded-full hover:bg-gray-700">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                    {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || "AM"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.name || "Алекс Морган"}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user?.email || "admin@example.com"}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Профиль</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Выйти</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      

    </header>
  );
}
