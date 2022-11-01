// ** React Imports
import React, { Fragment, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// ** Store & Actions
import { getData, getRoles, deleteMember, getCountries, addMemberPersonalInfo, setCurrentActivePage } from '../store'
import { useDispatch, useSelector } from 'react-redux'
import moment from "moment"
import { initialsLetters } from '../../../utility/Utils'
import { selectThemeColors } from '@utils'

// ** Third Party Components
import Select from 'react-select'
import ReactPaginate from 'react-paginate'
import DataTable from 'react-data-table-component'
import { Slack, User, Settings, Database, Edit2, MoreVertical, Trash2, Archive, Edit, ChevronDown, Share, Printer, FileText, File, Grid, Copy, Send, Eye, Check, X, Minus, Bell, Award, Edit3 } from 'react-feather'
import ReactCountryFlag from 'react-country-flag'
import { Slide, toast } from 'react-toastify'
import Toast from '../../../commoncomponent/Toast'
import base64 from 'base-64'

// ** Reactstrap Imports
import {
  Row,
  Col,
  Card,
  Input,
  Label,
  Button,
  CardBody,
  CardTitle,
  CardHeader,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  UncontrolledDropdown,
  UncontrolledButtonDropdown,
  Badge,
  UncontrolledTooltip
} from 'reactstrap'

// ** Styles
import '@styles/react/libs/react-select/_react-select.scss'
import '@styles/react/libs/tables/react-dataTable-component.scss'
import { getAppPermissions, isVisibleFounders} from '../../../configs/function'
import ConfirmDelete from '../../../commoncomponent/ConfirmDelete'
import AddNewMemberForm from './ModalForm'
import Avatar from "@components/avatar"

// ** Table Header
const CustomHeader = ({ handleFilter, searchTerm, store, rolesChecked, handleRolesChecked, user, setShow }) => {
  // , statusChecked, handleStatusChecked
  const filterOptions = (store.roles !== undefined) ? store.roles.map((role) => { return {label : role.name, value : role.id } }) : []
  return (
    <div className='invoice-list-table-header w-100 me-1 ms-50 mt-2 mb-75 px-0'>
      <Row>
        <Col xl='4' className='px-0'>
          <div className='d-flex align-items-center justify-content-between'>
          <Select 
            options={filterOptions}
            id='tools'
            isClearable={true}
            className={`flex-grow-1 react-select rounded"}`}
            value={filterOptions.filter(option => rolesChecked.includes(option.value))}
            onChange={(option) => handleRolesChecked(option)}
            classNamePrefix='select'
            theme={selectThemeColors}
            isMulti={true}
            closeMenuOnSelect={false}
            components={{
              DropdownIndicator: () => null,
              IndicatorSeparator: () => null
            }}
            menuPortalTarget={document.body}
            menuPosition={"absolute"}
            isSearchable={true}
            placeholder='Department'
          />
          {/* <Avatar size={12} className='' content={store.total ? store.total : 0} color='primary'/> */}
            <Badge color='primary' >Total {store.total ? store.total : 0}</Badge>
          </div>
        </Col>
        <Col
          xl='8'
          className='d-flex align-items-sm-center justify-content-xl-end justify-content-start flex-xl-nowrap flex-wrap flex-sm-row flex-column p-0 mt-xl-0 mt-1'
        >
          <div className='d-flex align-items-center mb-sm-0 mb-1 me-1'>
            <label className='mb-0' htmlFor='search-data'>
              Search
            </label>
            <Input
              id='search-data'
              className='ms-50 w-100'
              type='text'
              name='keyword'
              autoComplete='off'
              value={searchTerm}
              onChange={e => handleFilter(e.target.value)}
            />
          </div>

          <div className='d-flex align-items-center table-header-actions'>
            {
              getAppPermissions(user.role).includes('TEAM_MEMBER_ADD') &&
              <Button type='button' className='w-100' color='primary' onClick={() => setShow(true)} >
                Invite
              </Button>

            }
          </div>
        </Col>
      </Row>
    </div>
  )
}

const UsersList = () => {
  // ** Store Vars
  const dispatch = useDispatch()
  const store = useSelector(state => state.users)
  const userRole = useSelector(state => state.auth.userData.role)
  const user = useSelector(state => state.auth.userData)
  const accessToken = user ? user.accessToken : ''
  // const { userType } = useParams()
  const getBeforeActivePage = useSelector(state => state.users.currentActivePage)

  // ** States
  const [sort, setSort] = useState('desc')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(getBeforeActivePage)
  const [sortColumn, setSortColumn] = useState('registration_date')
  const [rowsPerPage, setRowsPerPage] = useState(50)
  // const [currentRole, setCurrentRoles] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [teamMemberInfo, setTeamMemberInfo] = useState({})

  const [rolesChecked, setRolesChecked] = useState([])
  const [currentRoles, setCurrentRoles] = useState([])
  const [statusChecked, setStatusChecked] = useState({})
  const [currentStatus, setCurrentStatus] = useState([])

  //Add new form
  const [show, setShow] = useState(false)

  useEffect(() => {
    dispatch(setCurrentActivePage(currentPage))
  }, [currentPage])


  const onDiscard = () => { 
    // clearErrors()
    setShow(false)
    // reset()
  }

  const onToggle = () => {
    // e.preventDefault()
    setShow(false)
  }

  // ** Function in get data on search query change
  const handleAddNewFormSubmit = async formValues => {
    const formData = new FormData()
    formData.append('firstname', formValues.firstname)
    formData.append('lastname', formValues.lastname)
    formData.append('email', formValues.email)
    formData.append('privilege', formValues.privilege)
    formData.append('role', formValues.department)

    const responseData = await dispatch(addMemberPersonalInfo({ formData, accessToken }))
    if (responseData.payload.status === true) {
      const message =  'TeamMember Invited Successfully'//responseData.payload.message
      const status = 'success'
      toast.success(
        <Toast message={message} status={status} />,
        { icon: true, transition: Slide, hideProgressBar: true, autoClose: 2000, position: toast.POSITION.TOP_CENTER }
      )
      //close popup
      setShow(false)
      //reload listing
      dispatch(
        getData({
          order: sort,
          orderBy: sortColumn,
          page: currentPage,
          perPageItem: rowsPerPage,
          keyword: searchTerm.trim(),
          role: currentRoles,
          status: currentStatus
        })
      )
    } else {
      const message = responseData.payload.message
      const status = 'error'
      toast.error(
        <Toast message={message} status={status} />,
        { icon: true, transition: Slide, hideProgressBar: true, autoClose: 2000, position: toast.POSITION.TOP_CENTER }
      )
    }
  }


  // ** Functions
  useEffect(() => {
    const data1 = []
    const data2 = { isChecked: false, active: false, inComplete: false }
    if (store.roles && store.roles.length > 0) {
      store.roles.map((option) => {
        // data1[option.name] = false
        data1.push(option.name)
      })
    }
    setRolesChecked(data1)
    setStatusChecked(data2)
  }, [dispatch])

  // ** Get data on mount
  useEffect(() => {
    dispatch(
      getData({
        order: sort,
        orderBy: sortColumn,
        page: currentPage,
        perPageItem: rowsPerPage,
        keyword: searchTerm.trim(),
        role: currentRoles,
        status: currentStatus
      })
    )
    dispatch(getRoles())
    dispatch(getCountries())
  }, [dispatch, currentRoles, currentStatus])

  // ** Function in get data on page change
  const handlePagination = page => {
    dispatch(
      getData({
        order: sort,
        orderBy: sortColumn,
        page: page.selected + 1,
        perPageItem: rowsPerPage,
        keyword: searchTerm.trim(),
        role: currentRoles,
        status: currentStatus
      })
    )
    setCurrentPage(page.selected + 1)
  }

  // ** Function in get data on rows per page
  const handlePerPage = e => {
    const value = parseInt(e.currentTarget.value)
    dispatch(
      getData({
        order: sort,
        orderBy: sortColumn,
        page: currentPage,
        perPageItem: value,
        keyword: searchTerm.trim(),
        role: currentRoles,
        status: currentStatus
      })
    )
    setRowsPerPage(value)
  }

  // ** Function in get data on search query change
  const handleFilter = val => {
    setSearchTerm(val)
    dispatch(
      getData({
        order: sort,
        orderBy: sortColumn,
        page: currentPage,
        perPageItem: rowsPerPage,
        keyword: val.trim(),
        role: currentRoles,
        status: currentStatus
      })
    )
  }

  // ** Custom Pagination
  const CustomPagination = () => {
    
    const count = Number(Math.ceil(store.total / rowsPerPage))
    return (
      <div className='d-flex align-items-center justify-content-between'>
        <div className='d-flex align-items-center px-0'>
                <label htmlFor='rows-per-page'>Show</label>
                <Input
                  className='mx-50'
                  type='select'
                  id='rows-per-page'
                  value={rowsPerPage}
                  onChange={handlePerPage}
                  style={{ width: '5rem' }}
                >
                  <option value='10'>10</option>
                  <option value='25'>25</option>
                  <option value='50'>50</option>
                </Input>
       </div>
        <ReactPaginate
          previousLabel={''}
          nextLabel={''}
          pageCount={count || 1}
          activeClassName='active'
          forcePage={currentPage !== 0 ? currentPage - 1 : 0}
          onPageChange={page => handlePagination(page)}
          pageClassName={'page-item'}
          nextLinkClassName={'page-link'}
          nextClassName={'page-item next'}
          previousClassName={'page-item prev'}
          previousLinkClassName={'page-link'}
          pageLinkClassName={'page-link'}
          containerClassName={'pagination react-paginate justify-content-end my-2 pe-1'}
          />
       </div>
    )
  }

  // ** Table data to render
  const dataToRender = () => {
    const filters = {
      role: currentRoles,
      status: currentStatus,
      keyword: searchTerm.trim()
    }
    const isFiltered = Object.keys(filters).some(function (k) {
      return filters[k].length > 0
    })

    if (store.data.length > 0) {
      return store.data
    } else if (store.data.length === 0 && isFiltered) {
      return []
    } else {
      return store.allData.slice(0, rowsPerPage)
    }
  }

  const handleSort = (column, sortDirection) => {
    setSort(sortDirection)
    setSortColumn(column.sortField)
    dispatch(
      getData({
        order: sortDirection,
        orderBy: column.sortField,
        page: currentPage,
        perPageItem: rowsPerPage,
        role: currentRoles,
        status: currentStatus
      })
    )
  }


  const deleteTeamMember = async (row) => {
    const conData = new FormData()
    conData.append('user_id', row.user_id)
    const responseData = await dispatch(deleteMember(conData, { accessToken }))
    if (responseData.payload.status === true) {
      const message = responseData.payload.message
      const status = 'success'
      setTeamMemberInfo({})
      //reload member listing
      dispatch(
        getData({
          order: sort,
          orderBy: sortColumn,
          page: currentPage,
          perPageItem: rowsPerPage,
          keyword: searchTerm.trim(),
          role: currentRoles,
          status: currentStatus
        })
      )
      toast.success(
        <Toast message={message} status={status} />,
        { icon: true, transition: Slide, hideProgressBar: true, autoClose: 2000, position: toast.POSITION.TOP_CENTER }
      )
    } else {
      const message = responseData.payload.message
      const status = 'error'
      toast.error(
        <Toast message={message} status={status} />,
        { icon: true, transition: Slide, hideProgressBar: true, autoClose: 2000, position: toast.POSITION.TOP_CENTER }
      )
    }
  }

  const toggleDeleteModal = (e, row) => {
    e.preventDefault()
    setShowDeleteModal(!showDeleteModal)
    setTeamMemberInfo(row)
  }

  const renderClient = row => {
    const stateNum = Math.floor(Math.random() * 6),
      states = ['light-success', 'light-danger', 'light-warning', 'light-info', 'light-primary', 'light-secondary'],
      color = states[stateNum]

    if (row.profile_image !== null) {
      return <Avatar className='me-1' img={row.profile_image} width='32' height='32' />
    } else {
      return <Avatar color={color || 'primary'} className='me-1' content={initialsLetters(row.name) || 'CB'} />
    }
  }

  // const getCountryShortCodeByPhoneCode = (phonecode) => {
  //   let countryShortCode = ''
  //   if (store.countries !== undefined) {
  //     (store.countries).map((option) => {
  //       if (option.phonecode === phonecode) {
  //         countryShortCode = option.code
  //       }
  //     })
  //   }
  //   return countryShortCode
  // }

  // const getMobileWIthFlag = (country_short_code, mobile_number, phonecode) => {
  //   return (
  //     <div>
  //       <ReactCountryFlag style={{ fontSize: '1.5em', lineHeight: '1em' }} countryCode={(country_short_code).toLowerCase()} svg />
  //       <span className=''> +{phonecode} {mobile_number}</span>
  //     </div>
  //   )
  // }

  // ** Renders mobile number
  // const mobileNumber = row => {
  //   if ((row.country_code !== null) && (row.mobile_number !== null)) {
  //     const country_short_code = getCountryShortCodeByPhoneCode(row.country_code)
  //     // const mobile_number = `+${row.country_code} ${row.mobile_number}`
  //     const mobile_number = row.mobile_number
  //     const phonecode = row.country_code
  //     return getMobileWIthFlag(country_short_code, mobile_number, phonecode)
  //   } else {
  //     return <Minus size={12} />
  //   }
  // }

  // const statusObj = {
  //   1: 'light-success',
  //   2: 'light-danger'
  // }

  // Function to handle Filter ClassificationChecked
  const handleRolesChecked = (options) => {
    // console.log('e', e)
    const roles = options.map(item => item.value)
    setCurrentRoles(roles) 
    setRolesChecked(roles)
  }

  // ** Function to get filter status
  const handleStatusFilter = (data) => {
    //  1 = Gold , 2 = Silver
    const statusData = [{ id: 1, name: 'active' }, { id: 2, name: 'inComplete' }]
    const status = []
    if (statusData && statusData.length > 0) {
      statusData.map((option) => {
        if (data[option.name]) {
          status.push(option.id)
        }
      })
    }
    return status
  }
  // / Function To Handle FilterStatuschecked
  const handleStatusChecked = (e) => {
    let filterArrays = []
    if (e.target.name === 'status') {
      if (e.target.checked) {
        const data1 = { active: true, inComplete: true, isChecked: true }
        setStatusChecked(data1)
        filterArrays = handleStatusFilter(data1)
      } else {
        setStatusChecked({ isChecked: false })
        filterArrays = handleStatusFilter({})
      }
    } else {
      const data = { ...statusChecked }
      data[e.target.name] = e.target.checked
      delete data.isChecked
      /// Check if all keys are false
      const isChecked = Object.values(data).every(value => value === false)
      if (isChecked) {
        setStatusChecked({ isChecked: false, ...data })
        filterArrays = handleStatusFilter(data)
      } else {
        setStatusChecked({ isChecked: true, ...data })
        filterArrays = handleStatusFilter(data)
      }
    }
    setCurrentStatus(filterArrays)
  }

  const visibleColumns = isVisibleFounders(userRole, user.privilege)
  let widthCol = ["250px", "140px", "200px", "158px", "220px", "100px"]
  if (!visibleColumns) {
    widthCol = ["300px", "200px", "200px", "0px", "0px", "100px"]
  } 


  let columns = [
    {
      name: 'Name',
      sortable: true,
      minWidth: widthCol[0],
      padding: '0rem 0.5rem',
      sortField: 'name',
      selector: row => row.name,
      cell: row => (
        <div className='d-flex justify-content-left align-items-center'>
          {renderClient(row)}
          <div className='d-flex flex-column user-name'>
            {<Link
              to={`/${userRole}/team-member/edit/${base64.encode(row.user_id)}`}
              className='user_name text-truncate text-body'
            >
              <span className='fw-bolder no-nowrap'>{row.name}</span>
            </Link>}
          </div>
        </div>
      )
    },
    {
      name: 'Dept',
      sortable: true,
      minWidth: widthCol[2],
      sortField: 'role',
      selector: row => row.role,
      cell: row => <span className='text-capitalize'>{row.role ? row.role : <Minus size={12} />}</span>
    },
    {
      name: 'Privilege',
      sortable: true,
      minWidth: widthCol[1],
      sortField: 'privilege',
      selector: row => row.privilege,
      cell: row => <span className='text-capitalize'>{(row.privilege === 1) ? "Super Admin" : ((row.privilege === 2) ? "Admin" : "User")}</span>
    },
    // {
    //   name: 'Mobile Number',
    //   minWidth: '200px',
    //   sortable: true,
    //   sortField: 'mobile_number',
    //   cell: row => <span className='text-capitalize'>{mobileNumber(row)}</span>
    // },
    {
      name: 'Start Date',
      minWidth: widthCol[3],
      sortable: true,
      sortField: 'registration_date',
      selector: row => row.registration_date,
      cell: row => <span className='text-capitalize'>{(row.registration_date !== null) ? moment(row.registration_date, "YYYY-MM-DD h:m:s").format("MMM DD, YYYY") : <Minus size={12} />}</span>
    },
    // {
    //   name: 'Status',
    //   minWidth: widthCol[4],
    //   sortable: true,
    //   sortField: 'status',
    //   selector: row => row.status,
    //   cell: row => (
    //     <Badge className='text-capitalize' color={statusObj[row.status]} pill>
    //       {(row.status === 1) ? "Active" : "Incomplete"}
    //     </Badge>
    //   )
    // },
    {
      name: 'Last Login',
      minWidth: widthCol[5],
      sortable: true,
      sortField: 'last_login',
      selector: row => row.last_login,
      cell: row => <span className='text-capitalize'>{(row.last_login !== null) ? moment(row.last_login).format("MMM DD, YYYY, h:mm A") : <Minus size={12} />}</span>
    },
    {
      name: 'Actions',
      minWidth: widthCol[6],
      cell: (row) => (
        <div className='column-action d-flex align-items-center'>
          {/* <Link to={`/${userRole}/team-member/generate-signature/${base64.encode(row.user_id)}`} className="tooltip2 me-1">
            <Edit3 size={14} id='signature' className="super" />
            <UncontrolledTooltip placement='top' target='signature'>
              Signature
            </UncontrolledTooltip>
          </Link> */}
          <div className="tooltip2"><Send size={14} className='me-1' id='view' />
            <UncontrolledTooltip placement='top' target='view'>New Tab</UncontrolledTooltip>
          </div>

          <Link to={`/${userRole}/team-member/edit/${base64.encode(row.user_id)}`} className="tooltip2">
            <Edit size={14} id='Edit' className="super" />
            <UncontrolledTooltip placement='top' target='Edit'>
              Edit
            </UncontrolledTooltip>
          </Link>

          {
            getAppPermissions(user.role).includes('TEAM_MEMBER_ACTION') &&
            <UncontrolledDropdown direction='left' className='z-2'>
              <DropdownToggle tag='div' className='btn btn-sm'>
                <MoreVertical size={14} className='cursor-pointer' />
              </DropdownToggle>
              <DropdownMenu>
                {
                  getAppPermissions(user.role).includes('TEAM_MEMBER_ACTION_DELETE') &&
                  <DropdownItem
                    tag='a'
                    href='/'
                    className='w-100'
                    onClick={(e) => toggleDeleteModal(e, row)}
                  >
                    <Trash2 size={14} className='me-50' />
                    <span className='align-middle'>Archive</span>
                  </DropdownItem>
                }
              </DropdownMenu>
            </UncontrolledDropdown>
          }
        </div>
      )
    }
  ]

  if (!visibleColumns) {
    columns = [
      {
        name: 'Name',
        sortable: true,
        minWidth: widthCol[0],
        padding: '0rem 0.5rem',
        sortField: 'name',
        selector: row => row.name,
        cell: row => (
          <div className='d-flex justify-content-left align-items-center'>
            {renderClient(row)}
            <div className='d-flex flex-column user-name'>
              {<Link
                to={`/${userRole}/team-member/edit/${base64.encode(row.user_id)}`}
                className='user_name text-truncate text-body'
              >
                <span className='fw-bolder no-nowrap'>{row.name}</span>
              </Link>}
            </div>
          </div>
        )
      },
      {
        name: 'Dept',
        sortable: true,
        minWidth: widthCol[2],
        sortField: 'role',
        selector: row => row.role,
        cell: row => <span className='text-capitalize'>{row.role ? row.role : <Minus size={12} />}</span>
      },
      {
        name: 'Privilege',
        sortable: true,
        minWidth: widthCol[1],
        sortField: 'role',
        selector: row => row.privilege,
        cell: row => <span className='text-capitalize'>{(row.privilege === 1) ? "Super Admin" : ((row.privilege === 2) ? "Admin" : "User")}</span>
      },
      // {
      //   name: 'Mobile Number',
      //   minWidth: '200px',
      //   sortable: true,
      //   sortField: 'mobile_number',
      //   cell: row => <span className='text-capitalize'>{mobileNumber(row)}</span>
      // },
      {
        name: 'Actions',
        minWidth: widthCol[6],
        cell: (row) => (
          <div className='column-action d-flex align-items-center'>
            <div className="tooltip2"><Send size={14} className='me-1' id='view' />
              <UncontrolledTooltip placement='top' target='view'>New Tab</UncontrolledTooltip>
            </div>

            <Link to={`/${userRole}/team-member/edit/${base64.encode(row.user_id)}`} className="tooltip2">
              <Edit size={14} id='Edit' className="super" />
              <UncontrolledTooltip placement='top' target='Edit'>
                Edit
              </UncontrolledTooltip>
            </Link>

            {
              getAppPermissions(user.role).includes('TEAM_MEMBER_ACTION') &&
              <UncontrolledDropdown direction='left' className='z-2'>
                <DropdownToggle tag='div' className='btn btn-sm'>
                  <MoreVertical size={14} className='cursor-pointer' />
                </DropdownToggle>
                <DropdownMenu>
                  {
                    getAppPermissions(user.role).includes('TEAM_MEMBER_ACTION_DELETE') &&
                    <DropdownItem
                      tag='a'
                      href='/'
                      className='w-100'
                      onClick={(e) => toggleDeleteModal(e, row)}
                    >
                      <Trash2 size={14} className='me-50' />
                      <span className='align-middle'>Archive</span>
                    </DropdownItem>
                  }
                </DropdownMenu>
              </UncontrolledDropdown>
            }
          </div>
        )
      }
    ]
  } 


  return (
    <Fragment>

      <Card className='px-2'>
        <div className='react-dataTable memberTable'>
          <DataTable
            noHeader
            subHeader
            sortServer
            pagination
            responsive
            paginationServer
            columns={columns}
            onSort={handleSort}
            sortIcon={<ChevronDown />}
            className='react-dataTable'
            paginationComponent={CustomPagination}
            noDataComponent={<p className='my-5 text-secondary'>No data available</p>}
            data={dataToRender()}
            subHeaderComponent={
              <CustomHeader
                store={store}
                searchTerm={searchTerm}
                rowsPerPage={rowsPerPage}
                handlePerPage={handlePerPage}
                handleFilter={handleFilter}
                statusChecked={statusChecked}
                handleStatusChecked={handleStatusChecked}
                rolesChecked={rolesChecked}
                handleRolesChecked={handleRolesChecked}
                user={user}
                setShow={setShow}
              />
            }
          />
        </div>
      </Card>
      {showDeleteModal ? <ConfirmDelete show={showDeleteModal} handleClose={toggleDeleteModal} handleSubmit={() => deleteTeamMember(teamMemberInfo)} bodyText="Are you sure, you want to archive this member ?" /> : null}
      {show ? <AddNewMemberForm show={show} onToggle={onToggle} onDiscard={onDiscard} handleFormSubmit={handleAddNewFormSubmit} departments={store.roles} /> : null}
    </Fragment>

  )
}

export default UsersList
