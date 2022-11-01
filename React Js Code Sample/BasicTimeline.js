import { Fragment, useState, useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { useParams } from 'react-router-dom'
import Avatar from "@components/avatar"
import { toast, Slide } from 'react-toastify'
import Toast from '@src/commoncomponent/Toast'
const fileImage = require('@src/assets/images/icons/file.png').default

// ** use formik
import { useFormik } from 'formik'
import * as Yup from 'yup'

import base64 from 'base-64'

// ** Custom Components
import Timeline from '@components/timeline'
import CustomFileUploader from '../../commoncomponent/CustomFileUploader'

import ConfirmDelete from '../../commoncomponent/ConfirmDelete'

// ** Reactstrap Imports
import { Button, Card, CardBody, CardHeader, Modal, ModalHeader, ModalBody, Form, Row, Col, Label, Input, FormFeedback, Spinner, CardImg, UncontrolledTooltip } from 'reactstrap'

// ** Store 
import { getStaffListUsingName, saveNoteForUser, getUserNote, deleteNote } from "./store"

// ** Timeline Data
import { MentionsInput, Mention } from 'react-mentions'
import { autoMention, swapTags, getUserRoleName } from '@src/configs/function'
import { Edit3, Trash2, X } from 'react-feather'
import moment from 'moment'

const BasicTimeline = ({note_for}) => {

  const dispatch = useDispatch()

  const params = useParams()
  const currentUser = (params && params.userId) ? params.userId : params.clientID

  // ** States
  const [addingNewNote, setAddingNewNote] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingItem, setDeletingItem] = useState(0)
  const [note, setNote] = useState('')
  const [editingNoteId, setEditingNoteId] = useState(0)

  // Getting staffs list
  useEffect(() => {
    dispatch(getStaffListUsingName({
      keywords: ''
    }))
    dispatch(getUserNote({user_id: base64.decode(currentUser), note_for}))
  }, [dispatch])

  // ** Auth User
  const authUser = useSelector(state => state.auth.userData)

  // ** Stores data using state selector 
  const mentionStaffList = useSelector(state => state.notes.staff)

  // saving notes to DB
  const saveNote = async (values, formik) => {
    const formData = new FormData()
    if (editingNoteId !== 0) {
      formData.append('noteId', editingNoteId)
    } 
    formData.append('note', values.note)
    formData.append('noteTitle', values.noteTitle)
    formData.append('files', JSON.stringify(values.files))
    formData.append('mentions', JSON.stringify(values.mentions))
    formData.append('user_id', base64.decode(currentUser))
    formData.append('note_for', note_for)
    const responseData = await dispatch(saveNoteForUser(formData))
    if (responseData.payload.status === true) {
      const message = responseData.payload.message
      const status = 'success'
      toast.success(
        <Toast message={message} status={status} />,
        { icon: true, transition: Slide, hideProgressBar: true, autoClose: 2000, position: toast.POSITION.TOP_CENTER }
      )

      // Dispatch for get notes 
      formik.resetForm()
      setNote('')
      setAddingNewNote(false)
      dispatch(getUserNote({user_id: base64.decode(currentUser), note_for}))

    } else {
      const message = responseData.payload.message
      const status = 'error'
      toast.error(
        <Toast message={message} status={status} />,
        { icon: true, transition: Slide, hideProgressBar: true, autoClose: 2000, position: toast.POSITION.TOP_CENTER }
      )
    }
    
  }

  const formik = useFormik({
    initialValues: {
      noteTitle: '',
      note: '',
      files: [],
      mentions: []
    },
    validationSchema: Yup.object({
      noteTitle: Yup.string(),
      note: Yup.string().required('Required Field'),
      files: Yup.array(),
      mentions: Yup.array()
    }),
    onSubmit: values => {
      saveNote(values, formik)
    }
  })

  const handleFileUpload = (result) => {
    setUploadingFiles(false)
    if (result.status) formik.setFieldValue('files', [...formik.values.files, ...result.data])
  }
  
  const handleLoader = (result) => {
    setUploadingFiles(result)
  }

  const handleNoteChange = (e, newValue, newPLainTextValue, mentions) => {
    setNote(newValue)
    formik.setFieldValue('note', newValue)
    formik.setFieldValue('mentions', mentions)
  }
  
  const drawFilesList = (file, viewOnly) => {
    let srcImg = file
    let extension = srcImg.split('.').pop()
    extension = extension ? extension.toLowerCase() : extension
    if (!('jpg|jpeg|png|gif'.includes(extension))) {
      // Check for pdf
      srcImg = fileImage
    }
    return (<Col xl='2' md='3' key={file} outline="true" className={'mb-2'}>
      <Card className=' border-primary shadow position-relative mb-0'>
        <CardImg top src={srcImg} alt='card-top' width='100' height={150} />
        {!viewOnly && <Avatar color='primary' onClick={() => formik.setFieldValue('files', formik.values.files.filter(item => item !== file))} size="sm" className="position-absolute top-0 start-100 translate-middle" icon={<X size={14} />} /> }
      </Card>
    </Col>)

  }

  const deleteNoteItem = (item) => {
    const note_id = item.id
    setDeletingItem(note_id)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (deletingItem === 0) return
    const responseData = await dispatch(deleteNote(deletingItem))
    if (responseData && responseData.payload && responseData.payload.status === true) {
      const message = responseData.payload.message
      const status = 'success'
      toast.success(
        <Toast message={message} status={status} />,
        { icon: true, transition: Slide, hideProgressBar: true, autoClose: 2000, position: toast.POSITION.TOP_CENTER }
      )
      setDeletingItem(0)
      dispatch(getUserNote({user_id: base64.decode(currentUser), note_for}))
    } else {
      const message = (responseData && responseData.payload && responseData.payload.message) ? responseData.payload.message : 'We are facing some technical issue. Please try again later.'
      const status = 'error'
      toast.error(
        <Toast message={message} status={status} />,
        { icon: true, transition: Slide, hideProgressBar: true, autoClose: 2000, position: toast.POSITION.TOP_CENTER }
      )
    }
  }
  
  const editNoteItem = (item) => {

    // Set formik values
    formik.setFieldValue('noteId', item.id)
    formik.setFieldValue('noteTitle', item.note_title)
    formik.setFieldValue('note', item.notes)
    const files = item.media.map(item => item.document_url)
    formik.setFieldValue('files', files)
    formik.setFieldValue('mentions', JSON.parse(item.mentions))
    setNote(item.notes)

    setEditingNoteId(item.id)
    setAddingNewNote(true)

  }

  const getNoteActions = (item) => {
    if (item.created_by === authUser.id && item.id) {
      return (<span className="">
          <Edit3 role="button" onClick={() => editNoteItem(item)} className="me-1 text-primary" size={18} id={`info-tooltip-edit-${item.id}`} />
          <UncontrolledTooltip placement='top' target={`info-tooltip-edit-${item.id}`}>
            Edit Note
          </UncontrolledTooltip>
          <Trash2 role="button" onClick={() => deleteNoteItem(item)} className="text-danger" size={17} id={`info-tooltip-delete-${item.id}`} />
          <UncontrolledTooltip placement='top' target={`info-tooltip-delete-${item.id}`}>
            Delete Note
          </UncontrolledTooltip>
        </span>)
    }
  }

  let notes = useSelector(state => state.notes.notes)
  notes = notes.map((item) => {
    const create_by_name = item.created_by_first_name + (item.created_by_last_name ? ` ${item.created_by_last_name}` : '')
    // const created_by_role_name = item.created_by_role_name
    const created_by_role_name = getUserRoleName(item)
    return {
        // title: item.note_title,
        // content: item.notes,
        title: swapTags(item.notes),
        action: getNoteActions(item),
        meta: moment(item.created_on, "YYYY-MM-DD h:m:s").format("DD MMM, YYYY"), //'25 May, 2022'
        customContent: (
          <div>
            <div className='d-flex align-items-center'>
            <Col xs={12} md={12}>
              <Row>
                { item && item.media && item.media.map(i => drawFilesList(i.document_url, true)) }
              </Row>
            </Col>
            </div>
            <div className='d-flex align-items-center'>
              { item.created_by_profile_image ? <Avatar img={item.created_by_profile_image} imgHeight='38' imgWidth='38' /> : <Avatar initials content={create_by_name} imgHeight='38' imgWidth='38' /> }
              <div className='ms-50'>
                <h6 className='mb-0'>{create_by_name}</h6>
                <span>{created_by_role_name}</span>
              </div>
            </div>
          </div>
        )
      }
  })

  const handleClose = () => {
    setShowDeleteModal(false)
  }
  
  const handleEditSubmit = () => {
    setShowDeleteModal(false)
    confirmDelete()
  }
  
  const noNotesAvailable = () => (<p className="text-center">No Notes Found!</p>)

  const handleAddNote = (saveToDb = false) => {
    if (saveToDb && formik.values.note !== '') {
      formik.handleSubmit()
    } else {
      setEditingNoteId(0)
      formik.resetForm()
      setNote('')
      setAddingNewNote(!addingNewNote)
    }
  } 

  return (
    <Fragment>
      {/* Modal for add / update */}
      <Modal
        isOpen={addingNewNote}
        toggle={!uploadingFiles ? (() => handleAddNote(true)) : null}
        className={'modal-dialog-centered modal-lg'}
      >
        <ModalHeader toggle={!uploadingFiles ? (() => handleAddNote(true)) : null}>
          {editingNoteId !== 0 ? `Edit Note` : `Add New Note`}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Row className='gy-1 gx-2'>
              <Col xs={12} md={12} className="d-none">
                <Label className='form-label' for='noteTitle'>
                  Title
                </Label>
                <Input id='noteTitle' name='noteTitle' value={formik.values.noteTitle} onChange={formik.handleChange} className={`form-control ${formik.errors.noteTitle && formik.touched.noteTitle && "border-danger"}`} />
                {formik.errors.noteTitle && formik.touched.noteTitle && <FormFeedback className='d-block' >{formik.errors.noteTitle}</FormFeedback>}
              </Col>
              <Col xs={12} md={12}>
                <Label className='form-label mb-0' for='note'>
                  Your Note
                </Label>
                  <MentionsInput
                    type="textarea"
                    name="content"
                    value={note}
                    placeholder="Comment"
                    markup='@__id__||__display__'
                    onChange={handleNoteChange}
                    allowSpaceInQuery={true}
                    className={`form-control ${formik.errors.note && formik.touched.note && "border-danger"}`}
                  >
                  <Mention
                    trigger="@"
                    data={autoMention(mentionStaffList)}
                    displayTransform={(id, display) => `@${display}`}
                    appendSpaceOnAdd={true}
                  />
                </MentionsInput>
                {/* <Input id='note' name='note' type='textarea' rows="7" value={formik.values.note} onChange={formik.handleChange} className={`form-control ${formik.errors.note && formik.touched.note && "border-danger"}`} /> */}
                {formik.errors.note && formik.touched.note && <FormFeedback className='d-block' >{formik.errors.note}</FormFeedback>}
              </Col>
              <Col xs={12} md={12}>
                <div className="position-relative">
                  { uploadingFiles && <div className={'position-absolute h-100 w-100 d-flex align-items-center justify-content-center bg-light' }>
                    <div className="text-center">
                      <Spinner color='secondary' />
                      <div className="text-center">
                        Uploading. Please wait...
                      </div>
                    </div>
                  </div> }
                  <CustomFileUploader height='150px' path="notes/media" handleFileUpload={handleFileUpload} handleLoader={handleLoader} />
                </div>
              </Col>
              <Col xs={12} md={12}>
                <Row>
                  {formik && formik.values && formik.values.files.map(i => drawFilesList(i, false))}
                </Row>
              </Col>
              <Col className='text-end d-none' xs={12}>
                <Button type='submit' disabled={!!uploadingFiles} className='my-2' color='primary'>
                  Save Note
                </Button>
              </Col>
            </Row>
          </Form>
        </ModalBody>
      </Modal>

      {/* Body */}
      <Card>
        <CardHeader className="mb-1 ms-auto">
          <Button type='button' onClick={handleAddNote} className='' color='primary'>
            Add New Note
          </Button>
        </CardHeader>
        <CardBody>
          {(notes && notes.length) ? <Timeline data={notes} /> : noNotesAvailable() }
        </CardBody>
      </Card>
      {showDeleteModal ? <ConfirmDelete  show={showDeleteModal} handleClose={handleClose} handleSubmit={handleEditSubmit} bodyText="Are you sure, you want to remove this note?" /> : null}
    </Fragment>
  )
}

export default BasicTimeline
