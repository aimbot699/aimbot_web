import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface TerminalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TerminalLine {
  type: 'input' | 'output';
  content: string;
}

const TerminalDialog = ({ open, onOpenChange }: TerminalDialogProps) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<TerminalLine[]>([
    { type: 'output', content: 'Welcome to Aimbot\'s terminal. Type "help" for commands.' },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    const command = cmd.toLowerCase().trim();
    let response: string;

    switch (command) {
      case 'help':
        response = `Available commands:
  1. server  - Discord server invite
  2. about   - About me
  3. discord - My Discord
  4. clear   - Clear terminal`;
        break;
      case 'server':
        response = '🎮 Discord Server: discord.gg/NMtGzvhqJz';
        break;
      case 'about':
        response = `👤 About Me:
  Name: Aimbot
  Profession: Discord & Minecraft Developer`;
        break;
      case 'discord':
        response = '💬 Discord: @Aimbot';
        break;
      case 'clear':
        setHistory([{ type: 'output', content: 'Terminal cleared. Type "help" for commands.' }]);
        setInput('');
        return;
      default:
        response = `Command not found: "${command}". Type "help" for available commands.`;
    }

    setHistory(prev => [
      ...prev,
      { type: 'input', content: `> ${cmd}` },
      { type: 'output', content: response },
    ]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      handleCommand(input);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] glass-card border-0 text-foreground max-w-lg p-0 overflow-hidden scanlines shadow-2xl shadow-primary/20 z-[100]">
        {/* Advanced OS Header */}
        <div className="bg-[#0a0a0a] px-4 py-2 border-b border-primary/20 flex justify-between items-center bg-gradient-to-r from-background to-primary/5">
          <div className="flex items-center gap-3">
             <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-sm bg-primary/20 hover:bg-red-500/50 transition-colors" />
               <div className="w-3 h-3 rounded-sm bg-primary/20 hover:bg-yellow-500/50 transition-colors" />
               <div className="w-3 h-3 rounded-sm bg-primary/20 hover:bg-green-500/50 transition-colors" />
             </div>
             <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-primary/80 uppercase">AimbotOS v1.0.4 - Secure_Session</span>
          </div>
          <div className="flex gap-4 items-center">
             <div className="flex gap-2">
               <span className="text-[9px] text-muted-foreground font-mono">RAM: 742MB</span>
               <div className="w-12 h-2 bg-white/5 rounded-full overflow-hidden mt-0.5">
                 <div className="h-full bg-primary/40 w-[65%]" />
               </div>
             </div>
             <span className="text-[9px] text-primary animate-pulse font-mono tracking-tighter">● UPTIME: 99.9%</span>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="p-5 font-mono text-xs max-h-80 overflow-y-auto space-y-2 bg-[#050505]/95 selection:bg-primary/30"
        >
          {history.map((line, index) => (
            <div 
              key={index} 
              className={line.type === 'input' ? 'text-primary' : 'text-muted-foreground/90 whitespace-pre-wrap pl-2 border-l border-primary/10'}
            >
              {line.content}
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <span className="text-primary font-bold">aimbot@system:~#</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-foreground font-mono caret-primary"
              placeholder="_"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="bg-background/20 px-4 py-1.5 border-t border-border/20 flex justify-between">
           <span className="text-[9px] text-muted-foreground/30 font-mono">ENCRYPTION: AES-256</span>
           <span className="text-[9px] text-muted-foreground/30 font-mono italic">connection_stable</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TerminalDialog;
