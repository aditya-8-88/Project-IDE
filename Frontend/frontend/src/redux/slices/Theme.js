import { createSlice } from "@reduxjs/toolkit";

export const ThemeSlice = createSlice({
    name:"theme",
    initialState:{
        value:true
    },
    reducers:{
        setTheme:state=>{
            state.value=!state.value
        }
    }

})

export const {setTheme} = ThemeSlice.actions

export default ThemeSlice.reducer