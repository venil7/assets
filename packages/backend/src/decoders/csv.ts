import { validationErr } from "@darkruby/assets-core/src/decoders/util";
import type { Action } from "@darkruby/assets-core";
import { validationError } from "@darkruby/assets-core";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";

// Configuration limits for CSV validation
const CSV_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
const CSV_ROW_LIMIT = 10000; // 10,000 rows max
const CSV_COLUMN_LIMIT = 20; // 20 columns max

export const fromCsv = <A, O = A, I = unknown>(decoder: t.Type<A, O, I>) => {
  return new t.Type<A[], string, string>(
    `fromCsv(${decoder.name})`,
    (a): a is A[] => t.array(decoder as t.Mixed).is(a),
    ((inp) => {
      return pipe(
        E.tryCatch(
          () => parse(inp, { columns: true, autoParse: true, cast: true }),
          (e) => [validationErr((e as Error).message)]
        ),
        E.chain(E.traverseArray((i) => decoder.decode(i as I)))
      );
    }) as t.Validate<string, A[]>,
    (as: A[]) => {
      return stringify(JSON.parse(JSON.stringify(as)), { header: true });
    }
  );
};

// File validation
export type ValidatedCSVFile = {
  filename: string;
  size: number;
  mimeType: string;
};

/**
 * Validates CSV file metadata (size, name, MIME type)
 * Prevents DoS attacks via excessively large files
 */
export const validateCSVFile = (
  file: { originalname?: string; size?: number; mimetype?: string } | null | undefined
): Action<ValidatedCSVFile> =>
  pipe(
    TE.Do,
    TE.bind("file", () =>
      file ? TE.of(file) : TE.left(validationError("No file provided"))
    ),
    TE.bind("filename", ({ file }) =>
      file.originalname
        ? TE.of(file.originalname)
        : TE.left(validationError("Missing filename"))
    ),
    TE.bind("size", ({ file }) =>
      file.size !== undefined
        ? TE.of(file.size)
        : TE.left(validationError("Missing file size"))
    ),
    TE.chain(({ file, filename, size }) => {
      // Check file size
      if (size > CSV_SIZE_LIMIT) {
        return TE.left(
          validationError(
            `CSV file exceeds 5MB limit (${(size / 1024 / 1024).toFixed(1)}MB)`
          )
        );
      }

      // Check file extension
      if (!filename.toLowerCase().endsWith(".csv")) {
        return TE.left(validationError("File must be .csv format"));
      }

      return TE.of({
        filename,
        size,
        mimeType: file.mimetype || "text/csv",
      });
    })
  );

/**
 * Validates CSV row data (row count, column count, structure)
 * Prevents parsing errors and excessive memory usage
 */
export const validateCSVRows = (
  rows: string[][] | any[]
): Action<{ rowCount: number; columnCount: number }> =>
  pipe(
    TE.Do,
    TE.bind("rowCount", () => TE.of(rows.length)),
    TE.chain(({ rowCount }) => {
      // Check row count limit
      if (rowCount > CSV_ROW_LIMIT) {
        return TE.left(
          validationError(
            `CSV exceeds ${CSV_ROW_LIMIT} rows (has ${rowCount})`
          )
        );
      }

      // Check if any row exceeds column limit
      const maxColumns = Math.max(
        ...rows.map((row) => (Array.isArray(row) ? row.length : 0))
      );
      if (maxColumns > CSV_COLUMN_LIMIT) {
        return TE.left(
          validationError(
            `CSV exceeds ${CSV_COLUMN_LIMIT} columns (has ${maxColumns})`
          )
        );
      }

      // Ensure all rows are arrays
      if (!rows.every((row) => Array.isArray(row))) {
        return TE.left(validationError("CSV data is malformed"));
      }

      return TE.of({
        rowCount,
        columnCount: maxColumns,
      });
    })
  );
