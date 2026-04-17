import { CsvImportWizard } from "@/components/csv-import-wizard";

export const metadata = {
  title: "CSV Import — Utah Rugby Alumni Network Admin",
};

export default function ImportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">CSV Import</h1>
      <CsvImportWizard />
    </div>
  );
}
