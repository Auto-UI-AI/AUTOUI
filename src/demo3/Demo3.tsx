import { TasksProvider } from './hooks/useAppFunctions';
import Demo3App from './Demo3App';
import Tasks from './MainPage';

const Demo3 = () => {
    
  return (
    
    <TasksProvider>
      <Tasks/>
        {/* <Demo3App/> */}
    </TasksProvider>
  )
}

export default Demo3