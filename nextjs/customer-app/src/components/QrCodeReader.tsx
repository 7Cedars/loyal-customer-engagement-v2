// file = Html5QrcodePlugin.jsx
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

const qrcodeRegionId = "html5qr-code-full-region";

type ConfigProps = {
  fps: number; 
  qrbox: number;
  aspectRatio?: number; 
  disableFlip?: boolean; 
  verbose?: boolean; 
  qrCodeSuccessCallback?: any; 
  qrCodeErrorCallback?: any; 
}

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props: ConfigProps) => {
    let config: ConfigProps = {fps: 5, qrbox: 500, aspectRatio: 1.77, disableFlip: false, 
      verbose: true,   
      qrCodeSuccessCallback: undefined, 
      qrCodeErrorCallback: undefined
    };
    if (props.fps) {
        config.fps = props.fps;
    }
    if (props.qrbox) {
        config.qrbox = props.qrbox;
    }
    if (props.aspectRatio) {
        config.aspectRatio = props.aspectRatio;
    }
    if (props.disableFlip !== undefined) {
        config.disableFlip = props.disableFlip;
    }
    return config;
};

const QrCodeReader = (props: ConfigProps) => {

    useEffect(() => {
        // when component mounts
        const config = createConfig(props);
        console.log("config: ", config)
        const verbose = props.verbose === true;
        // Suceess callback is required.
        if (!(props.qrCodeSuccessCallback)) {
            throw "qrCodeSuccessCallback is required callback.";
        }
        const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
        console.log("html5QrcodeScanner: ", html5QrcodeScanner)
        html5QrcodeScanner.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);

        // cleanup function when component will unmount
        return () => {
            html5QrcodeScanner.clear().catch((error: any) => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        };
    }, []);

    return (
        <div 
          id={qrcodeRegionId} 
          className='w-fit h-fit'
          />
    );
};

export default QrCodeReader;