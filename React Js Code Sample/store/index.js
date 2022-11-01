// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { API_BASE_URL } from '@configs/constants'

// ** Axios Imports
import axios from 'axios'
axios.defaults.baseURL = API_BASE_URL


// ** Workers for backend
export const getStaffListUsingName = createAsyncThunk('notes/get-staff-list-using-name', async ({ keywords }) => {
  const response = await axios.post('/api/common/get-staff-list-using-name', { keyword: keywords })
  return response.data
})

// ** saveNoteForUser
export const saveNoteForUser = createAsyncThunk('notes/save-to-db', async (formData) => {
  const response = await axios.post('/api/common/save-notes', formData)
  return response.data
})

// ** saveNoteForUser
export const getUserNote = createAsyncThunk('notes/get-note-list', async ({user_id, note_for}) => {
  const response = await axios.post('/api/common/get-notes', {user_id, note_for, page_no: 1, limit: 500})
  return response.data
})

// ** Delete note  
export const deleteNote = createAsyncThunk('notes/delete-note', async (note_id) => {
  const response = await axios.post('/api/common/delete-note', {note_id})
  return response.data
})

// ** Store data
export const appUsersSlice = createSlice({
  name: 'notes',
  initialState: {
    staff: [],
    notes: []
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(getStaffListUsingName.fulfilled, (state, action) => {
        state.staff = action.payload.data
      })
      .addCase(getUserNote.fulfilled, (state, action) => {
        state.notes = action.payload.data
      })
  }
})

export default appUsersSlice.reducer
