declare namespace Chrome {
  interface Tab {
    id?: number;
  }

  interface Runtime {
    onMessage: {
      addListener: (
        callback: (
          message: any,
          sender: any,
          sendResponse: (response?: any) => void
        ) => void
      ) => void;
    };
    sendMessage(message: any): Promise<any>;
    lastError?: Error;
  }

  interface Storage {
    sync: {
      get(keys: string[]): Promise<{ [key: string]: any }>;
      set(items: { [key: string]: any }): Promise<void>;
    };
  }

  interface Tabs {
    query(queryInfo: { active: boolean; currentWindow: boolean }): Promise<Tab[]>;
    sendMessage(tabId: number, message: any): Promise<any>;
  }
}

declare const chrome: {
  runtime: Chrome.Runtime;
  storage: Chrome.Storage;
  tabs: Chrome.Tabs;
}; 