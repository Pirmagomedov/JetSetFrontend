import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type NotificationNotice = {
    id?: string
    is_read?: boolean
    is_system?: boolean
    name?: string
    text?: string
    deleted_at?: string
    recipient?: string
    extra: any
}

export interface INotificationNoticeReducer extends NotificationNotice {
    isOpen: boolean
    onClose?: () => void
    onClick?: () => void
}

const initialState: INotificationNoticeReducer = {
    id: null,
    isOpen: false,
    onClose: null,
    onClick: null,
    is_read: null,
    is_system: null,
    name: '',
    text: '',
    deleted_at: '',
    recipient: '',
    extra: {
        type: '',
    },
}

export const notificationNoticeReducer = createSlice({
    name: 'notificationNotice',
    initialState,
    reducers: {
        noticeClose(state) {
            state.isOpen = false
            state.text = ''
            state.name = ''
            //   state.onClose && state.onClose()
        },
        noticeConfirm(state) {
            //   state.onClick && state.onClick()
            state.is_read = true
        },
        setNotificationNotice: {
            reducer: (
                state,
                action: PayloadAction<INotificationNoticeReducer>,
            ) => {
                const {
                    name = '',
                    text = '',
                    onClose,
                    onClick,
                    extra,
                    id,
                } = action.payload
                state.name = name
                state.text = text
                state.extra = extra
                state.isOpen = true
                state.id = id
                // state.onClose = onClose
                // state.onClick = onClick
            },
            prepare: (payload: INotificationNoticeReducer) => {
                return { payload }
            },
        },
    },
})

export const { setNotificationNotice, noticeClose, noticeConfirm } =
    notificationNoticeReducer.actions

export default notificationNoticeReducer.reducer
