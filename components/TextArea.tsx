
import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const TextArea: React.FC<TextAreaProps> = (props) => {
  return (
    <textarea
      {...props}
      className={`w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 resize-y disabled:opacity-50 disabled:cursor-not-allowed`}
    />
  );
};

export default TextArea;
