import { Link, Outlet } from "react-router-dom";
import "./rootLayout.css";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MdOutlineFileDownload } from "react-icons/md";
import { FaGithub } from "react-icons/fa";

const queryClient = new QueryClient();

const RootLayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
        <div className="rootLayout">
        <header>
        <div className="links"> 
          <div className="link-item">
            <MdOutlineFileDownload className="icon" />
            <Link to="https://drive.google.com/uc?export=download&id=185meaTu4Saawy5YGM5SIh9POZcPRB-Lh" className="logo  hover:text-gray-400">My Resume</Link>
          </div>
          <div className="link-item">
            <FaGithub className="icon" />
            <a
              href="http://github.com/piersdeshmukh"
              className="logo hover:text-gray-400"
              target="_blank"
              rel="noopener noreferrer"
            >
              My Github
            </a>
          </div>
        </div>
        <div className="user">
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
          </header>
          <main>
            <Outlet />
          </main>
        </div> 
      </QueryClientProvider>
  );
};

export default RootLayout;
