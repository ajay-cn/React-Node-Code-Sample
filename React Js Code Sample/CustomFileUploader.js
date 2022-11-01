import { useDropzone } from 'react-dropzone'
// ** Styles
import '@styles/react/libs/file-uploader/file-uploader.scss'
import { Row, Col } from 'reactstrap'
import { UploadCloud } from 'react-feather'
import axios from 'axios'

const CustomFileUploader = (props) => {

  const handleFileUpload = async (files) => {
    props.handleLoader(true)
    const formData = new FormData()
    formData.append('path', props.path)
    files.forEach((file, index) => {
      // formData.append(`file${index + 1}`, file)
      formData.append(`file[${index + 1}]`, file)
    })
    const res = await axios({
      method: "post",
      url: "/api/common/custom-file-uploader/upload-files",
      data: formData
    })
    const result = res.data
    props.handleFileUpload(result)
  }

  const { getRootProps, getInputProps } = useDropzone({
    multiple: true,
    onDrop: files => {
      handleFileUpload(files)
    }
  })

  return (
    <Row>
      <Col sm='12'>
        <div {...getRootProps({ className: 'dropzone' })} style={{minHeight: (props.height ? props.height : '300px')}}>
          <input {...getInputProps()} />
          <div className='d-flex align-items-center justify-content-center flex-column'>
            <UploadCloud size={64} />
            <h5>Drop files here or click to upload</h5>
            <p className='text-secondary'>
              Click
              <a href='/' onClick={e => e.preventDefault()}> icon</a>{' '}
              to add
            </p>
          </div>
        </div>
      </Col>
    </Row>
  )
}

export default CustomFileUploader