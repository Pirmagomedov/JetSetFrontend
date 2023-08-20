import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Confirm = {
    title?: string
    text?: string
    confirmButton?: string
    cancelButton?: string
    onConfirm?: () => void
}

export interface IConfirmReducer extends Confirm {
    isOpen: boolean
}

const initialState: IConfirmReducer = {
    isOpen: false,
    title: '',
    text: '',
    onConfirm: null,
    confirmButton: '',
    cancelButton: '',
}

export const ConfirmReducer = createSlice({
    name: 'info',
    initialState,
    reducers: {
        closeConfirm(state) {
            state.isOpen = false
            state.text = ''
            state.title = ''
        },
        confirm(state) {
            state.onConfirm && state.onConfirm()
        },
        setConfirm: {
            reducer: (state, action: PayloadAction<Confirm>) => {
                const {
                    title = '',
                    text = '',
                    confirmButton = 'Yes',
                    cancelButton = 'Cancel',
                    onConfirm,
                } = action.payload

                state.isOpen = true
                state.title = title
                state.text = text
                state.confirmButton = confirmButton
                state.cancelButton = cancelButton
                state.onConfirm = onConfirm
            },
            prepare: (payload: Confirm) => {
                return { payload }
            },
        },
    },
})

export const { setConfirm, closeConfirm } = ConfirmReducer.actions

export default ConfirmReducer.reducer
