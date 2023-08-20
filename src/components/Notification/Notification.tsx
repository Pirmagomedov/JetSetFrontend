import React, { useEffect } from 'react'
import Modal from 'src/components/Modal/Modal'
import { useDispatch, useSelector } from 'react-redux'
import { close } from 'src/reducers/notificationReducer'
import { AppDispatch, RootState } from 'src/store'
import './Notification.scss'
import {
    addNotification,
    checkIsNewNotification,
} from 'src/reducers/notificationsReducer'
import { setNotificationNotice } from 'src/reducers/notificationNoticeReducer'
import { flag } from 'src/reducers/eventReducer'
import { useProfile } from 'src/hooks'

const host = process.env.BACKEND_URL
    ? process.env.BACKEND_URL
    : window.location.host

const Notification: React.FC = () => {
    const { isOpen, isPositive, icon, title, text } = useSelector(
        (state: RootState) => state.notification,
    )
    const dispatch: AppDispatch = useDispatch()
    const profile = useProfile()


    useEffect(() => {
        if (profile?.id) {
            const WS_URL = `wss://${host}/pusher/ws/${profile?.id}/`
            //console.error(profile.id, typeof WS_URL)
            let ws
            let timeoutHandler = null
            let pingHandler = setInterval(() => {
                ws.send(JSON.stringify({ping: 'ping'}))
            }, 30000)

            const handleOpen = () => {
                console.log('WebSocket connection established.')
            }

            const handleMessage = (event) => {
                const notification = JSON.parse(event.data)
                console.log('WEBSOCKET', notification)
                if (notification?.ping) {
                    return
                }
                if (notification?.extra?.type === 'document_signed') {
                    dispatch(
                        flag({
                            id: notification.id,
                            received: new Date(),
                            type: notification.extra.type,
                            data: notification.extra,
                            processed: false
                        })
                    )
                } else {
                    dispatch(addNotification(profile?.id))
                    dispatch(
                        setNotificationNotice({
                            isOpen: true,
                            name: notification.name,
                            text: notification.text,
                            extra: notification.extra,
                            id: notification.id,
                        }),
                    )
                }
            }

            const goDumb = () => {
                ws.removeEventListener('open', handleOpen)
                ws.removeEventListener('message', handleMessage)
                ws.removeEventListener('close', handleClose)
                ws.removeEventListener('error', handleError)
                ws.close()
            }

            const goLive = () => {
                ws = new WebSocket(WS_URL)
                ws.addEventListener('open', handleOpen)
                ws.addEventListener('message', handleMessage)
                ws.addEventListener('close', handleClose)
                ws.addEventListener('error', handleError)
            }

            const handleClose = () => {
                console.log('WebSocket connection closed. Reconnecting...')
                goDumb()
                timeoutHandler = setTimeout(goLive, 100)
            }

            const handleError = (error) => {
                console.error('WebSocket error occurred:', error)
                handleClose()
            }

            goLive()

            return () => {
                goDumb()
                clearTimeout(timeoutHandler)
                //clearInterval(pingHandler)
            }
        }
    }, [dispatch, profile?.id])

    const closeModal = () => {
        dispatch(close())
    }

    const className = isOpen ? 'notification open' : 'notification hidden'
    const iconSign = icon ? icon : isPositive ? 'i-success' : 'i-fail'

    return (
        <Modal
            title={title}
            isCloseIcon={false}
            modalIsOpen={isOpen}
            onRequestClose={closeModal}
            icon={iconSign}
            buttons={[{ title: 'Understand', onClick: closeModal }]}
        >
            <div className="modal__paragraph">{text}</div>
        </Modal>
    )
}

export default Notification
