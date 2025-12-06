'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Çıkış yapıldı');
      router.push('/login');
    } catch (error) {
      toast.error('Çıkış yapılırken hata oluştu');
    }
  };

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-10 border-b border-warm-200 bg-white/80 backdrop-blur-sm" role="banner">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
              aria-label="Menüyü aç/kapat"
              aria-expanded="false"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-heading font-bold text-terracotta-600">
              Günlüğüm
            </h1>
            <p className="text-sm text-warm-600">
              Kişisel düşünceleriniz için güvenli alan
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-10 w-10 rounded-full"
              aria-label="Kullanıcı menüsü"
            >
              <Avatar>
                <AvatarFallback className="bg-terracotta-100 text-terracotta-700">
                  {getInitials(user?.email)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" role="menu">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-brown-800">{user?.email}</p>
              </div>
            </div>
            <DropdownMenuItem onClick={handleSignOut} role="menuitem">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Çıkış Yap</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
