"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/NavBar";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const hideNavbarPages = ["/login"]; // Hide navbar on login page

  return (
    <>
      {!hideNavbarPages.includes(pathname) && <Navbar />}
      {children}
      {/* {!hideFooterPages.includes(pathname) && !isProductPage && <Footer />} */}
    </>
  );
};

export default LayoutWrapper;