import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { UIProvider } from './state/UIProvider';
import { DataProvider } from './state/DataProvider';
import { QuickAddMenu } from './components/QuickAdd';
import { createLocalStore } from './data/localStore';
import { seedDemo } from './data/seed';

seedDemo();
const store = createLocalStore();

const App = () => (
  <UIProvider>
    <DataProvider store={store} uid="demo-me">
      <QuickAddMenu />
    </DataProvider>
  </UIProvider>
);

const root = createRoot(document.getElementById('root')!);
root.render(<StrictMode><App /></StrictMode>);
