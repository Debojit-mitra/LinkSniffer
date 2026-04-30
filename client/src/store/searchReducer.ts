import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MovieResult {
  title: string;
  link: string;
  image: string;
  quality: string;
}

export interface Section {
  header: string;
  links: { text: string; url: string }[];
}

export interface Episode {
  text: string;
  url: string;
}

interface SearchState {
  query: string;
  sourceType: string;
  results: MovieResult[];
  lastSearchedQuery: string;
  lastSearchedSource: string;
  detailsCache: Record<string, Section[]>;
  episodesCache: Record<string, Episode[]>;
}

const initialState: SearchState = {
  query: "",
  sourceType: "hollywood",
  results: [],
  lastSearchedQuery: "",
  lastSearchedSource: "",
  detailsCache: {},
  episodesCache: {},
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setSourceType: (state, action: PayloadAction<string>) => {
      state.sourceType = action.payload;
    },
    setResults: (state, action: PayloadAction<{ query: string, source: string, results: MovieResult[] }>) => {
      state.results = action.payload.results;
      state.lastSearchedQuery = action.payload.query;
      state.lastSearchedSource = action.payload.source;
    },
    setDetailsCache: (state, action: PayloadAction<{ link: string, sections: Section[] }>) => {
      state.detailsCache[action.payload.link] = action.payload.sections;
    },
    setEpisodesCache: (state, action: PayloadAction<{ link: string, episodes: Episode[] }>) => {
      state.episodesCache[action.payload.link] = action.payload.episodes;
    },
  },
});

export const { setQuery, setSourceType, setResults, setDetailsCache, setEpisodesCache } = searchSlice.actions;

export default searchSlice.reducer;
