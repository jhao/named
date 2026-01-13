import React from 'react';

interface Props {
  message: string;
}

const LoadingOverlay: React.FC<Props> = ({ message }) => {
  return (
    <div className="fixed inset-0 bg-stone-900 bg-opacity-50 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
      <div className="bg-paper p-8 rounded-2xl shadow-2xl border-2 border-gold flex flex-col items-center max-w-sm text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-stone-200 border-t-cinnabar mb-4"></div>
        <h3 className="text-xl font-serif text-ink mb-2">天机推演中</h3>
        <p className="text-stone-500 text-sm animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;