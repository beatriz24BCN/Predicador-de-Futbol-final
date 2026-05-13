import { useState } from "react";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import AuthModal from "../components/AuthModal";
import { Outlet } from "react-router-dom";

export const Layout = () => {
  const [open, setOpen] = useState(false);

  return (
    <ScrollToTop>
      <div style={{ background: "#26753c", minHeight: "100vh" }}>
        
        <Navbar openModal={() => setOpen(true)} />

       <AuthModal isOpen={open} onClose={() => setOpen(false)} />

        <Outlet />

        <Footer />
      </div>
    </ScrollToTop>
  );
};