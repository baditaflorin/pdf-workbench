export type RecentProject = {
  id: string;
  fileName: string;
  pageCount: number;
  updatedAt: string;
  ocrPages: number;
};

const dbName = "pdf-workbench";
const storeName = "recent-projects";

export async function saveRecentProject(record: RecentProject) {
  const db = await openDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("Could not save recent project metadata."));
  });
}

export async function listRecentProjects() {
  const db = await openDb();

  return new Promise<RecentProject[]>((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const request = tx.objectStore(storeName).getAll();
    request.onsuccess = () => {
      resolve(
        (request.result as RecentProject[]).sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        ),
      );
    };
    request.onerror = () =>
      reject(request.error ?? new Error("Could not load recent projects."));
  });
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(storeName, { keyPath: "id" });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Could not open browser storage."));
  });
}
