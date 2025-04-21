import React, { useEffect, useState } from "react";
import superadminApi from "../services/superadminApi";
import '../styles/DeleteUserModal.css'; // Import CSS for styling

export default function DeleteUserModal({ userId, rolUser, onClose, fetchUsers}) {
  
  const [messageDeleteModal, setMessageDeleteModal] = useState("");
  const [showConfirmButton, setShowConfirmButton] = useState(true);

  useEffect(() => {
    if (!userId || !rolUser) return;
    openDeleteModal();
    
  }, [userId, rolUser]);
  
  
    const handleDeleteUser = () => {
      if (rolUser === "Doctor") {
        deleteDoctor()
      }
  
      if (rolUser === "Patient") {
        deletePatient()
      }
      onClose();
    };
  
    const openDeleteModal = async() => {
      setShowConfirmButton(true)
      if (rolUser === "Doctor") {
        
        if (userId && userId === 13) {
          setMessageDeleteModal('❌ No se puede eliminar el doctor por defecto - SIN ASIGNAR');
          setShowConfirmButton(false)
          return
        }
       const { data }  = await superadminApi.get('/doctors/'+userId);
        if (data && data.patients && data.patients.length > 0) {
          setMessageDeleteModal('Este doctor tiene pacientes asignados, al eliminarlo, estos pacientes quedarán sin asignación. ¿Desea continuar?')
        }
      }
  
      if (rolUser === "Patient") {
        setMessageDeleteModal('¿Está seguro de que desea eliminar este paciente? Esta acción no se puede deshacer.')
      }

      if (rolUser === "Relative") {
        setMessageDeleteModal('❌ No es posible eliminar un familiar. Para eliminarlo, primero elimine al paciente asociado.');
        setShowConfirmButton(false)
        return
      }
      
  
    }
  
    const deleteDoctor = async () => {
      //Validar si el doctor tiene pacientes
      
      const { data }  = await superadminApi.get('/doctors/'+userId);
      if (data && data.patients && data.patients.length > 0) {
        try {
          await superadminApi.put('/patients/reassign', {
            id_doctor: userId,
          });
        } catch (err) {
          console.error('Error al reasignar pacientes:', err);
          alert('❌ Error al reasignar pacientes');
          return
        }
      }
      try {
        await superadminApi.delete('/doctor/'+userId);
        alert('Doctor borrado correctamente ✅');
        fetchUsers();
      } catch(err) {
        console.error('Error al borrar doctor:', err);
      }
          
    }
  
    const deletePatient = async () => {
      try {
        await superadminApi.delete('/patients/'+userId);
        alert('Paciente borrado correctamente ✅');
        fetchUsers();
      } catch(err) {
        console.error('Error al borrar paciente:', err);
      }
          
    }
    
      return (
        <div className="modal-overlay" onClick={onClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <span className="modal-close" onClick={onClose}>&times;</span>
          <div className="pd-header">
              Eliminar Usuario
          </div>

          <div className="modal-body">
            <section className="pd-section doctor-section">
            <p>{messageDeleteModal || 'Esta seguro de eliminar el usuario?'}</p>
            </section>
          </div>
           
          {showConfirmButton && <button className="pd-ok" onClick={() => handleDeleteUser()}>Confirmar</button>}
          <button className="pd-cancel" onClick={onClose}>Cancelar</button>
          
          </div>
        </div>
      );
    };
    