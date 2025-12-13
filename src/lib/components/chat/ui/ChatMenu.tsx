import { deleteIcon, moon, plus, sun } from '@/assets';
import { PopoverMenu } from '@lib/components/popover';
import { useChatContext } from '../context/chatContext';
import { Switch } from '@lib/components/switch';

export const ChatMenu = () => {
  const { handleClear, setTheme, theme, mode } = useChatContext();

  console.log(mode);
  return (
    <PopoverMenu
      popoverStyles={{
        position: 'absolute',
      }}
      button={
        <button type="button" className="autoui-chat-input-start">
          <img
            src={plus}
            alt="menu"
            width={20}
            height={20}
            style={{
              filter: 'var(--icon-filter-text)',
            }}
          />
        </button>
      }
      items={[
        {
          startContent: (
            <img
              src={deleteIcon}
              width={16}
              height={16}
              style={{
                filter: 'var(--icon-filter-text)',
              }}
            />
          ),
          key: 'clear',
          label: 'Clear Messages',
          onSelect: handleClear,
        },

        {
          key: 'switchTheme',
          label: (
            <Switch
              defaultChecked={theme === 'light'}
              onCheckedChange={(checked: boolean) => {
                if (checked) {
                  setTheme?.('light');
                } else {
                  setTheme?.('dark');
                }
              }}
              label="Theme mode"
              thumb={({ checked }) => (
                <>
                  {checked ? (
                    <img
                      src={sun}
                      width={14}
                      height={14}
                      style={{
                        filter: 'var(--icon-filter-accent)',
                      }}
                    />
                  ) : (
                    <img
                      src={moon}
                      width={14}
                      height={14}
                      style={{
                        filter: 'var(--icon-filter-text)',
                      }}
                    />
                  )}
                </>
              )}
            />
          ),
        },
      ]}
      closeAfterSelect={(key) => key !== 'switchTheme'}
      onSelectionChange={(key: any) => console.log('Selected:', key)}
    />
  );
};
