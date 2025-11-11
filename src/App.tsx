import PlayGround from './playground/PlayGround';
import DemoPage from './demo/DemoPage';
import { ModalChat } from '@lib';
import { autouiConfig } from '../autoui.config.example.ts';
import { InteractiveDemo } from './demo/DemoInteractive.tsx';
import { CartProvider } from './demo/context/CartContext.tsx';
function App() {
  return (
    <>
      <CartProvider>
        <DemoPage />
        {/* <InteractiveDemo /> */}
        <PlayGround />
        <ModalChat config={autouiConfig} />
      </CartProvider>
    </>
  );
}

export default App;
