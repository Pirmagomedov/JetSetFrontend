import { configureStore } from '@reduxjs/toolkit'
import choicesReducer from './reducers/choicesReducer'
import confirmReducer from './reducers/confirmReducer'
import loaderReducer from './reducers/loaderReducer'
import notificationNoticeReducer from './reducers/notificationNoticeReducer'
import notificationReducer from './reducers/notificationReducer'
import chatsReducer from './reducers/chatsReducer'
import notificationsReducer from './reducers/notificationsReducer'
import productNoticeReducer from './reducers/productNoticeReducer'
import userReducer from './reducers/userReducer'
import eventReducer from './reducers/eventReducer'

export const store = configureStore({
    reducer: {
        loader: loaderReducer,
        notification: notificationReducer,
        user: userReducer,
        choices: choicesReducer,
        chats: chatsReducer,
        confirm: confirmReducer,
        productNotice: productNoticeReducer,
        notifications: notificationsReducer,
        events: eventReducer,
        notificationNotice: notificationNoticeReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            /*serializableCheck: {
        ignoredActions: ['info/setNotification', 'info/setConfirm', 'productNotice/setProductNotice'],
        ignoredPaths: ['notification.onClose', 'confirm.onConfirm', 'productNotice.onClick'],
      },*/
        }),
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
