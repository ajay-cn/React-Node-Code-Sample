// ** React Imports
import { Fragment } from 'react'

// ** Reactstrap Imports
import { Row, Col } from 'reactstrap'

// ** Demo Components
import BasicTimeline from './BasicTimeline'

const Timeline = ({note_for}) => {

  return (
    <Fragment>
      <Row>
        <Col lg='12'>
          <BasicTimeline note_for={note_for} />
        </Col>
      </Row>
    </Fragment>
  )
}

export default Timeline
