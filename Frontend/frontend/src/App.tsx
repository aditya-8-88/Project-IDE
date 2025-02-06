import { useState } from 'react'
import CodeEditor from './component/CodeEditor'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Sun, Moon } from "lucide-react";
import { useDispatch } from 'react-redux'
import {setTheme} from "./redux/slices/Theme"


function App() {

  const [code,SetCode] = useState("")

  // now get the value for the theme 
  const theme = useSelector((state)=>state.theme.value)
  console.log(theme)

  // instance for theme
  const dispatch = useDispatch()

  // handle the ide theme
  useEffect(()=>{
      if(theme){
          document.documentElement.classList.add("dark");
      }else{
          document.documentElement.classList.remove("dark");
      }
  },[theme])

  return (
    <>
    <div className='bg-zinc-400 dark:bg-zinc-600 h-full p-10'>
      <nav className='bg-zinc-200 text-black dark:bg-zinc-800 rounded p-3 dark:text-white flex  items-center gap-5'>
        <div className=' font-semibold text-lg'>Code Editor</div>
      <button
      onClick={()=>{dispatch(setTheme())}}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white transition duration-300"
    >
      {!theme? <Sun size={20} /> : <Moon size={20} />}
    </button>
      </nav>
     <CodeEditor/>
     </div>
    </>
  )
}

export default App
