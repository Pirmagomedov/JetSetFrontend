import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ISystemEvent = {
    id: string,
    received: Date,
    type: string,
    data: any,
    processed: boolean
}


const initialState: ISystemEvent = {
    id: null,
    received: null,
    type: null,
    data: null,
    processed: true
}

export const eventReducer = createSlice({
    name: 'eventReducer',
    initialState,
    reducers: {
        setProcessed(state) {
            state.processed = true
        },
        flag(state, action: PayloadAction<ISystemEvent>) {
            state.id = action.payload.id
            state.received = action.payload.received
            state.type  = action.payload.type
            state.data  = action.payload.data
            state.processed  = false
        },
    },
})

export const { setProcessed, flag } =
    eventReducer.actions

export default eventReducer.reducer
