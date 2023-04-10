import renderer from 'react-test-renderer';
import React, {useState, useEffect} from "react";
import {algodClient} from "../../utils/constants";
import PollInstance from "../../components/pollCentre/PollInstance";
import {castVote, retrieveVotes, isOptedIn} from "../../utils/pollCentre";
import {Button, Modal, Card, ModalBody} from "react-bootstrap";
import { useLocation } from 'react-router-dom';
import PollCreation from '../../components/pollCentre/PollCreation';
import {getPolls} from "../../utils/pollCentre";

import Polls from "../../components/pollCentre/Polls";

jest.mock("../../utils/constants");
jest.mock("./PollInstance");
jest.mock("../../utils/pollCentre");
jest.mock("react-bootstrap");
jest.mock('react-router-dom');
jest.mock('./PollCreation');
jest.mock("../../utils/pollCentre");
jest.mock('../../App.css');

const renderTree = tree => renderer.create(tree);
describe('<Polls>', () => {
  it('should render component', () => {
    expect(renderTree(<Polls 
    />).toJSON()).toMatchSnapshot();
  });
  
});