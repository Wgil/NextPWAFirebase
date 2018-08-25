import React, { Component } from 'react'
import Webcam from "react-webcam";
import Button from '../Button';
import Title from '../Title';
import Input, { InputField } from '../Input';
import TitleDescription from '../TitleDescription';
import inputChanged from '../../utils/inputChange';
import Spinner from '../Spinner';
import reverseGeocoding from '../../utils/reverseGeocoding';
import axios from 'axios';
import FileInput from '../FileInput';


export class FormFeed extends Component {
  constructor(props) {
    super(props)

    this.state = {
      supportMedia: true,
      loadingLocation: false,
      locationSupport: true,
      tryShowCamera: false,
      showFileInput: false,
      controls: {
        title: {
          value: '',
          validation: {
            required: true,
            minLength: 4,
            maxLength: 45
          },
          valid: false,
          touched: false,
          errors: {
            message: null
          }
        },
        location: {
          value: '',
          validation: {
            required: true,
            minLength: 1
          },
          valid: false,
          touched: false,
          errors: {
            message: null
          }
        }
      }
    }

    this.videoConstraints = {
      width: 1280,
      height: 720,
      facingMode: "user"
    }
    this.camera = React.createRef()
    this.handleChange = inputChanged(this)
  }

  capture = () => {
    const imageSrc = this.camera.current.getScreenshot();
  };

  handleDetectLocation = () => {
    this.setState({ loadingLocation: true }, () => {
      navigator.geolocation.getCurrentPosition(position => {
        reverseGeocoding(position.coords.latitude, position.coords.longitude)
          .then(res => {
            if ('results' in res && res.results.length) {
              const formatted_address = res.results[0].formatted_address // 7277 Bedford Avenue, Brooklyn, NY 11211, USA

              this.inputChanged({
                target: {
                  value: formatted_address
                }
              }, 'location')
            }
            this.setState({ loadingLocation: false })
          })
          .catch(() => this.setState({ loadingLocation: false }))
      }, err => {
        this.setState({ loadingLocation: false })
      }, { timeout: 7500 });
    })
  }

  handleTryShowCamera = () => {
    this.setState({ tryShowCamera: true })
  }

  handleFallbackCameraFail = () => {
    this.setState({
      tryShowCamera: false,
      showFileInput: true
    })
  }

  componentDidMount = () => {
    if (!('geolocation' in navigator)) {
      this.setState({
        locationSupport: false
      })
    }
  }

  render() {
    const {
      handleDetectLocation,
      handleTryShowCamera,
      handleFallbackCameraFail,
      state: {
        controls,
        loadingLocation,
        locationSupport,
        tryShowCamera,
        showFileInput
      }
    } = this
    return (
      <React.Fragment>
        <form className='FormFeed'>
          <Title>Create New Feed</Title>
          <InputField>
            <TitleDescription>
              {showFileInput ? 'Upload Image' : 'Capture a image'}
            </TitleDescription>
            {
              showFileInput || (
                <Button type='button' onClick={handleTryShowCamera}>
                  Capture
                </Button>
              )
            }
            {
              tryShowCamera && (
                <InputField>
                  <Webcam
                    audio={false}
                    height={350}
                    width={'100%'}
                    ref={this.camera}
                    screenshotFormat="image/jpeg"
                    videoConstraints={this.videoConstraints}
                    onUserMediaError={handleFallbackCameraFail}
                  />
                </InputField>
              )
            }
            {
              showFileInput && (
                <InputField>
                  <FileInput />
                </InputField>
              )
            }
          </InputField>
          <Input
            label='Title'
            elementType='input'
            invalid={controls.title.errors.message}
            shouldValidate={true}
            name='title'
            value={controls.title.value}
            touched={controls.title.touched}
            changed={event => this.handleChange(event, 'title')}
            elementConfig={{
              type: 'text',
              required: true
            }}
          />
          <Input
            label='Location'
            elementType='input'
            invalid={controls.location.errors.message}
            shouldValidate={true}
            name='location'
            value={controls.location.value}
            touched={controls.location.touched}
            changed={event => this.handleChange(event, 'location')}
            elementConfig={{
              type: 'text',
              required: true
            }}
          />
          <InputField>
            {locationSupport ? loadingLocation ? <Spinner /> : (
              <Button type='submit' onClick={handleDetectLocation}>
                Detect Location
              </Button>
            ) : null
            }
          </InputField>
          <br />
          <InputField>
            <Button type='submit'>
              Save
            </Button>
          </InputField>
        </form>

        <style jsx>{`
          .FormFeed {
            padding: 2rem 0
          }
        `}</style>
      </React.Fragment>
    )
  }
}

export default FormFeed