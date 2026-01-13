import React from 'react';

interface NumberDisplayProps {
  value: number;
}

const NumberDisplay = ({ value }: NumberDisplayProps) => {
  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-xl shadow-sm">
      <div className="text-center">
        <p className="text-sm font-medium text-blue-600 mb-2">Number Value</p>
        <p className="text-4xl font-bold text-blue-900">{value + 5}</p>
        <p className="text-xs text-blue-500 mt-2">Displayed as a number</p>
      </div>
    </div>
  );
};

export default NumberDisplay;
