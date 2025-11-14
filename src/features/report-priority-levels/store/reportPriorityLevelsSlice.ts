import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ReportPriorityLevels } from '../api/reportPriorityLevelsApi'

interface ReportPriorityLevelsState {
  priorityLevels: ReportPriorityLevels | null
  isLoading: boolean
  error: string | null
}

const initialState: ReportPriorityLevelsState = {
  priorityLevels: null,
  isLoading: false,
  error: null,
}

const reportPriorityLevelsSlice = createSlice({
  name: 'reportPriorityLevels',
  initialState,
  reducers: {
    setPriorityLevels: (state, action: PayloadAction<ReportPriorityLevels | null>) => {
      state.priorityLevels = action.payload
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
    clearPriorityLevels: (state) => {
      state.priorityLevels = null
      state.error = null
    },
  },
})

export const {
  setPriorityLevels,
  setLoading,
  setError,
  clearPriorityLevels,
} = reportPriorityLevelsSlice.actions

export default reportPriorityLevelsSlice.reducer

