export { useReportCategories } from './hooks/useReportCategories'
export { useReportCategoryById } from './hooks/useReportCategoryById'
export { useSearchReportCategories } from './hooks/useSearchReportCategories'
export { reportCategoriesApi } from './api/reportCategoriesApi'
export type { ReportCategory, GetReportCategoriesParams } from './api/reportCategoriesApi'
export {
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
} from './store/reportCategoriesSlice'

