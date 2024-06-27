import { useDropzone } from 'react-dropzone';

function Dropzone({ style, onFilesAdded }) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      console.log('Files dropped:', acceptedFiles);
      // If an external handler is provided, call it with the accepted files
      if (onFilesAdded) {
        onFilesAdded(acceptedFiles);
      }
    }
  });

  return (
    <div {...getRootProps()} style={{ ...style }}>
      <input {...getInputProps()} />
      <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
    </div>
  );
}

export default Dropzone;