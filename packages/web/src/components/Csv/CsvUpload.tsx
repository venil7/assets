import { useDropzone, type DropzoneOptions } from "react-dropzone";
import { SecondaryButton } from "../Form/FormControl";

type OnDropHandler = NonNullable<DropzoneOptions["onDrop"]>;
type OnDropRejectedHandler = NonNullable<DropzoneOptions["onDropRejected"]>;

const accept: NonNullable<DropzoneOptions["accept"]> = {
  "text/csv": [],
};

export type CsvDropzoneProps = {};

export const CsvDropzone: React.FC<CsvDropzoneProps> = () => {
  const onDrop: OnDropHandler = (files) => {
    console.log(files.map((f) => f.name));
  };

  const onDropRejected: OnDropRejectedHandler = (f) => {
    console.error(f);
  };

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept,
      onDropRejected,
      multiple: false,
    });

  const handle = () => {
    const fr = new FileReader();
    fr.readAsText(acceptedFiles[0]);
    fr.addEventListener("load", (evt) => {
      const csvData = evt.target?.result;
      if (csvData) {
        console.info(csvData);
      }
    });
  };

  return (
    <>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
      </div>
      <SecondaryButton onClick={handle} disabled={!acceptedFiles.length}>
        handle
      </SecondaryButton>
    </>
  );
};
