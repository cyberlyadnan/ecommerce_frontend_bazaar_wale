import { ReactNode } from "react";

import { Header } from "@/components/layout/header/Header";
import { Footer } from "@/components/layout/footer/Footer";
import { CartSyncProvider } from "@/components/layout/CartSyncProvider";

interface CustomerLayoutProps {
  children: ReactNode;
}

const CustomerLayout = ({ children }: CustomerLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <CartSyncProvider />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;