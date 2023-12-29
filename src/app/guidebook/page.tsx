import NotionPage from "../components/NotionPage";
import { NotionAPI } from "notion-client";
const notion = new NotionAPI();

export default async function Page() {
  const recordMap = await notion.getPage("067dd719a912471ea9a3ac10710e7fdf");
  return (
    <main className="p-4 grid grid-cols-3 gap-2 h-screen bg-white">
      {/* Left Column */}
      <div className="border p-4 bg-white overflow-auto">
        <NotionPage recordMap={recordMap} />
      </div>
    </main>
  );
}
