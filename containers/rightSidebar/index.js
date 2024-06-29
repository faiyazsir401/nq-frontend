import { Fragment, useState, useEffect, useLayoutEffect } from "react";
import { TabContent, TabPane } from "reactstrap";
import TodoSection from "./todoSection";
import FileSection from "./fileSection";
import NoteSection from "./noteSection";
import ReminderSection from "./reminderSection";
import AppListSection from "./appList";
import ProfileSection from "./profileSection";

const Index = () => {
  // const width = useWindowSize();
  const [activeTab, setActiveTab] = useState("");
  const [size, setSize] = useState([0, 0]);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function updateSize() {
      setSize(window.innerWidth);
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", updateSize);

    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (width < 1640)
      document.querySelector(".chitchat-main").classList.add("small-sidebar");
    if (width > 992) {
      document.querySelector(".app-sidebar").classList.add("active");
    }
    if (width < 992) {
      document.querySelector(".main-nav").classList.remove("on");
    } else {
      document.querySelector(".main-nav").classList.add("on");
    }
  }, [width]);

  const ToggleTab = (tab) => {
    setActiveTab(tab);
    if (width > 1640)
      document
        .querySelector(".chitchat-main")
        .classList.remove("small-sidebar");
  };
  const smallSideBarToggle = () => {
    document.querySelector(".chitchat-main").classList.add("small-sidebar");
    setActiveTab("");
  };

  const CloseAppSidebar = () => {
    document.querySelector(".chitchat-main").classList.remove("small-sidebar");
    document.querySelector(".app-sidebar").classList.remove("active");
    document.body.className = `main-page ${localStorage.getItem("layout_mode")}`;
  };

  return (
    <Fragment>
      <ProfileSection />
      <aside className="app-sidebar active">
        <div className="apps">
          <div className="apps-ul">
            <TabContent activeTab={activeTab}>
              <TabPane tabId="todo">
                <TodoSection smallSideBarToggle={smallSideBarToggle} />
              </TabPane>
              <TabPane tabId="file">
                <FileSection smallSideBarToggle={smallSideBarToggle} />
              </TabPane>
              <TabPane tabId="notes">
                <NoteSection smallSideBarToggle={smallSideBarToggle} />
              </TabPane>
              <TabPane tabId="reminder">
                <ReminderSection smallSideBarToggle={smallSideBarToggle} />
              </TabPane>
            </TabContent>
          </div>
        </div>
        <AppListSection
          activeTab={activeTab}
          CloseAppSidebar={CloseAppSidebar}
          ToggleTab={ToggleTab}
        />
      </aside>
    </Fragment>
  );
};

export default Index;
