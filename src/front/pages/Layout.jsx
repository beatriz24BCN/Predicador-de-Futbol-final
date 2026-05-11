import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Outlet } from "react-router-dom";
import { Footer } from "../components/Footer";

export const Layout = () => {
    return (
        <ScrollToTop>
            <div style={{ background: "#26753c", minHeight: "100vh" }}>
                <Navbar />
                <Outlet />
                <Footer />
            </div>
        </ScrollToTop>
    );
};