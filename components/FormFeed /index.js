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
import dataURItoBlob from '../../utils/dataURItoBlob';

export class FormFeed extends Component {
  constructor(props) {
    super(props)

    this.state = {
      lat: null,
      lng: null,
      file: null,
      loadingRequest: false,
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
    const image = this.camera.current.getScreenshot();
    this.setState({ file: image });
  };

  handleDetectLocation = () => {
    this.setState({ loadingLocation: true }, () => {
      navigator.geolocation.getCurrentPosition(position => {
        this.setState({ lat: position.coords.longitude, lng: position.coords.latitude })
        reverseGeocoding(position.coords.latitude, position.coords.longitude)
          .then(res => {
            console.log(res)
            if (res.status === 200 && res.data.status === 'OK'
              && 'results' in res.data && res.data.results.length) {
              const formatted_address = res.data.results[0].formatted_address // 7277 Bedford Avenue, Brooklyn, NY 11211, USA
              console.log(formatted_address)
              this.handleChange({
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

  handleOnSubmit = event => {
    event.preventDefault();
    console.log(this.camera);
    this.setState({
      loadingRequest: true
    }, () => {
      const id = new Date().toISOString();
      const file =
        typeof this.state.file === "string" ?
        dataURItoBlob(this.state.file) : 
        this.state.file;
      const FormDataFeed = new FormData();

      FormDataFeed.append('id', id);
      FormDataFeed.append('title', this.state.controls.title.value);
      FormDataFeed.append('location', this.state.controls.location.value);
      FormDataFeed.append('rawLocationLat', this.state.lat);
      FormDataFeed.append('rawLocationLng', this.state.lng);
      FormDataFeed.append('file', file);
      axios.post('https://us-central1-pwagram-7decd.cloudfunctions.net/storePostData', FormDataFeed, {
        config: {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      }).then(res => {
        console.log('Cool!', res);
        this.setState({ loadingRequest: false }, () => {
          this.props.onSubmitCallBack()
        })
      }).catch(err => {
        console.log(err);
        this.setState({ loadingRequest: false })
      })
    })
  }

  handleOnChangeFile = (_, file) => {
    this.setState({ file: file })
  }

  render() {
    const {
      handleDetectLocation,
      handleTryShowCamera,
      handleFallbackCameraFail,
      handleOnChangeFile,
      handleOnSubmit,
      capture,
      state: {
        controls,
        file,
        loadingLocation,
        locationSupport,
        tryShowCamera,
        showFileInput,
        loadingRequest
      }
    } = this

    let disabled = false

    if (!controls.title.value) {
      disabled = true
    } else if (!controls.location.value) {
      disabled = true
    } else if (!file) {
      disabled = true
    }

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
                <Button
                  type='button'
                  onClick={!tryShowCamera ? handleTryShowCamera : capture}
                >
                  Capture
                </Button>
              )
            }
            {
              tryShowCamera && (
                <InputField>
                  {
                    file ?
                    <img
                      src={file}
                      height={350}
                      width={640}
                    />
                    :
                    <Webcam
                      audio={false}
                      height={350}
                      width={640}
                      ref={this.camera}
                      screenshotFormat="image/jpeg"
                      videoConstraints={this.videoConstraints}
                      onUserMediaError={handleFallbackCameraFail}
                    />
                  }
                </InputField>
              )
            }
            {
              showFileInput && (
                <InputField>
                  <FileInput onChange={handleOnChangeFile} />
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
              <Button type='button' onClick={handleDetectLocation}>
                Detect Location
              </Button>
            ) : null
            }
          </InputField>
          <br />
          <InputField>
            {
              loadingRequest ? <Spinner /> : (
                <Button
                  type='submit'
                  onClick={handleOnSubmit}
                  disabled={disabled || loadingRequest}
                >
                  Save
                </Button>
              )
            }

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