import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { UploadedFileType, ProfileMain } from './../generated/graphql'

export interface IUserReducer {
    token: string
    isAuth: boolean
    profile: ProfileMain
}

const initialProfile: ProfileMain = {
    email: null,
    id: null,
    username: '',
    firstName: '',
    lastName: '',
    middleName: '',
    hideAvatar: null,
    hideFullName: null,
    isDemo: null,
    avatar: null,
    kycInfo: null,
    currentWorkspace: null,
    workspaces: [],
}

const initialState: IUserReducer = {
    token: undefined,
    isAuth: undefined,
    profile: initialProfile,
}

export const userReducer = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setToken(state, action: PayloadAction<string>) {
            state.token = action.payload
        },
        setProfile(state, action: PayloadAction<ProfileMain>) {
            if (action.payload.username) {
                state.profile = action.payload
            } else {
                state.profile = initialProfile
                state.isAuth = false
                state.token = null
            }
        },
        setAuth(state, action: PayloadAction<boolean>) {
            state.isAuth = action.payload
        },
        logout(state) {
            state.isAuth = false
            state.profile = initialProfile
            state.token = null
        },
    },
})

export const { setToken, setProfile, logout, setAuth } = userReducer.actions

export default userReducer.reducer
