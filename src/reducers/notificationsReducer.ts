import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const host = process.env.BACKEND_URL
    ? process.env.BACKEND_URL
    : window.location.host

export interface Notifications {
    id: number
    is_read: boolean
    created_at?: string
    is_system: boolean
    name: string
    text: string
    notificationIds: [string]
    deleted_at: string
    recipient: string
    extra: {
        kind?: 'profile' | 'deal' | 'listing'
        proceed_id?: string
        type: string
        proceed: {
            text: string
        }
    }
}

export interface NotificationsState {
    notifications: Notifications[]
    count: number
    isNewNotifications: boolean
    notificationIds: [string]
    status: 'idle' | 'loading' | 'failed'
    error: string | null
    offset: number
}

const initialState: NotificationsState = {
    notifications: [],
    notificationIds: [''],
    isNewNotifications: false,
    status: 'idle',
    count: 0,
    offset: 0,
    error: null,
}

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async ({
        limit,
        offset,
        id,
    }: {
        limit: number
        offset: number
        id: string
    }) => {
        try {
            const response = await axios.post(
                `https://${host}/pusher/notifications/paginate/`,
                {
                    params: {
                        limit: limit,
                        offset: offset,
                    },
                    data: {
                        filters: {
                            sender: {
                                op: 'eq',
                                value: id,
                            },
                        },
                    },
                },
            )
            return response.data
        } catch (error) {
            throw new Error('Failed to fetch notifications')
        }
    },
)

export const makeSingleNotificationRead = (id, userId) => async (dispatch) => {
    const patchData = {
        item: { is_read: true },
        data: {
            filters: {
                id: { op: 'in', value: [id] },
            },
        },
    }
    try {
        const response = await axios.patch(
            `https://${host}/pusher/notifications/update_many/`,
            patchData,
        )
        dispatch(fetchNotifications({ limit: 50, offset: 0, id: userId }))
    } catch (error) {
        console.error('Failed to delete notification:', error.message)
    }
}

export const deleteNotification = (id) => async (dispatch) => {
    try {
        const response = await axios.delete(
            `https://${host}/pusher/notifications/${id}`,
        )
        dispatch(removeNotification(id))
    } catch (error) {
        console.error('Failed to delete notification:', error.message)
    }
}

export const checkIsNewNotification = (userId) => (dispatch) => {
    dispatch(fetchNotifications({ limit: 50, offset: 0, id: userId }))
}

export const deleteShownNotifications = (ids, userId) => async (dispatch) => {
    const patchData = {
        item: { is_deleted: true },
        data: {
            filters: {
                id: { op: 'in', value: ids },
            },
        },
    }
    try {
        const response = await axios.patch(
            `https://${host}/pusher/notifications/update_many/`,
            patchData,
        )
        dispatch(fetchNotifications({ limit: 50, offset: 0, id: userId }))
    } catch (error) {
        console.error('Failed to delete notification:', error.message)
    }
}

export const makeShownNotificationsRead = (ids) => async (dispatch) => {
    const patchData = {
        item: { is_read: true },
        data: {
            filters: {
                id: { op: 'in', value: ids },
            },
        },
    }
    try {
        const response = await axios.patch(
            `https://${host}/pusher/notifications/update_many/`,
            patchData,
        )
        dispatch(clearNotification())
    } catch (error) {
        console.error('Failed to mark as read notification:', error.message)
    }
}

export const addNotification = (userId) => (dispatch) => {
    dispatch(fetchNotifications({ limit: 50, offset: 0, id: userId }))
}

const notificationsReducer = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        removeNotification(state, action) {
            const id = action.payload
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== id,
            )
            state.count--
        },
        clearNotification(state) {
            state.isNewNotifications = false
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.status = 'idle'
                state.error = null
                state.notifications =
                    action.payload.offset === 0
                        ? action.payload.items
                        : state.notifications.concat(action.payload.items)
                state.count = action.payload.total
                state.notificationIds = action.payload.items.map((el) => el.id)
                state.isNewNotifications =
                    action.payload.items.findIndex(
                        (notification) => notification.is_read === false,
                    ) === -1
                        ? false
                        : true
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.status = 'failed'
                state.error =
                    action.error.message ?? 'Failed to fetch notifications'
            })
    },
})

export const { removeNotification, clearNotification } =
    notificationsReducer.actions

export default notificationsReducer.reducer
