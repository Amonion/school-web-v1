'use client'
import Image from 'next/image'

import { useState, useEffect, useRef } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as faceDetection from '@tensorflow-models/face-detection'
import { BioUserStore } from '@/src/zustand/user/BioUser'
// import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export default function Capture() {
  const [detection, setDetection] = useState('No Face Detected')
  const [isRecording, setRecording] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [photo, setPhoto] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { setForm, bioUserForm } = BioUserStore()
  const [model, setModel] = useState<faceDetection.FaceDetector | null>(null)

  useEffect(() => {
    const loadModel = async () => {
      if (typeof window === 'undefined') return
      await tf.setBackend('webgl')
      await tf.ready()

      const detector = await faceDetection.createDetector(
        faceDetection.SupportedModels.MediaPipeFaceDetector,
        { runtime: 'tfjs' }
      )

      setModel(detector)
    }

    loadModel()
  }, [])

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setRecording(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const stopCamera = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return

    const stream = videoRef.current.srcObject as MediaStream
    stream.getTracks().forEach((track) => track.stop())

    videoRef.current.srcObject = null
    setRecording(false)
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas element is missing.')
      return
    }

    setDetection('Face Detecting...')

    const canvas = canvasRef.current
    const video = videoRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = canvas.toDataURL('image/png')
      setPhoto(imageData)
      detectFace(imageData)
      setRecording(false)
    } else {
      setDetection('Face Not Detected. Try Again')
    }
  }

  const detectFace = async (image: string) => {
    if (!model) {
      console.error('Face detection model not loaded yet.')
      return
    }

    try {
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = image

      img.onload = async () => {
        const predictions = await model.estimateFaces(img)
        if (predictions.length > 0) {
          setForm('passport', image)
          stopCamera()
          setDetection('Face Detected')
        } else {
          setDetection(
            attempt === 2
              ? 'Face Will Be Validated. Continue'
              : attempt === 1
              ? 'Face Not Detected. Try One More'
              : 'Face Not Detected. Try Again'
          )
          if (attempt === 2) {
            setForm('passport', image)
          } else {
            setAttempt(attempt + 1)
          }
        }
      }
    } catch (error) {
      console.error('Error detecting face:', error)
      setDetection('Face Not Detected. Try Again')
    }
  }

  // const clearPhoto = async () => {
  //   setForm("passport", "");
  //   setPhoto(null);
  //   detectFace(``);
  //   setFaceDetected(false);
  // };
  return (
    <>
      <div className="flex flex-col items-center justify-center mb-3">
        <div className="field-label mb-1">{detection} </div>

        {bioUserForm.passport && !isRecording ? (
          <Image
            className="videoFeed"
            src={`${bioUserForm.passport}`}
            alt="Captured"
            sizes="100vw"
            width={0}
            height={0}
            style={{
              borderRadius: '5px',
              width: '200px',
              height: '200px',
              objectFit: 'cover',
              maxWidth: '200px',
            }}
          />
        ) : (
          !isRecording &&
          !photo && (
            <Image
              className="videoFeed"
              src="/images/avatar.jpg"
              alt="Captured"
              sizes="100vw"
              width={0}
              height={0}
              style={{
                borderRadius: '5px',
                width: '200px',
                height: '200px',
                objectFit: 'cover',
                maxWidth: '200px',
              }}
            />
          )
        )}
        <video
          className="videoFeed"
          ref={videoRef}
          style={{
            display: !isRecording ? 'none' : 'block',
            width: '200px',
            borderRadius: '5px',
            height: '200px',
            objectFit: 'cover',
            maxHeight: '200px',
          }}
        />
        {photo && bioUserForm.passport === '' && !isRecording && (
          <Image
            className="videoFeed"
            src={photo}
            alt="Captured"
            sizes="100vw"
            width={0}
            height={0}
            style={{
              borderRadius: '5px',
              width: '200px',
              height: '200px',
              objectFit: 'cover',
              maxWidth: '200px',
            }}
          />
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
      <div className="flex justify-center">
        {isRecording ? (
          <>
            <div onClick={stopCamera} className="btn mx-2">
              Stop Capture
            </div>

            <div onClick={capturePhoto} className="btn mx-2">
              Capture Photo
            </div>
          </>
        ) : (
          <>
            <div onClick={initCamera} className="btn mx-2">
              Start Capture
            </div>

            {/* {photo && (
              <div onClick={clearPhoto} className="btn mx-2">
                Clear Photo
              </div>
            )} */}
          </>
        )}
      </div>
    </>
  )
}
