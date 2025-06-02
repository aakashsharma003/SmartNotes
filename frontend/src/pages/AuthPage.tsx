import { SignIn, SignUp } from "@clerk/clerk-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, CheckSquare, Users, Shield, Zap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-all duration-500">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Marketing content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Organize Your Thoughts with{" "}
              <span className="text-blue-600">Smart Notes</span>
            </h1>
            <p className="text-xl text-gray-600">
              Create bullet points and checklists that sync across all your
              devices. Stay organized, stay productive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600 transition-all duration-200" />
                  <div>
                    <h3 className="font-semibold">Bullet Points</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quick, organized thoughts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Checklists</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Track your progress
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-semibold">Secure</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your notes are private
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold">Fast</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Lightning quick access
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>10,000+ users</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span>Free to use</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span>No ads</span>
          </div>
        </div>

        {/* Right side - Auth forms */}
        <div className="flex flex-col items-center space-y-6">
          <Card className="w-full max-w-md transition-all duration-300 hover:shadow-lg">
            <CardContent className="pt-2 flex justify-center">
              {isSignUp ? (
                <SignUp
                  appearance={{
                    elements: {
                      formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                      card: "shadow-none border-0",
                    },
                  }}
                  redirectUrl="/dashboard"
                />
              ) : (
                <SignIn
                  appearance={{
                    elements: {
                      formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                      card: "shadow-none border-0",
                    },
                  }}
                  redirectUrl="/dashboard"
                />
              )}
            </CardContent>
          </Card>

          {/* <div className="text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-all duration-200 hover:scale-105"
            >
              {isSignUp ? "Sign in instead" : "Sign up for free"}
            </Button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
