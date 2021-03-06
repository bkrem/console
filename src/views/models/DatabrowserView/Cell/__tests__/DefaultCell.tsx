import * as React from 'react' // tslint:disable-line
import DefaultCell from '../DefaultCell'
import { shallow } from 'enzyme'
import { shallowToJson } from 'enzyme-to-json'

test('DefaultCell renders', () => {

  const save = jest.fn((value: TypedValue) => { /* */ })
  const cancel = jest.fn()
  const onKeyDown = jest.fn()
  const field = {
    id: 'cip3p48sj001e1jsmghwkdt2k',
    name: 'description',
    description: '',
    isReadonly: true,
    isList: false,
    isSystem: true,
    typeIdentifier: 'String',
    relatedModel: null,
  }

  const component = shallow(
    <DefaultCell
      value='some string'
      save={save}
      cancel={cancel}
      onKeyDown={onKeyDown}
      field={field}
    />,
  )

  expect(shallowToJson(component)).toMatchSnapshot()

})
