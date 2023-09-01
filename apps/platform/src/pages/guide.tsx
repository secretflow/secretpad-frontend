import { GuidePageLayoutComponent } from '@/modules/guide';
import { HomeLayout } from '@/modules/layout/home-layout';

const GuidePage = () => {
  return (
    <HomeLayout>
      <GuidePageLayoutComponent />
    </HomeLayout>
  );
};

export default GuidePage;
