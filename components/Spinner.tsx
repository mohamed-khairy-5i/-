
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;
