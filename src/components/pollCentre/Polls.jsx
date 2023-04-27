import React, { useState, useEffect } from "react";
import { algodClient } from "../../utils/constants";
import PollInstance from "./PollInstance";
import { castVote, retrieveVotes, isOptedIn } from "../../utils/pollCentre";
import { Button, Modal, Card, ModalBody } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import PollCreation from "./PollCreation";
import { getPolls } from "../../utils/pollCentre";
import "../../App.css";

const Polls = () => {
  let { state } = useLocation();

  const [allPolls, setAllPolls] = useState(state.polls);
  const [showPoll, setShowPoll] = useState(false);
  const [showPollCreation, setShowPollCreation] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentOptions, setCurrentOptions] = useState([]);
  const [currentEndTime, setCurrentEndTime] = useState(0);
  const [currentIndex, setCurrentIndex] = useState("");
  const [currentVotes, setCurrentVotes] = useState({});
  const [currentPoll, setCurrentPoll] = useState("");
  const [showResultsFl, setShowResultsFl] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const address = state.address;

  const completedCreation = async (address, titleName, result, date, appId) => {
    let newDate = Math.floor(date.getTime() / 1000);
    const newPolls = [
      {
        title: titleName,
        owner: address,
        votingChoices: result,
        endTime: newDate,
        appId: appId,
      },
      ...allPolls,
    ];
    setAllPolls(newPolls);
    setShowPollCreation(false);
  };

  const handleVote = async (choice, appId) => {
    const optedIn = await isOptedIn(address, appId);

    if (!optedIn) {
      if (choice !== "") {
        setIsWaiting(true);
        castVote(address, choice, appId)
          .then(() => {
            setIsWaiting(false);
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        alert("You should select an option first.");
        setIsWaiting(false);
      }
    } else {
      alert("You have already voted.");
      setIsWaiting(false);
    }
  };

  const handleResults = async (endTime, appId) => {
    const status = await algodClient.status().do();

    const block = await algodClient.block(status["last-round"]).do();
    const currentRound = block["block"]["ts"];

    if (parseInt(currentRound) > parseInt(endTime)) {
      const votes = await retrieveVotes(appId);
      setCurrentVotes(votes);
      setShowResultsFl(true);
    } else {
      alert("The voting process for the poll hasn't ended");
    }
  };

  const handleOpenPoll = async (poll, index) => {
    setCurrentTitle(poll.title);
    setCurrentPoll(poll);
    const inputOptions = poll.votingChoices;
    const optionsData = inputOptions.split(",");
    setCurrentOptions(optionsData);
    setCurrentEndTime(poll.endTime);
    setCurrentIndex(index);
    setShowPoll(true);
  };

  const handleClosePoll = () => {
    setShowPoll(false);
    setShowResultsFl(false);
  };

  const handleOpenPollCreation = async () => {
    setShowPollCreation(true);
  };

  const handleClosePollCreation = () => {
    setShowPollCreation(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
    return formattedDate;
  };

  useEffect(() => {
    getPollsUpdate();
    console.log("Page refreshed!");
  }, []);

  const getPollsUpdate = async () => {
    getPolls()
      .then((polls) => {
        if (polls) {
          setAllPolls(polls);
        }
      })
      .catch((error) => {
        alert(
          "Problem with fetching. Please ensure your internet connection is good and try again."
        );
        console.log(error);
      });
  };

  return (
    <div className="polls">
      <h1 className="text-dark display-3 text-center">{"Polls"}</h1>
      <br></br>
      <div className="row justify-content-center card-padding">
        {allPolls.map((poll, index) => (
          <div className="col-md-2 mb-4" key={index}>
            <Card key={index}>
              <div className="card text-center">
                <div className="poll-body" style={{ height: "7em" }}>
                  <h3>{poll.title}</h3>
                </div>
                <div className="card-body poll-footer">
                  <Button
                    type="button"
                    className="btn btn-light"
                    onClick={() => handleOpenPoll(poll, index)}
                    key={index}
                  >
                    See more
                  </Button>
                </div>
              </div>
            </Card>
            <br></br>
          </div>
        ))}

        {address ===
          "ITBD5TIB7DX5GKKBL4KRJH574ZVKUVQESBWZ6NOTNSLQBAD4Q2B7WSMNQY" && (
          <div className="text-center">
            <Button
              className="btn btn-primary rounded-pill btn-lg"
              onClick={() => handleOpenPollCreation()}
              type="submit"
            >
              Add a Poll
            </Button>
          </div>
        )}
      </div>

      <Modal show={showPollCreation} onHide={handleClosePollCreation}>
        <Modal.Header closeButton>
          <Modal.Title>Create a new poll</Modal.Title>
        </Modal.Header>
        <Modal.Body className="poll-body">
          <PollCreation
            address={address}
            completedCreation={completedCreation}
          />
        </Modal.Body>
      </Modal>

      <Modal show={showPoll} onHide={handleClosePoll}>
        <Modal.Header closeButton>
          <Modal.Title>{currentTitle}</Modal.Title>
          <ModalBody>Ends on {formatDate(currentEndTime)}</ModalBody>
        </Modal.Header>
        <Modal.Body>
          <PollInstance
            address={address}
            options={currentOptions}
            endTime={currentEndTime}
            appId={currentPoll.appId}
            votes={currentVotes}
            onOptionSelect={handleVote}
            showResults={handleResults}
            showResultsFlag={showResultsFl}
            isWaiting={isWaiting}
            key={currentIndex}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Polls;
