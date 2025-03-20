import { IKContext, IKImage, IKUpload } from 'imagekitio-react';
import { useRef } from 'react';
import { TbCameraPlus } from "react-icons/tb";

const urlEndpoint = import.meta.env.VITE_IMAGE_KIT_ENDPOINT;
const publicKey = import.meta.env.VITE_IMAGE_KIT_PUBLIC_KEY;

const authenticator =  async () => {
    try {
        const response = await fetch('http://localhost:3000/auth');

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const { signature, expire, token } = data;
        return { signature, expire, token };
    } catch (error) {
        throw new Error(`Authentication request failed: ${error.message}`);
    }
};


const Upload = ({setImg}) => {
  const ikUploadRef = useRef(null);
  const onError = (err) => {
    console.log("Error", err);
  };

  const onSuccess = (res) => {
    setImg((prev) => ({ ...prev, isLoading: false, dbData: res }));
  };

  const onUploadProgress = (progress) => {
  };

  const onUploadStart = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImg((prev) => ({ ...prev, isLoading: true, aiData:{
        inlineData: {
          data: reader.result.split(",")[1],
          mimeType: file.type,
        }
      } }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <IKContext 
        publicKey={publicKey} 
        urlEndpoint={urlEndpoint} 
        authenticator={authenticator} 
      >
        <IKUpload
          fileName="test-upload.png"
          onError={onError}
          onSuccess={onSuccess}
          onUploadStart={onUploadStart}
          onUploadProgress={onUploadProgress}
          style={{display: "none"}}
          ref={ikUploadRef}
        />
        {
          <label onClick={() => ikUploadRef.current.click()}>
          <TbCameraPlus className="text-2xl text-blue-400" />
          </label>
        }
      </IKContext>
    </div>
  );
}

export default Upload;