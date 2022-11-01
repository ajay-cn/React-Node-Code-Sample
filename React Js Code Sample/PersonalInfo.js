// ** React Imports
import React, { useState, useEffect, Fragment } from 'react'
import { useParams } from 'react-router-dom'

// ** Third Party Components
import Select, { createFilter } from 'react-select'
import { useDropzone } from 'react-dropzone'
import '@styles/react/libs/file-uploader/file-uploader.scss'

import Cleave from 'cleave.js/react'
import 'cleave.js/dist/addons/cleave-phone.us'
import { toast, Slide } from 'react-toastify'
import Toast from '../../../../commoncomponent/Toast'
import { Check, X } from 'react-feather'
import ReactCountryFlag from 'react-country-flag'
import base64 from 'base-64'
import { handleLogin } from '@store/authentication'

import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

// ** Store & Actions
import { getCountries, getRoles, getMemberPersonalInfo, updatePersonalInfo } from '../../store'
import { autoSaveUpdate } from '@src/store'
import { useDispatch, useSelector } from 'react-redux'

// ** Custom Components
import Avatar from '@components/avatar'

import Flatpickr from 'react-flatpickr'

// ** ThemeConfig Import
import { getExtensionFromFile, isEmpty, isValidUrl, getAppPermissions, ImageCropFailedMessage } from '@configs/function'

// ** Reactstrap Imports
import { Row, Col, Form, Card, Input, Label, Button, CardBody, CardTitle, CardHeader, CardImg, FormFeedback, Modal, ModalHeader, ModalBody, ModalFooter, Spinner } from 'reactstrap'

// ** Utils
import { selectThemeColors } from '@utils'

import { useFormik } from 'formik'
import * as Yup from 'yup'

import axios from 'axios'

const genderOptions = [
  { value: 1, label: 'He/Him/His' },
  { value: 2, label: 'She/Her/Hers' },
  { value: 3, label: 'They/Them/Theirs' }
]


const getCountryFlagWithName = (option) => {
  return (
    <div>
      <ReactCountryFlag style={{ fontSize: '1.5em', lineHeight: '1em' }} countryCode={(option.code).toLowerCase()} svg />
      <span className='ms-1'>{option.name}</span>
    </div>
  )
}

const getCountryFlagWithPhoneCode = (option) => {
  return (
    <div>
      <ReactCountryFlag style={{ fontSize: '1.5em', lineHeight: '1em' }} countryCode={(option.code).toLowerCase()} svg />
      <span className='ms-1'>+{option.phonecode}</span>
    </div>
  )
}

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

const filterConfig = {
  stringify: option => `${option.data.name}`,
  matchFrom: 'start'
}

const filterConfigCountryCode = {
  stringify: option => `+${option.data.phonecode}`,
  matchFrom: 'start'
}

