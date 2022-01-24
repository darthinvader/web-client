import { electronicFormat, isValid, printFormat } from 'iban'
import React, { useEffect, useState } from 'react'
import { Widget, WidgetProps } from 'react-jsonschema-form'
import PhoneInput, { Country } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

function defaultCountry(localePrefs: string[]): Country {
  const lang = (localePrefs[0] || 'en').substr(0, 2)
  switch (lang) {
    case 'en':
      return 'GB'
    case 'da':
      return 'DK'
  }
  return lang.toUpperCase() as Country
}

interface MakeInputComponentProps {
  disabled: boolean
  autofocus: boolean
  placeholder: string
}

function makeInputComponent({ disabled, autofocus, placeholder }: MakeInputComponentProps) {
  return React.forwardRef(function CustomInput(props: any, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className="form-control"
        disabled={disabled}
        autoFocus={autofocus}
        placeholder={placeholder || '012-3456789'}
      />
    )
  })
}

interface PhoneNumberWidgetProps {
  value: string
  onChange: (value: string) => void
  formContext: { localePrefs: string[] }
  disabled: boolean
  autofocus: boolean
  placeholder: string
}

class PhoneNumberWidget extends React.Component<PhoneNumberWidgetProps> {
  inputComponent: any
  constructor(props: PhoneNumberWidgetProps) {
    super(props)
    this.inputComponent = makeInputComponent(this.props)
  }

  render() {
    const { value, onChange } = this.props
    return (
      <PhoneInput
        value={value}
        onChange={onChange}
        defaultCountry={defaultCountry(this.props.formContext.localePrefs)}
        inputComponent={this.inputComponent}
      />
    )
  }
}

const IbanFormWidget: React.FC<WidgetProps> = ({ value, onChange, disabled, autofocus, formContext, id }) => {
  const [error, setError] = useState(true)

  const onIBANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = electronicFormat(e.target.value)
    onChange(value)
  }

  useEffect(() => {
    formContext.widgetErrorsPlace(id, error)
  }, [error])

  useEffect(() => {
    if (!isValid(value)) {
      setError(true)
    } else {
      setError(false)
    }
  }, [value])

  const validate = () => {
    if (error) {
      return <div style={{ color: 'red' }}>IBAN is invalid</div>
    }
    return null
  }

  return (
    <div key={id}>
      <input
        type="text"
        className="form-control"
        onChange={onIBANChange}
        value={printFormat(value || '')}
        disabled={disabled}
        autoFocus={autofocus}
        placeholder="IBAN"
      ></input>{' '}
      {validate()}
    </div>
  )
}
export default {
  phone_number: PhoneNumberWidget as unknown as Widget,
  iban_number: IbanFormWidget as unknown as Widget,
}
