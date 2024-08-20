import { FC, useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import QrFrame from "../../public/qr-frame.svg";
import Image from "next/image";

export const Warehouses: FC = () => {
  // QR States
  const scanner = useRef<QrScanner>();
  const videoEl = useRef<HTMLVideoElement>(null);
  const qrBoxEl = useRef<HTMLDivElement>(null);
  const [qrOn, setQrOn] = useState<boolean>(true);

  // Result
  const [scannedResult, setScannedResult] = useState<string | undefined>("");

  // Success
  const onScanSuccess = (result: QrScanner.ScanResult) => {
    console.log("Scan Success:", result);
    setScannedResult(result.data);
  };

  // Fail
  const onScanFail = (err: string | Error) => {
    console.error("Scan Fail:", err);
  };

  useEffect(() => {
    const videoElement = videoEl.current;

    if (videoElement && !scanner.current) {
      // Instantiate the QR Scanner
      scanner.current = new QrScanner(videoElement, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        overlay: qrBoxEl.current || undefined,
        maxScansPerSecond: 1,
      });

      // Start QR Scanner
      scanner.current
        .start()
        .then(() => setQrOn(true))
        .catch((err) => {
          console.error("Error starting QR scanner: ", err);
          setQrOn(false);
        });
    }

    // Clean up on unmount
    return () => {
      if (scanner.current) {
        scanner.current.stop();
      }
    };
  }, []);

  // Show alert if camera is not allowed
  useEffect(() => {
    if (!qrOn) {
      alert(
        "Camera is blocked or not accessible. Please allow camera in your browser permissions and Reload."
      );
    }
  }, [qrOn]);

  return (
    <div className="qr-reader">
      <video ref={videoEl} className="qr-video"></video>
      <div className="qr-overlay"></div>
      <div className="qr-box">
        <Image src={QrFrame} alt="Qr Frame" />
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
              setScannedResult(undefined)
            }}
          >
            Cancel
          </button>
        </p>
      )}
    </div>
  )
};

export default Warehouses;