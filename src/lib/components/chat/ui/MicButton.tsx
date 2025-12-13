import { mic } from '@/assets';

export const MicButton = ({ active, onClick }: { active: boolean; onClick: () => void }) => {
  return (
    <button
      type="button"
      className={`chat-mic-btn ${active ? 'is-active' : ''}`}
      onClick={onClick}
      aria-label="Voice input"
    >
      <img
        src={mic}
        width={20}
        height={20}
        style={{
          filter: 'var(--icon-filter-text)',
        }}
      />
    </button>
  );
};
