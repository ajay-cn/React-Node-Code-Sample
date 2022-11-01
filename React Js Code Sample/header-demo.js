// ** React Imports
import { Fragment } from 'react'
// ** Reactstrap Imports

// ** Demo Components
// import Tabs from './Tabs'
import Breadcrumbs from '@src/navigation/breadcrumbs'
// ** Styles
import '@styles/react/libs/flatpickr/flatpickr.scss'
import '@styles/react/pages/page-account-settings.scss'
import { Briefcase, Home, Layers, PhoneCall, Server, User, Users } from 'react-feather'
import {  useParams } from 'react-router-dom'
const AccountSettings = () => {
  // ** Params
  const { id } = useParams()
  const preTitle = ((id !== undefined)) ? 'Edit' : 'Add'
  const params = useParams()
  const userType = params.userType
  return (
    <Fragment>
      <Breadcrumbs breadCrumbTitle={`${preTitle} User`} breadCrumbActive={`${preTitle} Profile`} backPageLink={`/${userType}/team-member/list`} />
    </Fragment>
  )
}

export default AccountSettings
