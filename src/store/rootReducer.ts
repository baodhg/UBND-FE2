import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../features/authentication/store/authSlice'
import reportCategoriesReducer from '../features/report-categories/store/reportCategoriesSlice'
import reportStatusHistoryReducer from '../features/report-status-history/store/reportStatusHistorySlice'
import reportPriorityLevelsReducer from '../features/report-priority-levels/store/reportPriorityLevelsSlice'
import reportStatusReducer from '../features/report-status/store/reportStatusSlice'
import reportMetadataReducer from '../features/report-metadata/store/reportMetadataSlice'
import newsReducer from '../features/news/store/newsSlice'
import newsCategoriesReducer from '../features/news-categories/store/newsCategoriesSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  reportCategories: reportCategoriesReducer,
  reportStatusHistory: reportStatusHistoryReducer,
  reportPriorityLevels: reportPriorityLevelsReducer,
  reportStatus: reportStatusReducer,
  reportMetadata: reportMetadataReducer,
  news: newsReducer,
  newsCategories: newsCategoriesReducer,
  // Add other reducers here
})

export default rootReducer

