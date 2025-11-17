import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { News, Pagination } from '../api/newsApi'

interface NewsState {
  newsList: News[]
  newsDetail: News | null
  currentNewsId: string | null
  pagination: Pagination | null
  isLoading: boolean
  isLoadingList: boolean
  error: string | null
  errorList: string | null
}

const initialState: NewsState = {
  newsList: [],
  newsDetail: null,
  currentNewsId: null,
  pagination: null,
  isLoading: false,
  isLoadingList: false,
  error: null,
  errorList: null,
}

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNewsList: (state, action: PayloadAction<News[]>) => {
      state.newsList = action.payload
      state.isLoadingList = false
      state.errorList = null
    },
    setPagination: (state, action: PayloadAction<Pagination | null>) => {
      state.pagination = action.payload
    },
    setLoadingList: (state, action: PayloadAction<boolean>) => {
      state.isLoadingList = action.payload
    },
    setErrorList: (state, action: PayloadAction<string | null>) => {
      state.errorList = action.payload
      state.isLoadingList = false
    },
    clearNewsList: (state) => {
      state.newsList = []
      state.pagination = null
      state.errorList = null
    },
    setNewsDetail: (state, action: PayloadAction<News | null>) => {
      state.newsDetail = action.payload
      state.isLoading = false
      state.error = null
    },
    setCurrentNewsId: (state, action: PayloadAction<string | null>) => {
      state.currentNewsId = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearNewsDetail: (state) => {
      state.newsDetail = null
      state.currentNewsId = null
      state.error = null
    },
  },
})

export const {
  setNewsList,
  setPagination,
  setLoadingList,
  setErrorList,
  clearNewsList,
  setNewsDetail,
  setCurrentNewsId,
  setLoading,
  setError,
  clearNewsDetail,
} = newsSlice.actions

export default newsSlice.reducer

