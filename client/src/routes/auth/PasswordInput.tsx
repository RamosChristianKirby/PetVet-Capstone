import React, { useState } from 'react';
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  placeholder?: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// PasswordInput Component - a controlled input component for password fields.

const PasswordInput: React.FC<PasswordInputProps> = ({ placeholder, name, value, onChange }) => {
  const [passwordShown, setPasswordShown] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  return (
    <div className="flex items-center border border-neutral-600 py-2 rounded-md mb-4 bg-neutral-800 relative">
      <input
        name={name}
        type={passwordShown ? 'text' : 'password'}
        placeholder={placeholder}
        className="pl-2 pr-10 outline-none border-none bg-neutral-800 w-full"
        value={value}
        onChange={onChange}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {passwordShown ? (
          <EyeOff className="cursor-pointer text-white w-4 h-4" onClick={togglePasswordVisibility} />
        ) : (
          <Eye className="cursor-pointer text-white w-4 h-4" onClick={togglePasswordVisibility} />
        )}
      </div>
    </div>
  );
};

export default PasswordInput;
