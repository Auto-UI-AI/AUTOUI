import React, { useState } from 'react'
import TaskList from './components/TaskList'
import type { TaskItemType } from './components/TaskItem';
import { TasksProvider } from './hooks/useTasksContext';
import { ModalChat } from '@lib';
import autouiDemo3Config from './autouiDemo3.config';

const Demo3 = () => {
    
  return (
    
    <TasksProvider>
        <div><TaskList/></div>
        <ModalChat config={autouiDemo3Config}/>
    </TasksProvider>
  )
}

export default Demo3