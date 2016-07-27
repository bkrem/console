import * as React from 'react'
import { findDOMNode } from 'react-dom'
const Tooltip: any = require('rc-tooltip')
import Icon from '../Icon/Icon'
const classes: any = require('./Help.scss')

require('rc-tooltip/assets/bootstrap.css')

interface Props {
  text: string
  placement?: 'left' | 'right'
}

export default class Help extends React.Component<Props, {}> {

  render() {

    const overlay = this.props.text.split('\n').map((line, index, arr) => (
      <span key={line}>{line}{index < arr.length - 1 && (<br />)}</span>
    ))

    return (
      <div>
        <Tooltip
          placement={this.props.placement || 'right'}
          overlay={<span onClick={(e) => e.stopPropagation()}>{overlay}</span>}
          getTooltipContainer={() => findDOMNode((this.refs as any).container)}
        >
          <Icon
            width={20}
            height={20}
            src={require('assets/icons/info.svg')}
          />
        </Tooltip>
        <div className={classes.container} ref='container' />
      </div>
    )
  }
}
