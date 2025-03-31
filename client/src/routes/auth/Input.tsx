import React, { ChangeEvent } from 'react';

interface InputProps {
  name?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

// Input

const Input: React.FC<InputProps> = ({ name, type = 'text', placeholder, className = '', value, onChange }) => {
  return (
    <div className={`flex items-center border border-neutral-600 py-2 rounded-md mb-4 bg-neutral-800 ${className}`}>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="pl-2 outline-none border-none bg-neutral-800 w-full"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default Input;
