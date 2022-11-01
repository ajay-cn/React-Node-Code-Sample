import cookie from 'react-cookies'
import base64 from 'base-64'

import _clone from 'lodash/clone'
import _escapeRegExp from 'lodash/escapeRegExp'
import _uniqBy from 'lodash/uniqBy'

const hasOwnProperty = Object.prototype.hasOwnProperty

export function isEmpty(obj) {
  if (obj === "") return true
  if (obj === 0) return true
  if (obj === "0") return true
  if (obj === null) return true
  if (obj === false) return true
  if (typeof obj === "undefined") return true
  if (obj.length > 0) return false
  if (obj.length === 0) return true
  //if (typeof obj !== "object") return true 
  for (const key in obj) {
    if (hasOwnProperty.call(obj, key)) return false
  }
}


export function isEmptyObj(obj) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false
    }
  }
  return true
}
export function camelize(str) {
  if (str) {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
  } else {
    return ""
  }
}

export function getAppPermissions(role) {

  const userRole = camelize(role)
  const teamPermissions = "NOTES, TEAM MANAGEMENT, DASHBOARD, TEAM_MEMBER, TEAM_MEMBER_LIST"
  const mixedPermissions = "Miscellaneous, MIS_ARCHIVE, MIS_ARCHIVE_CONTRACTOR, MIS_ARCHIVE_CANDIDATE, MIS_ARCHIVE_PROSPECT, MIS_ARCHIVE_PROJECT, MIS_ARCHIVE_CLIENT, MIS_ARCHIVE_TEAM_MEMBER, MIS_SUPPORT_TICKET, MIS_LOGOUT"
  const masterDataPermissions = "MASTER DATA MANAGEMENT, MASTER_DATA_COUNTRY, MASTER_DATA_PROJECT_TYPE, MASTER_DATA_COMMUNICATION_TOOL, MASTER_DATA_TOOL, MASTER_DATA_KEY_SKILL, MASTER_DATA_LANGUAGE, MASTER_DATA_ROLE, MASTER_DATA_PROJECT_STAGE, MASTER_DATA_COMPANY_TYPE, MASTER_DATA_INDUSTRY_TYPE, MASTER_DATA_TIME_ZONE, MASTER_DATA_EMAIL_TEMPLATE, MASTER_DATA_CANDIDATE_PROFILE_STAGE, MASTER_DATA_CIVIL_STATUS, MASTER_DATA, MASTER_DATA_LIST, MASTER_DATA_ADD"
  const talentPermissions = "TALENT, APPLICANT"
  const applicantPermissions = "TALENT, APPLICANT, APPLICANT_LIST, APPLICANT_ADD, APPLICANT_ACTION, APPLICANT_ACTION_EDIT, APPLICANT_ACTION_DELETE"
  const profileGroupPermissions = "PROFILE_GROUP, PROFILE_GROUP_EDIT, PROFILE_GROUP_LIST, PROFILE_GROUP_ACTION, PROFILE_GROUP_ADD, PROFILE_GROUP_ACTION_EDIT, PROFILE_GROUP_ACTION_DELETE"
  const emailmarketinpermissions = "EMAIL MARKETING, APOLLO, APOLLO_SCHEDULER"
  const permissions = {
    superAdmin: `COMPANY MANAGEMENT, ${teamPermissions}, ${mixedPermissions}, ${masterDataPermissions}, ${talentPermissions}, ${applicantPermissions}, ${emailmarketinpermissions}, TEAM_MEMBER_ACTION, TEAM_MEMBER_ACTION_DELETE, TEAM_MEMBER_ADD, TEAM_MEMBER_EDIT, CLIENT, CLIENT_LIST, CLIENT_ADD, CLIENT_ACTION, CLIENT_ACTION_EDIT, CLIENT_ACTION_DELETE, PROSPECT, PROSPECT_EDIT, PROSPECT_LIST, PROSPECT_ACTION, PROSPECT_ACTION_EDIT, PROSPECT_ACTION_DELETE, PROJECT, PROJECT_LIST, PROJECT_ACTION, PROJECT_ACTION_EDIT, PROJECT_ACTION_DELETE, CANDIDATE, CANDIDATE_LIST, CANDIDATE_ADD, CANDIDATE_ACTION, CANDIDATE_ACTION_EDIT, CANDIDATE_ACTION_DELETE, PROJECT_ADD, CONTRACTOR, CONTRACTOR_LIST, CONTRACTOR_ADD, CONTRACTOR_ACTION, CONTRACTOR_ACTION_EDIT, CONTRACTOR_ACTION_DELETE, INVOICE_ADD, INVOICE_LIST, INVOICE, ${profileGroupPermissions}`,
    salesAdmin: `COMPANY MANAGEMENT, ${teamPermissions}, TEAM_MEMBER_ADD, TEAM_MEMBER_EDIT, ${mixedPermissions}, ${masterDataPermissions}, ${talentPermissions}, ${applicantPermissions}, ${emailmarketinpermissions}, CLIENT, CLIENT_LIST, CLIENT_ADD, CLIENT_ACTION, CLIENT_ACTION_EDIT, CLIENT_ACTION_DELETE, PROJECT, PROJECT_LIST, PROJECT_ACTION, PROJECT_ACTION_EDIT, CANDIDATE, CANDIDATE_LIST, CANDIDATE_ACTION, CANDIDATE_ACTION_EDIT, CONTRACTOR, CONTRACTOR_LIST, CONTRACTOR_ADD, CONTRACTOR_ACTION, CONTRACTOR_ACTION_EDIT, CONTRACTOR_ACTION_DELETE, ${profileGroupPermissions}`,
    sales: `COMPANY MANAGEMENT, ${teamPermissions}, ${mixedPermissions}, ${talentPermissions}, ${applicantPermissions},${emailmarketinpermissions},  CLIENT, CLIENT_LIST, CLIENT_ADD, CLIENT_ACTION, CLIENT_ACTION_EDIT, CLIENT_ACTION_DELETE, PROSPECT, PROSPECT_EDIT, PROSPECT_LIST, PROSPECT_ACTION, PROSPECT_ACTION_EDIT, PROSPECT_ACTION_DELETE, PROJECT, PROJECT_LIST, PROJECT_ACTION, PROJECT_ACTION_EDIT, PROJECT_ADD, CANDIDATE, CANDIDATE_LIST, INVOICE_ADD, INVOICE_LIST, INVOICE, ${profileGroupPermissions}`,
    recruitmentAdmin: `COMPANY MANAGEMENT, ${teamPermissions}, TEAM_MEMBER_ADD, TEAM_MEMBER_EDIT, ${mixedPermissions}, ${masterDataPermissions}, ${applicantPermissions}, ${talentPermissions}, ${emailmarketinpermissions}, CLIENT, CLIENT_LIST, PROSPECT, PROSPECT_LIST, PROSPECT_EDIT, PROSPECT_ACTION, PROSPECT_ACTION_EDIT, PROSPECT_ACTION_DELETE, PROJECT, PROJECT_ADD, PROJECT_LIST, PROJECT_ACTION, PROJECT_ACTION_EDIT, PROJECT_ACTION_DELETE, CANDIDATE, CANDIDATE_LIST, CANDIDATE_ADD, CANDIDATE_ACTION, CANDIDATE_ACTION_EDIT, CANDIDATE_ACTION_DELETE, CONTRACTOR, CONTRACTOR_LIST, ${profileGroupPermissions}`,
    recruitment: `COMPANY MANAGEMENT, ${teamPermissions}, ${mixedPermissions}, ${talentPermissions}, ${applicantPermissions}, PROJECT, PROJECT_LIST, CANDIDATE, CANDIDATE_LIST, CANDIDATE_ADD, CANDIDATE_ACTION, CANDIDATE_ACTION_EDIT, CANDIDATE_ACTION_DELETE, ${profileGroupPermissions}`,
    csmAdmin: `COMPANY MANAGEMENT, ${teamPermissions}, TEAM_MEMBER_ADD, TEAM_MEMBER_EDIT, ${mixedPermissions}, ${masterDataPermissions}, ${talentPermissions}, ${applicantPermissions}, ${emailmarketinpermissions}, CLIENT, CLIENT_LIST, CLIENT_ADD, CLIENT_ACTION, CLIENT_ACTION_EDIT, CLIENT_ACTION_DELETE, PROJECT, PROJECT_LIST, PROJECT_ADD, PROJECT_ACTION, PROJECT_ACTION_EDIT, PROJECT_ACTION_DELETE, CANDIDATE, CANDIDATE_LIST, CONTRACTOR, CONTRACTOR_LIST, CONTRACTOR_ADD, CONTRACTOR_ACTION, CONTRACTOR_ACTION_EDIT, CONTRACTOR_ACTION_DELETE, ${profileGroupPermissions}`,
    csm: `COMPANY MANAGEMENT, ${teamPermissions}, ${mixedPermissions}, ${talentPermissions}, , ${applicantPermissions}, ${emailmarketinpermissions}, CLIENT, CLIENT_LIST, CLIENT_ADD, CLIENT_ACTION, CLIENT_ACTION_EDIT, CLIENT_ACTION_DELETE, PROJECT, PROJECT_LIST, PROJECT_ADD, PROJECT_ACTION, PROJECT_ACTION_EDIT, PROJECT_ACTION, CANDIDATE, CANDIDATE_LIST, CONTRACTOR, CONTRACTOR_LIST, CONTRACTOR_ADD, CONTRACTOR_ACTION, CONTRACTOR_ACTION_EDIT, CONTRACTOR_ACTION_DELETE, ${profileGroupPermissions}`,
    hrAdmin: `COMPANY MANAGEMENT, ${teamPermissions}, TEAM_MEMBER_ADD, TEAM_MEMBER_EDIT, TEAM_MEMBER_ACTION, TEAM_MEMBER_ACTION_DELETE, ${mixedPermissions}, ${masterDataPermissions}, ${talentPermissions}, ${applicantPermissions}, ${emailmarketinpermissions}, CLIENT, CLIENT_LIST, PROJECT, PROJECT_LIST, PROJECT_ACTION, PROJECT_ACTION_EDIT, CANDIDATE, CANDIDATE_ADD, CANDIDATE_LIST, CANDIDATE_ACTION, CANDIDATE_ACTION_EDIT, CANDIDATE_ACTION_DELETE, CONTRACTOR, CONTRACTOR_LIST, CONTRACTOR_ADD, CONTRACTOR_ACTION, CONTRACTOR_ACTION_EDIT, CONTRACTOR_ACTION_DELETE, ${profileGroupPermissions}`,
    hr: `COMPANY MANAGEMENT, ${teamPermissions}, TEAM_MEMBER_ADD, TEAM_MEMBER_EDIT, TEAM_MEMBER_ACTION, TEAM_MEMBER_ACTION_DELETE, ${mixedPermissions}, ${masterDataPermissions}, ${talentPermissions}, ${applicantPermissions}, ${emailmarketinpermissions}, CLIENT, CLIENT_LIST, PROJECT, PROJECT_LIST, PROJECT_ACTION, PROJECT_ACTION_EDIT, CANDIDATE, CANDIDATE_ADD, CANDIDATE_LIST, CANDIDATE_ACTION, CANDIDATE_ACTION_EDIT, CANDIDATE_ACTION_DELETE, CONTRACTOR, CONTRACTOR_LIST, CONTRACTOR_ADD, CONTRACTOR_ACTION, CONTRACTOR_ACTION_EDIT, CONTRACTOR_ACTION_DELETE, ${profileGroupPermissions}`,
    accountingAdmin: `COMPANY MANAGEMENT, ${teamPermissions}, TEAM_MEMBER_ADD, TEAM_MEMBER_EDIT, ${mixedPermissions}, ${masterDataPermissions}, ${talentPermissions}, ${applicantPermissions}, ${emailmarketinpermissions}, CLIENT, CLIENT_LIST, PROJECT, PROJECT_LIST, PROJECT_ACTION, PROJECT_ACTION_EDIT, CANDIDATE, CANDIDATE_LIST, CANDIDATE_ACTION, CANDIDATE_ACTION_EDIT, CONTRACTOR, CONTRACTOR_LIST, CONTRACTOR_ADD, CONTRACTOR_ACTION, CONTRACTOR_ACTION_EDIT, CONTRACTOR_ACTION_DELETE, ${profileGroupPermissions}`,
    accounting: `COMPANY MANAGEMENT, ${teamPermissions}, ${mixedPermissions}, ${applicantPermissions}, ${emailmarketinpermissions}, CLIENT, CLIENT_LIST, PROJECT, PROJECT_LIST, PROJECT_ACTION, PROJECT_ACTION_EDIT, CANDIDATE, CANDIDATE_LIST, CANDIDATE_ACTION, CANDIDATE_ACTION_EDIT, CANDIDATE_ACTION_DELETE, CONTRACTOR, CONTRACTOR_LIST, CONTRACTOR_ADD, CONTRACTOR_ACTION, CONTRACTOR_ACTION_EDIT, CONTRACTOR_ACTION_DELETE, ${profileGroupPermissions}`,
    operationsAdmin: `COMPANY MANAGEMENT, ${teamPermissions}, TEAM_MEMBER_ADD, TEAM_MEMBER_EDIT, ${mixedPermissions}, ${masterDataPermissions}, ${talentPermissions}, ${applicantPermissions}, ${emailmarketinpermissions}, CLIENT, CLIENT_LIST, PROJECT, PROJECT_LIST, PROJECT_ACTION, PROJECT_ACTION_EDIT, CANDIDATE, CANDIDATE_LIST, CANDIDATE_ACTION, CANDIDATE_ACTION_EDIT, CONTRACTOR, CONTRACTOR_LIST, CONTRACTOR_ADD, CONTRACTOR_ACTION, CONTRACTOR_ACTION_EDIT, CONTRACTOR_ACTION_DELETE, ${profileGroupPermissions}`,
    operations: `COMPANY MANAGEMENT, ${teamPermissions}, ${mixedPermissions}, ${applicantPermissions}, ${emailmarketinpermissions}, CLIENT, CLIENT_LIST, PROJECT, PROJECT_LIST, PROJECT_ACTION, PROJECT_ACTION_EDIT, CANDIDATE, CANDIDATE_LIST, CANDIDATE_ACTION, CANDIDATE_ACTION_EDIT, CANDIDATE_ACTION_DELETE, CONTRACTOR, CONTRACTOR_LIST, CONTRACTOR_ADD, CONTRACTOR_ACTION, CONTRACTOR_ACTION_EDIT, CONTRACTOR_ACTION_DELETE, ${profileGroupPermissions}`,
    businessDevelopment: `DASHBOARD, ${applicantPermissions}, ${emailmarketinpermissions}, CANDIDATE, CANDIDATE_LIST, CANDIDATE_ACTION, CANDIDATE_ACTION_EDIT, ${profileGroupPermissions}, ${emailmarketinpermissions}, Miscellaneous, MIS_ARCHIVE, MIS_ARCHIVE_CANDIDATE`,
    businessDevelopmentAdmin:  `DASHBOARD, ${applicantPermissions}, ${emailmarketinpermissions}, CANDIDATE, CANDIDATE_LIST, CANDIDATE_ACTION, CANDIDATE_ACTION_EDIT, ${profileGroupPermissions}, Miscellaneous, MIS_ARCHIVE, MIS_ARCHIVE_CANDIDATE, TEAM_MEMBER_EDIT`,
    candidate: `PROFILE, CANDIDATE_LOGOUT, MEDELINA`,
    contractor: `PROFILE, CANDIDATE_LOGOUT, MEDELINA`,
    admin: `${teamPermissions}`,
    user: `${teamPermissions}`,
    sourcingAdmin: `COMPANY MANAGEMENT, ${teamPermissions}, TEAM_MEMBER_ADD, TEAM_MEMBER_EDIT, ${mixedPermissions}, ${masterDataPermissions}, ${applicantPermissions}, ${talentPermissions}, ${emailmarketinpermissions}, CLIENT, CLIENT_LIST, PROSPECT, PROSPECT_LIST, PROSPECT_EDIT, PROSPECT_ACTION, PROSPECT_ACTION_EDIT, PROSPECT_ACTION_DELETE, PROJECT, PROJECT_ADD, PROJECT_LIST, PROJECT_ACTION, PROJECT_ACTION_EDIT, PROJECT_ACTION_DELETE, CANDIDATE, CANDIDATE_LIST, CANDIDATE_ADD, CANDIDATE_ACTION, CANDIDATE_ACTION_EDIT, CANDIDATE_ACTION_DELETE, CONTRACTOR, CONTRACTOR_LIST, ${profileGroupPermissions}`,
    sourcing: `COMPANY MANAGEMENT, ${teamPermissions}, ${mixedPermissions}, ${talentPermissions}, ${applicantPermissions}, PROJECT, PROJECT_LIST, CANDIDATE, CANDIDATE_LIST, CANDIDATE_ADD, CANDIDATE_ACTION, CANDIDATE_ACTION_EDIT, CANDIDATE_ACTION_DELETE, ${profileGroupPermissions}`
  }
  if (!isEmpty(userRole)) {
    return (permissions.hasOwnProperty(userRole)) ? permissions[userRole].split(", ") : permissions["hr"].split(", ")
  } else {
    return []
  }
}

