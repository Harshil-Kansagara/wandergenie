import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth.tsx";
import Header from "./Header";
import SignIn from "./SignIn";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, signOut, isSignInOpen, setIsSignInOpen } = useAuth();

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
            <DialogTitle>Sign In</DialogTitle>
          </DialogHeader>
          <SignIn onSuccess={() => setIsSignInOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
