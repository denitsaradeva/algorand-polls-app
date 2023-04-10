import renderer from 'react-test-renderer';
import React, {useState, useEffect} from "react";
import {Button} from "react-bootstrap";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import {getPolls} from "../../utils/pollCentre";
import { Link } from 'react-router-dom';
import {indexerClient} from "../../utils/constants";
import { ProgressSpinner } from 'primereact/progressspinner';

import Home from "../../components/Home";

jest.mock("react-bootstrap");
jest.mock("@randlabs/myalgo-connect");
jest.mock("../utils/pollCentre");
jest.mock('react-router-dom');
jest.mock("../utils/constants");
jest.mock('primereact/progressspinner');
jest.mock('../App.css');

const renderTree = tree => renderer.create(tree);
describe('<Home>', () => {
  it('should render component', () => {
    expect(renderTree(<Home 
    />).toJSON()).toMatchSnapshot();
  });
  
});