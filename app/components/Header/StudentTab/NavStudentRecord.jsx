import React, { useEffect, useState } from "react";
import {
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import { AccountType, LOCAL_STORAGE_KEYS } from "../../../common/constants";
import { authState } from "../../auth/auth.slice";
import { useAppSelector } from "../../../store";
import Reports from "../../locker/reports";
import MyClips from "../../locker/my-clips";

const allTabs = [
  {
    name: "My Clips",
    value: "myClips",
    accessBy: [AccountType?.TRAINEE, AccountType?.TRAINER],
    component: MyClips,
  },
  {
    name: "Game Plans",
    value: "gamePlans",
    accessBy: [AccountType?.TRAINER, AccountType?.TRAINEE],
    component: Reports,
  },
];

const NavStudentRecord = ({ trainee_id }) => {
  const { accountType } = useAppSelector(authState);
  const [activeTab, setActiveTab] = useState(allTabs[0]?.value);

  const toggleTab = (tabValue) => {
    if (activeTab !== tabValue) {
      setActiveTab(tabValue);
    }
  };

  return (
    <>
      <div id="navstudent">
        <div className="theme-tab sub-nav">
          <Nav tabs>
            {allTabs?.map(
              (el) =>
                el?.accessBy?.includes(accountType) && (
                  <NavItem key={el.value}>
                    <NavLink
                      className={
                        activeTab === el?.value
                          ? "activelink sub-item"
                          : "sub-item"
                      }
                      onClick={() => toggleTab(el?.value)}
                    >
                      {el?.name === "Schedule" ? (
                        <>&nbsp;&nbsp;Schedule &nbsp; </>
                      ) : (
                        el?.name
                      )}
                    </NavLink>
                  </NavItem>
                )
            )}
          </Nav>
        </div>
        <div
          style={{
            color: "black",
            minHeight: "auto",
            height: "70vh",
            overflow: "auto",
          }}
        >
          <TabContent activeTab={activeTab}>
            {allTabs?.map((el, index) => {
              return (
                <TabPane key={index} tabId={el?.value}>
                  {el?.component ? (
                    <el.component
                      key={index}
                      activeCenterContainerTab={activeTab}
                      trainee_id={trainee_id}
                    />
                  ) : (
                    <h1>{el?.name}</h1>
                  )}
                </TabPane>
              );
            })}
          </TabContent>
        </div>
      </div>
    </>
  );
};

export default NavStudentRecord;
