import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Compass, LogOut } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import LanguageSelector from "@/components/language-selector";
import CurrencySelector from "@/components/currency-selector";
import type { User } from "firebase/auth";

interface HeaderProps {
  user: User | null;
  onSignOut: () => void;
  onSignIn: () => void;
}

export default function Header({ user, onSignOut, onSignIn }: Readonly<HeaderProps>) {
  const { t } = useTranslation();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 elevation-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 smooth-transition">
              <Compass className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">
                WanderGenie
              </span>
            </Link>
            <nav className="hidden md:flex space-x-8 ml-8">
              <a href="/" className="text-muted-foreground hover:text-foreground smooth-transition">
                {t('destinations')}
              </a>
              {user && (
                <a href="/dashboard" className="text-muted-foreground hover:text-foreground smooth-transition">
                  {t('experiences')}
                </a>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <CurrencySelector />
            {user ? (
              <div className="flex items-center space-x-2">
                <span>{user.email}</span>
                <Button onClick={onSignOut} variant="ghost" size="icon">
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button onClick={onSignIn} data-testid="button-signin" className="bg-primary text-primary-foreground hover:opacity-90 smooth-transition ripple-effect">
                {t('sign_in')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
