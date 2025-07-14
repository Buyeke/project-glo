
import React from 'react';

export const ChatBotStyles = () => {
  return (
    <style>{`
      .pulse-animation {
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }
    `}</style>
  );
};
