import React, { useState, type FormEvent } from 'react'
import { getInstructionPlan } from '../lib/core/llmClient'
import { autouiConfig } from '../../autoui.config.example'

const PlayGround = () => {
    const [input, setInput ] = useState('')
    const onSend = async (e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        let response = await getInstructionPlan(input, autouiConfig)
        console.log("response: ",response)
    }

  return (
    <div>
        <form onSubmit={(e)=>onSend(e)}>
            <input type="text" value={input} onChange={(e)=>setInput(e.target.value)} />
        </form>
        
    </div>

  )
}

export default PlayGround