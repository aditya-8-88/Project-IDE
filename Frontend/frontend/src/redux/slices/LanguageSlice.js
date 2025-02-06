import { createSlice } from "@reduxjs/toolkit";
import { languages } from "monaco-editor";

export const LanguageSlice = createSlice({
    name:"Languages",
    initialState:{
        value:"javascript"
    },
    reducers:{
        setLanguage:(state,action)=>{
            state.value=action.payload
        }
    }
})

export const {setLanguage} = LanguageSlice.actions

export default LanguageSlice.reducer