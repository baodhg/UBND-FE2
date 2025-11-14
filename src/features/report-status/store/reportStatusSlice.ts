import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ReportStatus } from '../api/reportStatusApi'

interface ReportStatusState {
  status: ReportStatus | null
  isLoading: boolean
  error: string | null
}

const initialState: ReportStatusState = {
  status: null,
  isLoading: false,
  error: null,
}

const reportStatusSlice = createSlice({
  name: 'reportStatus',
  initialState,
  reducers: {
    setStatus: (state, action: PayloadAction<ReportStatus | null>) => {
      state.status = action.payload
      state.isLoading = false
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearStatus: (state) => {
      state.status = null
      state.error = null
    },
  },
})

export const {
  setStatus,
  setLoading,
  setError,
  clearStatus,
} = reportStatusSlice.actions

export default reportStatusSlice.reducer

