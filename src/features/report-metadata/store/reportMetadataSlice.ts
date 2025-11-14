import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ReportMetadata } from '../api/reportMetadataApi'

interface ReportMetadataState {
  metadata: ReportMetadata | null
  isLoading: boolean
  error: string | null
}

const initialState: ReportMetadataState = {
  metadata: null,
  isLoading: false,
  error: null,
}

const reportMetadataSlice = createSlice({
  name: 'reportMetadata',
  initialState,
  reducers: {
    setMetadata: (state, action: PayloadAction<ReportMetadata | null>) => {
      state.metadata = action.payload
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
    clearMetadata: (state) => {
      state.metadata = null
      state.error = null
    },
  },
})

export const {
  setMetadata,
  setLoading,
  setError,
  clearMetadata,
} = reportMetadataSlice.actions

export default reportMetadataSlice.reducer

