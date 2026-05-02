import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { setDetailsCache, Section } from "../store/searchReducer";
import { Layout } from "../components/Layout";

const API_BASE = "/api";

const sidebarVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const sectionsContainerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Details() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { link, title, image, quality } = router.query;
  const linkStr = link as string;

  const detailsCache = useSelector(
    (state: RootState) => state.search.detailsCache,
  );
  const cachedSections = linkStr ? detailsCache[linkStr] : undefined;

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!linkStr) return;
    if (cachedSections) return;

    let isMounted = true;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const resp = await axios.post(`${API_BASE}/details`, {
          link: linkStr,
        });
        if (isMounted) {
          dispatch(
            setDetailsCache({ link: linkStr, sections: resp.data.sections }),
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [linkStr, cachedSections, dispatch]);

  const sectionsToRender = cachedSections || [];

  const handleSelectSectionLink = (sectionLink: string) => {
    router.push({
      pathname: "/episodes",
      query: { link: sectionLink },
    });
  };

  return (
    <Layout>
      <motion.div
        key="details"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-7xl mx-auto px-4 py-8 w-full"
      >
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-emerald-200/50 hover:text-white mb-8 transition-[color] px-4 py-2 rounded-full hover:bg-emerald-500/10 w-fit"
        >
          <Icon
            icon="mdi:arrow-left"
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Search Results
        </button>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Movie Info Sidebar */}
          {title && (
            <div className="w-full lg:w-[300px] shrink-0">
              <motion.div
                variants={sidebarVariants}
                initial="hidden"
                animate="show"
                className="bg-[#050a07] border border-emerald-900/30 rounded-3xl overflow-hidden shadow-2xl sticky top-24"
              >
                <div className="aspect-[2/3] relative">
                  {image ? (
                    <img
                      src={image as string}
                      alt={title as string}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#08110b] flex flex-col items-center justify-center text-emerald-900/50">
                      <Icon icon="mdi:movie" className="text-6xl mb-2" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050a07] via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3">
                    <Icon icon="mdi:tag" />
                    {quality}
                  </div>
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    {title}
                  </h2>
                </div>
              </motion.div>
            </div>
          )}

          {/* Links Sections */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 bg-[#050a07] border border-emerald-900/20 rounded-3xl">
                <Icon
                  icon="mdi:magnify-expand"
                  className="text-6xl text-emerald-500 animate-pulse mb-6"
                />
                <p className="text-xl text-emerald-400 font-medium tracking-wide">
                  Extracting sections...
                </p>
                <p className="text-sm text-emerald-900 mt-2">
                  Navigating the maze
                </p>
              </div>
            ) : sectionsToRender.length > 0 ? (
              <motion.div
                variants={sectionsContainerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {sectionsToRender.map((section, idx) => (
                  <motion.div
                    key={idx}
                    variants={sectionVariants}
                    className="bg-black/40 backdrop-blur-xl rounded-2xl border border-emerald-900/30 overflow-hidden shadow-xl"
                  >
                    <div className="bg-emerald-900/10 px-6 py-5 border-b border-emerald-900/20 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white flex items-center gap-3">
                        <Icon
                          icon="mdi:folder-play-outline"
                          className="text-green-400 text-2xl"
                        />
                        {section.header}
                      </h3>
                    </div>
                    <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.links.map((link, lIdx) => (
                        <button
                          key={lIdx}
                          onClick={() => handleSelectSectionLink(link.url)}
                          className="flex items-center gap-4 bg-emerald-900/10 hover:bg-emerald-600/20 hover:border-emerald-500/50 border border-emerald-900/20 text-emerald-100 hover:text-white p-4 rounded-xl transition-[background-color,border-color,color] group"
                        >
                          <div className="bg-black/50 p-2 rounded-lg group-hover:bg-emerald-500 transition-[background-color] shrink-0">
                            <Icon
                              icon="mdi:download"
                              className="text-xl text-emerald-400 group-hover:text-black transition-[color]"
                            />
                          </div>
                          <span className="text-sm font-semibold truncate text-left">
                            {link.text}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 bg-[#050a07] border border-emerald-900/20 rounded-3xl">
                <Icon
                  icon="mdi:folder-open-outline"
                  className="text-6xl text-emerald-900/50 mb-4"
                />
                <p className="text-xl text-emerald-400 font-medium">
                  No direct sections found.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Layout>
  );
}
