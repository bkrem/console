import * as React from 'react'
import {showNotification} from '../../actions/notification'
import * as Relay from 'react-relay'
import {connect} from 'react-redux'
import {nextStep} from '../../actions/gettingStarted'
import {Link, withRouter} from 'react-router'
import ModelDescription from './ModelDescription'
import Tether from '../../components/Tether/Tether'
import Header from '../../components/Header/Header'
import {Model, Viewer, Project} from '../../types/types'
import {GettingStartedState} from '../../types/gettingStarted'
import PopupWrapper from '../../components/PopupWrapper/PopupWrapper'
import AuthProviderPopup from './AuthProviderPopup/AuthProviderPopup'
import {Icon, particles, variables} from 'graphcool-styles'
import * as cx from 'classnames'
import styled from 'styled-components'
import UpdateModelNameMutation from '../../mutations/UpdateModelNameMutation'
import EditModelPopup from '../ProjectRootView/EditModelPopup'
import DeleteModelMutation from '../../mutations/DeleteModelMutation'
import {ShowNotificationCallback} from '../../types/utils'
import {onFailureShowNotification} from '../../utils/relay'
import cuid from 'cuid'
import {Popup} from '../../types/popup'
import {showPopup} from '../../actions/popup'
import {SYSTEM_MODELS} from '../../constants/system'
import tracker from '../../utils/metrics'
const classes: any = require('./ModelHeader.scss')
const headerClasses: any = require('../../components/Header/Header.scss')
import {ConsoleEvents} from 'graphcool-metrics'

interface Props {
  children: Element
  params: any
  gettingStartedState: GettingStartedState
  model: Model
  nextStep: any
  viewer: Viewer
  project: Project
  router: any
  showNotification: ShowNotificationCallback
  showPopup: (popup: Popup) => void
  forceFetchRoot: () => void
  buttonsClass?: string
}

interface State {
  authProviderPopupVisible: boolean
}

class ModelHeader extends React.Component<Props, State> {

  state = {
    authProviderPopupVisible: false,
  }

