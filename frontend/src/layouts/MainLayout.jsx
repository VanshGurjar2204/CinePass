import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 relative overflow-x-hidden transition-colors duration-300">
      {/* Cinematic Ambient Glow Accents */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10 transition-opacity" />
      <div className="fixed top-20 right-1/4 w-[500px] h-[400px] bg-violet-500/5 dark:bg-violet-600/10 rounded-full blur-[150px] pointer-events-none -z-10 transition-opacity" />
      <div className="fixed bottom-0 left-1/3 w-[700px] h-[400px] bg-rose-500/5 dark:bg-rose-600/5 rounded-full blur-[160px] pointer-events-none -z-10 transition-opacity" />

      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

