import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { initializeApp } from 'firebase/app'
import {
    getAuth,
    signInWithCustomToken,
    signInAnonymously,
} from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import {
    getFirestore,
    collection,
    doc,
    addDoc,
    getDocs,
    arrayUnion,
    getDoc,
    updateDoc,
    increment,
    deleteField,
    serverTimestamp,
    where,
    query,
    orderBy,
    limit,
    onSnapshot,
} from 'firebase/firestore'

const FB_cred = {
    apiKey: 'AIzaSyBSXhSci-Nzh4m4Iq3s-A5FEbhU7ELRPwI',
    authDomain: 'jetsetchat-8d63f.firebaseapp.com',
    projectId: 'jetsetchat-8d63f',
    storageBucket: 'jetsetchat-8d63f.appspot.com',
    messagingSenderId: '487870627667',
    appId: '1:487870627667:web:6f63aaad84a636d79f6ba6',
    //measurementId: "G-MZQ5TKNR78"
}

export interface IFBChat {
    key: string
    title?: string
    archived?: string[]
    context?: any
    created?: string
    updated?: string
    count?: number
    parts?: string[]
    from?: string
    to?: string
    read?: any
    titles?: any
    notified?: any
    lastMessage?: string
}

export interface IFBChatMessage {
    key: string
    created?: string
    text?: string
    uid?: string
    view?: boolean
}

export interface IChatContext {
    type: string
    id: string
    icon: string
}

export interface IChatId {
    key?: string
    from?: string
    to?: string
    context?: IChatContext
}

export interface IChatCacheItem {
    id: string
    image?: string
    title?: string
    loading: boolean
}

export interface IFBContext {
    key: string
    type: 'AD' | 'DEAL'
    title?: string
    image?: string
}

const FB = initializeApp(FB_cred)
export const FB_auth = getAuth(FB)
export const FB_firestore = getFirestore(FB)
export const FB_chatsCollection = collection(FB_firestore, 'messages')

export const FB_subscriptions = {
    chatsQuery: null,
    chatsSubscription: null,
    chatRoomSubscription: null,
    chatRoomDataSubscription: null,
    chatRoomQuery: null,
    chatRoomRef: null,
    chatRoomCollection: null,
}

export const FB_chatSerialize = (doc): IFBChat => {
    const data = doc.data()
    const chat: IFBChat = {
        key: doc.id,
        title: data.title,
        archived: data.archived,
        context: data.context,
        created: data?.createdAt?.seconds,
        updated: data?.updatedAt?.seconds,
        count: data?.count ? data.count : 0,
        parts: data.parts,
        from: data.from,
        to: data.to,
        read: {},
        notified: {},
        titles: {},
    }
    chat.parts.forEach((part) => {
        const read = data[`read_${part}`]
        const title = data[`title_${part}`]
        const notified = data[`notified_${part}`]
        if (read) {
            chat.read[part] = +read
        } else {
            chat.read[part] = 0
        }
        if (title) {
            chat.titles[part] = title
        } else {
            chat.titles[part] = chat.title
        }
        if (notified) {
            chat.notified[part] = +notified
        } else {
            chat.notified[part] = 0
        }
    })
    return chat
}

export const FB_chatsSerialize = (querySnapshot): IFBChat[] => {
    const chats = []
    querySnapshot.forEach((fbchat) => {
        chats.push(FB_chatSerialize(fbchat))
    })
    return chats
}

export const FB_chatRoomMessageSerialize = (doc): IFBChatMessage => {
    const data = doc.data()
    const message: IFBChatMessage = {
        key: doc.id,
        text: data.text,
        uid: data.uid,
        created: data?.createdAt?.seconds,
    }
    return message
}

export const FB_chatRoomMessagesSerialize = (
    querySnapshot,
): IFBChatMessage[] => {
    const messages: IFBChatMessage[] = []
    const changes = querySnapshot.docChanges().length
    if (changes > 1) {
        querySnapshot
            .docChanges()
            .reverse()
            .forEach((change, id) => {
                if (change.type === 'added') {
                    messages.push(FB_chatRoomMessageSerialize(change.doc))
                }
            })
    } else {
        querySnapshot.docChanges().forEach((change, id) => {
            if (change.type === 'added') {
                //modified, removed
                messages.push(FB_chatRoomMessageSerialize(change.doc))
            }
            if (change.type === 'modified') {
                //modified, removed
                //this.chatRoomMessage(change.doc);
            }
        })
    }
    return messages
}

export type IChatsState = {
    loggedIn: boolean
    loggedInTime: null | number
    token: null | string
    uuid: null | string
    authenticating: boolean
    auth: boolean
    chats: IFBChat[]
    unread: number
    lastFixCounters: number
    activeChat: string | any
    chatRoom: IFBChatMessage[]
    chatRoomData: null | IFBChat
    chatRoomNew: any
    chatRoomNewCount: number
    chatRoomScrolled: boolean
    userCache: IChatCacheItem[]
    aircraftCache: IChatCacheItem[]
    open: boolean
    //chatRoomBottom: boolean,
}

export interface IChatNewAction {
    msgId: string
    //ref: any
}

