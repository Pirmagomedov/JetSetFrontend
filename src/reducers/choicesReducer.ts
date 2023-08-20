import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Choices } from './../generated/graphql'

export interface IChoicesReducer {
    choices: Choices
}

const initialState: IChoicesReducer = {
    choices: {},
}

export const choicesReducer = createSlice({
    name: 'choices',
    initialState,
    reducers: {
        setChoices(state, action: PayloadAction<Choices>) {
            state.choices = action.payload
        },
    },
})

export const { setChoices } = choicesReducer.actions

export default choicesReducer.reducer
