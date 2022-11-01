import React from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap'
const ConfirmDelete = (props) => {
      
    const handleSubmit = (e) => {
        e.preventDefault()
        props.handleSubmit()
        props.handleClose(e)
    }
    const cancelDelete = (e) => {
        e.preventDefault()
        props.handleClose(e)
    }
  return (
    <div className='vertically-centered-modal'>
      <Modal isOpen={props.show} className='modal-dialog-centered'>
            <ModalHeader>Confirm</ModalHeader>
            <ModalBody className='my-0'>
              <h5>{props.bodyText}</h5>
            </ModalBody>
            <ModalFooter>
              <Button onClick={(e) => cancelDelete(e)} outline color="secondary">No</Button>
              <Button onClick={(e) => handleSubmit(e)} color='primary'>
                Yes
              </Button>
            </ModalFooter>
      </Modal>
    </div>
  )
}

export default ConfirmDelete