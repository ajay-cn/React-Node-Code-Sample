// ** React Imports
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
// ** Third Party Components
import Select, { createFilter } from 'react-select'
import Cleave from 'cleave.js/react'
import 'cleave.js/dist/addons/cleave-phone.us'
import Flatpickr from 'react-flatpickr'
import "flatpickr/dist/themes/material_green.css"
// ** Store & Actions
import { updateContractorPersonalInfo/* , addNewCandidate */, getUpdateContractorInfo } from '../../store'

import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

// ** Custom Components
import Avatar from '@components/avatar'

// ** Reactstrap Imports
import { Row, Col, Form, Card, Input, Label, Button, CardBody, CardTitle, CardHeader, CardImg, FormFeedback, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'

// ** Utils
import { selectThemeColors } from '@utils'

import { useFormik } from 'formik'
import * as Yup from 'yup'
import { getExtensionFromFile, isEmpty, ImageCropFailedMessage } from '@configs/function'
import { contractorStatusOptions, genderOptions } from '@configs/constants'

import { useDispatch, useSelector } from 'react-redux'
import { Slide, toast } from 'react-toastify'
import Toast from '../../../../commoncomponent/Toast'
import { useHistory, useParams } from 'react-router-dom'
import { decode, encode } from "base-64"

import ReactCountryFlag from 'react-country-flag'
import { useDropzone } from 'react-dropzone'

const PersonalInfo = (userInfo) => {
  // ** Other Vars
  const URL = /^((https?|ftp):\/\/)?(www.)?(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
  // ** Store Vars
  const contractor = useSelector(state => state.contractors.data)
  const countries = useSelector(state => state.contractors.countries)
  const userRole = useSelector(state => state.contractors.userRole)
  const user = useSelector(state => state.auth.userData)
  const departments = useSelector(state => state.contractors.departments)
  // ** States
  const avatarImage = require('@src/assets/images/avatars/user.png').default
  const [avatar, setAvatar] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [invalidFile, setImageUploadError] = useState('')

  // ** State for saving added Image
  const [modalOpened, setModal] = useState(null)
  // ** for Image cropper 
  const [imgSrcToCrop, setImgSrcToCrop] = useState('')
  const [cropRatio, setCropRatio] = useState({
    unit: 'px',
    x: 5,
    y: 5,
    width: 100,
    height: 100
  })
  const [completedCrop, setCompletedCrop] = useState(null)
  // Routes Vars
  const { userType } = useParams()
  let { userId } = useParams()
  const history = useHistory()

  const getCountryFlagWithName = (option) => {
    return (
      <div>
        <ReactCountryFlag style={{ fontSize: '1.2em', lineHeight: '1em' }} countryCode={(option.code).toLowerCase()} svg />
        <span className='ms-1'>{option.name}</span>
      </div>
    )
  }
  const getCountryFlagWithPhoneCode = (option) => {
    return (
      <div>
        <ReactCountryFlag style={{ fontSize: '1em', lineHeight: '1em' }} countryCode={(option.code).toLowerCase()} svg />
        <small className='ms-1'>+{option.phonecode}</small>
      </div>
    )
  }

  // React Select Options
  const dispatch = useDispatch()

  // Function to get countries options for react-select
  const countryOptions = (countries) => {
    const countryValues = []
    countries.map((option) => {
      const flag = getCountryFlagWithName(option)
      countryValues.push({
        value: option.id,
        name: option.name,
        label: flag
      })
    })
    return countryValues
  }
  const countryCodeOptions = (countries) => {
    let countryValues = []
    countries.map((option) => {
      const flag = getCountryFlagWithPhoneCode(option)
      countryValues.push({
        value: option.id,
        phonecode: option.phonecode.trim(),
        label: flag
      })
    })
    countryValues = countryValues.sort((a, b) => ((a.phonecode > b.phonecode) ? 1 : ((b.phonecode > a.phonecode) ? -1 : 0)))
    return countryValues
  }

  const filterConfigCountryCode = {
    stringify: option => `+${option.data.phonecode}`,
    matchFrom: 'start'
  }

  // Function to filter react-select
  const filterConfig = {
    stringify: option => `${option.data.name}`,
    matchFrom: 'start'
  }
  const departmentOptions = departments.map(department => ({ value: department.id, label: department.name }))

  useEffect(() => {
    dispatch(getUpdateContractorInfo(userInfo.userRole))
  }, [])

  // function to upload file using image -cropper
  const handleFileUpload = async (e) => {
    const imageFile = e
    if (imageFile) {
      const fileSize = imageFile.size
      const fileName = imageFile.name
      const extension = getExtensionFromFile(fileName)
      if (fileSize > 2000000) {
        setImageUploadError('Maximum file size 2MB for uploading.')
        setAvatar(avatar)
      } else if (!extension.match(/\.(jpg|jpeg|png|PNG|JPG)$/)) {
        setImageUploadError('Please select valid file.')
        setAvatar(avatar)
      } else {

        // Open cropper and crop the image
        const myFileItemReader = new FileReader()

        myFileItemReader.addEventListener("load", () => {
          // console.log(myFileItemReader.result)
          const myResult = myFileItemReader.result
          setImgSrcToCrop(myResult)
          // setAddedFileToCropExt(myResult.substring('data:image/'.length, myResult.indexOf('base64')))
          setModal(true)

        }, false)

        myFileItemReader.readAsDataURL(imageFile)

      }
    } else {
      setImageUploadError('Please select valid Image file.')
    }
  }


  const handleImgReset = () => {
    setAvatar('')
  }

  // function to update Candidate Data
  const handleFormUpdate = async (values) => {
    userId = (userId) ? userId : ""
    const token = user.accessToken
    const formData = new FormData()
    formData.append('userID', decode(userId))
    formData.append('userRole', userRole)
    formData.append('first_name', values.firstName)
    formData.append('last_name', values.lastName)
    formData.append('preferred_name', values.preferredName)
    formData.append('email', values.email)
    formData.append('mobile_number', values.mobileNumber)
    formData.append('mobile_code', values.mobileCode)
    formData.append('gender', values.gender)
    formData.append('dob', values.dateOfBirth)
    formData.append('address', values.address)
    formData.append('city', values.city)
    formData.append('state', values.state)
    formData.append('country', values.country)
    formData.append('zipcode', values.zipCode)
    formData.append('about_me', values.aboutMe)
    formData.append('files', avatar)
    formData.append('create_user_id', user.id)
    formData.append('role', userInfo.role)   // 1 for candidate ,2 for contractor */
    formData.append('department_id', values.department)
    formData.append('profile_status', values.profile_status)
    if (userId) {
      formData.append('user_id', decode(userId))
    }
    const response = await dispatch(updateContractorPersonalInfo({
      token,
      formData
    }))

    if (response.payload.status) {
      const status = 'success'
      const message = 'Your profile has been updated successfully'
      toast.success(
        <Toast message={message} status={status} />,
        { icon: true, transition: Slide, hideProgressBar: true, autoClose: 2000, position: toast.POSITION.TOP_CENTER }
      )
      const id = encode(response.payload.data.userID)
      if (isEmpty(userId)) {
        history.push(`/${userType}/contractors/edit/${id}`)
      }
    } else {
      const status = 'error'
      const message = response.payload.message
      toast.error(
        <Toast message={message} status={status} />,
        { icon: true, transition: Slide, hideProgressBar: true, autoClose: 2000, position: toast.POSITION.TOP_CENTER }
      )
    }
  }

  const closeModal = () => {
    setModal(false)
  }

  const getAndSaveCroppedImage = async (imageFile) => {
    setImageUploadError('')
    setAvatar(imageFile)
  }

  const getCroppedImage = () => {

    // Creating Cropped Image
    const selectedImageForCrop = new Image()
    selectedImageForCrop.onload = async () => {

      // Calc image height and width
      const imgHeight = selectedImageForCrop.naturalHeight
      const imgWidth = selectedImageForCrop.naturalWidth

      if (!(completedCrop && completedCrop.width > 0 && completedCrop.height > 0)) {
        toast.error(
          <ToastContent message={ImageCropFailedMessage} />,
          { icon: true, transition: Slide, hideProgressBar: true, autoClose: 2000 }
        )
        return
      }

      const x = ((imgWidth * completedCrop.x) / 100)
      const y = ((imgHeight * completedCrop.y) / 100)
      const w = ((imgWidth * completedCrop.width) / 100)
      const h = ((imgHeight * completedCrop.height) / 100)

      const canvas = document.createElement("canvas")
      const scaleX = selectedImageForCrop.naturalWidth / selectedImageForCrop.width
      const scaleY = selectedImageForCrop.naturalHeight / selectedImageForCrop.height
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")


      ctx.drawImage(
        selectedImageForCrop,
        x * scaleX,
        y * scaleY,
        w * scaleX,
        h * scaleY,
        0,
        0,
        w,
        h
      )

      const base64Image = canvas.toDataURL("image/jpeg", 1)
      const url = base64Image

      await fetch(url)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], "user-avatar.png", { type: "image/png" })
          console.log(file)
          // setAvatar(file)
          getAndSaveCroppedImage(file)
        })

      setModal(false)

    }

    selectedImageForCrop.src = imgSrcToCrop

  }

  const ToastContent = ({ message }) => (
    <React.Fragment>
      <div className='toastify-body'>
        <span>{message}</span>
      </div>
    </React.Fragment>
  )

  // Handle Image after Dropping
  const { getRootProps, getInputProps } = useDropzone({
    multiple: true,
    onDrop: e => {
      const files = e
      // console.log(`Uploaded file`)
      handleFileUpload(files[0])
    }
  })

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      preferredName: '',
      email: '',
      mobileNumber: '',
      mobileCode: '',
      gender: '',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      aboutMe: '',
      department: '',
      profile_status: ''
    },
    validationSchema: Yup.object().shape({
      firstName: Yup.string()
        .required('Required Field').matches(
          /^[a-zA-Z ]*$/,
          "Must contain only alphabets"
        ),
      lastName: Yup.string().matches(
        /^[a-zA-Z ]*$/,
        "Must contain only alphabets"
      ),
      preferredName: Yup.string().matches(
        /^[a-zA-Z ]*$/,
        "Must contain only alphabets"
      ),
      email: Yup.string()
        .email('Invalid email')
        .required('Required Field'),
      mobileCode: Yup.string(),
      mobileNumber: Yup.string(),
      mobileNumber: Yup.string().when('mobileCode', (mobileCode) => {
        return !isEmpty(mobileCode) ? Yup.string().required('Required Field') : Yup.string()
      }),
      mobileCode: Yup.string().when('mobileNumber', (mobileNumber) => {
        return !isEmpty(mobileNumber) ? Yup.string().required('Required Field') : Yup.string()
      }),
      gender: Yup.string(),
      dateOfBirth: Yup.string(),
      address: Yup.string(),
      city: Yup.string(),
      state: Yup.string(),
      zipCode: Yup.string(),
      aboutMe: Yup.string().min(350, 'Minimum 350 Characters Required'),
      department: Yup.string(),
      country: Yup.string(),
      profile_status: Yup.string()
    }, [['mobileCode', 'mobileNumber']]),
    onSubmit: values => {
      handleFormUpdate(values)
    }
  })

  const setContractorValuesInFormik = () => {
    formik.setValues({
      ...formik.values,
      firstName: contractor.firstName ? contractor.firstName : '',
      lastName: contractor.lastName ? contractor.lastName : '',
      preferredName: contractor.preferredName ? contractor.preferredName : '',
      email: contractor.email ? contractor.email : '',
      mobileNumber: !isEmpty(contractor.mobileNumber) ? contractor.mobileNumber : '',
      mobileCode: !isEmpty(contractor.mobileCode) ? Number(contractor.mobileCode) : '',
      gender: !isEmpty(contractor.gender) ? parseInt(contractor.gender) : '',
      city: !isEmpty(contractor.city) ? contractor.city : '',
      state: contractor.state ? contractor.state : '',
      country: contractor.country ? contractor.country : '',
      zipCode: contractor.zipCode ? contractor.zipCode : '',
      aboutMe: contractor.aboutMe ? contractor.aboutMe : '',
      department: contractor.department ? contractor.department : '',
      profile_status: contractor.profile_status ? contractor.profile_status : '',
      dateOfBirth: contractor.dateOfBirth ? contractor.dateOfBirth : '',
      address: contractor.address ? contractor.address : ''
    })
  }

  useEffect(() => {
    if (!isEmpty(contractor) && userId) {
      setContractorValuesInFormik()
      setProfileImage(contractor.profileImage)
      formik.setErrors({})
    }
  }, [contractor])

  const handleAddressChange = (e) => {
    const input = document.getElementById('address')
    formik.setFieldValue('address', e.target.value)
    const autocomplete = new google.maps.places.Autocomplete(input)
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
      const place = autocomplete.getPlace()
      formik.setFieldValue('address', place.name)
      for (const component of place.address_components) {
        // @ts-ignore remove once typings fixed
        const componentType = component.types[0]
        switch (componentType) {
          case "postal_code": {
            formik.setFieldValue('zipCode', component.long_name)
            break
          }
          case "administrative_area_level_1": {
            // state
            formik.setFieldValue('state', component.long_name)
            break
          }
          case "administrative_area_level_2": {
            // city
            formik.setFieldValue('city', component.short_name)
            break
          }
          case "country":
            // console.log('country', component)
            const country = countries.filter(item => item.code === component.short_name)
            if (country.length > 0) {
              formik.setFieldValue('country', country[0].id)
            }
            break
        }
      }
    })
  }

  return (
    <React.Fragment>
      <Row>
        <Col sm='12' tag='h4' className='mb-2'>Personal Details</Col>
      </Row>

      {/* Modal for Cropper */}
      <Modal
        isOpen={modalOpened}
        className={'modal-dialog-centered modal-lg'}
      >
        <ModalHeader>
          <p className='p-0 m-0'>Set Your Profile Image</p>
        </ModalHeader>
        <ModalBody>
          <div className='d-flex align-items-center justify-content-center h-100'>
            <ReactCrop
              crop={cropRatio}
              aspect={1}
              onChange={(c) => setCropRatio(c)}
              onComplete={(_, c) => setCompletedCrop(c)}
              circularCrop={true}
            >
              <img
                alt="Crop me"
                src={imgSrcToCrop}
              />
            </ReactCrop>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color='danger' onClick={() => closeModal()} outline>
            Close
          </Button>
          <Button color='primary' onClick={getCroppedImage} outline>
            Set Image
          </Button>
        </ModalFooter>
      </Modal>

      {/* Creating a drop zone for profile image drag drop */}
      <div {...getRootProps({ className: 'dropzone dropzoneImg' })}>
        <input {...getInputProps()} accept="image/*" />
        <div>
          <div className='d-flex align-items-center justify-content-center w-100'>
            <div className='p-1'>
              <img className='rounded me-50' src={avatar ? webkitURL.createObjectURL(avatar) : (!isEmpty(profileImage)) ? profileImage : avatarImage} alt='Generic placeholder image' height='100' width='100' />
            </div>
            <div>
              <div>
                <p className='mb-0'>Upload JPG or PNG files only. Maximum of 2MB.</p>
                <small>Click anywhere to upload or simply drop your image here.</small>
                {(invalidFile) ? (
                  <FormFeedback className='d-block'>{invalidFile}</FormFeedback>
                ) : null}
                <div className='mt-1'>
                  <Button className='mb-75' color='secondary' size='sm' outline onClick={handleImgReset}>
                    Change
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Row>
        {/* <Col sm='12' className='d-flex mb-2'>
          <div className='me-25'>
            <img className='rounded-circle me-50' src={avatar ? webkitURL.createObjectURL(avatar) : profileImage ? profileImage : avatarImage} alt='Generic placeholder image' height='100' width='100' />
            <input type="hidden" name="profile_image" value={avatar} onChange={formik.handleChange} />
          </div>
          <div className='d-flex align-items-end mt-75 ms-1'>
            <div>
              <Button tag={Label} className='mb-75 me-75' size='sm' color='primary'>
                Upload
                <Input type='file' onChange={(e) => handleFileUpload(e)} hidden accept='image/*' />
              </Button>
              <Button className='mb-75' color='secondary' size='sm' outline onClick={() => setAvatar('')}>
                Reset
              </Button>
              <p className='mb-0'>Allowed JPG or PNG maximum size of 1MB.</p>
            </div>
          </div>
        </Col> */}
        <Form className='mb-1 mt-3' onSubmit={formik.handleSubmit}>
          <Row>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='firstName'>
                First Name
              </Label>
              <Input autoComplete='off' id='firstName' name='firstName' placeholder='' value={formik.values.firstName} onChange={formik.handleChange} className={`form-control ${formik.errors.firstName && formik.touched.firstName && "border-danger"}`} />
              {formik.errors.firstName && formik.touched.firstName && <FormFeedback className='d-block'>{formik.errors.firstName}</FormFeedback>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='lastName'>
                Last Name
              </Label>
              <Input autoComplete='off' id='lastName' name='lastName' placeholder='' value={formik.values.lastName} onChange={formik.handleChange} className={`form-control ${formik.errors.lastName && formik.touched.lastName && "border-danger"}`} />
              {formik.errors.lastName && formik.touched.lastName && (<FormFeedback className='d-block'>{formik.errors.lastName}</FormFeedback>)}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='preferredName'>
                Preferred Name
              </Label>
              <Input autoComplete='off' id='preferredName' name='preferredName' placeholder='' value={formik.values.preferredName} onChange={formik.handleChange} className={`form-control ${formik.errors.preferredName && formik.touched.preferredName && "border-danger"}`} />
              {formik.errors.preferredName && formik.touched.preferredName && (<FormFeedback className='d-block'>{formik.errors.preferredName}</FormFeedback>)}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='email'>
                Email
              </Label>
              <Input autoComplete='off' id='email' name='email' placeholder='' value={formik.values.email} onChange={formik.handleChange} className={`form-control ${formik.errors.email && formik.touched.email && "border-danger"}`} />
              {formik.errors.email && formik.touched.email && <FormFeedback className='d-block'>{formik.errors.email}</FormFeedback>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='mobile_number'>
                Mobile Number
              </Label>

              <Row>
                <Col sm='12' className='mb-1'>
                  <div className='d-flex'>
                    <div className='flag-col'>
                      <Select
                        id='mobileCode'
                        isClearable={false}
                        classNamePrefix='select'
                        options={Object.values(countryCodeOptions(countries))}
                        theme={selectThemeColors}
                        defaultValue={countryCodeOptions[0]}
                        onChange={(option) => formik.setFieldValue('mobileCode', option.value)}
                        className={`react-select ${formik.errors.mobileCode && formik.touched.mobileCode && "border-danger rounded"}`}
                        value={Object.values(countryCodeOptions(countries)).filter(option => option.value === formik.values.mobileCode)}
                        filterOption={createFilter(filterConfigCountryCode)}
                      />
                      {formik.errors.mobileCode && formik.touched.mobileCode && <FormFeedback className='d-block'>{formik.errors.mobileCode}</FormFeedback>}
                    </div>
                    <div className='ps-1 flex-grow-1'>
                      <Cleave
                        id='mobileNumber'
                        name='mobileNumber'
                        autoComplete='off'
                        value={formik.values.mobileNumber}
                        onChange={formik.handleChange}
                        className={`form-control ${formik.errors.mobileNumber && formik.touched.mobileNumber && "border-danger"}`}
                        placeholder=''
                        options={{ phone: true, phoneRegionCode: 'US' }}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
              {formik.errors.mobileNumber && formik.touched.mobileNumber && <FormFeedback className='d-block'>{formik.errors.mobileNumber}</FormFeedback>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='gender'>
                Preferred Pronouns
              </Label>
              <Select
                id='gender'
                isClearable={false}
                className={`react-select ${formik.errors.gender && formik.touched.gender && "border-danger rounded"}`}
                value={genderOptions.filter(option => option.value === formik.values.gender)}
                onChange={(option) => formik.setFieldValue('gender', option.value)}
                classNamePrefix='select'
                options={genderOptions}
                theme={selectThemeColors}
              />
              {formik.errors.gender && formik.touched.gender && <FormFeedback className='d-block'>{formik.errors.gender}</FormFeedback>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='department'>
                Department
              </Label>
              <Select
                id='department'
                isClearable={false}
                className={`react-select ${formik.errors.department && formik.touched.department && "border-danger rounded"}`}
                value={departmentOptions.filter(option => option.value === formik.values.department)}
                onChange={(option) => formik.setFieldValue('department', option.value)}
                classNamePrefix='select'
                options={departmentOptions}
                theme={selectThemeColors}
              />
              {formik.errors.department && formik.touched.department && <FormFeedback className='d-block'>{formik.errors.department}</FormFeedback>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='dateOfBirth'>
                Date Of Birth
              </Label>
              <Flatpickr className={`form-control ${formik.errors.dateOfBirth && formik.touched.dateOfBirth && "border-danger rounded"}`} id='dateOfBirth' name='dateOfBirth' value={formik.values.dateOfBirth} onChange={date => formik.setFieldValue('dateOfBirth', date[0])} options={{ maxDate: "today" }} />
              {formik.errors.dateOfBirth && formik.touched.dateOfBirth && <small className='text-danger'>{formik.errors.dateOfBirth}</small>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='profile_status'>
                Status
              </Label>
              <Select
                id='profile_status'
                isClearable={false}
                className={`react-select ${formik.errors.profile_status && formik.touched.profile_status && "border-danger rounded"}`}
                value={contractorStatusOptions.filter(option => option.value === formik.values.profile_status)}
                onChange={(option) => formik.setFieldValue('profile_status', option.value)}
                classNamePrefix='select'
                options={contractorStatusOptions}
                theme={selectThemeColors}
              />
              {formik.errors.profile_status && formik.touched.profile_status && <FormFeedback className='d-block'>{formik.errors.profile_status}</FormFeedback>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='address'>
                Address
              </Label>
              <Input autoComplete='off' id='address' name='address' placeholder='' value={formik.values.address} onChange={handleAddressChange} className={`form-control ${formik.errors.address && formik.touched.address && "border-danger"}`} />
              {formik.errors.address && formik.touched.address && <FormFeedback className='d-block'>{formik.errors.address}</FormFeedback>}
            </Col>

            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='city'>
                City
              </Label>
              <Input autoComplete='off' id='city' name='city' placeholder='' value={formik.values.city} onChange={formik.handleChange} className={`form-control ${formik.errors.city && formik.touched.city && "border-danger"}`} />
              {formik.errors.city && formik.touched.city && <FormFeedback className='d-block'>{formik.errors.city}</FormFeedback>}
            </Col>

            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='state'>
                State
              </Label>
              <Input autoComplete='off' id='state' name='state' placeholder='' value={formik.values.state} onChange={formik.handleChange} className={`form-control ${formik.errors.state && formik.touched.state && "border-danger"}`} />
              {formik.errors.state && formik.touched.state && <FormFeedback className='d-block'>{formik.errors.state}</FormFeedback>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='zipCode'>
                Zip Code
              </Label>
              <Input autoComplete='off' id='zipCode' type='number' name='zipCode' placeholder='' value={formik.values.zipCode} onChange={formik.handleChange} className={`form-control ${formik.errors.zipCode && formik.touched.zipCode && "border-danger"}`} />
              {formik.errors.zipCode && formik.touched.zipCode && <FormFeedback className='d-block'>{formik.errors.zipCode}</FormFeedback>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='country'>
                Country
              </Label>
              <Select
                id='country'
                name="country"
                isClearable={false}
                classNamePrefix='select'
                value={Object.values(countryOptions(countries)).filter(option => option.value === formik.values.country)}
                onChange={(selected) => formik.setFieldValue('country', selected.value)}
                options={countryOptions(countries)}
                theme={selectThemeColors}
                defaultValue={countryOptions[0]}
                className={`${formik.errors.country && formik.touched.country && "border-danger rounded"}`}
                filterOption={createFilter(filterConfig)}
              />
              {formik.errors.country && formik.touched.country && <FormFeedback className='d-block'>{formik.errors.country}</FormFeedback>}
            </Col>

            <Col sm='12' tag='h4' className='mb-1 mt-2'>About Me</Col>
            <Col sm='12' className='mb-1'>
              <Label className='form-label' htmlFor='aboutMe'>
              </Label>
              <Input autoComplete='off' type='textarea' name='aboutMe' id='aboutMe' rows='7' placeholder='Tell us about yourself and highlight your proudest achievements in your professional journey!' value={formik.values.aboutMe} onChange={formik.handleChange} className={`form-control ${formik.errors.aboutMe && formik.touched.aboutMe && "border-danger"}`} />
              {formik.errors.aboutMe && formik.touched.aboutMe && <small className='text-danger'>{formik.errors.aboutMe}</small>}
            </Col>
            <Col sm='12' className='mb-1'>

              <Button type='submit' className='me-1' color='primary'>
                {userId ? "Update" : "Save"}
              </Button>
            </Col>
          </Row>
        </Form>

      </Row>
    </React.Fragment >

  )
}

export default PersonalInfo

PropTypes.propTypes = {
  candidates: PropTypes.isRequired
}