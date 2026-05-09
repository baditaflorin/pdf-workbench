export type RecentProject = {
  id: string;
  fileName: string;
  pageCount: number;
  updatedAt: string;
  ocrPages: number;
};

export type UserSettings = {
  schemaVersion: "pdf-workbench.settings.v1";
  autosaveProject: boolean;
  showDebugPanel: boolean;
  confirmPageDelete: boolean;
};

const dbName = "pdf-workbench";
const recentProjectsStore = "recent-projects";
const activeProjectStore = "active-project";
const settingsStore = "settings";

export const defaultSettings: UserSettings = {
  schemaVersion: "pdf-workbench.settings.v1",
  autosaveProject: true,
  showDebugPanel: false,
  confirmPageDelete: true,
};

export async function saveRecentProject(record: RecentProject) {
  const db = await openDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(recentProjectsStore, "readwrite");
    tx.objectStore(recentProjectsStore).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("Could not save recent project metadata."));
  });
}

export async function listRecentProjects() {
  const db = await openDb();

  return new Promise<RecentProject[]>((resolve, reject) => {
    const tx = db.transaction(recentProjectsStore, "readonly");
    const request = tx.objectStore(recentProjectsStore).getAll();
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

export async function clearRecentProjects() {
  const db = await openDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(recentProjectsStore, "readwrite");
    tx.objectStore(recentProjectsStore).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("Could not clear recent projects."));
  });
}

export async function saveActiveProjectArchive(archiveJson: string) {
  const db = await openDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(activeProjectStore, "readwrite");
    tx.objectStore(activeProjectStore).put({
      id: "active",
      archiveJson,
      updatedAt: new Date().toISOString(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("Could not autosave active project."));
  });
}

export async function loadActiveProjectArchive() {
  const db = await openDb();

  return new Promise<string | null>((resolve, reject) => {
    const tx = db.transaction(activeProjectStore, "readonly");
    const request = tx.objectStore(activeProjectStore).get("active");
    request.onsuccess = () => {
      const result = request.result as { archiveJson?: string } | undefined;
      resolve(result?.archiveJson ?? null);
    };
    request.onerror = () =>
      reject(request.error ?? new Error("Could not load active project."));
  });
}

export async function clearActiveProjectArchive() {
  const db = await openDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(activeProjectStore, "readwrite");
    tx.objectStore(activeProjectStore).delete("active");
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("Could not clear active project."));
  });
}

export async function saveUserSettings(settings: UserSettings) {
  const db = await openDb();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(settingsStore, "readwrite");
    tx.objectStore(settingsStore).put({ id: "settings", ...settings });
    tx.oncomplete = () => resolve();
    tx.onerror = () =>
      reject(tx.error ?? new Error("Could not save settings."));
  });
}

export async function loadUserSettings() {
  const db = await openDb();

  return new Promise<UserSettings>((resolve, reject) => {
    const tx = db.transaction(settingsStore, "readonly");
    const request = tx.objectStore(settingsStore).get("settings");
    request.onsuccess = () => {
      const result = request.result as Partial<UserSettings> | undefined;
      resolve({
        ...defaultSettings,
        ...result,
        schemaVersion: "pdf-workbench.settings.v1",
      });
    };
    request.onerror = () =>
      reject(request.error ?? new Error("Could not load settings."));
  });
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, 2);

    request.onupgradeneeded = () => {
      const { objectStoreNames } = request.result;

      if (!objectStoreNames.contains(recentProjectsStore)) {
        request.result.createObjectStore(recentProjectsStore, {
          keyPath: "id",
        });
      }

      if (!objectStoreNames.contains(activeProjectStore)) {
        request.result.createObjectStore(activeProjectStore, {
          keyPath: "id",
        });
      }

      if (!objectStoreNames.contains(settingsStore)) {
        request.result.createObjectStore(settingsStore, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Could not open browser storage."));
  });
}
