import { useRef } from "react";
import { FileFormates } from "./constants";
const UploadFile = ({ onChange, name, key, values, isError }) => {
  const fileInputRef = useRef();
  const handleFileSelect = () => {
    fileInputRef?.current?.click();
  };
  return (
    <div
      className={`d-flex border ${
        isError ? "border-danger" : "border-dark"
      } rounded p-10 mt-2`}
      onClick={handleFileSelect}
    >
      <input
        key={key}
        type="file"
        ref={fileInputRef}
        name={name}
        value={values}
        style={{ display: "none" }}
        onChange={onChange}
        accept={FileFormates.image}
      />
      <h2 className="fa fa-cloud-upload" aria-hidden="true" />
    </div>
  );
};

export default UploadFile;
