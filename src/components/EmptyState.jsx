import { useNavigate } from 'react-router-dom';

/**
 * Professional empty state component
 * Provides clear user guidance when no data is available
 */
function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  actionPath,
  secondaryActionLabel,
  onSecondaryAction,
  showAction = true
}) {
  const navigate = useNavigate();

  const handlePrimaryAction = () => {
    if (onAction) {
      onAction();
    } else if (actionPath) {
      navigate(actionPath);
    }
  };

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        {icon || (
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      
      <div className="space-y-3">
        <h3 className="empty-state-title">{title}</h3>
        {description && <p className="empty-state-description">{description}</p>}
      </div>

      {showAction && (
        <div className="flex flex-col sm:flex-row gap-3">
          {actionLabel && (
            <button onClick={handlePrimaryAction} className="btn-primary !px-8">
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button onClick={onSecondaryAction} className="btn-secondary !px-8">
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
