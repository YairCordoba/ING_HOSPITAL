import '../styles/DeleteUserModal.css'; // Import CSS for styling

export default function DeleteUserModal({  isOpen, title, message, onConfirm, onCancel, onClose}) {

      if (!isOpen) return null;
    
      return (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{title || 'Eliminar Usuario'}</h2>
            <p>{message || 'Esta seguro de eliminar el usuario?'}</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={onConfirm}>Confirmar</button>
              <button className="cancel-btn" onClick={onCancel}>Cancelar</button>
            </div>
          </div>
        </div>
      );
    };
    