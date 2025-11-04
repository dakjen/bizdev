import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";

function App() {
  return (
    <>
      <SignedIn>
        <Pages />
        <Toaster />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center">
          <SignIn />
        </div>
      </SignedOut>
    </>
  )
}

export default App