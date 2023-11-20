import { useEffect } from 'react';

import { HomeLayout } from '@/modules/layout/home-layout';
import { HomeLayoutService } from '@/modules/layout/home-layout/home-layout.service';
import { MessagePageView } from '@/modules/message-center';
import { useModel } from '@/util/valtio-helper';

const MessagePage = () => {
  const homeLayoutService = useModel(HomeLayoutService);
  useEffect(() => {
    homeLayoutService.setSubTitle('Edge');
  }, []);
  return (
    <HomeLayout>
      <MessagePageView />
    </HomeLayout>
  );
};

export default MessagePage;