const PersonalInfo = () => {
  // ** Store Vars
  const dispatch = useDispatch()
  const store = useSelector(state => state.users)

  const user = useSelector(state => state.auth.userData)
  const accessToken = user ? user.accessToken : ''

  // ** States
  const [personInfo, setPersonalInfo] = useState({})
  const avatarImage = require('@src/assets/images/avatars/user.png').default
  const [avatar, setAvatar] = useState('')
  const [profileImage, setProfileImage] = useState('')
  const [invalidFile, setImageUploadError] = useState('')

  // const params = useParams()
  // const userType = params.userType
  const { id } = useParams()
  // ** State for saving added Image
  const [modalOpened, setModal] = useState(null)
  // ** State for saving Image on server
  const [isUploadingProfileImage, updateUploadingProfileImage] = useState(null)
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

  const privileges = [
    { value: 2, label: 'Admin' },
    { value: 3, label: 'User' }
  ]

  const autoSaveUpdateHandle = (t, c, i, v) => {
    // Check for authority of update 
    let isAuthrized = false
    if (getAppPermissions(user.role).includes('TEAM_MEMBER_EDIT') && (user.privilege === 1)) isAuthrized = true

    if (getAppPermissions(user.role).includes('TEAM_MEMBER_EDIT') && (user.privilege === 2) && (personInfo.privilege === 2) && (personInfo.roleKey === user.role)) isAuthrized = true

    if (getAppPermissions(user.role).includes('TEAM_MEMBER_EDIT') && (user.privilege === 2) && (personInfo.privilege === 3) && (personInfo.roleKey === user.role)) isAuthrized = true

    if (getAppPermissions(user.role).includes('TEAM_MEMBER_EDIT') && (user.privilege === 2) && (personInfo.privilege === 3)) isAuthrized = true

    if ((user.id === personInfo.userId) && (user.privilege === 3)) isAuthrized = true

    if (!!isAuthrized) {
      dispatch(autoSaveUpdate({t, c, i, v}))
    } else {
      toast.warning(
        <Toast message="You are not an authorized user to make these changes. Your changes will not save." status={true} />,
        { icon: true, transition: Slide, hideProgressBar: true, autoClose: 2000, position: toast.POSITION.TOP_CENTER }
      )
    }
  }

  const departmentOptions = (roles) => {
    const departmentValues = []
    roles.map((option) => {
      if (personInfo.privilege === 1) {
        departmentValues.push({
          value: option.id,
          label: option.name
        })
      } else {
        if (option.roleKey !== 'founder') {
          departmentValues.push({
            value: option.id,
            label: option.name
          })
        }
      }
    })
    return departmentValues
  }


  const privilegeOptions = (privileges) => {
    const values = []
    privileges.map((option) => {
      if (user.privilege === 3) {
        if (option.label === 'User') {
          values.push({
            value: option.value,
            label: option.label
          })
        }
      } else {
        values.push({
          value: option.value,
          label: option.label
        })
      }
    })
    return values
  }


  const getPersonalData = async (userId) => {
    const responseData = await dispatch(getMemberPersonalInfo(userId))
    if (responseData.payload.status) {
      setPersonalInfo(responseData.payload.data)
    } else {
      console.log('Error', responseData.payload.error)
    }
  }

  // ** Get data on mount
  useEffect(() => {
    if ((id !== undefined) && (id !== '')) {
      getPersonalData(base64.decode(id))
    }
    dispatch(getCountries())
    dispatch(getRoles())
  }, [dispatch, id])

  const bindForm = (file) => {
    const formData = new FormData()
    formData.append('image', file)
    return formData
  }

  const handleImgReset = () => {
    setProfileImage('')
    setAvatar('')
    // setAvatar(require('@src/assets/images/avatars/user.png').default)
  }

  const closeModal = () => {
    setModal(false)
  }

  const getAndSaveCroppedImage = async (imageFile) => {
    setImageUploadError('')

    // Create Image for cropper

    const formData = await bindForm(imageFile)
    try {
      const res = await axios({
        method: "post",
        url: "/api/members/uploadProfileImage",
        data: formData
      })
      const result = await res.data
      if (result.status) {
        updateUploadingProfileImage(false)
        setProfileImage(result.data)
        autoSaveUpdateHandle('team_members', 'profile_image', personInfo.teamMembersRowId, result.data)
      } else {
        updateUploadingProfileImage(false)
        setImageUploadError(res.message)
        console.log("Error", res.message)
      }
    } catch (err) {
      updateUploadingProfileImage(false)
      console.log("err", err)
    }
  }

  const getCroppedImage = () => {

    updateUploadingProfileImage(true)
    // Creating Cropped Image
    const selectedImageForCrop = new Image()

    selectedImageForCrop.onload = async () => {

      // const canvas = document.createElement("canvas")
      // const scaleX = selectedImageForCrop.naturalWidth / selectedImageForCrop.width
      // const scaleY = selectedImageForCrop.naturalHeight / selectedImageForCrop.height
      // canvas.width = completedCrop.width
      // canvas.height = completedCrop.height
      // const ctx = canvas.getContext("2d")

      // ctx.drawImage(
      //   selectedImageForCrop,
      //   completedCrop.x * scaleX,
      //   completedCrop.y * scaleY,
      //   completedCrop.width * scaleX,
      //   completedCrop.height * scaleY,
      //   0,
      //   0,
      //   completedCrop.width,
      //   completedCrop.height
      // )

      // Calc image height and width
      const imgHeight = selectedImageForCrop.naturalHeight
      const imgWidth = selectedImageForCrop.naturalWidth

      if (!(completedCrop && completedCrop.width > 0 && completedCrop.height > 0)) {
        toast.error(
          <ToastContent message={ImageCropFailedMessage} />,
          { icon: true, transition: Slide, hideProgressBar: true, autoClose: 2000, position: toast.POSITION.TOP_CENTER }
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
          // console.log(file)
          getAndSaveCroppedImage(file)
        })

      // Closing modal
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

  // Handle Image after Dropping
  const { getRootProps, getInputProps } = useDropzone({
    multiple: true,
    onDrop: e => {
      const files = e
      // console.log(`Uploaded file`)
      handleFileUpload(files[0])
    }
  })

  // ** Function in get data on search query change
  const handleSubmit = async formValues => {
    const formData = new FormData()
    formData.append('firstname', formValues.firstname)
    formData.append('lastname', formValues.lastname)
    formData.append('gender', formValues.gender)
    formData.append('email', formValues.email)
    formData.append('country_code', formValues.country_code)
    formData.append('mobile_number', formValues.mobile_number)
    formData.append('zipcode', formValues.zipcode)
    formData.append('city', formValues.city)
    formData.append('state', formValues.state)
    formData.append('country', formValues.country)
    formData.append('address', formValues.address)
    formData.append('role', formValues.department)
    formData.append('privilege', formValues.privilege)

    if (isValidUrl(profileImage)) {
      formData.append('profile_image', profileImage)
    }
    formData.append('user_id', base64.decode(id))
    const responseData = await dispatch(updatePersonalInfo({ formData, accessToken }))

    if (responseData.payload.status === true) {
      // const user_id = ((id !== undefined) && (id !== '')) ? base64.decode(id) : responseData.payload.data.user_id
      // const message = responseData.payload.message
      // const status = 'success'
      // toast.success(
      //   <Toast message={message} status={status} />,
      //   { icon: true, transition: Slide, hideProgressBar: true, autoClose: 2000, position: toast.POSITION.TOP_CENTER }
      // )
      if (base64.decode(id) === String(user.id)) {
        const userData = user
        const name = `${formValues.firstname} ${formValues.lastname}`
        dispatch(handleLogin({ ...userData, username: name, avatar: isValidUrl(profileImage) ? profileImage : userData.avatar }))
      }
      // history.push(`/${userType}/team-member/edit/${base64.encode(user_id)}`)

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
      firstname: personInfo.first_name || '',
      lastname: personInfo.last_name || '',
      gender: personInfo.gender_pronoun || '',
      email: personInfo.email || '',
      mobile_number: personInfo.mobile_number || '',
      country_code: parseInt(personInfo.country_code) || '',
      address: personInfo.address_line_one || '',
      zipcode: personInfo.zipcode || '',
      city: personInfo.city || '',
      state: personInfo.state || '',
      country: parseInt(personInfo.country_id) || '',
      department: personInfo.role || '',
      privilege: personInfo.privilege || ''
    },
    validationSchema: Yup.object().shape({
      firstname: Yup.string()
        .required('Required Field').matches(
          /^[a-zA-Z ]*$/,
          "Must contain only alphabets"
        ),
      lastname: Yup.string().matches(
        /^[a-zA-Z ]*$/,
        "Must contain only alphabets"
      ),
      email: Yup.string()
        .email('Email is invalid')
        .required('Required Field'),
      privilege: Yup.string()
        .required('Required Field'),
      department: Yup.string()
        .required('Required Field'),
      mobile_number: Yup.string(),
      country_code: Yup.string(),
      mobile_number: Yup.string().when('country_code', (country_code) => {
        return !isEmpty(country_code) ? Yup.string().required('Required Field') : Yup.string()
      }),
      country_code: Yup.string().when('mobile_number', (mobile_number) => {
        return !isEmpty(mobile_number) ? Yup.string().required('Required Field') : Yup.string()
      })
    }, [['mobile_number', 'country_code']]),
    enableReinitialize: true,
    onSubmit: values => {
      handleSubmit(values)
    }
  })

  const notSuperAdmin = () => {
    return (personInfo.privilege !== 1)
  }

  useEffect(() => {
    if (!isEmpty(personInfo)) {
      if ((personInfo.profile_image !== "undefined") && (personInfo.profile_image !== null)) {
        setProfileImage(personInfo.profile_image)
      } else {
        setProfileImage('')
      }
    }
  }, [personInfo])

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
            formik.setFieldValue('zipcode', component.long_name)
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
            const country = store.countries.filter(item => item.code === component.short_name)
            if (country.length > 0) {
              formik.setFieldValue('country', country[0].id)
            }
            break
        }
      }
      // Save in DB
      const f = document.querySelector('.team-members-form-submit-button')
      setTimeout(() => {
        f.click()
      }, 1000)
    })
  }

  return (
    <Card>
      <CardHeader className='border-bottom'>
        <CardTitle tag='h4'>Personal Details</CardTitle>
      </CardHeader>
      <CardBody className='py-2 my-25'>

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

        <Form className='pt-50' className="team-members-form" onSubmit={formik.handleSubmit} type="multipart/form-data">

          {/* Creating a drop zone for profile image drag drop */}
          <div {...getRootProps({ className: 'dropzone dropzoneImg' })}>
            <input {...getInputProps()} accept="image/*" />
            <div>
              <div className='d-flex align-items-center justify-content-center w-100'>
                <div className='p-1'>
                  <img className='rounded me-50' src={avatar ? webkitURL.createObjectURL(avatar) : ((profileImage !== undefined && profileImage !== '' && profileImage !== null)) ? profileImage : avatarImage} alt='Generic placeholder image' height='100' width='100' />
                </div>
                <div>
                  <div>
                    <p className='mb-0'>Upload JPG or PNG files only. Maximum of 2MB.</p>
                    <small>Click anywhere to upload or simply drop your image here.</small>
                    {(invalidFile) ? (
                      <FormFeedback className='d-block'>{invalidFile}</FormFeedback>
                    ) : null}
                    <div className='mt-1'>
                      <Button color='secondary' size='sm' outline onClick={handleImgReset}>
                        {isUploadingProfileImage ? <Spinner className='me-25' size='sm' /> : ''}
                        Change
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Row className="mt-2">
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='firstname'>
                First Name
              </Label>
              <Input id='firstname' name='firstname' placeholder='' value={formik.values.firstname} 
              onBlur={(e) => {
                autoSaveUpdateHandle("team_members", "first_name", personInfo.teamMembersRowId, e.target.value)
              }} 
              onChange={(e) => {
                formik.setValues({ ...formik.values, firstname: e.target.value })
              }} 
              className={`form-control ${formik.errors.firstname && formik.touched.firstname && "border-danger"}`} />
              {formik.errors.firstname && formik.touched.firstname && <FormFeedback className='d-block'>{formik.errors.firstname}</FormFeedback>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='lastname'>
                Last Name
              </Label>
              <Input id='lastname' name='lastname' placeholder='' value={formik.values.lastname} 
              onBlur={(e) => {
                autoSaveUpdateHandle("team_members", "last_name", personInfo.teamMembersRowId, e.target.value)
              }} 
              onChange={(e) => {
                formik.setValues({ ...formik.values, lastname: e.target.value })
              }} 
               className={`form-control ${formik.errors.lastname && formik.touched.lastname && "border-danger"}`} />
              {formik.errors.lastname && formik.touched.lastname && <FormFeedback className='d-block'>{formik.errors.lastname}</FormFeedback>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='emailInput'>
                Email
              </Label>
              <Input id='emailInput' type='email' name='email' placeholder='' value={formik.values.email} 
              onBlur={(e) => {
                autoSaveUpdateHandle("users", "email", personInfo.usersRowId, e.target.value)
              }} 
              onChange={(e) => {
                formik.setValues({ ...formik.values, email: e.target.value })
              }}  
              className={`form-control ${formik.errors.email && formik.touched.email && "border-danger"}`} />
              {formik.errors.email && formik.touched.email && <FormFeedback className='d-block'>{formik.errors.email}</FormFeedback>}
            </Col>
            {/* validate privilege if one and editing 1 */}
            {notSuperAdmin() ? <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='privilege'>
                Privilege
              </Label>
              <Select
                id='privilege'
                isClearable={false}
                className={`react-select ${formik.errors.privilege && formik.touched.privilege && "border-danger rounded"}`}
                value={((privileges !== undefined)) ? (Object.values(privilegeOptions((privileges))).filter(option => option.value === formik.values.privilege)) : {}}
                onChange={(e) => {
                  autoSaveUpdateHandle("team_member_roles", "privilege", personInfo.teamMemberRolesRowId, e.value)
                  formik.setValues({ ...formik.values, privilege: e.value })
                }}  
                classNamePrefix='select'
                options={(privileges !== undefined) ? privilegeOptions(privileges) : {}}
                theme={selectThemeColors}
              />
              {formik.errors.privilege && formik.touched.privilege && <FormFeedback className='d-block'>{formik.errors.privilege}</FormFeedback>}
            </Col> : ''
            }
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='department'>
                Department
              </Label>
              <Select
                id='department'
                isClearable={false}
                className={`react-select ${formik.errors.department && formik.touched.department && "border-danger rounded"}`}
                value={((store.roles !== undefined)) ? (Object.values(departmentOptions((store.roles))).filter(option => option.value === formik.values.department)) : {}}
                onChange={(e) => {
                  autoSaveUpdateHandle("team_member_roles", "role_id", personInfo.teamMemberRolesRowId, e.value)
                  formik.setValues({ ...formik.values, department: e.value })
                }}  
                classNamePrefix='select'
                options={(store.roles !== undefined) ? departmentOptions(store.roles) : {}}
                theme={selectThemeColors}
              />
              {formik.errors.department && formik.touched.department && <FormFeedback className='d-block'>{formik.errors.department}</FormFeedback>}
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
                onChange={(e) => {
                  autoSaveUpdateHandle("team_members", "gender_pronoun", personInfo.teamMembersRowId, e.value)
                  formik.setValues({ ...formik.values, gender: e.value })
                }}  
                classNamePrefix='select'
                options={genderOptions}
                theme={selectThemeColors}
              />
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
                        id='country_code'
                        isClearable={false}
                        classNamePrefix='select'
                        options={(store.countries !== undefined) ? countryCodeOptions(store.countries) : {}}
                        theme={selectThemeColors}
                        defaultValue={countryCodeOptions[0]}
                        onChange={(e) => {
                          autoSaveUpdateHandle("team_members", "country_code", personInfo.teamMembersRowId, e.value)
                          formik.setValues({ ...formik.values, country_code: e.value })
                        }}  
                        className={`react-select ${formik.errors.country_code && formik.touched.country_code && "border-danger rounded"}`}
                        value={((store.countries !== undefined)) ? (Object.values(countryCodeOptions((store.countries))).filter(option => option.value === formik.values.country_code)) : {}}
                        filterOption={createFilter(filterConfigCountryCode)}
                      />
                    </div>
                    <div className='ps-1 flex-grow-1'>
                      <Cleave
                        id='mobile_number'
                        name='mobile_number'
                        value={formik.values.mobile_number}
                        onBlur={(e) => {
                          autoSaveUpdateHandle("team_members", "mobile_number", personInfo.teamMembersRowId, e.target.value)
                        }}  
                        onChange={(e) => {
                          formik.setValues({ ...formik.values, mobile_number: e.target.value })
                        }}  
                        className={`form-control ${formik.errors.mobile_number && formik.touched.country && "border-danger"}`}
                        placeholder=''
                        options={{ phone: true, phoneRegionCode: 'US' }}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
              {formik.errors.mobile_number && formik.touched.mobile_number && <FormFeedback className='d-block'>{formik.errors.mobile_number}</FormFeedback>}
              {formik.errors.country_code && formik.touched.country_code && <FormFeedback className='d-block'>{formik.errors.country_code}</FormFeedback>}
            </Col>

            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='address'>
                Address
              </Label>
              <Input id='address' name='address' placeholder='' value={formik.values.address} 
              onChange={(e) => {
                  autoSaveUpdateHandle("address_details", "address_line_one", personInfo.addressRowId, e.target.value)
                  formik.setValues({ ...formik.values, address: e.target.value })
                  handleAddressChange(e)
                }} className={`form-control ${formik.errors.address && formik.touched.address && "border-danger"}`} />
              {formik.errors.address && formik.touched.address && <FormFeedback className='d-block'>{formik.errors.address}</FormFeedback>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='city'>
                City
              </Label>
              <Input id='city' name='city' placeholder='' value={formik.values.city} 
                onBlur={(e) => {
                    autoSaveUpdateHandle("address_details", "city", personInfo.addressRowId, e.target.value)
                }} 
                onChange={(e) => {
                    formik.setValues({ ...formik.values, city: e.target.value })
                }} 
                className={`form-control ${formik.errors.city && formik.touched.city && "border-danger"}`} />
              {formik.errors.city && formik.touched.city && <FormFeedback className='d-block'>{formik.errors.city}</FormFeedback>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='state'>
                State
              </Label>
              <Input id='state' name='state' placeholder='' value={formik.values.state} 
              onBlur={(e) => {
                  autoSaveUpdateHandle("address_details", "state", personInfo.addressRowId, e.target.value)
              }} 
              onChange={(e) => {
                  formik.setValues({ ...formik.values, state: e.target.value })
              }} 
              className={`form-control ${formik.errors.state && formik.touched.state && "border-danger"}`} />
              {formik.errors.state && formik.touched.state && <FormFeedback className='d-block'>{formik.errors.state}</FormFeedback>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='zipcode'>
                Zip Code
              </Label>
              <Input id='zipCode' name='zipcode' placeholder='123456' value={formik.values.zipcode} 
              onBlur={(e) => {
                  autoSaveUpdateHandle("address_details", "zipcode", personInfo.addressRowId, e.target.value)
              }} 
              onChange={(e) => {
                  formik.setValues({ ...formik.values, zipcode: e.target.value })
              }} 
              className={`form-control ${formik.errors.zipcode && formik.touched.zipcode && "border-danger"}`} />
              {formik.errors.zipcode && formik.touched.zipcode && <FormFeedback className='d-block'>{formik.errors.zipcode}</FormFeedback>}
            </Col>
            <Col sm='6' className='mb-1'>
              <Label className='form-label' htmlFor='country'>
                Country
              </Label>
              <Select
                id='country'
                isClearable={false}
                classNamePrefix='select'
                options={(store.countries !== undefined) ? countryOptions(store.countries) : {}}
                theme={selectThemeColors}
                defaultValue={countryOptions[0]}
                onChange={(e) => {
                  autoSaveUpdateHandle("address_details", "country_id", personInfo.addressRowId, e.value)
                  formik.setValues({ ...formik.values, country: e.value })
                }}
                className={`react-select ${formik.errors.country && formik.touched.country && "border-danger rounded"}`}
                value={((store.countries !== undefined)) ? (Object.values(countryOptions((store.countries))).filter(option => option.value === formik.values.country)) : {}}
                filterOption={createFilter(filterConfig)}
              />
              {formik.errors.country && formik.touched.country && <FormFeedback className='d-block'>{formik.errors.country}</FormFeedback>}
            </Col>
            <Col className='mt-2' sm='12 d-none'>

              {(getAppPermissions(user.role).includes('TEAM_MEMBER_EDIT') && (user.privilege === 1)) &&
                <Button type='submit' className='me-1 team-members-form-submit-button' color='primary'>Save</Button>
              }
              {(getAppPermissions(user.role).includes('TEAM_MEMBER_EDIT') && (user.privilege === 2) && (personInfo.privilege === 2) && (personInfo.roleKey === user.role)) &&
                <Button type='submit' className='me-1 team-members-form-submit-button' color='primary'>Save</Button>
              }
              {(getAppPermissions(user.role).includes('TEAM_MEMBER_EDIT') && (user.privilege === 2) && (personInfo.privilege === 3) && (personInfo.roleKey === user.role)) &&
                <Button type='submit' className='me-1 team-members-form-submit-button' color='primary'>Save</Button>
              }
              {(getAppPermissions(user.role).includes('TEAM_MEMBER_EDIT') && (user.privilege === 2) && (personInfo.privilege === 3)) &&
                <Button type='submit' className='me-1 team-members-form-submit-button ' color='primary'>Save</Button>
              }
              {(user.id === personInfo.userId) && (user.privilege === 3) &&
                <Button type='submit' className='me-1 team-members-form-submit-button ' color='primary'>Save</Button>
              }

            </Col>
          </Row>
        </Form>
      </CardBody>
    </Card>
  )
}

export default PersonalInfo
