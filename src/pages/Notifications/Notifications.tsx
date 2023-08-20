import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Icon from 'src/components/Icon/Icon';
import LoaderView from 'src/components/LoaderView/LoaderView';
import Layout from 'src/hoc/Layout'
import {
    deleteNotification,
    deleteShownNotifications,
    fetchNotifications,
    makeShownNotificationsRead,
    Notifications
} from 'src/reducers/notificationsReducer';
import { RootState } from 'src/store';
import './Notifications.scss'
import { useProfile } from 'src/hooks'


const host = process.env.BACKEND_URL ? process.env.BACKEND_URL : window.location.host


export const createNotifications =
    async () => {
        try {
            const response = await axios.post(`https://${host}/pusher/notifications/`);
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch notifications');
        }
    };



export const NotificationViewer: React.FC<Notifications> = ({ id, is_read, is_system, name, text, extra, created_at }) => {
    const dispatch = useDispatch()
    const [deleted, setDeleted] = useState<boolean>(false)
    const handleDelete = () => {
        dispatch(deleteNotification(id));
        setDeleted(true)
    };
    const router = useHistory()
    const classname = extra?.type


    const notificationName = name
    const notificationText = text

    const renderTexts = (extra) => {
        if (extra.proceed?.text) {
            return extra.proceed.text
        } else if (extra.kind === 'profile') {
            return 'Proceed to Profile'
        } else if (extra.kind === 'listing') {
            return 'Proceed to Inventory'
        } else if (extra.kind === 'deal') {
            return 'Proceed to Deals'
        }
    }

    const handleClick = () => {
        if (extra.kind === 'profile') {
            router.push('/profile')
        } else if (extra.kind === 'deal' && !!extra.proceed_id) {
            if (extra.proceed_id) {
                router.push(`/deal-process/${extra.proceed_id}`)
            } else {
                router.push('/deals')
            }
        } else if (extra.kind === 'listing') {
            if (extra.proceed_id) {
                router.push(`/product/${extra.proceed_id}`)
            } else {
                router.push('/inventory')
            }
        }
    }
    return (
        <>
            {classname !== 'document_signed' &&
                <div className={`notifications__notification__wrapper ${deleted ? 'hidden' : 'notice-active'}`}>
                    <div className="circle__wrapper">
                        {!is_read && <div className={`circle  ${classname} ${classname}__bcg `}></div>}
                    </div>
                    <div className={`notifications__notification ${classname}`}>
                        <div className='notifications__ico'>
                            <Icon height={16} width={16} name={`${classname}Ico`} />
                        </div>
                        <div className='notifications__texts'>
                            <div className='notifications__texts__header'>{notificationName}</div>
                            <p className='notifications__texts__text'>
                                {notificationText}
                                <br />
                                {created_at}
                            </p>
                        </div>
                        <div className='notifications__actionButtons'>
                            <div
                                onClick={handleClick}
                            >
                                {renderTexts(extra)}
                            </div>
                            <div className='notifications__actionButtons__removeBtn' onClick={() => handleDelete()}>Remove</div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}


const Notifications: React.FC = () => {
    const dispatch = useDispatch();
    const notifications = useSelector((state: RootState) => state.notifications.notifications);
    const notificationIds = useSelector((state: RootState) => state.notifications.notificationIds)
    const status = useSelector((state: RootState) => state.notifications.status);
    const error = useSelector((state: RootState) => state.notifications.error);
    const totalCount = useSelector((state: RootState) => state.notifications.count);
    const [offset, setOffset] = useState(0);
    const [isLoading, setLoading] = useState<boolean>(status === 'loading')
    const profile = useProfile()

    useEffect(() => {
        if (profile.id) {
            dispatch(fetchNotifications({ limit: 50, offset, id: profile?.id }));
            setLoading(false)
        }
    }, [dispatch, offset, profile?.id]);

    // useEffect(() => {
    //     notificationIds ? dispatch(makeShownNotificationsRead(notificationIds)) : null
    // }, [notificationIds, profile?.id])

    useEffect(() => {
        console.log('notifications', notifications)
    }, [notifications])

    const handleLoadMore = () => {
        setLoading(true)
        setOffset((prev) => prev + 50);
    }

    // const visibleNotifications = notifications.filter((item) => item.text !== "Document signed.");
    // const invisibleNotifications = notifications
    //     .filter((item) => item.text === "Document signed.")
    //     .map(
    //         (notification, index) => {
    //             return notification.id
    //         })
    // makeShownNotificationsRead(invisibleNotifications)
    // console.log('visibleNotifications', invisibleNotifications)



    return (
        <Layout>
            <div className='notifications'>
                <div className='notifications__header'>
                    <div className='notifications__header__title'>Notifications</div>
                    {notifications.length ? <div className='notifications__header__clearButton' onClick={() => dispatch(deleteShownNotifications(notificationIds, profile?.id))}>Clear All</div> : null}
                </div>
                {notifications.length ?
                    <div className='notifications__body'>
                        {notifications?.slice()
                            // .sort(
                            //     (a, b) => (new Date(b.created_at) as any) - (new Date(a.created_at) as any))
                            .map(
                                (notification) => {
                                    return (
                                        <NotificationViewer
                                            key={`${notification.id}`}
                                            {...notification}
                                        />
                                    )
                                })}
                        {status === 'failed' && <div>{error}</div>}
                        {notifications.length < totalCount && (
                            <div className="notifications__moreBtn">
                                {!isLoading ? (
                                    totalCount > offset &&
                                    <Icon
                                        width={24}
                                        height={24}
                                        name="load-more"
                                        onClick={handleLoadMore}
                                        className="notifications__moreBtn-icon"
                                    />
                                ) : (
                                    <LoaderView ring />
                                )}
                            </div>
                        )}
                    </div>
                    :
                    <div className='notifications__empty'>No Unresolved Notifications!</div>}


            </div>
        </Layout>
    );
};

export default Notifications
