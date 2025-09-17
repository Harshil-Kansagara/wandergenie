import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useLocation } from "wouter";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";


interface SignInProps {
  onSuccess: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const { getAndClearTemporaryTrip } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const saveTripMutation = useMutation({
    mutationFn: (trip: any) => apiRequest('POST', '/api/trips', trip),
    onSuccess: async (data) => {
      const savedTrip = await data.json();
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      toast({
        title: "Trip Saved!",
        description: `Your trip to ${savedTrip.destination} has been saved.`,
      });
      setLocation("/trips");
    },
    onError: () => {
      toast({ title: "Error", description: "Could not save your trip after login. Please save it again.", variant: "destructive" });
      setLocation("/dashboard");
    }
  });

  const handleAuthSuccess = () => {
    const tempTrip = getAndClearTemporaryTrip();
    const currentUser = auth.currentUser;
    console.log(currentUser);
    if (tempTrip && currentUser) {
      // Overwrite the anonymous userId with the real one before saving.
      const tripToSave = { ...tempTrip, userId: currentUser.uid };
      saveTripMutation.mutate(tripToSave);
    } else {
      setLocation("/dashboard");
    }
    onSuccess();
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        toast({ title: "Signed in successfully" });
        handleAuthSuccess();
      })
      .catch((error) => {
        const errorMessage = error.message;
        toast({ title: "Error signing in", description: errorMessage, variant: "destructive" });
        console.error("Error signing in", error.code, errorMessage);
      });
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up
        toast({ title: "Signed up successfully" });
        setEmail("");
        setPassword("");
        setIsSignUp(false);
        handleAuthSuccess();
      })
      .catch((error) => {
        const errorMessage = error.message;
        toast({ title: "Error signing up", description: errorMessage, variant: "destructive" });
        console.error("Error signing up", error.code, errorMessage);
      });
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">{t('email')} </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="m@example.com"
          required
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">{t('password')} </Label>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {isSignUp ? (
        <Button onClick={handleSignUp} type="submit" className="w-full">
          {t('sign_up')} 
        </Button>
      ) : (
        <Button onClick={handleSignIn} type="submit" className="w-full">
         {t('sign_in')} 
        </Button>
      )}
      <div className="mt-4 text-center text-sm">
        {isSignUp ?  t('already_account') :  t('no_account')}{" "}
        <button onClick={() => setIsSignUp(!isSignUp)} className="underline">
          {isSignUp ? t('sign_in') : t('sign_up')}
        </button>
      </div>
    </div>
  );
};

export default SignIn;
