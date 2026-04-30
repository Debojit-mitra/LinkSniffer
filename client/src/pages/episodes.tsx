import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { setEpisodesCache, Episode } from "../store/searchReducer";
import { Layout } from "../components/Layout";
import { API_BASE } from "../constants";

const listContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function Episodes() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { link } = router.query;
  const linkStr = link as string;

  const episodesCache = useSelector(
    (state: RootState) => state.search.episodesCache,
  );
  const cachedEpisodes = linkStr ? episodesCache[linkStr] : undefined;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!linkStr) return;
    if (cachedEpisodes) return;

    let isMounted = true;
    const fetchEpisodes = async () => {
      setLoading(true);
      try {
        const resp = await axios.post(`${API_BASE}/episodes`, {
          link: linkStr,
        });
        if (isMounted) {
          dispatch(
            setEpisodesCache({ link: linkStr, episodes: resp.data.episodes }),
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchEpisodes();

    return () => {
      isMounted = false;
    };
  }, [linkStr, cachedEpisodes, dispatch]);

  const episodesToRender = cachedEpisodes || [];

  return (
    <Layout>
      <motion.div
        key="episodes"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto px-4 py-8 w-full"
      >
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-emerald-200/50 hover:text-white mb-8 transition-[color] px-4 py-2 rounded-full hover:bg-emerald-500/10 w-fit"
        >
          <Icon
            icon="mdi:arrow-left"
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Sections
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-[#050a07] border border-emerald-900/20 rounded-3xl">
            <Icon
              icon="mdi:magnify-expand"
              className="text-6xl text-emerald-500 animate-pulse mb-6"
            />
            <p className="text-xl text-emerald-400 font-medium tracking-wide">
              Resolving final links...
            </p>
            <p className="text-sm text-emerald-900 mt-2">Bypassing ads</p>
          </div>
        ) : episodesToRender.length > 0 ? (
          <>
            <div className="bg-gradient-to-br from-green-500 to-teal-700 rounded-[2.5rem] p-8 sm:p-10 md:p-14 mb-10 relative overflow-hidden shadow-2xl shadow-emerald-900/50">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
              <Icon
                icon="mdi:rocket-launch"
                className="absolute -right-10 -bottom-10 text-[200px] sm:text-[250px] text-black/10 -rotate-12"
              />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-sm text-white font-bold mb-6">
                  <Icon
                    icon="mdi:check-decagram"
                    className="text-xl text-green-300"
                  />
                  Extraction Complete
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-black mb-4">
                  Links Ready!
                </h2>
                <p className="text-lg sm:text-xl text-teal-900 font-medium">
                  Successfully sniffed{" "}
                  <span className="text-black font-bold">
                    {episodesToRender.length}
                  </span>{" "}
                  direct links.
                </p>
              </div>
            </div>

            <motion.div
              variants={listContainerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4"
            >
              {episodesToRender.map((episode, idx) => (
                <motion.a
                  key={idx}
                  variants={listItemVariants}
                  href={episode.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#08110b] hover:bg-[#0a140d] border border-emerald-900/20 hover:border-emerald-500/50 p-5 md:p-6 rounded-2xl transition-[background-color,border-color] group shadow-lg"
                >
                  <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto overflow-hidden">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-lg sm:text-xl font-black text-green-400 group-hover:text-green-300 group-hover:bg-emerald-500/20 transition-[color,background-color]">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base sm:text-lg font-bold text-gray-200 group-hover:text-white transition-[color] mb-1 truncate">
                        {episode.text}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-emerald-400/60 font-medium uppercase tracking-wider">
                        <Icon icon="mdi:server-network" className="shrink-0" />
                        <span className="truncate">
                          {episode.url.split("/")[2]}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 w-full sm:w-auto">
                    <div className="w-full sm:w-auto justify-center bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-300 hover:to-teal-400 text-black rounded-xl px-6 py-3 text-sm font-bold transition-[background] shadow-lg flex items-center gap-2">
                      Download
                      <Icon icon="mdi:download" className="text-lg" />
                    </div>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-[#050a07] border border-emerald-900/20 rounded-3xl">
            <Icon
              icon="mdi:link-variant-off"
              className="text-6xl text-emerald-900/50 mb-4"
            />
            <p className="text-xl text-emerald-400 font-medium">
              No final links could be extracted.
            </p>
          </div>
        )}
      </motion.div>
    </Layout>
  );
}
