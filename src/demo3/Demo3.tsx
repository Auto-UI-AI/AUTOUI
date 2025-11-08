import { TasksProvider } from './hooks/useAppFunctions';
import Demo3App from './Demo3App';

const Demo3 = () => {
    
  return (
    
    <TasksProvider>
        <Demo3App/>
    </TasksProvider>
  )
}

export default Demo3