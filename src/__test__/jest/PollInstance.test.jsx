import renderer from "react-test-renderer";
import React, { useState } from "react";
import { Col, Form, InputGroup, Button, Row } from "react-bootstrap";
import PollChart from "../../components/pollCentre/PollChart";
import { ProgressSpinner } from "primereact/progressspinner";
import PollInstance from "../../components/pollCentre/PollInstance";

jest.mock("react-bootstrap");
jest.mock("./PollChart");
jest.mock("primereact/progressspinner");

const renderTree = (tree) => renderer.create(tree);
describe("<PollInstance>", () => {
  it("should render component", () => {
    expect(renderTree(<PollInstance />).toJSON()).toMatchSnapshot();
  });
});
