import PlayGround from './playground/PlayGround';
import DemoPage from './demo/DemoPage';
import { ModalChat } from '@lib';
import { autouiConfig } from '../autoui.config.example.ts';
import Demo3 from './demo3/Demo3.tsx';
function App() {
  return (
    <>
      {/* <DemoPage /> */}
      {/* <PlayGround /> */}
      {/* <ModalChat config={autouiConfig}/> */}
      <Demo3/>
    </>
  );
}

export default App;
