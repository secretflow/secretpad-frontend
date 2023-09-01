import { HomeLayout } from '@/modules/layout/home-layout';
import { ProjectContentComponent } from '@/modules/project-content/project-content.view';

const HomePage = () => {
  return (
    <HomeLayout>
      <ProjectContentComponent />
    </HomeLayout>
  );
};

export default HomePage;
