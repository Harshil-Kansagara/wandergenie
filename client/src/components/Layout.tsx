import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth.tsx";
import Header from "./Header";
import SignIn from "./SignIn";
import { useTranslation } from "@/hooks/use-translation";


interface LayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function Layout({ children, actions }: Readonly<LayoutProps>) {
  const { user, signOut, isSignInOpen, setIsSignInOpen } = useAuth();
  const { t } = useTranslation();


  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header
        user={user}
        onSignOut={signOut}
        onSignIn={() => setIsSignInOpen(true)}
        actions={actions}
      />
      <main className="flex-grow overflow-y-auto">{children}</main>
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
