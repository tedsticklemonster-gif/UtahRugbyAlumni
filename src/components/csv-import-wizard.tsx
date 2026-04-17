"use client";

import { useState, useCallback } from "react";
import { importCsvAction, type ImportResult } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DB_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "grad_year",
  "position",
  "phone",
  "profession",
  "job_title",
  "company",
  "city",
  "state",
  "linkedin_url",
] as const;

type Step = "upload" | "map" | "preview" | "result";

export function CsvImportWizard() {
  const [step, setStep] = useState<Step>("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (lines.length < 2) return;

        const headers = parseCsvLine(lines[0]);
        const rows = lines.slice(1).map(parseCsvLine);

        setCsvHeaders(headers);
        setCsvRows(rows);

        // Auto-map columns with matching names
        const autoMap: Record<string, string> = {};
        for (const field of DB_FIELDS) {
          const match = headers.find(
            (h) =>
              h.toLowerCase().replace(/[\s_-]/g, "") ===
              field.toLowerCase().replace(/_/g, "")
          );
          if (match) autoMap[field] = match;
        }
        setMapping(autoMap);
        setStep("map");
      };
      reader.readAsText(file);
    },
    []
  );

  function getMappedRows(): Record<string, string>[] {
    return csvRows.map((row) => {
      const mapped: Record<string, string> = {};
      for (const [dbField, csvHeader] of Object.entries(mapping)) {
        const idx = csvHeaders.indexOf(csvHeader);
        if (idx >= 0 && row[idx]) {
          mapped[dbField] = row[idx];
        }
      }
      return mapped;
    });
  }

  async function handleImport() {
    setImporting(true);
    const mappedRows = getMappedRows();
    const fd = new FormData();
    fd.set("rows", JSON.stringify(mappedRows));
    const res = await importCsvAction(fd);
    setResult(res);
    setStep("result");
    setImporting(false);
  }

  if (step === "upload") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
          <CardDescription>
            Upload a CSV file with alumni data. You&apos;ll map columns in the
            next step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="text-sm"
          />
        </CardContent>
      </Card>
    );
  }

  if (step === "map") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Map Columns</CardTitle>
          <CardDescription>
            Match CSV columns to database fields. Unmapped columns will be
            skipped.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {DB_FIELDS.map((field) => (
              <div key={field} className="space-y-1">
                <Label className="text-xs">{field}</Label>
                <select
                  value={mapping[field] ?? ""}
                  onChange={(e) =>
                    setMapping((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  className="h-8 w-full rounded-md border bg-background px-2 text-sm"
                >
                  <option value="">— skip —</option>
                  {csvHeaders.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setStep("preview")}>
              Preview ({csvRows.length} rows)
            </Button>
            <Button variant="ghost" onClick={() => setStep("upload")}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === "preview") {
    const preview = getMappedRows().slice(0, 5);
    const mappedFields = Object.keys(mapping).filter((k) => mapping[k]);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            First 5 of {csvRows.length} rows. Records will be imported with
            status &quot;imported&quot; (or &quot;needs_research&quot; if no
            email).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  {mappedFields.map((f) => (
                    <th key={f} className="px-3 py-2 text-left font-medium">
                      {f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t">
                    {mappedFields.map((f) => (
                      <td key={f} className="px-3 py-2">
                        {row[f] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Imported records will NOT receive emails automatically. Use the
            Email page to send emails separately.
          </p>
          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={importing}>
              {importing
                ? "Importing..."
                : `Import ${csvRows.length} Records`}
            </Button>
            <Button variant="ghost" onClick={() => setStep("map")}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Result step
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Complete</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-md bg-green-50 p-3 text-center">
            <p className="text-2xl font-bold text-green-800">
              {result?.created ?? 0}
            </p>
            <p className="text-xs text-green-700">Created</p>
          </div>
          <div className="rounded-md bg-yellow-50 p-3 text-center">
            <p className="text-2xl font-bold text-yellow-800">
              {result?.skipped ?? 0}
            </p>
            <p className="text-xs text-yellow-700">
              Skipped (duplicate email)
            </p>
          </div>
          <div className="rounded-md bg-red-50 p-3 text-center">
            <p className="text-2xl font-bold text-red-800">
              {result?.errors.length ?? 0}
            </p>
            <p className="text-xs text-red-700">Errors</p>
          </div>
        </div>
        {result?.errors && result.errors.length > 0 && (
          <div className="max-h-40 overflow-auto rounded-md border p-3 text-xs">
            {result.errors.map((err, i) => (
              <p key={i} className="text-destructive">
                {err}
              </p>
            ))}
          </div>
        )}
        <Button variant="outline" onClick={() => setStep("upload")}>
          Import Another File
        </Button>
      </CardContent>
    </Card>
  );
}

// Simple CSV line parser handling quoted fields
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
