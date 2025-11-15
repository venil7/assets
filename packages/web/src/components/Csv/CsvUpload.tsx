import type { AppError, Nullable, Result } from "@darkruby/assets-core";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { useRef, useState } from "react";
import {
  useDropzone,
  type DropzoneOptions,
  type FileWithPath,
} from "react-dropzone";
import { Error } from "../../decorators/errors";
import { Info, Success } from "../Form/Alert";

type OnDropHandler = NonNullable<DropzoneOptions["onDrop"]>;

const accept: NonNullable<DropzoneOptions["accept"]> = {
  "text/csv": [],
};

export type CsvUploadProps<T> = {
  decode: (csv: string) => Result<T[]>;
  onParse: (items: T[]) => void;
  onClear?: () => void;
  disabled?: boolean;
};

export function CsvUpload<T>({ decode, onParse, disabled }: CsvUploadProps<T>) {
  const fr = useRef(new FileReader());
  const [error, setError] = useState<Nullable<AppError>>(null);

  const onDrop: OnDropHandler = (files: FileWithPath[]) => {
    if (files.length) {
      fr.current.readAsText(files[0]);
      fr.current.addEventListener("load", (evt) => {
        const csv = evt.target?.result;
        if (csv) {
          return pipe(decode(csv.toString()), E.fold(setError, onParse));
        }
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept,
      disabled,
      multiple: false,
    });

  return (
    <>
      <Error error={error} />
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <Info hidden={isDragActive || acceptedFiles.length > 0}>
          Drop CSV file here
        </Info>
        <Success hidden={!isDragActive}>Drop CSV file here</Success>
        <Success hidden={acceptedFiles.length < 1}>
          {acceptedFiles[0]?.name}
        </Success>
      </div>
    </>
  );
}
