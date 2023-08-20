import React, { lazy, useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
const Layout = lazy(() => import('src/hoc/Layout'))
import {
    chatsAuthenticate,
    chatsOpenChat,
    sendMessage,
    setOpen,
    chatsCreateRoom,
    closeChat,
    chatRoomMessageNew,
    chatRoomMessageView,
    chatRoomScroll,
    setAdCache,
    IFBChat,
    IChatCacheItem,
} from 'src/reducers/chatsReducer'
import { AppDispatch, RootState } from 'src/store'
import { useQuery, useMutation } from 'urql'
import { ProfileMain, useGetAdContext } from 'src/generated/graphql'
import { formatDate, getImageLink, ImageStyles } from 'src/helper'
import { useProfile } from 'src/hooks'
import Icon from 'src/components/Icon/Icon'
import './Chats.scss'

const ChatForm: React.FC = (props) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const dispatch: AppDispatch = useDispatch()
    const profile = useProfile()

    const clearInput = () => {
        const innerHTML = inputRef?.current?.innerHTML
            ? inputRef.current.innerHTML
                  .replace(/<(?!\/?(b|i|strong|br))[^>]*>/g, ' ')
                  .trim()
            : ''
        inputRef.current.innerHTML = innerHTML
    }

    const sendMsg = () => {
        clearInput()
        const msg = inputRef.current.innerHTML.trim()
        if (msg.replace(/\<br[^>]*>/g, '') == '') return
        dispatch(sendMessage(msg))
        inputRef.current.innerHTML = '<br />'
    }

    useEffect(() => {
        inputRef.current.innerHTML = '<br />'
    }, [])

    const handleType = (e) => {
        if (e.charCode == 13) {
            if (e.ctrlKey) {
                const div = document.createElement('br')
                var range = window.getSelection().getRangeAt(0)
                range.deleteContents()
                range.insertNode(div)

                range = document.createRange()
                range.setStartAfter(div)
                range.collapse(false)
                var sel = window.getSelection()
                sel.removeAllRanges()
                sel.addRange(range)
                e.preventDefault()
            } else {
                //submit
                e.preventDefault()
                sendMsg()
                e.target.innerHTML = ''
            }
        }
    }

    const handlePaste = (e) => {
        clearInput()
    }

    return (
        <div className="chatroom__form">
            <div className="chatroom__form--attach"></div>
            <div className="chatroom__form--wrapper">
                <div className="chatroom__form--box-wrapper">
                    <div
                        ref={inputRef}
                        className="chatroom__form--box"
                        contentEditable
                        onPaste={handlePaste}
                        onKeyPress={handleType}
                    ></div>
                </div>
                <div className="chatroom__form--submit">
                    <Icon
                        name="i-send"
                        onClick={sendMsg}
                    />
                </div>
            </div>
        </div>
    )
}

