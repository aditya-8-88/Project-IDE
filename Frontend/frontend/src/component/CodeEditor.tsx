import React, { useEffect, useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { useSelector,useDispatch } from 'react-redux'

import { setCode } from "../redux/slices/Codeslice";
import axios from 'axios';


function CodeEditor() {

    // now get the value for the theme 
    const theme = useSelector((state)=>state.theme.value)

    // get the code stored from the redux store
    const code = useSelector((state)=>state.code.value)

    // instacnce for dispatch
    const dispatch = useDispatch()

    // debounce function for performance optimization
    // this fun is added in both editor the run button for optimization
    const debounce = (fn,delay:number)=>{
        let time;
        return (...args)=>{
            clearTimeout(time);
            time=setTimeout(()=>{
                fn(...args)
            },delay)
        }
    }

    // now handel the useState
    const [editorTheme,setEditorTheme]=useState("vs-dark")
    const [languages,setLanguages]=useState("c++")
    const[output,Setoutput]=useState("No output")
    const language=["java","python","c++","javascript","rust"]

    console.log(code.value,"hello from code ")

    // now handel the function for the
    const callApi=async()=>{
        await axios.post("http://localhost:8000/api/execute/",{languages,code}).then((res)=>{
            Setoutput(res.data)
        }).catch((err)=>{
            alert(err)
        })
    }
    // now on button click the api will call after 500ms and constant api aor fake api calls will reduced
    const handleRun = debounce(callApi,500)

    // handle the ide theme
    useEffect(()=>{
        if(theme){
            document.documentElement.classList.add("dark");
        }else{
            document.documentElement.classList.remove("dark");
        }
    },[theme])

  return (
    <div>
        <div>
            <nav className=' bg-zinc-300 dark:bg-zinc-900 p-3 flex  justify-start gap-5'>
                <select name="language" onChange={()=>setLanguages(event?.target.value)} className='bg-zinc-300 dark:bg-zinc-900 dark:text-white'>
                    {language.map((elem,index)=>{
                        return (<option value={elem} key={index} className='bg-zinc-300 dark:bg-zinc-900'> {elem}</option>)
                    })}
                </select>
                <select name="theme"  onChange={()=>{setEditorTheme(event.target.value)}}  className='bg-zinc-300 dark:bg-zinc-900 dark:text-white'>
                    <option value="vs-dark"  className='bg-zinc-300 dark:bg-zinc-900'>vs-dark</option>
                    <option value="vs-light"   className='bg-zinc-300 dark:bg-zinc-900'>vs-light</option>
                </select>
              
                <button onClick={handleRun} className=' text-black border-2 px-2 hover:bg-white dark:hover:bg-zinc-800 rounded border-zinc-800 dark:text-white bg-zinc-300 dark:bg-zinc-900'> Run</button>
                
            </nav>
        </div>
      <Editor
      language='javascript'
      defaultLanguage='javascript'
      height="400px"
      theme={editorTheme}
      value={code.value}
      onChange={debounce((value)=>{
        const payload={
            value
        }
        dispatch(setCode(payload))
      },1000)}
      />
      <div className=' bg-zinc-200 text-black dark:bg-zinc-800 rounded p-3 dark:text-white   gap-5'>
        <span className='bg-zinc-800 text-white dark:bg-zinc-400 rounded p-1 dark:text-black'>
            Output Terminal
        </span>      
      <div className=' h-[200px] bg-zinc-200 text-black dark:bg-zinc-800 rounded p-3 dark:text-white overflow-auto flex items-start  gap-5'>
        
        {output}
      </div>
      </div>
    </div>
  )
}

export default CodeEditor

