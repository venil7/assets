import type { AppError, Nullable, Result } from "@darkruby/assets-core";
import classnames from "classnames";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { useRef } from "react";
import {
  useDropzone,
  type DropzoneOptions,
  type FileWithPath,
} from "react-dropzone";
import "./DropArea.scss";

type OnDropHandler = NonNullable<DropzoneOptions["onDrop"]>;
type DropZoneAccept = NonNullable<DropzoneOptions["accept"]>;
const accept: DropZoneAccept = { "text/csv": [] };

export type CsvUploadProps<T> = {
  decode: (csv: string) => Result<T[]>;
  onParse: (items: T[], error: Nullable<AppError>) => void;
  disabled?: boolean;
};

export function CsvUpload<T>({ decode, onParse, disabled }: CsvUploadProps<T>) {
  const fr = useRef(new FileReader());
  const handleSuccess = (data: T[]) => onParse(data, null);
  const handleError = (error: AppError) => onParse([], error);

  const onDrop: OnDropHandler = (files: FileWithPath[]) => {
    if (files.length) {
      fr.current.readAsText(files[0]);
      fr.current.addEventListener("load", (evt) => {
        const csv = evt.target?.result;
        if (csv) {
          return pipe(
            decode(csv.toString()),
            E.fold(handleError, handleSuccess)
          );
        }
      });
    }
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    acceptedFiles: _,
  } = useDropzone({
    onDrop,
    accept,
    disabled,
    multiple: false,
  });
  return (
    <>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <DropArea isDragActive={isDragActive} />
        {/* <Info hidden={isDragActive}>Drag CSV file here</Info> */}
        {/* <Warning hidden={!isDragActive}>Drop CSV file here</Warning> */}
      </div>
    </>
  );
}

export const DropArea: React.FC<{ isDragActive: boolean }> = ({
  isDragActive,
}) => (
  <div className={classnames("drop-area", { "drag-active": isDragActive })}>
    Drop CSV files here, or click to open
  </div>
);
