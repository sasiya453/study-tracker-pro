import { Check } from 'lucide-react';

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: () => void;
}

const AnimatedCheckbox = ({ checked, onChange }: AnimatedCheckboxProps) => {
  return (
    <button
      onClick={onChange}
      className={`
        w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
        ${checked
          ? 'bg-primary border-primary shadow-sm shadow-primary/25'
          : 'border-border hover:border-primary/50 bg-transparent'
        }
      `}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && (
        <Check className="w-3.5 h-3.5 text-primary-foreground checkbox-tick checked" strokeWidth={3} />
      )}
    </button>
  );
};

export default AnimatedCheckbox;
