import PlayGround from './playground/PlayGround';
import DemoPage from './demo/DemoPage';
import { ModalChat } from '@lib';
import { autouiConfig } from '../autoui.config.example.ts';
import { InteractiveDemo } from './demo/DemoInteractive.tsx';
function App() {
  return (
    <>
      <DemoPage />
      {/* <InteractiveDemo /> */}
      <PlayGround />
      <ModalChat config={autouiConfig}/>
    </>
  );
}

export default App;
