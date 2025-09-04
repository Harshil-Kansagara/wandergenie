import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useToast } from "../hooks/use-toast";

interface SignInProps {
  onSuccess: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        toast({ title: "Signed in successfully" });
        console.log("User signed in successfully", user);
        onSuccess();
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
        const user = userCredential.user;
        toast({ title: "Signed up successfully" });
        console.log("User signed up successfully", user);
        setEmail("");
        setPassword("");
        setIsSignUp(false);
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
        <Label htmlFor="email">Email</Label>
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
          <Label htmlFor="password">Password</Label>
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
          Sign Up
        </Button>
      ) : (
        <Button onClick={handleSignIn} type="submit" className="w-full">
          Sign In
        </Button>
      )}
      <div className="mt-4 text-center text-sm">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button onClick={() => setIsSignUp(!isSignUp)} className="underline">
          {isSignUp ? "Sign in" : "Sign up"}
        </button>
      </div>
    </div>
  );
};

export default SignIn;
