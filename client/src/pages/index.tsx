import { useRouter } from "next/router";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { setQuery, setSourceType } from "../store/searchReducer";
import { SourceSelect } from "../components/SourceSelect";
import { Layout } from "../components/Layout";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const query = useSelector((state: RootState) => state.search.query);
  const sourceType = useSelector((state: RootState) => state.search.sourceType);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push({
      pathname: "/search",
      query: { q: query, source: sourceType },
    });
  };

  return (
    <Layout hideNavAndFooter={true}>
      <AnimatePresence mode="wait">
        <motion.div
          key="home"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex-1 flex flex-col items-center justify-center px-4 py-20"
        >
          <div className="text-center max-w-4xl mx-auto mb-12">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-2xl text-green-400 font-semibold mb-8"
            >
              <Icon icon="mdi:magnify-expand" className="text-emerald-400" />
              LinkSniffer
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-emerald-100 leading-tight"
            >
              Find Anything.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-emerald-400 to-teal-500">
                Download Instantly.
              </span>
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-emerald-200/60 font-light max-w-2xl mx-auto"
            >
              Bypass the clutter, annoying ads, and wait times. LinkSniffer
              elegantly extracts high-quality direct links for your favorite
              content.
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-3xl"
          >
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-teal-500 rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex flex-col md:flex-row items-center bg-[#050a07] border border-emerald-900/40 rounded-3xl shadow-2xl p-2 md:p-0">
                <div className="relative w-full flex-1">
                  <Icon
                    icon="mdi:magnify"
                    className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl text-emerald-900/60 group-focus-within:text-emerald-400 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="What do you want to watch?"
                    className="w-full bg-transparent py-5 md:py-6 pl-16 pr-6 md:pr-40 text-lg md:text-xl text-white placeholder-emerald-900/50 focus:outline-none"
                    value={query}
                    onChange={(e) => dispatch(setQuery(e.target.value))}
                  />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto mt-3 md:mt-0 md:absolute md:right-2 p-2 md:p-0">
                  <SourceSelect
                    value={sourceType}
                    onChange={(val) => dispatch(setSourceType(val))}
                  />
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-gradient-to-r from-green-400 to-teal-500 text-black font-bold py-3 md:py-2.5 px-6 rounded-xl hover:from-green-300 hover:to-teal-400 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