export function formatDate(date) {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  // month = (month.toString().length === "1" ? `0${month}` : month)
  // day = (day.toString().length === "1" ? `0${day}` : day)

  return `${day} / ${month} / ${year}`
}

export function isValidUrl(str) {
  const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
  return !!pattern.test(str)
}

export function getStaffMemberDetails(info) {
  const defaultImage = require('@src/assets/images/avatars/user.png').default
  return {
    id: info.id,
    fullName: info.fullName,
    username: info.fullName,
    password: '*******',
    avatar: info.profileImage ?? defaultImage,
    email: info.email,
    role: info.roleKey ?? 'hr',
    userType: info.userType ?? '1',
    privilege: info.privilege ?? '3',
    createdOn: info.createdOn,
    ability: [
      {
        action: 'manage',
        subject: 'all'
      }
    ],
    extras: {
      eCommerceCartItemsCount: 0
    }
  }
}
export function getCandidateDetails(info) {
  const defaultImage = require('@src/assets/images/avatars/user.png').default
  return {
    id: info.id,
    fullName: info.fullName,
    username: info.fullName,
    password: '*******',
    avatar: info.profileImage ?? defaultImage,
    email: info.email,
    role: info.roleKey ?? 'candidate',
    userType: info.userType ?? '2',
    profileLocked: info.profileLocked ?? 0,
    tempCount: info.tempCount ?? 0,
    ability: [
      {
        action: 'read',
        subject: 'ACL'
      },
      {
        action: 'read',
        subject: 'Auth'
      }
    ],
    extras: {
      eCommerceCartItemsCount: 0
    }
  }
}

