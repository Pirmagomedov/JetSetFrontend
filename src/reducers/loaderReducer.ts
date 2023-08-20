import { createSlice, PayloadAction } from '@reduxjs/toolkit'
export interface IloaderReducer {
    verifyLoader: boolean
    profileLoader: boolean
    commonLoader: boolean
    simpleLoader: boolean
}

const initialState: IloaderReducer = {
    verifyLoader: false,
    profileLoader: true,
    commonLoader: false,
    simpleLoader: false,
}

export const loaderReducer = createSlice({
    name: 'loader',
    initialState,
    reducers: {
        setVerifyLoader(state, action: PayloadAction<boolean>) {
            state.verifyLoader = action.payload
        },
        setProfileLoader(state, action: PayloadAction<boolean>) {
            state.profileLoader = action.payload
        },
        setCommonLoader(state, action: PayloadAction<boolean>) {
            state.commonLoader = action.payload
        },
        setSimpleLoader(state, action: PayloadAction<boolean>) {
            state.simpleLoader = action.payload
        },
    },
})

export const {
    setVerifyLoader,
    setProfileLoader,
    setCommonLoader,
    setSimpleLoader,
} = loaderReducer.actions

export default loaderReducer.reducer
