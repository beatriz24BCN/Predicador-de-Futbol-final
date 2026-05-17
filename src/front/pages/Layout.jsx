import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Body } from "../components/Body"
import { Home } from "./Home"
import { TablaPosiciones } from "../components/TablaPosiciones"

export const Layout = () => {
    return (
        <ScrollToTop>
            <Navbar />
            <Home />
            <TablaPosiciones ligaId="140" nombreLiga="La Liga" />
        </ScrollToTop>
    )
}