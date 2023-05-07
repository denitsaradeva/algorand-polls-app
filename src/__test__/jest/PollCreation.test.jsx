import renderer from "react-test-renderer";
import React, { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { createNewPoll } from "../../utils/pollCentre";
import { DateTimePicker } from "react-rainbow-components";
import { ProgressSpinner } from "primereact/progressspinner";
import PollCreation from "../../components/pollCentre/PollCreation";

jest.mock("react-bootstrap");
jest.mock("../../utils/pollCentre");
jest.mock("react-rainbow-components");
jest.mock("primereact/progressspinner");

const renderTree = (tree) => renderer.create(tree);
describe("<PollCreation>", () => {
  it("should render the Poll Creation window", () => {
    expect(renderTree(<PollCreation />).toJSON()).toMatchSnapshot();
  });
});
