import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer} from "../components/Footer"
import { Outlet } from "react-router-dom";


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