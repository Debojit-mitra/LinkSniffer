import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import {
  setResults,
  setQuery,
  setSourceType,
  MovieResult,
} from "../store/searchReducer";
import { Layout } from "../components/Layout";
import { API_BASE } from "../constants";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Search() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cachedResults = useSelector((state: RootState) => state.search.results);
  const lastSearchedQuery = useSelector(
    (state: RootState) => state.search.lastSearchedQuery,
  );
  const lastSearchedSource = useSelector(
    (state: RootState) => state.search.lastSearchedSource,
  );

  const [loading, setLoading] = useState(false);

  const query = router.query.q as string;
  const source = router.query.source as string;

  useEffect(() => {
    if (!query || !source) return;

    dispatch(setQuery(query));
    dispatch(setSourceType(source));

    if (
      query === lastSearchedQuery &&
      source === lastSearchedSource &&
      cachedResults.length > 0
    ) {
      return;
    }

    let isMounted = true;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const resp = await axios.post(`${API_BASE}/search`, {
          query,
          source,
        });
        if (isMounted) {
          dispatch(setResults({ query, source, results: resp.data.results }));
        }
      } catch (err) {
        console.error(err);
        alert("Search failed. Is the Python server running?");
        if (isMounted) dispatch(setResults({ query, source, results: [] }));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [
    query,
    source,
    lastSearchedQuery,
    lastSearchedSource,
    cachedResults.length,
    dispatch,
  ]);

  const handleSelectMovie = (movie: MovieResult) => {
    router.push({
      pathname: "/details",
      query: {
        link: movie.link,
        title: movie.title,
        image: movie.image,
        quality: movie.quality,
      },
    });
  };

  return (
    <Layout>
      <motion.div
        key="search"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-7xl mx-auto px-4 py-8 w-full"
      >
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-3xl font-black text-white tracking-tight">
            Search Results
          </h2>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Icon
              icon="mdi:loading"
              className="text-5xl text-emerald-500 animate-spin mb-4"
            />
            <p className="text-emerald-400 font-medium">Sniffing the web...</p>
          </div>
        ) : cachedResults.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
          >
            {cachedResults.map((r, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                onClick={() => handleSelectMovie(r)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer bg-[#050a07] border border-emerald-900/30 hover:border-emerald-500/50 transition-[border-color,box-shadow] duration-300 hover:shadow-2xl hover:shadow-emerald-500/20"
              >
                <div className="aspect-[2/3] relative overflow-hidden bg-[#08110b]">
                  {r.image ? (
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-emerald-900/50">
                      <Icon icon="mdi:movie" className="text-4xl mb-2" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        No Poster
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030705] via-[#030705]/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Quality Badge */}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md">
                    <div className="text-[10px] font-bold text-emerald-400">
                      {r.quality}
                    </div>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                      <Icon
                        icon="solar:play-bold"
                        className="text-2xl flex items-center justify-center"
                      />
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <h3 className="font-bold text-white line-clamp-2 leading-tight">
                    {r.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 text-emerald-200/50">
            <Icon
              icon="mdi:ghost"
              className="text-6xl mx-auto mb-4 opacity-50"
            />
            <p className="text-xl font-medium">
              No results found for "{query}"
            </p>
          </div>
        )}
      </motion.div>
    </Layout>
  );
}
