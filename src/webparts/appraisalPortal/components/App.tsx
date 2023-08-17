import * as React from 'react'
import { Web } from "sp-pnp-js";
import { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./style.scss"
import EmployeeComponent from './EmployeeComponent';
import TeamLeadComponent from './TeamLeadComponent';

var baseUrl = "https://smalsusinfolabs.sharepoint.com/sites/HHHH/HR"
// var baseUrl = "https://hhhhteams.sharepoint.com/sites/HHHH/SP"
let DataArray: any = []

let TeamMember: any = []
const App = (props: any) => {
    const [TeamMembers, setTeamMembers] = useState([]);
    const [current, setCurrent] = useState<any>([]);

    const fetchAPIData = async () => {
        console.log('fetchApiData')
        let CurrentUser: any = []
        const web = new Web(baseUrl);
        // DataArray = await web.lists.getById('B318BA84-E21D-4876-8851-88B94B9DC300').items.select('ID', 'Title', 'Approver/Title', 'Approver/ID',
        //     'Approver/Name', 'AssingedToUser/Title', 'AssingedToUser/EMail', 'AssingedToUser/ID', 'CategoriesItemsJson', 'Company', 'Created', 'DraftCategory',
        //     'Email', 'Group', 'IsActive', 'IsApprovalMail', 'isDeleted', 'IsShowCommentUser', 'IsShowReportPage', 'IsShowTeamLeader', 'IsTaskNotifications',
        //     'Item_x0020_Cover', 'ItemType', 'Modified', 'ParentID1', 'Role', 'showAllTimeEntry', 'SmartTime', 'SortOrder', 'Status', 'Suffix',
        //     'TaskStatusNotification', 'technicalGroup', 'TimeCategory', 'TeamLeader/Title', 'TeamLeader/ID', 'UserGroup/Title', 'UserGroup/Id').expand('UserGroup', 'TeamLeader', 'AssingedToUser', 'Approver').get();

        DataArray = await web.lists.getById('BDE43545-CF44-4959-A191-EA3FF319A6AB').items.select("ID, MobileNumber, Email, TaskUser, WeightageTable, technicalGroup, UserGroup, TeamLead, WeightageStatus, CardStatus, ItemImage, LeadComment").get();
        // DataArray?.map((item: any, index: any) => {
        //     if (props?.props?.Context?.pageContext?._legacyPageContext?.userId === (item?.AssingedToUser?.ID) && item?.Company == "Smalsus") {
        //         CurrentUser.push(item)
        //     }
        // })
        DataArray?.map((item: any, index: any) => {
            if (props?.props?.Context?.pageContext?._legacyPageContext?.userLoginName === (item?.Email)) {
                CurrentUser.push(item)
            }
        })
        setCurrent(CurrentUser)
        TeamMember = DataArray.filter((elem: any) => elem?.technicalGroup === CurrentUser[0]?.technicalGroup);
        setTeamMembers(TeamMember)
        console.log(DataArray)
        console.log("fetchApi Called!!!")
    }

    useEffect(() => { fetchAPIData() }, [])
    // console.log(current)

    return (
        <>
            { current.length > 0 && current[0].TeamLead === "Team Lead" ? (
                <TeamLeadComponent current={current} TeamMembers={TeamMembers} baseUrl={baseUrl} fetchAPIData={fetchAPIData}/>
            ) : (
                <EmployeeComponent current={current} TeamMembers={TeamMembers} baseUrl={baseUrl} />
            )}
            {/* <EmployeeComponent current={current} TeamMembers={TeamMembers} baseUrl={baseUrl} fetchAPIData={fetchAPIData}/>
            <TeamLeadComponent current={current} TeamMembers={TeamMembers} baseUrl={baseUrl} /> */}
        </>
    )
}

export default App
