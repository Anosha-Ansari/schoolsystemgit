export default function Card({ title, action, children, className = "" }) {
  return (
    <div className={`bg-card border border-border rounded-xl2 p-5 card-hover ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-semibold text-[15px] text-ink">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