  render() {

    const schemaActive = location.pathname.includes('schema')
    const schemaTypeText = schemaActive ? 'Schema' : 'Data'
    const {model} = this.props
    const isSystem = model && (model.isSystem || SYSTEM_MODELS.includes(model.name))

    const SettingsLink = styled(Link)`
      padding: ${variables.size10};
      background: ${variables.gray04};
      font-size: ${variables.size14};
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 1px;
      color: ${variables.gray40};
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 2px;
      transition: color ${variables.duration} linear, background ${variables.duration} linear;

      svg {
        fill: ${variables.gray40};
        stroke: ${variables.gray40};
        transition: fill ${variables.duration} linear;
      }

      > div {
        margin-left: 10px;
      }

      &:hover {
        color: ${variables.white};
        background: ${variables.gray20};

        svg, svg g {
          fill: ${variables.white} !important;
          stroke: ${variables.white} !important;
        }
      }
    `

    const BlueSettingsLink = styled(SettingsLink)`
      background: ${variables.blue};
      color: ${variables.white};

      svg {
        fill: ${variables.white};
        stroke: ${variables.white};
        transition: fill ${variables.duration} linear;
      }

      > div {
        margin-left: 10px;
      }

      &:hover {
        background: ${variables.blue80};
      }
    `

    return (
      <div className={classes.root}>
        {this.state.authProviderPopupVisible &&
        <PopupWrapper>
          <AuthProviderPopup
            project={this.props.project}
            close={() => this.setState({ authProviderPopupVisible: false } as State)}
            forceFetchRoot={this.props.forceFetchRoot}
          />
        </PopupWrapper>
        }
        <div className={classes.top}>
          <Header
            viewer={this.props.viewer}
            params={this.props.params}
            project={this.props.project}
            left={false}
          >
            <div className={headerClasses.left}>
              <div className={classes.info}>
                <div className={classes.title}>
                  {this.props.model.name}
                  <div className={classes.type}>{`(${schemaTypeText})`}</div>
                  {isSystem ?
                    <span className={classes.system}>System</span>
                    :
                    <Icon
                      width={32}
                      height={32}
                      src={require('graphcool-styles/icons/fill/settings.svg')}
                      color={variables.gray10}
                      onClick={this.openEditModelModal}
                      className={cx(
                        particles.ml6,
                        particles.mt6,
                        particles.pointer,
                      )}
                    />
                  }
                </div>
                <div className={classes.titleDescription}>
                  <ModelDescription model={this.props.model}/>
                </div>
              </div>
            </div>
            <div className={headerClasses.right}>
              {schemaActive ? (
                <BlueSettingsLink
                  to={`/${this.props.params.projectName}/models/${this.props.params.modelName}/databrowser`}
                  onClick={this.dataViewOnClick}
                >
                  <Icon width={20} height={20} src={require('graphcool-styles/icons/fill/check.svg')}/>
                  <Tether
                    steps={[{
                      step: 'STEP3_CLICK_DATA_BROWSER',
                      title: 'Switch to the Data Browser',
                      description: 'In the Data Browser you can view and manage your data ("Post" nodes in our case).', // tslint:disable-line
                    }]}
                    width={280}
                    offsetX={-50}
                    offsetY={5}
                    zIndex={2000}
                  >
                    <div>Done Editing Schema</div>
                  </Tether>
                </BlueSettingsLink>
              ) : (
                <SettingsLink
                  to={`/${this.props.params.projectName}/models/${this.props.params.modelName}/schema`}
                  onClick={this.onClickEditSchema}
                >
                  <Icon width={20} height={20} src={require('graphcool-styles/icons/fill/structure.svg')}/>
                  <div>Edit Schema</div>
                </SettingsLink>
              )}
            </div>
          </Header>
        </div>
        <div className={classes.bottom}>
          <div className={cx(
            schemaActive ? classes.buttons_schema : classes.buttons, particles.z5, {
            [this.props.buttonsClass]: this.props.buttonsClass && this.props.buttonsClass.length > 0,
          })}>
            {this.props.model.name === 'User' && !schemaActive &&
            <div
              className={cx(
                  particles.ml10,
                  particles.f14,
                  particles.pa10,
                  particles.pointer,
                  particles.ttu,
                  particles.bgWhite,
                  particles.black50,
                  particles.lhSolid,
                  particles.fw6,
                  particles.buttonShadow,
                  particles.tracked,
                )}
              onClick={() => this.setState({authProviderPopupVisible: true} as State)}
              >
                Configure Auth Provider
            </div>
            }
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }

  private onClickEditSchema = () => {
    tracker.track(ConsoleEvents.Databrowser.editSchemaClicked())
  }

  private openEditModelModal = () => {
    const {model} = this.props
    if (model.isSystem || SYSTEM_MODELS.includes(model.name)) {
      return
    }

    const id = cuid()
    this.props.showPopup({
      element: <EditModelPopup
        id={id}
        projectId={this.props.project.id}
        modelName={this.props.model.name}
        saveModel={this.renameModel}
        deleteModel={this.deleteModel}
      />,
      id,
    })
  }

  private renameModel = (modelName: string) => {
    const redirect = () => {
      this.props.router.replace(`/${this.props.params.projectName}/models/${modelName}`)
    }

    if (modelName) {
      Relay.Store.commitUpdate(
        new UpdateModelNameMutation({
          name: modelName,
          modelId: this.props.model.id,
        }),
        {
          onSuccess: () => {
            tracker.track(ConsoleEvents.Schema.Model.renamed({id: this.props.model.id}))
            redirect()
          },
          onFailure: (transaction) => {
            onFailureShowNotification(transaction, this.props.showNotification)
          },
        },
      )
    }
  }

  private deleteModel = () => {

    if (window.confirm('Do you really want to delete this model?')) {
      this.props.router.replace(`/${this.props.params.projectName}/models`)

      Relay.Store.commitUpdate(
        new DeleteModelMutation({
          projectId: this.props.project.id,
          modelId: this.props.model.id,
          fields: this.props.model.fields,
        }),
        {
          onSuccess: () => {
            tracker.track(ConsoleEvents.Schema.Model.Popup.deleted({type: 'Update'}))
            this.props.forceFetchRoot()
          },
          onFailure: (transaction) => {
            onFailureShowNotification(transaction, this.props.showNotification)
          },
        },
      )
    }
  }

  private dataViewOnClick = () => {
    tracker.track(ConsoleEvents.Schema.doneEditingClick())
    if (this.props.gettingStartedState.isCurrentStep('STEP3_CLICK_DATA_BROWSER')) {
      this.props.nextStep()
    }
  }
}

const ReduxContainer = connect(
  state => ({
    gettingStartedState: state.gettingStarted.gettingStartedState,
  }),
  {
    nextStep,
    showNotification,
    showPopup,
  },
)(withRouter(ModelHeader))

export default Relay.createContainer(ReduxContainer, {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        ${Header.getFragment('viewer')}
      }
    `,
    project: () => Relay.QL`
      fragment on Project {
        ${Header.getFragment('project')}
        ${AuthProviderPopup.getFragment('project')}
      }
    `,
    model: () => Relay.QL`
      fragment on Model {
        id
        name
        itemCount
        isSystem
        fields(first: 100) {
          edges {
            node {
              id
              name
              typeIdentifier
              relatedModel {
                id
              }
              reverseRelationField {
                name
                id
              }
            }
          }
        }
        ${ModelDescription.getFragment('model')}
      }
    `,
  },
})
