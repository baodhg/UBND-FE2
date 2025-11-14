import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ReportCategory } from '../api/reportCategoriesApi'

interface ReportCategoriesState {
  categories: ReportCategory[]
  selectedCategory: string | null
  categoryDetail: ReportCategory | null
  searchResults: ReportCategory[]
  searchQuery: string | null
  isLoading: boolean
  isLoadingDetail: boolean
  isSearching: boolean
  error: string | null
  errorDetail: string | null
  searchError: string | null
}

const initialState: ReportCategoriesState = {
  categories: [],
  selectedCategory: null,
  categoryDetail: null,
  searchResults: [],
  searchQuery: null,
  isLoading: false,
  isLoadingDetail: false,
  isSearching: false,
  error: null,
  errorDetail: null,
  searchError: null,
}

const reportCategoriesSlice = createSlice({
  name: 'reportCategories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<ReportCategory[]>) => {
      state.categories = action.payload
      state.isLoading = false
      state.error = null
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearCategories: (state) => {
      state.categories = []
      state.selectedCategory = null
      state.error = null
    },
    setCategoryDetail: (state, action: PayloadAction<ReportCategory | null>) => {
      state.categoryDetail = action.payload
      state.isLoadingDetail = false
      state.errorDetail = null
    },
    setLoadingDetail: (state, action: PayloadAction<boolean>) => {
      state.isLoadingDetail = action.payload
    },
    setErrorDetail: (state, action: PayloadAction<string | null>) => {
      state.errorDetail = action.payload
      state.isLoadingDetail = false
    },
    clearCategoryDetail: (state) => {
      state.categoryDetail = null
      state.errorDetail = null
    },
    setSearchResults: (state, action: PayloadAction<ReportCategory[]>) => {
      state.searchResults = action.payload
      state.isSearching = false
      state.searchError = null
    },
    setSearchQuery: (state, action: PayloadAction<string | null>) => {
      state.searchQuery = action.payload
    },
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload
    },
    setSearchError: (state, action: PayloadAction<string | null>) => {
      state.searchError = action.payload
      state.isSearching = false
    },
    clearSearchResults: (state) => {
      state.searchResults = []
      state.searchQuery = null
      state.searchError = null
    },
  },
})

export const {
  setCategories,
  setSelectedCategory,
  setLoading,
  setError,
  clearCategories,
  setCategoryDetail,
  setLoadingDetail,
  setErrorDetail,
  clearCategoryDetail,
  setSearchResults,
  setSearchQuery,
  setSearching,
  setSearchError,
  clearSearchResults,
} = reportCategoriesSlice.actions

export default reportCategoriesSlice.reducer

