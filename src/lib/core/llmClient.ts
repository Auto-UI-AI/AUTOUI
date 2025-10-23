import { autouiConfig } from "../../../autoui.config.example";
import type { AutoUIConfig } from "../types";
import type { InstructionPlan } from "../types/llmTypes";

export const getInstructionPlan = async (userMessage:string, config: AutoUIConfig):Promise<InstructionPlan> =>{
    // console.log(JSON.stringify(autouiConfig))
    console.log(userMessage)
    console.log(config)
    return Promise.resolve({
    "type": "sequence",
    "steps": [
        { "type": "text", "text": "Here is the list of items:" },
        { "type": "component", "name": "ItemList", "props": { "items": ["A","B"] }},
        { "type": "text", "text": "Did any of these catch your eye?" }
    ]
    })
}