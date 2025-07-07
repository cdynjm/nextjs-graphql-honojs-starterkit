// components/TypingIndicator.tsx
export default function TypingIndicator() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0s]"></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
    </div>
  );
}