import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { ipcRenderer } from 'electron';
import { Payload } from '../../main/terminal-service';
import '@xterm/xterm/css/xterm.css';

const isDev = process.env.NODE_ENV === 'development';

export const Terminal = () => {
  const [ship, setShip] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    ipcRenderer.on('ship', (e, data) => {
      isDev && console.log('receiving ship', data);
      setShip(data);
    })
  }, []);

  useEffect(() => {
    if (!ship || !terminalRef.current) {
      return;
    }

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;

    const terminal = new XTerminal({
      cursorStyle: 'underline',
      cursorBlink: true,
      fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace',
      lineHeight: 1.2,
      theme: {
        background: '#000000',
      }
    });

    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    xtermRef.current = terminal;

    fitAddon.fit();

    terminal.onData((data) => {
      ipcRenderer.send('terminal-keystroke', { ship, data });
    });

    const write = (_event: any, { ship: incomingShip, data }: Payload) => {
      if (ship !== incomingShip) return;
      terminal.write(data);
    };

    const fitTerm = () => fitAddon.fit();

    ipcRenderer.on('terminal-incoming', write);
    window.addEventListener('resize', fitTerm);

    isDev && console.log('sending terminal loaded')
    ipcRenderer.send('terminal-loaded', ship);

    return () => {
      ipcRenderer.removeListener('terminal-incoming', write);
      window.removeEventListener('resize', fitTerm);
      terminal.dispose();
    }
  }, [ship])

  return (
    <div ref={terminalRef} className="h-full p-2 bg-black" />
  )
}
