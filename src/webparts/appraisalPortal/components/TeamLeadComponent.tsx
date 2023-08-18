import React, { useEffect, useMemo, useState } from 'react';
import { FaPhone, FaEnvelope, FaUser, FaUserTie, FaPlus } from 'react-icons/fa';
import { Web } from "sp-pnp-js";
import "./style.scss"
// import Cards from './Cards';
// import AppraisalGoals from './AppraisalGoals';
import GlobalCommonTable from './GlobalCommonTable';
import { ColumnDef } from "@tanstack/react-table";
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import moment from 'moment';
const TeamLeadComponent = (props: any) => {
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  const [showAppraisalGoals, setShowAppraisalGoals] = useState(true);
  const [data, setTableData] = useState([])
  const [isOpenPopup, setIsOpenPopup] = useState(false)
  const [openPopup, setOpenPopup] = useState(false)
  const [dataUpdate, setDataUpdate] = useState<any>()
  const [goals, setGoals] = useState("")
  const [weightage, setWeightage] = useState("")
  const [toggle, setToggle] = useState<boolean>()
  const [cardsApi, setCardsApi] = useState<any>()
  const [isSendButtonActive, setIsSendButtonActive] = useState(false);
  const [isResetButtonActive, setIsResetButtonActive] = useState(true);
  const [show, setShow] = useState(false);
  const [personDelete, setPersonDelete] = useState([]);
  const [resetData, setResetData] = useState(false);
  const [sendData, setSendData] = useState(false);
  const [cardsData, setCardsData] = useState<any>([]);
  const [leadComment, setLeadComment] = useState("")

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const resetShow = () => setResetData(true);
  const resetClose = () => setResetData(false);

  const sendDataShow = () => setSendData(true);
  const sendDataClose = () => setSendData(false);

  const handleTeamMemberClick = (teamMember: any) => {
    if (teamMember.Id !== props.current[0].Id) {
      let carddata: any = JSON.parse(teamMember?.CardStatus);
      setCardsApi(carddata)
      setSelectedTeamMember(teamMember);
      setShowAppraisalGoals(false);
      setLeadComment(teamMember.LeadComment || "");
    }
  }

  const handleShowAppraisalGoals = () => {
    setCardsApi(null)
    setSelectedTeamMember(null);
    setShowAppraisalGoals(true);
  }

  // if (cardsApi != null) {
  //   selectedMember = cardsApi
  // }
  // else {
  //   if (props.current != undefined && props.current[0] != undefined) {
  //     try {
  //       selectedMember = JSON.parse(props.current[0].CardStatus);

  //     } catch (e) { console.log(e) }

  //   }
  // }
  const selectedMember = useMemo(() => {
    if (cardsApi != null) {
      return cardsApi;
    } else {
      if (props.current != undefined && props.current[0] != undefined) {
        try {
          return JSON.parse(props.current[0].CardStatus);
        } catch (e) {
          console.log(e);
        }
      }
    }
    return null;
  }, [cardsApi, props.current]);

  ///////// Main driving useEffect to update cards////////
  useEffect(() => {
    if (selectedMember) {
      // const parsedCardsData = JSON.parse(selectedMember.CardStatus);
      const parsedCardsData = selectedMember

      let previousCardCompleted = true; // Flag to track if the previous card is completed
      const updatedCardsData = parsedCardsData?.map((card: any) => {
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
      const currentDate = moment().format('DD-MM-YYYY');
      const isCardStatus4AndToday = cardsApi?.find((item: any) => item.id === "4" && item.date === currentDate);
      const isAnyCardDateNull = cardsApi?.some((item: any) => item.date === null);

      // Update the Send button activation state
      setIsSendButtonActive(isCardStatus4AndToday);
      setIsSendButtonActive(isAnyCardDateNull)

      setIsResetButtonActive(!isCardStatus4AndToday);
      setIsResetButtonActive(!isAnyCardDateNull)
      setCardsData(updatedCardsData);
    } else {
      setCardsData([]);
    }
  }, [selectedMember]);


  useEffect(() => {
    if (selectedTeamMember !== null && selectedTeamMember !== "undefined") {
      setTableData(JSON.parse(selectedTeamMember?.WeightageTable))
    } else {
      setTableData([]);
    }
  }, [selectedTeamMember])

  console.log("helloo")

  const handleEdit = (row: any,) => {
    // Handle the edit action here using the row data
    setIsOpenPopup(true)
    let editdata = row.original
    editdata.index = row.index
    setDataUpdate(editdata)
  };

  const handleDelete = (row: any) => {
    // Handle the delete action here using the row data
    const newData = data.filter((item: any) => item !== row.original);
    setTableData(newData);
    let web = new Web(props.baseUrl);
    let WeightageData = JSON.stringify(newData)
    web.lists.getById("BDE43545-CF44-4959-A191-EA3FF319A6AB").items.getById(selectedTeamMember.Id).update({
      WeightageTable: WeightageData,
    })
    props.fetchAPIData()
    handleClose();
  };

  // Global common table setting columns and rows
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
        accessorKey: '',
        header: '',
        id: "edit",
        canSort: "False",
        cell: ({ row }: { row: any }) => {
          const selectCardStatus = cardsApi
          const TodaysDate = moment().format('DD-MM-YYYY');
          const isFirstCardDateBeforeToday = selectCardStatus && ((TodaysDate > selectCardStatus[0]?.date) ? true : false)
          const isSecondCardDateAfterToday = selectCardStatus && ((TodaysDate < selectCardStatus[1]?.date) ? true : false)
          return (
            <span
              onClick={() => handleEdit(row)}
              title="Edit"
              // className={` 'svg__iconbox svg__icon--edit' : 'svg__iconbox svg__icon--edit-disabled'}`}
              className={`svg__iconbox svg__icon--edit ${isSendButtonActive || (isFirstCardDateBeforeToday && isSecondCardDateAfterToday) ? "" : "svg__icon--edit-disabled"}`}
            ></span>
          );
        }
      },
      {
        accessorKey: '',
        header: '',
        id: "delete",
        canSort: "False",
        cell: ({ row }: { row: any }) => {
          const selectCardStatus = cardsApi
          const isFirstCardDateBeforeToday = selectCardStatus && moment(selectCardStatus[0]?.date, 'DD-MM-YYYY').isBefore(moment());
          const isSecondCardDateAfterToday = selectCardStatus && moment(selectCardStatus[1]?.date, 'DD-MM-YYYY').isAfter(moment());
          return (
            <span
              onClick={() => handleShow()}
              title="Delete"
              // className={`svg__iconbox ${isSendButtonActive || (isFirstCardDateBeforeToday && isSecondCardDateAfterToday) ? 'svg__icon--trash' : 'svg__icon--trash-disabled'}`}
              className={`svg__iconbox svg__icon--trash ${isSendButtonActive || (isFirstCardDateBeforeToday && isSecondCardDateAfterToday) ? "" : "svg__icon--trash-disabled"}`}
            >{setPersonDelete(row)}</span>
          );
        }
      },
    ],
    [data, isSendButtonActive, cardsApi]
  );

  // function to update existing table with updated data
  const updateDetails = async () => {
    if (!dataUpdate) return; // Ensure dataUpdate has a value
    data.splice(dataUpdate.index, 1, dataUpdate);
    const metaData = JSON.stringify(data); // Convert data back to JSON string
    let web = new Web(props.baseUrl);
    try {
      await web.lists
        .getById("BDE43545-CF44-4959-A191-EA3FF319A6AB").items.getById(selectedTeamMember.Id).update({
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

  // function to ADD data
  const calculateTotalWeightage = (data: any) => {
    return data.reduce((total: any, item: any) => total + parseFloat(item.Weightage), 0);
  };

  // const addFunction = async () => {
  //   if (!goals || !weightage) return;

  //   const totalWeightage = calculateTotalWeightage(data);
  //   const newWeightage = parseFloat(weightage);

  //   if (totalWeightage + newWeightage > 100) {
  //     alert("Total weightage cannot exceed 100");
  //     return;
  //   }

  //   const objData = {
  //     Goals: goals,
  //     Weightage: weightage,
  //     SelfRate: 0,
  //     Comment: "",
  //     TLRate: 0,
  //     TLComment: ""
  //   }
  //   let addData = data;
  //   addData.push(objData)
  //   const AddedData = JSON.stringify(addData); // Convert newData back to JSON string
  //   let web = new Web(props.baseUrl);
  //   try {
  //     await web.lists
  //       .getById("BDE43545-CF44-4959-A191-EA3FF319A6AB").items.getById(selectedTeamMember.Id).update({
  //         WeightageTable: AddedData, // Use the JSON string for update
  //       });
  //     props.fetchAPIData()
  //     setOpenPopup(false);
  //     setGoals("");
  //     setWeightage("");
  //   } catch (error) {
  //     console.error(error);
  //     return error;
  //   }
  //   setTableData((data) => [...data]); // Update the state with the new data
  // };
  const addFunction = async () => {
    if (!goals || !weightage) return;

    const totalWeightage = calculateTotalWeightage(data);
    const newWeightage = parseFloat(weightage);

    if (totalWeightage + newWeightage > 100) {
      alert("Total weightage cannot exceed 100");
      return;
    }

    const objData = {
      Goals: goals,
      Weightage: weightage,
      SelfRate: 0,
      Comment: "",
      TLRate: 0,
      TLComment: ""
    };
    let addData = data.concat(objData); // Use concat to create a new array
    const AddedData = JSON.stringify(addData);
    let web = new Web(props.baseUrl);
    try {
      await web.lists
        .getById("BDE43545-CF44-4959-A191-EA3FF319A6AB").items.getById(selectedTeamMember.Id).update({
          WeightageTable: AddedData,
        });
      props.fetchAPIData();
      setOpenPopup(false);
      setGoals("");
      setWeightage("");
    } catch (error) {
      console.error(error);
      return error;
    }
    setTableData(addData);
  };


  useEffect(() => {
    if (selectedTeamMember) {
      setToggle(selectedTeamMember.WeightageStatus);
    }
  }, [selectedTeamMember]);

  // Function for setting dates in cards 
  const toggleHandler = () => {
    setToggle(!toggle)

    const CardsApi = JSON.parse(selectedTeamMember.CardStatus)
    CardsApi.forEach((item: any) => {
      let currentDate = new Date();
      if (item.id === "1") {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (item.id === "2") {
        currentDate.setDate(currentDate.getDate() + 14);
      } else if (item.id === "3" || item.id === "4") {
        currentDate.setDate(currentDate.getDate() + 21);
      }
      item.date = moment(currentDate).format('DD-MM-YYYY');
    });

    console.log("New CardsApi:", CardsApi);
    setCardsApi(CardsApi);
    cardHandler()
    sendDataClose();
    // alert("Data send Successfully...")
  }

  // function to handle reset button 
  const resetHandler = () => {
    setToggle(!toggle)

    const CardsApi = JSON.parse(selectedTeamMember.CardStatus)
    CardsApi.forEach((item: any) => {
      item.date = null; // Set the date property to null
    });

    console.log("New CardsApi:", CardsApi);
    setCardsApi(CardsApi);
    cardHandler()
    resetClose();
  }

  useEffect(() => {
    if (cardsApi) {
      cardHandler();
    }
  }, [cardsApi]);

  // Event Handler to update the CardStatus state when toggle changes
  const cardHandler = async () => {
    if (selectedTeamMember) {
      let web = new Web(props.baseUrl);
      let cardsUpdate = JSON.stringify(cardsApi)
      await web.lists
        .getById("BDE43545-CF44-4959-A191-EA3FF319A6AB").items.getById(selectedTeamMember.Id).update({
          CardStatus: cardsUpdate,
        })
        .then(() => {
          console.log("CardStatus updated on the backend.");
        })
        .catch((error) => {
          console.error("Error updating WeightageStatus:", error);
        });
      props.fetchAPIData()
    }
  }

  // useEffect to update the toggle state when selectedTeamMember changes
  useEffect(() => {
    if (selectedTeamMember) {
      let web = new Web(props.baseUrl);
      web.lists
        .getById("BDE43545-CF44-4959-A191-EA3FF319A6AB").items.getById(selectedTeamMember.Id).update({
          WeightageStatus: toggle,
        })
        .then(() => {
          console.log("WeightageStatus updated on the backend.");
        })
        .catch((error) => {
          console.error("Error updating WeightageStatus:", error);
        });
      props.fetchAPIData()
    }
  }, [toggle, selectedTeamMember]);

  const commentHandler = () => {
    {
      let web = new Web(props.baseUrl);
      web.lists
        .getById("BDE43545-CF44-4959-A191-EA3FF319A6AB").items.getById(selectedTeamMember.Id).update({
          LeadComment:
            leadComment,
        })
        .then(() => {
          console.log("Lead's comment updated on the backend.");
          props.fetchAPIData()
        })
        .catch((e) => {
          console.error("Error updating Lead's comment:", e);
        });
    }
  }

  const deleteLeadCommentHandler = () => {
    if (selectedTeamMember) {
      let web = new Web(props.baseUrl);
      web.lists
        .getById("BDE43545-CF44-4959-A191-EA3FF319A6AB").items.getById(selectedTeamMember.Id).update({
          LeadComment: null,
        })
        .then(() => {
          console.log("Lead's comment deleted on the backend.");
          setLeadComment(""); // Reset the leadComment state to empty string
          props.fetchAPIData();
        })
        .catch((e) => {
          console.error("Error deleting Lead's comment:", e);
        });
    }
  }

  return (
    <>
      <section className='bg-body-secondary p-3'>
        <div className="container">
          <div className='row'>
            {/* -------sidebar start------ */}
            <div className='col-md-3'>
              <div className='card aside p-3 shadow'>
                <div className='text-center'>
                  <div>
                    {/* {selectedTeamMember?.ItemImage == null ? (<div className="rounded-circle useradmin"><FaUser className="user" /></div>) : (<img className="user-DP" src={selectedTeamMember?.ItemImage?.Url}></img>)} */}
                    {/* {selectedTeamMember ? {selectedTeamMember?.ItemImage == null ? (<div className="rounded-circle useradmin"><FaUser className="user" /></div>) 
                    : (<img className="user-DP" src={selectedTeamMember?.ItemImage?.Url}></img>)}
                  :
                  {props.current[0]?.ItemImage == null ?
                    (<div className="rounded-circle useradmin"><FaUser className="user" /></div>) : (<img className="user-DP" src={props.current[0]?.ItemImage?.Url}></img>)}} */}

                    <div>
                      {selectedTeamMember ? (selectedTeamMember?.ItemImage == null ? (
                        <div className="rounded-circle useradmin">
                          <FaUser className="user" />
                        </div>
                      ) : (<img className="user-DP" src={selectedTeamMember?.ItemImage?.Url} alt="User DP" />)
                      ) : (props.current[0]?.ItemImage == null ? (
                        <div className="rounded-circle useradmin">
                          <FaUser className="user" />
                        </div>
                      ) : (<img className="user-DP" src={props.current[0]?.ItemImage?.Url} alt="User DP" />
                      )
                      )}
                    </div>

                  </div>
                  <h5 className="card-title mt-2">{selectedTeamMember !== null ? (selectedTeamMember.TeamLead === "Team Lead" ? <>{selectedTeamMember.TaskUser} <FaUserTie /></> : (selectedTeamMember.TaskUser)) : (props.current.length > 0 ? props.current[0].TaskUser : '')}</h5>
                  <p className='mt-1'><strong>{props.current.length > 0 ? props.current[0].technicalGroup : ''}</strong></p>
                  <p className='mt-1'><strong>{selectedTeamMember !== null ? selectedTeamMember?.UserGroup : props.current.length > 0 ? props.current[0].UserGroup : ''}</strong></p>
                </div>
                <div className="card-body">
                  <div className="row mt-4 mt-3">
                    <h3 className="card-title">Basic Information</h3>
                    <div className='ps-2'>
                      <p className="card-text">
                        <span><FaPhone /></span>
                        <span>{selectedTeamMember !== null ? selectedTeamMember?.MobileNumber : props.current.length > 0 ? props.current[0].MobileNumber : ''}</span>
                      </p>
                      <p className="card-text">
                        <span><FaEnvelope /></span>
                        <span className='break_word pe-4'>{selectedTeamMember !== null ? selectedTeamMember?.Email : props.current.length > 0 ? props.current[0].Email : ''}</span>
                      </p>
                    </div>
                  </div>
                  <div className="row mt-4">
                    <h3 className="card-title">Team Members</h3>
                    <div>
                      {props.TeamMembers.map((member: any) => (
                        <ul className='list-group' key={member.TaskUser}>
                          <li className="list-group-item" onClick={() => handleTeamMemberClick(member)}>
                            {member.TeamLead === "Team Lead" ? (
                              <span className={member.Id == selectedTeamMember?.Id ? "fw-bold" : ""}>
                                {member.TaskUser} <FaUserTie />
                              </span>
                            ) : (<div className={member.Id == selectedTeamMember?.Id ? "fw-bold" : ""}>
                              {member.TaskUser}{" "}
                            </div>
                            )}
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
                <h1 className='shadow'>
                  {selectedTeamMember !== null ? (selectedTeamMember.TeamLead === "Team Lead" ? <>{selectedTeamMember.TaskUser} </> : (selectedTeamMember.TaskUser)) : (props.current.length > 0 ? props.current[0].TaskUser : '')}'s Appraisal Portal
                </h1>

                <div className='bg-white p-2 rounded'>
                  {/* --------Appraisal member name------ */}

                  <h4 className="names">{props.current.length > 0 ? props.current[0].TaskUser : ""}</h4>
                  {/* {selectedTeamMember !== null ? (<Cards className="cardComp" name={selectedTeamMember.TaskUser} selectedMember={selectedTeamMember} />
                  ) : (
                    props.current.length > 0 && (<Cards className="cardComp" name={props.current[0].TaskUser} selectedMember={props.current[0]} />)
                  )} */}
                  <div>
                    <div>
                      {cardsData?.map((mycard: any) => (
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

                  {showAppraisalGoals ? (
                    <div>
                      <section>
                        <div className='text-md-start py-4'>
                          <h4>Key Responsibilities</h4>
                        </div>
                        <div className='container'>
                          <div className="row">
                            <div>
                              <div className='mycardboxes1'>
                                <p className='py-md-5'>Keep Calm!
                                  <br></br>Goals being set.
                                </p>
                              </div>
                            </div>
                            <div>
                              <div className='mycardboxes'>
                                <p className='py-md-5'>Leads comment and rating</p>
                              </div>
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
                  ) : (
                    <div className="text-end">
                      <a href="#" onClick={() => setOpenPopup(true)}>
                        <span className="iconss">
                          <FaPlus />Add
                        </span>
                      </a>
                      <div>
                        <GlobalCommonTable data={data} columns={columns} />
                      </div>

                      <div className="text-end mb-4">
                        <button className="me-1 btn btn-primary" onClick={handleShowAppraisalGoals}>Go Back</button>
                        <button className={`me-1 btn btn-primary ${isResetButtonActive ? '' : 'disabled'}`} onClick={resetShow}>Reset</button>
                        {/* <button className="me-1 btn btn-primary" onClick={toggleHandler}>Send</button> */}
                        <button className={`me-1 btn btn-primary ${isSendButtonActive ? '' : 'disabled'}`} onClick={sendDataShow}>Send</button>
                      </div>
                      <div>
                        {/* <textarea className='form-control w-100' value={selectedTeamMember?.LeadComment?.replace(/<[^>]*>/g, ' ')} onChange={(e) => setLeadComment(e.target.value)} /> */}
                        <textarea className='form-control w-100 mb-3' placeholder="Enter the comment/comments for employee" value={leadComment.replace(/<[^>]*>/g, ' ')} onChange={(e) => setLeadComment(e.target.value)} />
                        <Button className="me-1" onClick={commentHandler}>Send Comment</Button>
                        <Button onClick={deleteLeadCommentHandler}>Delete Comment</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* -------Panel to update data------- */}
        <Panel
          headerText="Update Data"
          isOpen={isOpenPopup}
          isBlocking={!isOpenPopup}
          onDismiss={() => setIsOpenPopup(false)}
          closeButtonAriaLabel="Close"
        >
          <div className="input-group">
            <label className='form-label mb-0 mt-2 w-100'>Goal Name: </label>
            <input className='form-control' type="text" defaultValue={dataUpdate?.Goals} onChange={(e) => setDataUpdate({ ...dataUpdate, Goals: e.target.value })} />

            <label className='form-label mb-0 mt-2 w-100'>Weightage: </label>
            <input className='form-control' type="number" defaultValue={dataUpdate?.Weightage} onChange={(e: any) => setDataUpdate({ ...dataUpdate, Weightage: e.target.value })} />

            <label className='form-label mb-0 mt-2 w-100'>Employee Rating: </label>
            <input className='form-control' type="number" defaultValue={dataUpdate?.SelfRate} onChange={(e: any) => setDataUpdate({ ...dataUpdate, SelfRate: e.target.value })} />

            <label className='form-label mb-0 mt-2 w-100'>Employee Comment: </label>
            <textarea className='form-control' defaultValue={dataUpdate?.Comment} onChange={(e: any) => setDataUpdate({ ...dataUpdate, Comment: e.target.value })} />

            <label className='form-label mb-0 mt-2 w-100'>TL's Rating: </label>
            <input type="text" className='form-control' defaultValue={dataUpdate?.TLRate} onChange={(e: any) => setDataUpdate({ ...dataUpdate, TLRate: e.target.value })} />

            <label className='form-label mb-0 mt-2 w-100'>TL's Comment: </label>
            <textarea className='form-control w-100' defaultValue={dataUpdate?.TLComment} onChange={(e: any) => setDataUpdate({ ...dataUpdate, TLComment: e.target.value })} />
            <div className='row'>
              <DefaultButton className='btn btn-primary mt-3 p-3' onClick={() => updateDetails()}>Update</DefaultButton>
            </div>
          </div>
        </Panel>

        {/* -------Panel to add key responsibilities------- */}
        <Panel
          headerText="Add Key Responsibilities"
          isOpen={openPopup}
          onDismiss={() => setOpenPopup(false)}
          isFooterAtBottom={true}
          isBlocking={!openPopup}
          type={PanelType.custom}
          customWidth="850px"
        >
          <div className="add-datapanel">
            <br></br>
            <label>Enter new goal: </label>
            <input type="text" value={goals} onChange={(e: any) => setGoals(e.target.value)} />
            <br></br>
            <br></br>
            <label>Enter the weightage: </label>
            <input type="text" value={weightage} onChange={(e: any) => setWeightage(e.target.value)} />
            <br></br>
            {/* <DefaultButton className="btn btn-primary mt-3 p-3 shadow" onClick={addFunction}>Add Item</DefaultButton> */}
            <DefaultButton className="btn btn-primary mt-3 p-3 shadow" 
            onClick={() => {if (parseFloat(weightage) > 0) {addFunction()} else {alert("Weightage must be greater than 0")}}}>Add Item</DefaultButton>
          </div>
        </Panel>

        {/* -------modal for close and delete------- */}
        <Modal
          show={show}
          onHide={sendDataClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Warning</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to Delete this row?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => handleDelete(personDelete)}
            >
              Delete
            </Button>
          </Modal.Footer>
        </Modal>

        {/* -------reset modal open------- */}
        <Modal
          show={resetData}
          onHide={resetClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Warning</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to Reset these Statuses?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={resetClose}>
              Close
            </Button>
            <Button variant="primary" onClick={resetHandler}>
              Reset
            </Button>
          </Modal.Footer>
        </Modal>

        {/* -------Lead to Emloyee Send Data modal open------- */}
        <Modal
          show={sendData}
          onHide={sendDataClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Warning</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to send the data Goals and Weightage at Employee Portal?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={sendDataClose}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={toggleHandler}
            >
              Send
            </Button>
          </Modal.Footer>
        </Modal>
      </section>
    </>
  )
}

export default TeamLeadComponent;