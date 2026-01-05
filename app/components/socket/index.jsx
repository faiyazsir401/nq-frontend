// Backward compatibility: Re-export SocketContext from SocketProvider
// This ensures existing imports continue to work
export { SocketContext } from './SocketProvider';

// Keep getSocket for backward compatibility (deprecated - use SocketContext instead)
export const getSocket = () => {
  // This is deprecated - components should use SocketContext instead
  console.warn('getSocket() is deprecated. Use SocketContext from SocketProvider instead.');
  return null;
};
