import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Notification = {
    title?: string
    text?: string
    isPositive?: boolean
    icon?: string
    onClose?: () => void
}

export interface INotificationReducer extends Notification {
    isOpen: boolean
}

const initialState: INotificationReducer = {
    isOpen: false,
    title: '',
    text: '',
    isPositive: true,
    onClose: null,
}

export const notificationReducer = createSlice({
    name: 'info',
    initialState,
    reducers: {
        close(state) {
            state.isOpen = false
            state.text = ''
            state.title = ''
            state.isPositive = true
            state.icon = ''
            state.onClose && state.onClose()
        },
        setNotification: {
            reducer: (state, action: PayloadAction<Notification>) => {
                const {
                    title = '',
                    text = '',
                    isPositive = true,
                    onClose,
                    icon,
                } = action.payload
                state.isOpen = true
                state.title = title
                state.text = text
                state.isPositive = isPositive
                state.icon = icon
                state.onClose = onClose
            },
            prepare: (payload: Notification) => {
                return { payload }
            },
        },
    },
})

export const { setNotification, close } = notificationReducer.actions

export default notificationReducer.reducer
