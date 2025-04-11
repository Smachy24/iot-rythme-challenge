interface CountdownDisplayProps {
  countdown: number;
}

export default function CountdownDisplay({ countdown }: CountdownDisplayProps) {
  return (
    <div className="text-4xl font-bold text-white animate-pulse">
      {countdown === 1 ? "GO!" : countdown}
    </div>
  );
}
