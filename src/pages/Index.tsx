import { useState } from 'react';
import BackgroundVideo from '@/components/BackgroundVideo';
import ProfileCard from '@/components/ProfileCard';
import EnterScreen from '@/components/EnterScreen';

const Index = () => {
  const [entered, setEntered] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 sm:p-6 md:p-8">
      <EnterScreen onEnter={() => setEntered(true)} />
      {entered && (
        <>
          <BackgroundVideo />
          <ProfileCard />
        </>
      )}
    </div>
  );
};

export default Index;
