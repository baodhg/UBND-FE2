import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ReportStatusHistory } from '../api/reportStatusHistoryApi'

interface ReportStatusHistoryState {
  statusHistory: ReportStatusHistory[]
  currentReportId: string | null
  isLoading: boolean
  error: string | null
}

const initialState: ReportStatusHistoryState = {
  statusHistory: [],
  currentReportId: null,
  isLoading: false,
  error: null,
}

const reportStatusHistorySlice = createSlice({
  name: 'reportStatusHistory',
  initialState,
  reducers: {
    setStatusHistory: (state, action: PayloadAction<ReportStatusHistory[]>) => {
      state.statusHistory = action.payload
      state.isLoading = false
      state.error = null
    },
    setCurrentReportId: (state, action: PayloadAction<string | null>) => {
      state.currentReportId = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearStatusHistory: (state) => {
      state.statusHistory = []
      state.currentReportId = null
      state.error = null
    },
  },
})

export const {
  setStatusHistory,
  setCurrentReportId,
  setLoading,
  setError,
  clearStatusHistory,
} = reportStatusHistorySlice.actions

export default reportStatusHistorySlice.reducer

