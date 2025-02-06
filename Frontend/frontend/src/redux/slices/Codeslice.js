import { createSlice } from "@reduxjs/toolkit";

export const CodeSlice = createSlice({
    name:"code",
    initialState:{
        value:"// write code here..."
    },
    reducers:{
        setCode:(state,action)=>{

            state.value=action.payload
        }
    }
})

export const {setCode} = CodeSlice.actions

export default CodeSlice.reducer