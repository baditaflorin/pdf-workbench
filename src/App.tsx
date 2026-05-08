import { PdfWorkbench } from "./features/pdf/PdfWorkbench";
import { ProjectHeader } from "./features/project/ProjectHeader";

function App() {
  return (
    <main className="app-shell">
      <ProjectHeader />
      <PdfWorkbench />
    </main>
  );
}

export default App;
