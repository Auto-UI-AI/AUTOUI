import type { ChatMessage, SerializedMessage } from "@lib/ui/chat/types";
import type { ResolveComponent, SetUI } from "./stepExecutor";

export const rerenderChatFromHistory = (chatHistory:SerializedMessage[], resolveComponent: ResolveComponent, setUI: SetUI,) =>{
    let messagesArray:ChatMessage[]= []
    for(let message of chatHistory){
        if(message.kind=="ui"){
            const {t} = message?.ui
            let node = t=="component"?resolveComponent(message.ui.name, message.ui.props):'unsuccessful rerender'
            node&&setUI(node)
            messagesArray.push({id:message.id, role: message.role, content: node})
        }
        if(message.kind == "text"){
            setUI(message.text) 
            messagesArray.push({id:message.id,role:message.role, content: message.text})
        } 
    }
    return messagesArray;
}