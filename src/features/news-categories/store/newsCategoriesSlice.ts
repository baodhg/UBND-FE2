import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { NewsCategory, Pagination } from '../api/newsCategoriesApi'

interface NewsCategoriesState {
  categories: NewsCategory[]
  categoriesWithPagination: NewsCategory[]
  categoryDetail: NewsCategory | null
  selectedCategory: string | null
  pagination: Pagination | null
  isLoading: boolean
  isLoadingPagination: boolean
  isLoadingDetail: boolean
  error: string | null
  errorPagination: string | null
  errorDetail: string | null
}

const initialState: NewsCategoriesState = {
  categories: [],
  categoriesWithPagination: [],
  categoryDetail: null,
  selectedCategory: null,
  pagination: null,
  isLoading: false,
  isLoadingPagination: false,
  isLoadingDetail: false,
  error: null,
  errorPagination: null,
  errorDetail: null,
}

const newsCategoriesSlice = createSlice({
  name: 'newsCategories',
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<NewsCategory[]>) => {
      state.categories = action.payload
      state.isLoading = false
      state.error = null
    },
    setCategoriesWithPagination: (state, action: PayloadAction<NewsCategory[]>) => {
      state.categoriesWithPagination = action.payload
      state.isLoadingPagination = false
      state.errorPagination = null
    },
    setPagination: (state, action: PayloadAction<Pagination | null>) => {
      state.pagination = action.payload
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setLoadingPagination: (state, action: PayloadAction<boolean>) => {
      state.isLoadingPagination = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    setErrorPagination: (state, action: PayloadAction<string | null>) => {
      state.errorPagination = action.payload
      state.isLoadingPagination = false
    },
    clearCategories: (state) => {
      state.categories = []
      state.selectedCategory = null
      state.error = null
    },
    clearCategoriesWithPagination: (state) => {
      state.categoriesWithPagination = []
      state.pagination = null
      state.errorPagination = null
    },
    setCategoryDetail: (state, action: PayloadAction<NewsCategory | null>) => {
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
  },
})

export const {
  setCategories,
  setCategoriesWithPagination,
  setPagination,
  setSelectedCategory,
  setLoading,
  setLoadingPagination,
  setError,
  setErrorPagination,
  clearCategories,
  clearCategoriesWithPagination,
  setCategoryDetail,
  setLoadingDetail,
  setErrorDetail,
  clearCategoryDetail,
} = newsCategoriesSlice.actions

export default newsCategoriesSlice.reducer