const ChatMessages: React.FC<IChatRoom> = (props) => {
    const { profile } = props
    const scrollRef = useRef<HTMLDivElement>()
    const partRef = useRef<HTMLDivElement>()
    const dispatch: AppDispatch = useDispatch()
    const chats = useSelector((state: RootState) => state.chats)

    const scrollDown = useCallback(() => {
        if (scrollRef.current && partRef.current) {
            console.log('scrollDown', {
                scrollRef: scrollRef.current.clientHeight,
                partRef: partRef.current.clientHeight,
            })
            scrollRef.current.scrollTop =
                partRef.current.clientHeight -
                scrollRef.current.clientHeight +
                50
        } else {
            //dirty buggy trick
            scrollRef.current.scrollTop = 10000000
        }
    }, [])

    const handleScrollToMe = useCallback(
        (/*ref, isLast*/) => {
            console.log('scrollToMe', chats.chatRoomScrolled)
            if (!chats.chatRoomScrolled) {
                dispatch(chatRoomScroll(true))
                scrollDown()
                //ref.current.scrollIntoView();
            }
        },
        [chats.activeChat],
    )

    const handleScroll = (e) => {
        //viewScroll
        if (!partRef.current) {
            return
        }
        //if (document?.visibilityState !== 'hidden'){
        //console.log('handlescroll', (partRef.current.clientHeight - scrollRef.current.clientHeight) - scrollRef.current.scrollTop);
        if (
            partRef.current.clientHeight -
                scrollRef.current.clientHeight -
                scrollRef.current.scrollTop <
            10
        ) {
            dispatch(chatRoomScroll(false))
            //chats.fixCounters();
        } else {
            dispatch(chatRoomScroll(true))
        }
        Object.keys(chats.chatRoomNew).forEach((key) => {
            console.log('handlescroll->', chats.chatRoomNew[key])
            if (chats.chatRoomNew[key].current) {
                console.log(
                    scrollRef.current.scrollTop,
                    scrollRef.current.clientHeight,
                    chats.chatRoomNew[key].current.offsetTop,
                )

                if (
                    scrollRef.current.scrollTop +
                        scrollRef.current.clientHeight >
                    chats.chatRoomNew[key].current.offsetTop
                ) {
                    dispatch(chatRoomMessageView({ msgId: key }))
                    console.log('message viewed', key, new Date().getTime())
                }
            }
        })
        //}
    }

    useEffect(() => {
        scrollRef.current.onscroll = handleScroll
        setTimeout(handleScroll, 1000)
    }, [])

    const messageIsNew = (message) => {
        return !message.data.view && chats.uuid != message.data.uid
    }

    //if (!chats?.chatRoom?.length) return null

    return (
        <>
            {/*<ChatRoomNewCount scrollDown={scrollDown}/>*/}
            <div
                ref={scrollRef}
                className="messages"
                id="messages"
            >
                <div
                    ref={partRef}
                    className="partyanka"
                    id="partyanka"
                >
                    {chats.chatRoom.map((message, key) => {
                        return (
                            <ChatMessage
                                iAmNew={handleScrollToMe}
                                isLast={key == chats.chatRoom.length - 1}
                                created={message.created}
                                key={message.key + '-' + key}
                                mid={message.key}
                                view={message.view}
                                text={message.text}
                                uuid={chats.uuid}
                                messageSender={message.uid}
                            />
                        )
                    })}
                </div>
            </div>
        </>
    )
}

interface IChatsMessage {
    isLast: boolean
    iAmNew: () => any
    mid: string
    text: string
    created: string
    view: boolean
    uuid: string
    messageSender: string
    htmlProps?: any
}

const ChatMessage: React.FC<IChatsMessage> = React.memo((props) => {
    const {
        isLast,
        iAmNew,
        mid,
        text,
        created,
        view,
        uuid,
        messageSender,
        htmlProps,
    } = props
    const dispatch: AppDispatch = useDispatch()
    const chats = useSelector((state: RootState) => state.chats)
    //console.log('ChatMessage', uuid, messageSender)
    const incoming = messageSender != uuid
    const isNew = !view && incoming
    const className = (incoming ? 'm mt' : 'm mf') + ' ' + (isNew ? 'n' : 'v')

    const ref = useRef()
    useEffect(() => {
        if (isNew) {
            if (iAmNew) iAmNew(/*ref*/)
            dispatch(chatRoomMessageNew(mid))
        }
        if (isLast) iAmNew(/*ref, true*/)
    }, [])

    //const date = formatDate(created ? created : false)
    //date.timeStamp

    return (
        <div
            ref={ref}
            id={mid}
            className={className}
            {...htmlProps}
        >
            <div className="i">12:31</div>
            <div
                className="t"
                dangerouslySetInnerHTML={{ __html: text }}
            ></div>
        </div>
    )
})

interface IChat {
    chat: IFBChat
    aircraftCache?: IChatCacheItem[]
}

