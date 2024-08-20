import QrScanner from 'qr-scanner'
import { FC, useEffect, useRef, useState } from 'react'
import QrFrame from '../../public/images/qr-frame.svg'
// import "../../public/ckeditor/qrcode/qrStyle.css";
import '../styles/qrcode/qrStyle.css'

export const QrCode: FC<{
  setScannedData: any
  duplicateFulfilledItems: any
  setDuplicateFulfilledItems: any
}> = ({
  setScannedData,
  duplicateFulfilledItems,
  setDuplicateFulfilledItems
}) => {
  // QR States
  const scanner = useRef<QrScanner>()
  const videoEl = useRef<HTMLVideoElement>(null)
  const [qrOn, setQrOn] = useState<boolean>(true)
  // Result
  const [scannedResult, setScannedResult] = useState<string | undefined>('')

  // Success
  const onScanSuccess = (result: QrScanner.ScanResult) => {
    setScannedResult(result.data)
  }

  // Fail
  const onScanFail = (err: string | Error) => {
    console.error('Scan Fail:', err)
  }

  useEffect(() => {
    const videoElement = videoEl.current

    if (videoElement && !scanner.current) {
      // Instantiate the QR Scanner
      scanner.current = new QrScanner(videoElement, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: 'environment',
        highlightScanRegion: true,
        highlightCodeOutline: true
      })

      // Start QR Scanner
      scanner.current
        .start()
        .then(() => setQrOn(true))
        .catch(err => {
          console.error('Error starting QR scanner: ', err)
          setQrOn(false)
        })
    }

    // Clean up on unmount
    return () => {
      if (scanner.current) {
        scanner.current.stop()
      }
    }
  }, [])

  useEffect(() => {
    if (!qrOn) {
      alert(
        'Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload.'
      )
    }
  }, [qrOn])

  return (
    <div className="qr-reader">
      <video ref={videoEl} className="qr-video"></video>
      <div className="qr-overlay"></div>
      <div className="qr-box">
        <img src={QrFrame} alt="Qr Frame" />
        <div className="scanner-line"></div>
      </div>
      {scannedResult && (
        <p
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 99999,
            color: 'white'
          }}
        >
          Scanned Result: {scannedResult}
          <button
            className="btn"
            onClick={() => {
              const scannedData = JSON.parse(scannedResult)
              const fulfilledItem = duplicateFulfilledItems.filter(
                (item: any) =>
                  item.productId === scannedData.productId
              )

             
              let remainingQuantity = scannedData.quantity;

              const updatedFulfilledItems = duplicateFulfilledItems.map((item: any) => {
                if (item.productId === scannedData.productId) {
                  if (remainingQuantity > 0) {
                    if (item.quantity >= remainingQuantity) {
                      const newItem = {
                        ...item,
                        quantity: item.quantity - remainingQuantity
                      };
                      remainingQuantity = 0;
                      return newItem;
                    } else {
                      remainingQuantity -= item.quantity;
                      return {
                        ...item,
                        quantity: 0
                      };
                    }
                  }
                }
                return item;
              });
         
              // fulfilledItem.quantity = fulfilledItem.quantity - scannedData.quantity
              setDuplicateFulfilledItems(updatedFulfilledItems)
              setScannedData((prevData: any) => [...prevData, scannedData])
              setScannedResult(undefined)
              return
            }}
          >
            Submit
          </button>
          <button
            className="btn"
            onClick={() => {
              setScannedResult(undefined)
            }}
          >
            Cancel
          </button>
        </p>
      )}
    </div>
  )
}

export default QrCode
