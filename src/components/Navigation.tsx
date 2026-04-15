import { Terminal } from 'lucide-react';

interface NavigationProps {
  activeTab: 'home' | 'projects' | 'contact';
  onTabChange: (tab: 'home' | 'projects' | 'contact') => void;
  onHelpClick: () => void;
}

const Navigation = ({ activeTab, onTabChange, onHelpClick }: NavigationProps) => {
  const tabs: Array<'home' | 'projects' | 'contact'> = ['home', 'projects', 'contact'];

  return (
    <div className="flex justify-between p-2 border-b" style={{ borderColor: 'hsl(240 4% 20% / 0.3)' }}>
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`nav-tab ${activeTab === tab ? 'nav-tab-active' : 'nav-tab-inactive'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <button
        onClick={onHelpClick}
        className="flex items-center gap-2 px-3 py-1 text-[10px] text-muted-foreground/70 hover:text-primary hover:bg-white/5 rounded-md transition-all duration-300 font-mono group"
      >
        <Terminal size={12} className="group-hover:animate-pulse" />
        <span className="tracking-widest uppercase">system_info.sh</span>
      </button>
    </div>
  );
};

export default Navigation;