const Chat: React.FC<IChat> = (props) => {
    const { key, title, lastMessage } = props.chat
    const chats = useSelector((state: RootState) => state.chats)
    const cached = chats.aircraftCache.filter(
        (i) => i.id == props?.chat?.context?.key,
    )
    const dispatch: AppDispatch = useDispatch()

    const handleOpenChat = () => {
        dispatch(chatsOpenChat({ key: key }))
    }

    return (
        <div
            className="chats__chat"
            id={`chat_${key} `}
            onClick={handleOpenChat}
        >
            <div className="chat__image">
                {cached.length == 1 && cached[0].image ? (
                    <img
                        src={cached[0].image}
                        alt={title}
                        title={title}
                    />
                ) : (
                    <div className="chat__image--placeholder"></div>
                )}
            </div>
            <div className="chat__title">
                <div className="chat__title--main">{title ? title : key}</div>
                <div className="chat__title--message">{lastMessage}</div>
            </div>
        </div>
    )
}

const ChatHeader: React.FC<IChat> = (props) => {
    const { chat } = props
    const dispatch: AppDispatch = useDispatch()
    const handleClose = () => {
        dispatch(closeChat())
    }

    return (
        <div className="chatroom__header">
            <div
                className="chatroom__header--close"
                onClick={handleClose}
            >
                <Icon name="back" />
            </div>
            <div className="chatroom__header--title">
                {chat?.title ? chat.title : '-'}
            </div>
            <div className="chatroom__header--buttons"></div>
        </div>
    )
}

interface IChatRoom {
    profile: ProfileMain
}

const ChatRoom: React.FC<IChatRoom> = (props) => {
    const { profile } = props
    const chats = useSelector((state: RootState) => state.chats)
    const [activeChat, setActiveChat] = useState<IFBChat>(null)

    useEffect(() => {
        if (chats?.chats?.length > 0) {
            chats.chats.forEach((chat) => {
                if (chat.key == chats.activeChat) {
                    setActiveChat(chat)
                }
            })
        }
    }, [chats])

    return (
        <div className="chats__chatroom">
            <ChatHeader chat={activeChat} />
            <ChatMessages profile={profile} />
            <ChatForm />
        </div>
    )
}

const Chats: React.FC = (props) => {
    const dispatch: AppDispatch = useDispatch()
    const chats = useSelector((state: RootState) => state.chats)
    const activeChat = chats.activeChat
        ? 'active ' + chats.activeChat
        : 'inactive'
    const [expanded, setExpanded] = useState<boolean>(false)
    const [, getAdContext] = useGetAdContext()

    const profile = useProfile()

    const closeChat = () => {
        dispatch(setOpen(false))
    }

    useEffect(() => {
        const aircrafts = chats.aircraftCache
        chats.chats.forEach((chat) => {
            const chatKey = chat?.context?.key
            if (chatKey) {
                if (!aircrafts.filter((a) => a.id == chatKey)?.length) {
                    dispatch(
                        setAdCache({
                            id: chatKey,
                            loading: true,
                        }),
                    )
                    getAdContext({ adId: chatKey }).then((res) => {
                        if (
                            res?.data?.getAd?.ad?.mainInformation?.images?.[0]
                        ) {
                            const mainInformation =
                                res.data.getAd?.ad.mainInformation
                            dispatch(
                                setAdCache({
                                    id: chatKey,
                                    image: getImageLink(
                                        mainInformation.images[0],
                                        ImageStyles.AD_CHAT,
                                    ),
                                    loading: false,
                                }),
                            )
                        }
                    })
                    //console.log('load cache for context', chat.context)
                }
            }
        })
    }, [chats.chats])

    useEffect(() => {
        if (profile.id) {
            dispatch(chatsAuthenticate(profile.id))
        }
    }, [profile.id])

    return (
        <div
            className={`chats ${activeChat} ${
                expanded ? 'expanded' : 'aside'
            } ${chats.open ? 'open' : 'closed'}`}
        >
            <div className="chats__list">
                <div className="chats__list--header">
                    <div className="chats__title">Chats</div>
                    <Icon
                        name="i-close"
                        onClick={closeChat}
                    />
                </div>
                <div className="chats__list--list">
                    {chats?.chats?.length > 0 &&
                        chats.chats.map((chat) => (
                            <Chat
                                key={chat.key}
                                chat={chat}
                            />
                        ))}
                </div>
            </div>
            <ChatRoom profile={profile} />
        </div>
    )
}

export default Chats