export interface IChatMsg {
    msgId: string
}

const initialState: IChatsState = {
    loggedIn: false,
    loggedInTime: null,
    token: null,
    uuid: null,
    authenticating: false,
    auth: false,
    chats: [],
    unread: 0,
    lastFixCounters: 0,
    activeChat: null,
    chatRoom: [],
    chatRoomData: null,
    chatRoomNew: {},
    chatRoomNewCount: 0,
    chatRoomScrolled: false,
    userCache: [],
    aircraftCache: [],
    open: false,
    //chatRoomBottom: false,
}

export const chatsReducer = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setUserCache(state, action: PayloadAction<IChatCacheItem>) {
            state.userCache.push(action.payload)
        },
        setAdCache(state, action: PayloadAction<IChatCacheItem>) {
            const existed = state.aircraftCache.findIndex(
                (c) => c.id == action.payload.id,
            )
            if (existed >= 0) {
                console.log(
                    'aircraftCache update for ',
                    action.payload,
                    existed,
                )
                state.aircraftCache[existed] = action.payload
            } else {
                console.log('aircraftCache set', action.payload)
                state.aircraftCache.push(action.payload)
            }
        },
        setAuthenticating(state, action: PayloadAction<string>) {
            state.authenticating = true
            state.uuid = action.payload
        },
        setLoggedIn(state) {
            state.authenticating = false
            state.loggedIn = true
            state.loggedInTime = new Date().getTime()
        },
        onChatsUpdate(state, action: PayloadAction<any>) {
            const chats = action.payload
            const newChats = []
            var unread = 0
            chats.forEach((chat) => {
                if (chat.archived && chat.archived.includes(state.uuid)) {
                    //do nothing
                } else {
                    if (chat['read_' + state.uuid] !== undefined) {
                        //console.log('public_uuid', data, data.count - data['read_' + this.publicuuid])
                        unread +=
                            chat.count > chat['read_' + state.uuid]
                                ? chat.count - chat['read_' + state.uuid]
                                : 0
                    }
                    newChats.push(chat)
                }
            })
            //console.log('chatsCollection query update', unread);
            state.unread = unread
            state.chats = newChats
        },
        setActiveChat(state, action: PayloadAction<string>) {
            state.activeChat = action.payload
        },
        logIn(state, action: PayloadAction<string>) {
            state.token = action.payload
        },
        onChatRoomUpdate(state, action: PayloadAction<IFBChat>) {
            state.chatRoomData = action.payload
        },
        onChatRoomMessagesUpdate(
            state,
            action: PayloadAction<IFBChatMessage[]>,
        ) {
            const messages: IFBChatMessage[] = action.payload
            messages.forEach((message) => state.chatRoom.push(message))
            //state.chatRoom = [...state.chatRoom, ...messages]
            //console.log('onChatRoomMessagesUpdate', action.payload)
        },
        chatRoomReset(state, action: PayloadAction<any>) {
            state.chatRoomScrolled = false
            state.activeChat = action.payload
        },
        chatRoomScroll(state, action: PayloadAction<boolean>) {
            state.chatRoomScrolled = action.payload
        },
        closeChat(state) {
            state.activeChat = null
            state.chatRoomData = null
            state.chatRoom = []
            state.chatRoomNewCount = 0
        },
        toggleOpen(state) {
            state.open = !state.open
        },
        setOpen(state, action: PayloadAction<boolean>) {
            state.open = action.payload
        },
        chatRoomMessageNew(state, action: PayloadAction<string>) {
            state.chatRoomNew[action.payload] = true
            state.chatRoomNewCount = Object.keys(state.chatRoomNew).length
        },
        chatRoomMessageView(state, action: PayloadAction<IChatMsg>) {
            if (state.chatRoomData) {
                delete state.chatRoomNew[action.payload.msgId]
                state.chatRoomNewCount = Object.keys(state.chatRoomNew).length
                const msg = doc(
                    FB_firestore,
                    'messages',
                    FB_subscriptions.chatRoomRef.id,
                    'chatroom',
                    action.payload.msgId,
                )
                const sendID = state.uuid
                updateDoc(msg, { view: true })
                updateDoc(FB_subscriptions.chatRoomRef, {
                    ['read_' + sendID]: increment(1),
                })
            }
        },
        sendMessage(state, action: PayloadAction<string>) {
            const msg = action.payload
            if (msg !== '' && state.activeChat) {
                state.chatRoomScrolled = false
                addDoc(FB_subscriptions.chatRoomCollection, {
                    uid: state.uuid,
                    text: msg,
                    createdAt: serverTimestamp(),
                    view: false,
                })
                updateDoc(FB_subscriptions.chatRoomRef, {
                    archived: [],
                    count: increment(1),
                    updatedAt: serverTimestamp(),
                    lastMessage: msg,
                    updated: serverTimestamp(),
                    ['read_' + state.uuid]: increment(1),
                })
            }
        },
        logOut(state) {
            state = initialState
            if (FB_subscriptions.chatRoomSubscription)
                FB_subscriptions.chatRoomSubscription() //unsubscribe;
            if (FB_subscriptions.chatRoomDataSubscription)
                FB_subscriptions.chatRoomDataSubscription() //unsubscribe;
            if (FB_subscriptions.chatsSubscription)
                FB_subscriptions.chatsSubscription() //unsubscribe;
        },
    },
})

