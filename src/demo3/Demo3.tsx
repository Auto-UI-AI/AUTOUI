import { TasksProvider } from './hooks/useAppFunctions';
// import Demo3App from './Demo3App';
import Tasks from './MainPage';
import TasksApp from './TasksApp';

const Demo3 = () => {
    
  return (
    
    <TasksProvider>
      <TasksApp/>
      
        {/* <Demo3App/> */}
    </TasksProvider>
  )
}

export default Demo3