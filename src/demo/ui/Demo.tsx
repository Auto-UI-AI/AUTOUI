import { Chat, ModalChat } from '../../lib/ui';
import { autouiConfig } from '../../../autoui.config.example';

export const Demo = () => {
  return (
    <div>
      <h3>Chat example</h3>
      <Chat config={autouiConfig} />
      <h3>ModalChat example</h3>
      <ModalChat config={autouiConfig} />
    </div>
  );
};
