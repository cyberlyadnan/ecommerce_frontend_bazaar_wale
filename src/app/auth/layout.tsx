import { Footer } from "@/components/layout/footer/Footer";
import { Header } from "@/components/layout/header/Header";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    )
}

export default AuthLayout;