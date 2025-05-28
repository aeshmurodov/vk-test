// src/App.tsx
import React, { useState } from 'react';
import { View, Panel, PanelHeader, SplitLayout, SplitCol } from '@vkontakte/vkui';
import { UserTable } from './components/UserTable';
import { UserForm } from './components/UserForm';

function App() {
  const [userAdded, setUserAdded] = useState(false);

  // Function to trigger refetch in table after form submission
  const handleUserAdded = () => {
    setUserAdded(true);
    // Reset the flag after a short delay to allow re-triggering
    setTimeout(() => setUserAdded(false), 100);
  };

  return (
    <SplitLayout header={<PanelHeader delimiter="bottom" />}>
      <SplitCol autoSpaced>
        <View activePanel="main">
          <Panel id="main">
            <PanelHeader>Профильное задание</PanelHeader>
            <UserForm onSuccess={handleUserAdded} />
            <UserTable onUserAdded={userAdded ? handleUserAdded : undefined} /> {/* Pass a change signal */}
          </Panel>
        </View>
      </SplitCol>
    </SplitLayout>
  );
}

export default App;