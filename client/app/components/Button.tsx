interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({ onClick, children }: ButtonProps) {
  return (
    <button onClick={onClick} className="button">
      {children}
    </button>
  );
}
