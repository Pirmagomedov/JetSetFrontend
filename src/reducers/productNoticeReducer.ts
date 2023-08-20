import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ProductNotice = {
    image: string
    title: string
    text: string
    btnText?: string
    onClose?: () => void
    onClick?: () => void
}

export interface IProductNoticeReducer extends ProductNotice {
    isOpen: boolean
}

const initialState: IProductNoticeReducer = {
    image: '',
    title: '',
    text: '',
    btnText: '',
    isOpen: false,
    onClose: null,
    onClick: null,
}

export const productNoticeReducer = createSlice({
    name: 'productNotice',
    initialState,
    reducers: {
        noticeClose(state) {
            state.isOpen = false
            state.image = ''
            state.text = ''
            state.title = ''
            state.onClose && state.onClose()
        },
        noticeConfirm(state) {
            state.onClick && state.onClick()
        },
        setProductNotice: {
            reducer: (state, action: PayloadAction<ProductNotice>) => {
                const {
                    image = '',
                    title = '',
                    text = '',
                    btnText = 'Compare',
                    onClose,
                    onClick,
                } = action.payload
                state.image = image
                state.title = title
                state.text = text
                state.btnText = btnText
                state.isOpen = true
                state.onClose = onClose
                state.onClick = onClick
            },
            prepare: (payload: ProductNotice) => {
                return { payload }
            },
        },
    },
})

export const { setProductNotice, noticeClose, noticeConfirm } =
    productNoticeReducer.actions

export default productNoticeReducer.reducer
