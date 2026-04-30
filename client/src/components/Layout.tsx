import Head from "next/head";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { setQuery, setSourceType } from "../store/searchReducer";
import { SourceSelect } from "./SourceSelect";

export function Layout({
  children,
  hideNavAndFooter = false,
}: {
  children: React.ReactNode;
  hideNavAndFooter?: boolean;
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const query = useSelector((state: RootState) => state.search.query);
  const sourceType = useSelector((state: RootState) => state.search.sourceType);

  useEffect(() => {
    if (router.query.q && router.query.q !== query)
      dispatch(setQuery(router.query.q as string));
    if (router.query.source && router.query.source !== sourceType)
      dispatch(setSourceType(router.query.source as string));
  }, [router.query.q, router.query.source]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push({
      pathname: "/search",
      query: { q: query, source: sourceType },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#030705] text-gray-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden relative">
      <Head>
        <title>LinkSniffer - Movies & Series Scraper</title>
        <link
          rel="icon"
          type="image/svg+xml"
          href="https://api.iconify.design/mdi:magnify-expand.svg?color=%2310b981"
        />
      </Head>

      {/* Fresh Green Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-700/10 blur-[120px]" />
      </div>

      {!hideNavAndFooter && (
        <nav className="relative z-50 border-b border-emerald-900/30 bg-[#030705]/80 backdrop-blur-xl sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
              <Link href="/">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                    <Icon
                      icon="mdi:magnify-expand"
                      className="text-2xl text-black"
                    />
                  </div>
                  <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-100 to-teal-200">
                    LinkSniffer
                  </span>
                </div>
              </Link>

              <form
                onSubmit={handleSearch}
                className="flex-1 max-w-xl mx-auto sm:mx-0 w-full relative"
              >
                <input
                  type="text"
                  placeholder="Search movies & series..."
                  className="w-full bg-[#050a07] border border-emerald-900/40 focus:border-emerald-500/50 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white placeholder-emerald-900/50 focus:outline-none transition-colors shadow-inner"
                  value={query}
                  onChange={(e) => dispatch(setQuery(e.target.value))}
                />
                <Icon
                  icon="mdi:magnify"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-emerald-900/60"
                />
              </form>

              <div className="flex items-center gap-4">
                <div className="hidden sm:block">
                  <SourceSelect
                    value={sourceType}
                    onChange={(val) => dispatch(setSourceType(val))}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Source Select */}
            <div className="sm:hidden pb-4">
              <SourceSelect
                value={sourceType}
                onChange={(val) => dispatch(setSourceType(val))}
              />
            </div>
          </div>
        </nav>
      )}

      <main className="flex-1 w-full relative z-10 flex flex-col">
        {children}
      </main>

      {!hideNavAndFooter && (
        <footer className="py-12 border-t border-emerald-900/30 mt-20 relative z-10 bg-[#030705]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <Icon
                icon="mdi:magnify-expand"
                className="text-2xl text-emerald-500"
              />
              <span className="text-xl font-black tracking-tighter">
                LinkSniffer
              </span>
            </div>
            <p className="text-emerald-200/40 text-sm font-medium">
              Developed for personal entertainment. Respect copyright laws.
            </p>
            <div className="flex gap-4 justify-center md:justify-end">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-500/20 transition-colors"
              >
                <Icon icon="mdi:github" className="text-xl" />
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
