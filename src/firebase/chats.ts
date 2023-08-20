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
}

export interface IFBChatMessage {
    key: string
    created?: string
    text?: string
    uid?: string
    //view?: boolean
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
