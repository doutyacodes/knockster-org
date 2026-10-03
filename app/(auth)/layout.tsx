import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFDFE]">
      <Navbar user={null} variant="public" />
      <div className="flex-1 flex flex-col pt-24">{children}</div>
      <Footer variant="public" />
    </div>
  );
}
