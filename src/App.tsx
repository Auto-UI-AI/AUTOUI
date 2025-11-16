import PlayGround from './playground/PlayGround';
import DemoPage from './demo/DemoPage';
import { ModalChat } from '@lib';
import { autouiConfig } from '../autoui.config.example.ts';
function App() {
  return (
    <>
      <DemoPage />
      <PlayGround />
      <ModalChat config={autouiConfig}/>
    </>
  );
}

export default App;
