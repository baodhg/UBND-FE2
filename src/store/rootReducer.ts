import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '../features/authentication/store/authSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here
})

export default rootReducer

