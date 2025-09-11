import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth.tsx";
import Header from "./Header";
import SignIn from "./SignIn";
import { useTranslation } from "@/hooks/use-translation";


interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut, isSignInOpen, setIsSignInOpen } = useAuth();
  const { t, language } = useTranslation();


  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={user} 
        onSignOut={signOut} 
        onSignIn={() => setIsSignInOpen(true)} 
      />
      <main>{children}</main>
      <Dialog open={isSignInOpen} onOpenChange={setIsSignInOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sign_in')}</DialogTitle>
          </DialogHeader>
          <SignIn onSuccess={() => setIsSignInOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
