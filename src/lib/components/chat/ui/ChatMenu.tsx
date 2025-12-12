import { deleteIcon, plus, settings } from '@/assets';
import { PopoverMenu } from '@lib/components/popover';
import { useChatContext } from '../context/chatContext';
import { Switch } from '@lib/components/switch';

export const ChatMenu = () => {
  const { handleClear } = useChatContext();
  return (
    <PopoverMenu
      popoverStyles={{
        position: 'absolute',
      }}
      button={
        <button type="button" className="autoui-chat-input-start">
          <img src={plus} alt="menu" width={20} height={20} />
        </button>
      }
      items={[
        {
          startContent: <img src={deleteIcon} width={16} height={16} />,
          key: 'clear',
          label: 'Clear Messages',
          onSelect: handleClear,
        },

        {
          startContent: <img src={settings} width={16} height={16} />,
          key: 'switchtheme',
          label: (
            <Switch
              thumb={({ checked }) => (
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: checked ? '#22c55e' : '#a1a1aa',
                  }}
                />
              )}
            />
          ),
        },
      ]}
      onSelectionChange={(key: any) => console.log('Selected:', key)}
    />
  );
};
