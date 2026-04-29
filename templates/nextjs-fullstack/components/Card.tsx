interface CardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Card({ title, description, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}
