
import { useState } from "react";
import {
  LayoutDashboard,
  Image,
  Layers,
  Repeat2,
  Scaling,
  History,
  BarChart3,
  Settings,
  UploadCloud,
  HardDrive,
  TrendingDown,
  Menu,
  X,
  ArrowRight,
  Zap,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  ImagePlus,
  Bell,
  CircleHelp,
} from "lucide-react";

import Compressor from "./components/Compressor";
import BatchCompressor from "./components/BatchCompressor";
import FormatConverter from "./components/FormatConverter";
import ResizeCrop from "./components/ResizeCrop";
import HistoryPage from "./components/History";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Compressor", icon: Image },
  { name: "Batch Compressor", icon: Layers },
  { name: "Format Converter", icon: Repeat2 },
  { name: "Resize & Crop", icon: Scaling },
  { name: "History", icon: History },
  { name: "Analytics", icon: BarChart3 },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    {
      title: "Images Optimized",
      value: "0",
      description: "Start your first optimization",
      icon: Image,
      color: "text-violet-600",
      bg: "bg-violet-100",
    },
    {
      title: "Storage Saved",
      value: "0 MB",
      description: "Space saved so far",
      icon: HardDrive,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Average Savings",
      value: "0%",
      description: "Compression efficiency",
      icon: TrendingDown,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Jobs",
      value: "0",
      description: "Processing sessions",
      icon: Zap,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  const tools = [
    {
      name: "Image Compressor",
      description:
        "Reduce image sizes without compromising visual quality.",
      icon: Image,
      color: "bg-violet-100 text-violet-700",
      tag: "POPULAR",
      page: "Compressor",
    },
    {
      name: "Batch Processing",
      description: "Optimize multiple images together in one go.",
      icon: Layers,
      color: "bg-blue-100 text-blue-700",
      tag: "TIME SAVER",
      page: "Batch Compressor",
    },
    {
      name: "Format Converter",
      description: "Convert between JPEG, PNG, WebP and AVIF.",
      icon: Repeat2,
      color: "bg-emerald-100 text-emerald-700",
      tag: "4 FORMATS",
      page: "Format Converter",
    },
    {
      name: "Resize & Crop",
      description: "Adjust image dimensions and crop images precisely.",
      icon: Scaling,
      color: "bg-orange-100 text-orange-700",
      tag: "EDITOR",
      page: "Resize & Crop",
    },
  ];

  function navigate(page) {
    setActivePage(page);
    setSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 flex w-[265px]
            flex-col border-r border-white/10 bg-[#111326] text-white
            transition-transform duration-300
            lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* LOGO */}
          <div className="flex h-[86px] shrink-0 items-center justify-between border-b border-white/10 px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg">
                <Image size={23} />
              </div>

              <div>
                <h1 className="text-xl font-bold">ImageFlow</h1>
                <p className="text-[10px] font-medium uppercase tracking-[2px] text-slate-400">
                  Image optimization
                </p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="text-slate-400 hover:text-white lg:hidden"
            >
              <X size={22} />
            </button>
          </div>

          {/* NAVIGATION */}
          <div className="flex-1 overflow-y-auto px-4 py-7">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">
              Workspace
            </p>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const selected = activePage === item.name;

                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.name)}
                    className={`
                      flex w-full items-center gap-3 rounded-xl px-4 py-3.5
                      text-left text-[13px] font-medium transition-all
                      ${
                        selected
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg"
                          : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                      }
                    `}
                  >
                    <Icon size={18} />
                    {item.name}

                    {selected && (
                      <ChevronRight
                        size={16}
                        className="ml-auto"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <p className="mb-4 mt-10 px-3 text-[10px] font-bold uppercase tracking-[2px] text-slate-500">
              Preferences
            </p>

            <button
              onClick={() => navigate("Settings")}
              className={`
                flex w-full items-center gap-3 rounded-xl px-4 py-3.5
                text-[13px] font-medium transition
                ${
                  activePage === "Settings"
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                }
              `}
            >
              <Settings size={18} />
              Settings
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1 overflow-x-hidden">
          {/* TOP HEADER */}
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl md:px-9">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                <Menu size={22} />
              </button>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Workspace / {activePage}
                </p>

                <h2 className="mt-1 text-sm font-bold text-slate-800">
                  {activePage}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold text-emerald-700">
                  Workspace active
                </span>
              </div>

              <button className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
                <CircleHelp size={19} />
              </button>

              <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
                <Bell size={19} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-500" />
              </button>

              <div className="ml-1 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">
                U
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <div className="mx-auto w-full max-w-[1550px] p-5 md:p-9">
            {/* DASHBOARD */}
            {activePage === "Dashboard" && (
              <>
                {/* HERO */}
                <section className="relative mb-9 overflow-hidden rounded-[26px] bg-gradient-to-br from-[#25204d] via-[#393078] to-[#5543b7] p-7 text-white shadow-xl shadow-violet-200/50 md:p-10">
                  <div className="absolute -right-20 -top-32 h-96 w-96 rounded-full border border-white/10" />
                  <div className="absolute -right-5 -top-20 h-72 w-72 rounded-full border border-white/10" />

                  <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
                    <div className="max-w-2xl">
                      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold">
                        <Sparkles size={14} />
                        SMART IMAGE OPTIMIZATION
                      </div>

                      <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-[43px]">
                        Make your images
                        <br />
                        <span className="bg-gradient-to-r from-violet-200 to-pink-200 bg-clip-text text-transparent">
                          lighter. Better. Faster.
                        </span>
                      </h1>

                      <p className="mt-5 max-w-lg text-sm leading-7 text-violet-100/80 md:text-base">
                        Compress, convert and optimize your images with
                        powerful tools designed to save storage without
                        sacrificing quality.
                      </p>

                      <button
                        onClick={() => navigate("Compressor")}
                        className="mt-7 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-violet-800 shadow-lg transition hover:-translate-y-1"
                      >
                        <UploadCloud size={18} />
                        Start Optimizing
                        <ArrowRight size={17} />
                      </button>
                    </div>

                    <div className="relative hidden h-52 w-64 items-center justify-center lg:flex">
                      <div className="absolute h-48 w-48 rounded-full border border-white/15" />
                      <div className="absolute h-36 w-36 rounded-full border border-white/20" />

                      <div className="relative flex h-32 w-32 items-center justify-center rounded-[32px] border border-white/30 bg-white/10 backdrop-blur-xl">
                        <ImagePlus size={62} strokeWidth={1.2} />
                      </div>

                      <div className="absolute right-0 top-3 rounded-xl border border-white/20 bg-white/15 p-3">
                        <Sparkles size={22} />
                      </div>
                    </div>
                  </div>
                </section>

                {/* STATISTICS */}
                <section className="mb-10">
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-slate-900">
                      Your overview
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      A quick look at your optimization activity.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => {
                      const Icon = stat.icon;

                      return (
                        <div
                          key={stat.title}
                          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-medium text-slate-500">
                                {stat.title}
                              </p>
                              <h3 className="mt-3 text-3xl font-bold text-slate-900">
                                {stat.value}
                              </h3>
                            </div>

                            <div
                              className={`rounded-xl p-3 ${stat.bg} ${stat.color}`}
                            >
                              <Icon size={21} />
                            </div>
                          </div>

                          <p className="mt-4 text-[11px] text-slate-400">
                            {stat.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* QUICK COMPRESSION */}
                <section className="mb-10">
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-slate-900">
                      Quick compression
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Get started with your next image.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
                    <button
                      onClick={() => navigate("Compressor")}
                      className="group flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 px-5 py-12 text-center transition hover:border-violet-400 hover:bg-violet-50"
                    >
                      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg transition group-hover:scale-110">
                        <UploadCloud size={31} />
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">
                        Drop your images here
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Start compressing and optimizing your images.
                      </p>

                      <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white">
                        Open Image Compressor
                        <ArrowRight size={17} />
                      </span>

                      <p className="mt-5 text-[11px] text-slate-400">
                        JPEG · PNG · WebP · AVIF
                      </p>
                    </button>
                  </div>
                </section>

                {/* TOOLS */}
                <section className="mb-10">
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-slate-900">
                      Explore your tools
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Everything you need to optimize your images.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {tools.map((tool) => {
                      const Icon = tool.icon;

                      return (
                        <button
                          key={tool.name}
                          onClick={() => navigate(tool.page)}
                          className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl"
                        >
                          <div className="mb-5 flex items-center justify-between">
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-xl ${tool.color}`}
                            >
                              <Icon size={23} />
                            </div>

                            <span className="rounded-md bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-400">
                              {tool.tag}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-slate-900">
                            {tool.name}
                          </h3>

                          <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">
                            {tool.description}
                          </p>

                          <div className="mt-5 flex items-center justify-between text-xs font-semibold text-violet-600">
                            Open tool
                            <ArrowRight
                              size={16}
                              className="transition group-hover:translate-x-1"
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* FOOTER */}
                <footer className="border-t border-slate-200 py-7 text-center text-sm font-medium text-slate-500">
                  Made by <span className="font-bold text-violet-600">Somraj Deb</span>
                </footer>
              </>
            )}

            {/* SINGLE IMAGE COMPRESSOR */}
            {activePage === "Compressor" && <Compressor />}

            {/* BATCH COMPRESSOR */}
            {activePage === "Batch Compressor" && (
              <BatchCompressor />
            )}

            {/* FORMAT CONVERTER */}
            {activePage === "Format Converter" && (
              <FormatConverter />
            )}

            {/* RESIZE AND CROP */}
            {activePage === "Resize & Crop" && <ResizeCrop />}

            {/* HISTORY */}
            {activePage === "History" && <HistoryPage />}

            {/* OTHER MODULES */}
            {![
              "Dashboard",
              "Compressor",
              "Batch Compressor",
              "Format Converter",
              "Resize & Crop",
              "History",
            ].includes(activePage) && (
              <section className="flex min-h-[65vh] flex-col items-center justify-center rounded-[26px] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-600">
                  <Sparkles size={35} />
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  {activePage}
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                  This module will be implemented in the upcoming
                  development stages.
                </p>

                <button
                  onClick={() => navigate("Dashboard")}
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  Back to Dashboard
                  <ArrowRight size={16} />
                </button>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