export function saveCookie(key, value) {
  value = base64.encode(value)
  cookie.save(
    key,
    value,
    {
      path: '/',
      httpOnly: false,
      SameSite: 'none'
    }
  )
}

export function removeCookie(key) {
  cookie.remove(
    key,
    {
      path: '/',
      httpOnly: false,
      SameSite: 'none',
      secure: false
    }
  )
}

export function getCookie(key) {
  let value = cookie.load(key) ?? null
  if (!isEmpty(value)) {
    value = base64.decode(value)
  }
  return value
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const getExtensionFromFile = (fileName, type = false) => {
  const fileExtension = fileName.split('.').pop()
  if (!type) {
    return `.${fileExtension}`
  } else {
    return fileExtension
  }
}
export const jobHistoryEditorOptions = {
  options: ['list'],
  list: {
    options: ['unordered']
  }
}
export const ImageCropFailedMessage = 'Please select a cropping area from image.'

export const isVisibleFounders = (role, privilege) => (role === 'super-admin' && privilege === 1)

export const autoMention = (array) => {
  const my_array = array.map(item => {
    const newItem = {
      id: item.id,
      display: item.first_name + ((item.last_name) ? ` ${item.last_name}` : '')
    }
    return newItem
  })
  return my_array
}

export const swapTags = (text) => {
  let displayText = _clone(text)
  // const tags = text.match(/@\{\{[^\}]+\}\}/gi) || []            // @{{user||123||John Reynolds}}  // @[Nisha Singh](20)
  const tags = text.match(/@\[[A-Za-z ]{1,}\]\([0-9]{1,}\)/gi) || []            // @{{user||123||John Reynolds}}
  tags.map(myTag => {
    const tagData = myTag.slice(2, -1)
    const tagDataArray = tagData.split('](')
    const tagDisplayValue = `<span class="tagged-user-name">@${tagDataArray[0]}</span>`
    displayText = displayText.replace(new RegExp(_escapeRegExp(myTag), 'gi'), tagDisplayValue)
  })
  return displayText
}

export const getUsersFromTags = (text) => {
  // const tags = text.match(/@\{\{[^\}]+\}\}/gi) || []
  const tags = text.match(/@\[[A-Za-z ]{1,}\]\([0-9]{1,}\)/gi) || [] 
  const allUserIds = tags.map(myTag => {
    const tagData = myTag.slice(3, -2)
    const tagDataArray = tagData.split('||')
    return {_id: tagDataArray[1], name: tagDataArray[2]}
  })
  return _uniqBy(allUserIds, myUser => myUser._id)
}

export const  arraysEqual = (a, b) => {
  if (a === b) return true
  if (a === null || b === null) return false
  if (a.length !== b.length) return false

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export const getUserRoleName = (item) => {
  let roleName = ''
  if (item.created_by_user_type === 1) {
    if (item.created_by_privilege === 1) {
      roleName = "Super Admin"
    } else if (item.created_by_privilege === 2) {
        if (item.created_by_role_name !== null) {
          roleName = `${item.created_by_role_name} Admin`
        } else {
          roleName = 'Admin'
        }
    } else {
      roleName = item.created_by_role_name
    }
  } else {
    roleName = item.created_by_role_name
  }
  return roleName
}