export const {
    logIn,
    logOut,
    setAuthenticating,
    setLoggedIn,
    toggleOpen,
    setOpen,
    closeChat,
    sendMessage,
    chatRoomMessageNew,
    chatRoomMessageView,
    chatRoomScroll,
    setUserCache,
    setAdCache,
} = chatsReducer.actions

const chatsAuthenticate = (uuid) => async (dispatch) => {
    dispatch(chatsReducer.actions.setAuthenticating(uuid))
    const credentials = await signInAnonymously(FB_auth)
    console.log('chatsAuthenticate', uuid)
    dispatch(setLoggedIn())
    FB_subscriptions.chatsQuery = query(
        FB_chatsCollection,
        where('parts', 'array-contains-any', [uuid]),
        orderBy('updatedAt', 'desc'),
        limit(100),
    )
    if (FB_subscriptions.chatsSubscription) FB_subscriptions.chatsSubscription() //unsubscribe;
    FB_subscriptions.chatsSubscription = onSnapshot(
        FB_subscriptions.chatsQuery,
        (querySnapshot) => {
            dispatch(
                chatsReducer.actions.onChatsUpdate(
                    FB_chatsSerialize(querySnapshot),
                ),
            )
        },
    )
}

const chatsOpenChat = (chatId: IChatId | false) => async (dispatch) => {
    dispatch(setOpen(true))
    if (FB_subscriptions.chatRoomSubscription)
        FB_subscriptions.chatRoomSubscription() //unsubscribe;
    if (FB_subscriptions.chatRoomDataSubscription)
        FB_subscriptions.chatRoomDataSubscription() //unsubscribe;
    if (chatId == false) {
        dispatch(chatsReducer.actions.closeChat())
        return
    }
    if (chatId.key) {
        FB_subscriptions.chatRoomRef = doc(FB_firestore, 'messages', chatId.key)
        FB_subscriptions.chatRoomCollection = collection(
            FB_firestore,
            'messages',
            chatId.key,
            'chatroom',
        )
        FB_subscriptions.chatRoomQuery = query(
            FB_subscriptions.chatRoomCollection,
            orderBy('createdAt', 'desc'),
            limit(500),
        )
        FB_subscriptions.chatRoomSubscription = onSnapshot(
            FB_subscriptions.chatRoomQuery,
            (querySnapshot) => {
                dispatch(
                    chatsReducer.actions.onChatRoomMessagesUpdate(
                        FB_chatRoomMessagesSerialize(querySnapshot),
                    ),
                )
            },
        )
        dispatch(chatsReducer.actions.chatRoomReset(chatId.key))
        FB_subscriptions.chatRoomDataSubscription = onSnapshot(
            FB_subscriptions.chatRoomRef,
            (chatRoomData) => {
                dispatch(
                    chatsReducer.actions.onChatRoomUpdate(
                        FB_chatSerialize(chatRoomData),
                    ),
                )
            },
        )
        const chatRoomData = await getDoc(FB_subscriptions.chatRoomRef)
        dispatch(
            chatsReducer.actions.onChatRoomUpdate(
                FB_chatSerialize(chatRoomData),
            ),
        )
    } else {
        //dispatch(chatsCreateRoom(chatId));
    }
}

const chatsCreateRoom =
    (from: string, to: string, title: string, context: IFBContext) =>
    async (dispatch) => {
        //console.log('CreateChatRoom', from, to, context)
        const contextKey = context.type + '_' + context.key
        const q = query(
            collection(FB_firestore, 'messages'),
            where('parts', 'array-contains-any', [from]),
            where('key', '==', contextKey),
        )
        const querySnapshot = await getDocs(q)
        if (querySnapshot.docs.length == 0) {
            const chatTitle = title ? title : '--empty--'
            const contextItem = context
            const newChatItem = {
                parts: [String(from), String(to)],
                from: String(from),
                to: String(to),
                context: context,
                key: contextKey,
                ['title_' + from]: chatTitle,
                ['title_' + to]: chatTitle,
                title: chatTitle,
                type: context.type,
                archived: [],
                //titleTo: title,
                updatedAt: serverTimestamp(),
                updated: false,
                //lastViewFrom: serverTimestamp(),
                //lastViewTo: false,
                createdAt: serverTimestamp(),
                count: 0,
                ['read_' + from]: 0,
                ['read_' + to]: 0,
            }
            const newCR = await addDoc(
                collection(FB_firestore, 'messages'),
                newChatItem,
            )
            dispatch(chatsOpenChat({ key: newCR.id }))
            //console.log('Created chat room', newCR.id)
        } else {
            //console.log('chat room existed', querySnapshot.docs[0].id)
            dispatch(chatsOpenChat({ key: querySnapshot.docs[0].id }))
        }
    }

export { chatsAuthenticate, chatsOpenChat, chatsCreateRoom }

export default chatsReducer.reducer
