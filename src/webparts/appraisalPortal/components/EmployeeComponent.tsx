import * as React from 'react'
import { useState, useEffect } from "react";
import { FaPhone, FaEnvelope, FaUser, FaUserTie } from 'react-icons/fa';
import { Web } from "sp-pnp-js";
import { DefaultButton } from '@fluentui/react/lib/Button';
import GlobalCommonTable from './GlobalCommonTable';
import { ColumnDef } from "@tanstack/react-table";
import "./style.scss"
// import Cards from './Cards';
import { Panel } from 'office-ui-fabric-react';
import moment from 'moment';

const EmployeeComponent = (props: any) => {
    const [data, setTableData] = useState([])
    const [isOpenPopup, setIsOpenPopup] = useState(false)
    const [dataUpdate, setDataUpdate] = useState<any>()
    const [cardsApi, setCardsApi] = useState<any>()
    const [cardsData, setCardsData] = useState<any>([]);

    // let selectedMember: any
    // if (props.current != undefined && props.current[0] != undefined) {
    //     try {
    //       selectedMember = JSON.parse(props.current[0].CardStatus);
    //     } catch (e) { console.log(e) }
    //   }

    const selectedMember = React.useMemo(() => {
        if (props.current != undefined && props.current[0] != undefined) {
            try {
                return JSON.parse(props.current[0].CardStatus);
            } catch (e) {
                console.log(e);
            }
        }
        return [];
    }, [props.current]);

    ///////// Main driving useEffect to update cards////////
    useEffect(() => {
        if (selectedMember) {
            const parsedCardsData = selectedMember

            let previousCardCompleted = true; // Flag to track if the previous card is completed
            const updatedCardsData = parsedCardsData.map((card: any) => {
                if (!card.date) {
                    return { ...card, statement: `${card.statusDef} is pending`, status: "Pending", remainingDays: undefined };
                }

                const cardDate = moment(card.date, 'DD-MM-YYYY');
                const isDateTodayOrPast = cardDate.isSameOrBefore(moment(), 'day');
                const remainingDays = cardDate.diff(moment(), 'days');

                let status, statement;

                if (isDateTodayOrPast) {
                    status = "Completed";
                    statement = `${card.statusDef} has completed this portal info.`;
                } else {
                    status = previousCardCompleted ? "Working" : "Pending";
                    statement = previousCardCompleted ? `${card.statusDef} is working on this portal info.` : `pending from ${card.statusDef}'s side`;
                }

                previousCardCompleted = isDateTodayOrPast;

                return { ...card, status, statement, remainingDays };
            });

            setCardsData(updatedCardsData);
        } else {
            setCardsData([]);
        }
    }, [selectedMember]);

    // setting Table Data
    useEffect(() => {
        if (props.current && props.current.length > 0 && props.current[0].WeightageTable !== null && props.current[0].WeightageTable !== "undefined") {
            setTableData(JSON.parse(props.current[0]?.WeightageTable))
        } else {
            setTableData([]);
        }
    }, [props.current])

    // setting Cards Data
    useEffect(() => {
        if (props.current && props.current.length > 0 && props.current[0].WeightageTable !== null && props.current[0].WeightageTable !== "undefined") {
            setCardsApi(JSON.parse(props.current[0]?.CardStatus))
        } else {
            setCardsApi([]);
        }
    }, [props.current])

    // Handling the edit action here using the row data
    const handleEdit = (row: any,) => {
        setIsOpenPopup(true)
        let editdata = row.original
        editdata.index = row.index
        setDataUpdate(editdata)
    };

    const columns = React.useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: 'Goals',
                header: '',
                placeholder: 'Goals'
            },
            {
                accessorKey: 'Weightage',
                header: '',
                placeholder: 'Weightage'
            },
            {
                accessorKey: 'SelfRate',
                header: '',
                placeholder: 'Employee Ratings'
            },
            {
                accessorKey: 'Comment',
                header: '',
                placeholder: 'Employee Comment'
            },
            {
                accessorKey: 'TLRate',
                header: '',
                placeholder: 'TL Rating'
            },
            {
                accessorKey: 'TLComment',
                header: '',
                placeholder: 'TL Comment'
            },
            {
                accessorKey: 'ManagerRating',
                header: '',
                placeholder: 'Manager Rating',
            },
            {
                accessorKey: 'ManagerComment',
                header: '',
                placeholder: 'Manager Comment',
            },
            {
                accessorKey: '',
                header: '',
                id: "edit",
                canSort: "false",
                cell: ({ row }: { row: any }) => {
                    const selectCardStatus = cardsApi
                    const TodaysDate = moment().format('DD-MM-YYYY');
                    const isFirstCardDateBeforeToday = selectCardStatus && ((TodaysDate > selectCardStatus[0]?.date) ? true : false)
                    return (
                        <span
                            onClick={() => handleEdit(row)}
                            title="Edit"
                            // className={` 'svg__iconbox svg__icon--edit' : 'svg__iconbox svg__icon--edit-disabled'}`}
                            className={`svg__iconbox svg__icon--edit ${isFirstCardDateBeforeToday ? "svg__icon--edit-disabled" : ""}`}
                        ></span>
                    );
                }
            },
        ],
        [data]
    )

    const updateDetails = async () => {
        if (!dataUpdate) return; // Ensure dataUpdate has a value

        if (parseFloat(dataUpdate.SelfRate) > parseFloat(dataUpdate.Weightage)) {
            dataUpdate.SelfRate = dataUpdate.Weightage;
        }

        data.splice(dataUpdate.index, 1, dataUpdate);
        const metaData = JSON.stringify(data); // Convert data back to JSON string
        let web = new Web(props.baseUrl);
        try {
            await web.lists
                .getById("BDE43545-CF44-4959-A191-EA3FF319A6AB").items.getById(props.current[0].Id).update({
                    WeightageTable: metaData, // Use the JSON string for update
                });
            props.fetchAPIData()
            setIsOpenPopup(false);
        } catch (error) {
            console.error(error);
            return error;
        }
        setTableData((data) => [...data]); // Update the state with the new data
    };

    console.log("employee Component")

    return (
        <>
            <section className='bg-body-secondary p-3'>
                <div className='container'>
                    <div className='row'>
                        {/* -------sidebar start------ */}
                        <div className='col-md-3'>
                            <div className='card aside p-3 shadow'>
                                <div className='text-center'>
                                    <div>
                                        {props.current[0]?.ItemImage == null ?
                                            (<div className="rounded-circle useradmin"><FaUser className="user" /></div>) : (<img className="user-DP" src={props.current[0]?.ItemImage?.Url}></img>)}
                                    </div>

                                    {/* <h5 className="card-title">{props.current.length > 0 ? (props.current[0].TeamLead === "Team Lead" ? <>{props.current[0].TaskUser} <FaStar /></> : (props.current[0].TaskUser)) : ''}</h5> */}
                                    <h5 className="card-title mt-2">{props.current.length > 0 ? props.current[0].TaskUser : ''}</h5>
                                    <p className='mt-1'><strong>{props.current.length > 0 ? props.current[0].technicalGroup : ''}</strong></p>
                                    <p className='mt-1'><strong>{props.current.length > 0 ? props.current[0].UserGroup : ''}</strong></p>
                                </div>
                                <div className='card-body'>
                                    <div className='row mt-4'>
                                        <h3 className="card-title">Basic Information</h3>
                                        <p className="card-text ms-3">
                                            <span><FaPhone /></span>
                                            <span>{props.current.length > 0 ? props.current[0].MobileNumber : ''}</span>
                                        </p>
                                        <p className="card-text ms-3 mt-2 ">
                                            <span><FaEnvelope /></span>
                                            <span className='break_word pe-3'>{props.current.length > 0 ? props.current[0].Email : ''}</span>
                                        </p>
                                    </div>
                                    <div className='row mt-4'>
                                        <h3 className="card-title">Team Members</h3>
                                        <div>
                                            {props.TeamMembers.map((team: any) => (
                                                <ul className='list-group'>
                                                    <li className="list-group-item">
                                                        {/* {team.TeamLead === "Team Lead" ? team.TaskUser + "( TL)" : team.TaskUser} */}
                                                        {/* {team.TaskUser} */}
                                                        {team.TeamLead === "Team Lead" ? (<>{team.TaskUser} <FaUserTie /></>) : (team.TaskUser)}
                                                    </li>
                                                </ul>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* -------sidebar end------ */}

                        <div className="col-md-9">
                            <div className="application-status">
                                <h1 className='shadow'>{props.current.length > 0 ? props.current[0].TaskUser : ""}'s Appraisal Portal</h1>
                                <div className='bg-white p-2 rounded'>
                                    {/* {props.current.length > 0 && (<Cards className="cardComp" name={props.current[0].TaskUser} selectedMember={props.current[0]} />)} */}
                                    <div>
                                        <div>
                                            {cardsData.map((mycard: any) => (
                                                <div key={mycard.id} className="mycard">
                                                    <p>Card {mycard.id}</p>
                                                    <p className={`statuscol ${mycard.status} shadow`}>Status: {mycard.status}</p>
                                                    <p>{mycard.statement}</p>
                                                    {mycard.remainingDays !== undefined && (
                                                        <p>Remaining Days: {mycard.remainingDays}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* <AppraisalGoals/>                            */}

                                    <div>
                                        <section>
                                            <div className='key-response'>
                                                <h4>Key Responsibilities</h4>
                                            </div>
                                            <div className='container'>
                                                <div className="row">
                                                    <div>
                                                        <div>
                                                            {props.current[0]?.WeightageStatus ? (
                                                                <GlobalCommonTable data={data} columns={columns} />
                                                            ) : (
                                                                <p className='mycardboxes1 py-md-5'>
                                                                    Keep Calm!
                                                                    <br />
                                                                    Goals being set.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className='pt-3'>
                                                        {props.current[0]?.LeadComment ? (<div className='form-control w-100 mb-3 p-5'>{props.current[0]?.LeadComment.replace(/<[^>]*>/g, ' ')}</div>)
                                                            :
                                                            <div className='mycardboxes'>
                                                                <p className='py-md-5'>Leads comment and rating</p>
                                                            </div>
                                                        }
                                                    </div>

                                                </div>
                                            </div>
                                            {/* -------footer part managers rating---------- */}
                                            <div>
                                                <div className='container'>
                                                    <div className='row'>
                                                        {/* <div className='w-100 border-dashed p-10' > */}
                                                        <div className="border-dashed p-4 p-5 w-100 footer">
                                                            <h6>Managers Rating</h6>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div >
            </section >

            {/* panel to update employee data */}
            <Panel
                headerText="Update Data"
                isOpen={isOpenPopup}
                isBlocking={!isOpenPopup}
                onDismiss={() => setIsOpenPopup(false)}
                closeButtonAriaLabel="Close"
            >
                <div className='edit-data'>
                    <label>Employee Rating: </label>
                    <input type="number" defaultValue={dataUpdate?.SelfRate} onChange={(e: any) => setDataUpdate({ ...dataUpdate, SelfRate: e.target.value })} />

                    <label>Employee Comment: </label>
                    <input type="text" defaultValue={dataUpdate?.Comment} onChange={(e: any) => setDataUpdate({ ...dataUpdate, Comment: e.target.value })} />

                    <DefaultButton className='btn btn-primary mt-3 p-3' onClick={() => updateDetails()}>Update</DefaultButton>
                </div>
            </Panel>

        </>
    )
}

export default EmployeeComponent